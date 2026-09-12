-- Run AFTER 20260912_r2_storage.sql, BEFORE deploying the timed-event frontend.
-- Old events remain all-day in Riga. New events select an IANA time zone.
begin;
alter table public.events add column if not exists time_zone text not null default 'Europe/Riga';
alter table public.events add column if not exists start_time time;
alter table public.events add column if not exists end_time time;
alter table public.events add column if not exists starts_at timestamptz generated always as
 ((start_date + coalesce(start_time,time '00:00')) at time zone time_zone) stored;
alter table public.events add column if not exists ends_at timestamptz generated always as
 (((case when end_time is null then end_date+1 else end_date end) + coalesce(end_time,time '00:00')) at time zone time_zone) stored;
alter table public.events drop constraint if exists events_clock_pair;
alter table public.events add constraint events_clock_pair check ((start_time is null)=(end_time is null));
alter table public.events drop constraint if exists events_clock_order;
alter table public.events add constraint events_clock_order check (ends_at>starts_at);
create index if not exists events_ends_at_idx on public.events(ends_at);

create or replace function public.event_upload_open(p_status text,p_start timestamptz,p_end timestamptz)
returns boolean language sql stable set search_path=public as $$
 select coalesce(p_status='active' and now()>=p_start and now()<p_end,false);
$$;

create or replace function public.validate_event_clocks()
returns trigger language plpgsql set search_path=public as $$
declare local_clock timestamp; instant timestamptz; finish timestamptz;
begin
 if not exists(select 1 from pg_timezone_names where name=new.time_zone) then raise exception 'Choose a valid time zone'; end if;
 if new.start_time is not null and new.end_time is not null then
   foreach local_clock in array array[new.start_date+new.start_time,new.end_date+new.end_time] loop
     instant := local_clock at time zone new.time_zone;
     if (instant at time zone new.time_zone)<>local_clock
       or ((instant-interval '1 hour') at time zone new.time_zone)=local_clock
       or ((instant+interval '1 hour') at time zone new.time_zone)=local_clock
       or ((instant-interval '30 minutes') at time zone new.time_zone)=local_clock
       or ((instant+interval '30 minutes') at time zone new.time_zone)=local_clock
     then raise exception 'Choose an unambiguous time outside the daylight-saving clock change'; end if;
   end loop;
 end if;
 finish := ((case when new.end_time is null then new.end_date+1 else new.end_date end)+coalesce(new.end_time,time '00:00')) at time zone new.time_zone;
 if new.zip_downloaded_at is not null and finish>now() then raise exception 'Event must have ended before ZIP export'; end if;
 if tg_op='UPDATE' and old.zip_downloaded_at is not null then
   if new.zip_downloaded_at is distinct from old.zip_downloaded_at then raise exception 'ZIP export cannot be reset'; end if;
   if row(new.start_date,new.end_date,new.start_time,new.end_time,new.time_zone) is distinct from row(old.start_date,old.end_date,old.start_time,old.end_time,old.time_zone)
   then raise exception 'An exported event schedule cannot be changed'; end if;
 end if;
 return new;
end $$;
drop trigger if exists validate_event_clocks on public.events;
create trigger validate_event_clocks before insert or update on public.events
for each row execute function public.validate_event_clocks();

-- Replace all upload/share gates together; permissions on existing RPCs are retained.
create or replace function public.prepare_photo_upload(p_id uuid,p_event uuid,p_guest uuid,p_path text,p_thumb text,p_type text,p_size bigint)
returns void language plpgsql security definer set search_path=public as $$
declare folder text; existing public.media;
begin
 select storage_folder into folder from public.events
 where id=p_event and public.event_upload_open(status,starts_at,ends_at);
 if folder is null or not exists(select 1 from public.guests where id=p_guest and event_id=p_event)
    or p_path is null or p_thumb is null or p_path=p_thumb
    or split_part(p_path,'/',1)<>folder or split_part(p_thumb,'/',1)<>folder
    or position('/../' in '/'||p_path||'/')>0 or position('/../' in '/'||p_thumb||'/')>0
    or p_size is null or p_size not between 1 and 6291456
    or p_type is null or p_type not in ('image/jpeg','image/png','image/webp') then
   raise exception 'Upload is not available';
 end if;
 select * into existing from public.media where id=p_id;
 if found then
   if existing.event_id=p_event and existing.guest_id=p_guest and existing.storage_path=p_path
     and existing.thumbnail_path=p_thumb and existing.status in ('uploading','uploaded') then return; end if;
   raise exception 'Upload is not available';
 end if;
 insert into public.media(id,event_id,guest_id,storage_path,thumbnail_path,file_type,file_size,status)
 values(p_id,p_event,p_guest,p_path,p_thumb,p_type,p_size,'uploading');
end $$;

create or replace function public.complete_photo_upload(p_id uuid)
returns void language plpgsql security definer set search_path=public as $$
declare m public.media;
begin
 select * into m from public.media where id=p_id for update;
 if not found or m.status='deleted' or not exists(
   select 1 from public.events where id=m.event_id and public.event_upload_open(status,starts_at,ends_at)
 ) then raise exception 'Upload is not available'; end if;
 if not exists(select 1 from storage.objects where bucket_id='event-photos' and name=m.storage_path)
   or not exists(select 1 from storage.objects where bucket_id='event-photos' and name=m.thumbnail_path)
 then raise exception 'Photo upload is incomplete'; end if;
 update public.media set status='uploaded' where id=p_id;
end $$;

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
 and now()>=e.starts_at and now()<e.ends_at)))
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
   if not public.event_upload_open(e.status,e.starts_at,e.ends_at)
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
 and public.event_upload_open(e.status,e.starts_at,e.ends_at))
 then raise exception 'Upload is not available'; end if;
 if (select count(*) from public.r2_objects where media_id=m.id and event_id=m.event_id
 and path in (m.storage_path,m.thumbnail_path) and token_hash=p_token and status='ready')<>2
 then raise exception 'Photo upload is incomplete'; end if;
 update public.media set status='uploaded' where id=m.id;
end $$;

create or replace function public.manage_gallery_share(p_event uuid, p_enabled boolean default null)
returns jsonb language plpgsql security definer set search_path = public as $$
declare e public.events; s public.gallery_shares;
begin
 select * into e from public.events where id=p_event and owner_id=auth.uid();
 if not found then raise exception 'Not allowed'; end if;
 if p_enabled is not null then
   if p_enabled and (e.status='deleted' or e.ends_at > now() or e.end_date < public.current_app_date()-14) then
     raise exception 'Event must have ended';
   end if;
   insert into public.gallery_shares(event_id,enabled,expires_at)
   values(p_event,p_enabled,least(now()+interval '7 days',(e.end_date+15)::timestamp at time zone 'Europe/Riga'))
   on conflict(event_id) do update set enabled=p_enabled,
     expires_at=case when p_enabled and (not gallery_shares.enabled or gallery_shares.expires_at<=now())
       then least(now()+interval '7 days',(e.end_date+15)::timestamp at time zone 'Europe/Riga') else gallery_shares.expires_at end;
 end if;
 select * into s from public.gallery_shares where event_id=p_event;
 return jsonb_build_object('enabled',coalesce(s.enabled and s.expires_at>now(),false),
   'expires_at',s.expires_at,'requests_used',coalesce(s.requests_used,0),'request_limit',2000);
end $$;

create or replace function public.guest_gallery_access(p_slug text, p_photo uuid default null, p_full boolean default false, p_offset integer default 0, p_guest text default '', p_oldest boolean default false)
returns jsonb language plpgsql security definer set search_path = public as $$
declare eid uuid; result jsonb;
begin
 update public.gallery_shares s set requests_used=requests_used+1
 from public.events e
 where s.event_id=e.id and e.slug=p_slug and e.status<>'deleted'
   and e.ends_at<=now() and e.end_date>=public.current_app_date()-14
   and s.enabled and s.expires_at>now() and s.requests_used<2000
 returning e.id into eid;
 if eid is null then
   if exists(select 1 from public.events where slug=p_slug and status<>'deleted') then
     return jsonb_build_object('closed',true);
   end if;
   return null;
 end if;
 if p_photo is not null then
   select jsonb_build_object('path',case when p_full then m.storage_path else m.thumbnail_path end)
   into result from public.media m join public.events e on e.id=m.event_id
   where m.id=p_photo and m.event_id=eid and m.status='uploaded'
     and split_part(case when p_full then m.storage_path else m.thumbnail_path end,'/',1)=e.storage_folder
     and position('/../' in '/' || (case when p_full then m.storage_path else m.thumbnail_path end) || '/')=0;
   return result;
 end if;
 select jsonb_build_object('photos',coalesce(jsonb_agg(to_jsonb(rows)),'[]'::jsonb)) into result from (
   select m.id,m.created_at,coalesce(g.name,'Guest') as guest
   from public.media m left join public.guests g on g.id=m.guest_id and g.event_id=m.event_id
   where m.event_id=eid and m.status='uploaded' and m.thumbnail_path is not null
     and (p_guest='' or g.name=p_guest)
   order by case when p_oldest then m.created_at end asc,
     case when not p_oldest then m.created_at end desc, m.id
   limit 24 offset greatest(0,least(p_offset,100000))
 ) rows;
 return result || jsonb_build_object('guests',(select coalesce(jsonb_agg(name),'[]'::jsonb) from (
   select distinct g.name from public.guests g join public.media m on m.guest_id=g.id
   where m.event_id=eid and m.status='uploaded' and m.thumbnail_path is not null order by g.name
 ) names));
end $$;

drop policy if exists "Guests can read active event landing pages" on public.events;
create policy "Guests can read active event landing pages"
on public.events for select
to anon, authenticated
using (
    status = 'active'
    and now() >= starts_at
    and now() < ends_at
);

drop policy if exists "Guests can join active events" on public.guests;
create policy "Guests can join active events"
on public.guests for insert
to anon, authenticated
with check (
    exists (
        select 1
        from public.events
        where events.id = guests.event_id
          and events.status = 'active'
          and now() >= events.starts_at
          and now() < events.ends_at
    )
);

drop policy if exists "Guests can create media records for active events" on public.media;
create policy "Guests can create media records for active events"
on public.media for insert
to anon, authenticated
with check (
    file_type like 'image/%'
    and file_size <= 6291456
    and exists (
        select 1
        from public.events
        where events.id = media.event_id
          and events.status = 'active'
          and now() >= events.starts_at
          and now() < events.ends_at
    )
);

drop policy if exists "Guests can upload event photos" on storage.objects;
create policy "Guests can upload event photos"
on storage.objects for insert
to anon, authenticated
with check (
    bucket_id = 'event-photos'
    and exists (
        select 1
        from public.events
        where events.storage_folder = (storage.foldername(storage.objects.name))[1]
          and events.status = 'active'
          and now() >= events.starts_at
          and now() < events.ends_at
    )
);

drop policy if exists "Guests can read active event covers" on storage.objects;
create policy "Guests can read active event covers"
on storage.objects for select
to anon, authenticated
using (
    bucket_id = 'event-photos'
    and exists (
        select 1
        from public.events
        where events.cover_image_path = storage.objects.name
          and events.status = 'active'
          and now() >= events.starts_at
          and now() < events.ends_at
    )
);

drop policy if exists "Organizers can create own events" on public.events;
create policy "Organizers can create own events" on public.events for insert to authenticated
with check (owner_id=auth.uid() and start_date >= (now() at time zone time_zone)::date
 and end_date>=start_date and end_date<=start_date+2);

commit;
