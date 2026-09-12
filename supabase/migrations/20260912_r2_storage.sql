-- OPTIONAL. Run AFTER 20260912_media_reliability.sql, before enabling MEDIA_API_URL.
-- No existing paths or files are moved. Never grant clients direct registry access.
create table if not exists public.r2_objects (
 path text primary key,
 event_id uuid not null references public.events(id),
 media_id uuid references public.media(id),
 object_key text not null unique,
 checksum text not null,
 token_hash text not null,
 file_size bigint not null check(file_size between 1 and 6291456),
 file_type text not null check(file_type in ('image/webp','image/jpeg','image/png')),
 status text not null default 'uploading' check(status in ('uploading','ready','deleted')),
 created_at timestamptz not null default now()
);
alter table public.r2_objects enable row level security;
revoke all on public.r2_objects from public,anon,authenticated;
grant all on public.r2_objects to service_role;

create or replace function public.r2_path_allowed(p_path text,p_owner uuid,p_remove boolean default false)
returns boolean language sql security definer set search_path=public as $$
 select p_path is not null and position('/../' in '/'||p_path||'/')=0 and (
 exists(select 1 from public.media m join public.events e on e.id=m.event_id
 where e.owner_id=p_owner and (p_remove or (m.status='uploaded' and e.status<>'deleted'))
 and p_path in (m.storage_path,m.thumbnail_path) and split_part(p_path,'/',1)=e.storage_folder)
 or exists(select 1 from public.events e where
 split_part(p_path,'/',1)='event-covers' and split_part(p_path,'/',2)=e.id::text
 and ((e.owner_id=p_owner and (e.cover_image_path=p_path or (p_remove and exists(
 select 1 from public.cover_cleanup c where c.event_id=e.id and c.path=p_path))))
 or (not p_remove and e.cover_image_path=p_path and e.status='active'
 and current_app_date() between e.start_date and e.end_date)))
 );
$$;

create or replace function public.reserve_r2_object(p_path text,p_media uuid,p_guest uuid,p_owner uuid,
 p_checksum text,p_token text,p_size bigint,p_type text)
returns public.r2_objects language plpgsql security definer set search_path=public as $$
declare m public.media; e public.events; r public.r2_objects;
begin
 if p_path is null or length(p_path)>600 or p_path ~ '[\\?\x00-\x1f]' or position('/../' in '/'||p_path||'/')>0
 or p_checksum is null or p_checksum !~ '^[A-Za-z0-9+/]{43}=$' or p_token is null or length(p_token)<>64
 or p_size is null or p_size not between 1 and 6291456 or p_type is distinct from 'image/webp'
 then raise exception 'Upload is not available'; end if;
 if p_media is not null then
   select * into m from public.media where id=p_media;
   if not found or m.guest_id is distinct from p_guest or p_path not in (m.storage_path,m.thumbnail_path)
     or m.status not in ('uploading','uploaded') then raise exception 'Upload is not available'; end if;
   select * into e from public.events where id=m.event_id for update;
   if e.status<>'active' or current_app_date() not between e.start_date and e.end_date
     or split_part(p_path,'/',1)<>e.storage_folder
     or (p_path=m.storage_path and (p_size<>m.file_size or p_type<>m.file_type))
     or (p_path=m.thumbnail_path and p_size>1048576) then raise exception 'Upload is not available'; end if;
 else
   select * into e from public.events where owner_id=p_owner
     and split_part(p_path,'/',1)='event-covers' and split_part(p_path,'/',2)=id::text for update;
   if not found or not exists(select 1 from public.cover_cleanup where event_id=e.id and path=p_path)
     then raise exception 'Not allowed'; end if;
 end if;
 select * into r from public.r2_objects where path=p_path;
 if found then
   if r.token_hash<>p_token or r.checksum<>p_checksum or r.file_size<>p_size or r.status='deleted'
     then raise exception 'Upload is not available'; end if;
   return r;
 end if;
 if m.status='uploaded' or exists(select 1 from storage.objects where bucket_id='event-photos' and name=p_path)
 then raise exception 'File already exists'; end if;
 -- Serialize per event to enforce a bounded reservation rate and storage budget.
 if (select count(*) from public.r2_objects where event_id=e.id and created_at>now()-interval '1 minute')>=60
 or (select coalesce(sum(file_size),0) from public.r2_objects where event_id=e.id and status<>'deleted')+p_size>2147483648
 then raise exception 'Upload limit reached'; end if;
 insert into public.r2_objects(path,event_id,media_id,object_key,checksum,token_hash,file_size,file_type)
 values(p_path,e.id,p_media,'objects/'||gen_random_uuid()::text,p_checksum,p_token,p_size,p_type) returning * into r;
 return r;
end $$;

create or replace function public.complete_r2_photo(p_media uuid,p_token text)
returns void language plpgsql security definer set search_path=public as $$
declare m public.media;
begin
 select * into m from public.media where id=p_media for update;
 if not found or m.status='deleted' or not exists(select 1 from public.events e where e.id=m.event_id
 and e.status='active' and current_app_date() between e.start_date and e.end_date)
 then raise exception 'Upload is not available'; end if;
 if (select count(*) from public.r2_objects where media_id=m.id and event_id=m.event_id
 and path in (m.storage_path,m.thumbnail_path) and token_hash=p_token and status='ready')<>2
 then raise exception 'Photo upload is incomplete'; end if;
 update public.media set status='uploaded' where id=m.id;
end $$;
revoke all on function public.r2_path_allowed(text,uuid,boolean) from public,anon,authenticated;
revoke all on function public.reserve_r2_object(text,uuid,uuid,uuid,text,text,bigint,text) from public,anon,authenticated;
revoke all on function public.complete_r2_photo(uuid,text) from public,anon,authenticated;
grant execute on function public.r2_path_allowed(text,uuid,boolean) to service_role;
grant execute on function public.reserve_r2_object(text,uuid,uuid,uuid,text,text,bigint,text) to service_role;
grant execute on function public.complete_r2_photo(uuid,text) to service_role;
