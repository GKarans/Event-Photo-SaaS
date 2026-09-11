-- Run after schema.sql. Sharing settings are separate to prevent owner UPDATE
-- policies on events from resetting the public access counter.
create table if not exists public.gallery_shares (
 event_id uuid primary key references public.events(id) on delete cascade,
 enabled boolean not null default false,
 expires_at timestamptz,
 requests_used integer not null default 0 check (requests_used >= 0)
);
alter table public.gallery_shares enable row level security;
revoke all on public.gallery_shares from anon, authenticated;

create or replace function public.manage_gallery_share(p_event uuid, p_enabled boolean default null)
returns jsonb language plpgsql security definer set search_path = public as $$
declare e public.events; s public.gallery_shares;
begin
 select * into e from public.events where id=p_event and owner_id=auth.uid();
 if not found then raise exception 'Not allowed'; end if;
 if p_enabled is not null then
   if p_enabled and (e.status='deleted' or e.end_date >= public.current_app_date() or e.end_date < public.current_app_date()-14) then
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
revoke all on function public.manage_gallery_share(uuid,boolean) from public, anon;
grant execute on function public.manage_gallery_share(uuid,boolean) to authenticated;

-- Only the Edge Function may consume the quota and obtain private paths.
create or replace function public.guest_gallery_access(p_slug text, p_photo uuid default null, p_full boolean default false, p_offset integer default 0, p_guest text default '', p_oldest boolean default false)
returns jsonb language plpgsql security definer set search_path = public as $$
declare eid uuid; result jsonb;
begin
 update public.gallery_shares s set requests_used=requests_used+1
 from public.events e
 where s.event_id=e.id and e.slug=p_slug and e.status<>'deleted'
   and e.end_date<public.current_app_date() and e.end_date>=public.current_app_date()-14
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
revoke all on function public.guest_gallery_access(text,uuid,boolean,integer,text,boolean) from public,anon,authenticated;
grant execute on function public.guest_gallery_access(text,uuid,boolean,integer,text,boolean) to service_role;
