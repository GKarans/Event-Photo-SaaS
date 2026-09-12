-- Run after schema.sql and 20260911_guest_gallery.sql.
alter table public.media drop constraint if exists media_status_check;
alter table public.media add constraint media_status_check check(status in ('uploading','uploaded','deleted'));
alter table public.media add column if not exists storage_deleted_at timestamptz;

-- Storage removal also needs SELECT; allow owners to clean pending/deleted
-- files while preventing forged media paths from reaching another event.
drop policy if exists "Organizers can read own event photos" on storage.objects;
create policy "Organizers can read own event photos" on storage.objects for select to authenticated using (
 bucket_id='event-photos' and exists(select 1 from public.media m join public.events e on e.id=m.event_id
 where e.owner_id=auth.uid() and (m.storage_path=storage.objects.name or m.thumbnail_path=storage.objects.name)
 and split_part(storage.objects.name,'/',1)=e.storage_folder)
);
drop policy if exists "Organizers can delete own event photos" on storage.objects;
create policy "Organizers can delete own event photos" on storage.objects for delete to authenticated using (
 bucket_id='event-photos' and exists(select 1 from public.media m join public.events e on e.id=m.event_id
 where e.owner_id=auth.uid() and (m.storage_path=storage.objects.name or m.thumbnail_path=storage.objects.name)
 and split_part(storage.objects.name,'/',1)=e.storage_folder)
);

create or replace function public.prepare_photo_upload(p_id uuid,p_event uuid,p_guest uuid,p_path text,p_thumb text,p_type text,p_size bigint)
returns void language plpgsql security definer set search_path=public as $$
declare folder text; existing public.media;
begin
 select storage_folder into folder from public.events
 where id=p_event and status='active' and current_app_date() between start_date and end_date;
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
   select 1 from public.events where id=m.event_id and status='active' and current_app_date() between start_date and end_date
 ) then raise exception 'Upload is not available'; end if;
 if not exists(select 1 from storage.objects where bucket_id='event-photos' and name=m.storage_path)
   or not exists(select 1 from storage.objects where bucket_id='event-photos' and name=m.thumbnail_path)
 then raise exception 'Photo upload is incomplete'; end if;
 update public.media set status='uploaded' where id=p_id;
end $$;
revoke all on function public.prepare_photo_upload(uuid,uuid,uuid,text,text,text,bigint) from public;
revoke all on function public.complete_photo_upload(uuid) from public;
grant execute on function public.prepare_photo_upload(uuid,uuid,uuid,text,text,text,bigint) to anon,authenticated;
grant execute on function public.complete_photo_upload(uuid) to anon,authenticated;

-- Cover replacement and cleanup jobs are committed together. Owners can retry
-- Storage removal without losing the old path after switching the event cover.
create table if not exists public.cover_cleanup (
 id uuid primary key default gen_random_uuid(),
 event_id uuid not null references public.events(id) on delete cascade,
 path text not null,
 created_at timestamptz not null default now(),
 unique(event_id,path)
);
alter table public.cover_cleanup enable row level security;
grant select,delete on public.cover_cleanup to authenticated;
drop policy if exists "Owner reads cover cleanup" on public.cover_cleanup;
create policy "Owner reads cover cleanup" on public.cover_cleanup for select to authenticated
 using(exists(select 1 from public.events e where e.id=event_id and e.owner_id=auth.uid()));
drop policy if exists "Owner completes cover cleanup" on public.cover_cleanup;
create policy "Owner completes cover cleanup" on public.cover_cleanup for delete to authenticated
 using(exists(select 1 from public.events e where e.id=event_id and e.owner_id=auth.uid()));

create or replace function public.track_cover_cleanup()
returns trigger language plpgsql security definer set search_path=public as $$
begin
 if old.cover_image_path is not null and old.cover_image_path is distinct from new.cover_image_path then
   insert into public.cover_cleanup(event_id,path) values(old.id,old.cover_image_path) on conflict do nothing;
 end if;
 return new;
end $$;
drop trigger if exists track_cover_cleanup on public.events;
create trigger track_cover_cleanup after update of cover_image_path on public.events
 for each row execute function public.track_cover_cleanup();

create or replace function public.register_cover_upload(p_event uuid,p_path text)
returns void language plpgsql security definer set search_path=public as $$
begin
 if p_path is null or not exists(select 1 from public.events where id=p_event and owner_id=auth.uid()
   and split_part(p_path,'/',1)='event-covers' and split_part(p_path,'/',2)=id::text) or position('/../' in '/'||p_path||'/')>0
 then raise exception 'Not allowed'; end if;
 insert into public.cover_cleanup(event_id,path) values(p_event,p_path) on conflict do nothing;
end $$;
revoke all on function public.register_cover_upload(uuid,text) from public,anon;
grant execute on function public.register_cover_upload(uuid,text) to authenticated;
