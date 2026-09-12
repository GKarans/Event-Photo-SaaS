-- Run after 20260912_r2_storage.sql. Existing object keys are never changed.
-- Applies to new upload reservations; verified legacy copies supply their own key.
begin;
create or replace function public.assign_r2_object_folder()
returns trigger language plpgsql set search_path=public as $$
declare photo public.media;
begin
 if new.status <> 'uploading' then return new; end if;
 if new.media_id is null then
   new.object_key := 'events/' || new.event_id::text || '/covers/' || gen_random_uuid()::text || '.webp';
 else
   select * into photo from public.media where id=new.media_id and event_id=new.event_id;
   if not found or photo.guest_id is null or new.path not in (photo.storage_path,photo.thumbnail_path)
   then raise exception 'Upload is not available'; end if;
   new.object_key := 'events/' || new.event_id::text || '/guests/' || photo.guest_id::text || '/'
     || case when new.path=photo.thumbnail_path then 'thumb-' else 'photo-' end
     || gen_random_uuid()::text || '.webp';
 end if;
 return new;
end $$;
revoke all on function public.assign_r2_object_folder() from public,anon,authenticated;
drop trigger if exists r2_object_folder on public.r2_objects;
create trigger r2_object_folder before insert on public.r2_objects
for each row execute function public.assign_r2_object_folder();
commit;
