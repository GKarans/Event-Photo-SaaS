-- Run after 20260912_r2_id_folders.sql. Existing keys are never moved.
begin;
alter table public.r2_objects add column if not exists organizer_folder text;
alter table public.r2_objects add column if not exists event_folder text;
alter table public.r2_objects add column if not exists guest_folder text;

create or replace function public.r2_folder_label(value text, fallback text)
returns text language sql immutable set search_path=public as $$
 select coalesce(nullif(trim(both '-' from left(regexp_replace(
  translate(lower(coalesce(value,'')),'āčēģīķļņšūž','acegiklnsuz'),
  '[^a-z0-9]+','-','g'),60)),''),fallback);
$$;
revoke all on function public.r2_folder_label(text,text) from public,anon,authenticated;

create or replace function public.assign_r2_object_folder()
returns trigger language plpgsql set search_path=public as $$
declare
 photo public.media; ev public.events; guest public.guests;
 owner_name text; prefix text; stamp text;
begin
 if new.status <> 'uploading' then return new; end if;
 select * into ev from public.events where id=new.event_id;
 if not found then raise exception 'Upload is not available'; end if;
 -- Serialize first naming snapshots for one organizer without moving old keys.
 perform pg_advisory_xact_lock(hashtextextended(ev.owner_id::text,0));
 select o.organizer_folder into new.organizer_folder
 from public.r2_objects o join public.events e on e.id=o.event_id
 where e.owner_id=ev.owner_id and o.organizer_folder is not null
 order by o.created_at,o.path limit 1;
 if new.organizer_folder is null then
  select concat_ws(' ',first_name,last_name) into owner_name from public.users where id=ev.owner_id;
  new.organizer_folder:=public.r2_folder_label(owner_name,'organizer')||'--'||ev.owner_id::text;
 end if;
 select o.event_folder into new.event_folder from public.r2_objects o
 where o.event_id=ev.id and o.event_folder is not null order by o.created_at,o.path limit 1;
 new.event_folder:=coalesce(new.event_folder,public.r2_folder_label(ev.name,'event')||'--'||ev.id::text);
 prefix:=new.organizer_folder||'/'||new.event_folder||'/';
 if new.media_id is null then
  new.guest_folder:=null;
  new.object_key:=prefix||'covers/cover-'||gen_random_uuid()::text||'.webp';
 else
  select * into photo from public.media where id=new.media_id and event_id=ev.id;
  if not found or photo.guest_id is null or new.path not in (photo.storage_path,photo.thumbnail_path)
  then raise exception 'Upload is not available'; end if;
  select * into guest from public.guests where id=photo.guest_id and event_id=ev.id;
  if not found then raise exception 'Upload is not available'; end if;
  select o.guest_folder into new.guest_folder from public.r2_objects o
  join public.media m on m.id=o.media_id
  where m.guest_id=guest.id and m.event_id=ev.id and o.guest_folder is not null
  order by o.created_at,o.path limit 1;
  new.guest_folder:=coalesce(new.guest_folder,public.r2_folder_label(guest.name,'guest')||'--'||guest.id::text);
  -- Metadata creation time, not EXIF capture time; UTC avoids ambiguous clocks.
  stamp:=to_char(photo.created_at at time zone 'UTC','YYYY-MM-DD"T"HH24-MI-SS"Z"');
  new.object_key:=prefix||new.guest_folder||'/'
   ||case when new.path=photo.thumbnail_path then 'thumb-' else '' end
   ||split_part(new.guest_folder,'--',1)||'_'||stamp||'_'||photo.id::text||'.webp';
 end if;
 return new;
end $$;
revoke all on function public.assign_r2_object_folder() from public,anon,authenticated;
drop trigger if exists r2_object_folder on public.r2_objects;
create trigger r2_object_folder before insert on public.r2_objects
for each row execute function public.assign_r2_object_folder();
commit;
