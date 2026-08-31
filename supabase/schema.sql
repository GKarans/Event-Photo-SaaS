-- Event Photo SaaS MVP schema
-- Run this full script in Supabase SQL Editor after creating the project.

create extension if not exists pgcrypto;

create or replace function public.current_app_date()
returns date
language sql
stable
as $$
    select (now() at time zone 'Europe/Riga')::date;
$$;

create table if not exists public.users (
    id uuid primary key references auth.users(id) on delete cascade,
    email text not null,
    first_name text,
    last_name text,
    created_at timestamptz not null default now()
);

alter table public.users
add column if not exists first_name text;

alter table public.users
add column if not exists last_name text;

create table if not exists public.events (
    id uuid primary key default gen_random_uuid(),
    owner_id uuid not null references public.users(id) on delete cascade,
    name text not null,
    date date,
    start_date date,
    end_date date,
    storage_folder text,
    guest_title text,
    guest_subtitle text,
    guest_button_text text,
    cover_image_path text,
    slug text not null unique,
    status text not null default 'active' check (status in ('active', 'inactive', 'deleted')),
    created_at timestamptz not null default now()
);

alter table public.events
add column if not exists start_date date;

alter table public.events
add column if not exists end_date date;

alter table public.events
add column if not exists storage_folder text;

alter table public.events
add column if not exists guest_title text;

alter table public.events
add column if not exists guest_subtitle text;

alter table public.events
add column if not exists guest_button_text text;

alter table public.events
add column if not exists cover_image_path text;

update public.events
set start_date = coalesce(start_date, date, public.current_app_date()),
    end_date = coalesce(end_date, date, start_date, public.current_app_date()),
    date = coalesce(date, start_date, public.current_app_date()),
    storage_folder = coalesce(storage_folder, slug)
where start_date is null
   or end_date is null
   or date is null
   or storage_folder is null;

alter table public.events
alter column start_date set not null;

alter table public.events
alter column end_date set not null;

alter table public.events
alter column storage_folder set not null;

do $$
begin
    if not exists (
        select 1
        from pg_constraint
        where conname = 'events_date_order_check'
          and conrelid = 'public.events'::regclass
    ) then
        alter table public.events
        add constraint events_date_order_check
        check (end_date >= start_date);
    end if;
end;
$$;

do $$
begin
    if not exists (
        select 1
        from pg_constraint
        where conname = 'events_max_three_days_check'
          and conrelid = 'public.events'::regclass
    ) then
        alter table public.events
        add constraint events_max_three_days_check
        check (end_date <= start_date + 2);
    end if;
end;
$$;

do $$
begin
    if not exists (
        select 1
        from pg_constraint
        where conname = 'events_storage_folder_unique'
          and conrelid = 'public.events'::regclass
    ) then
        alter table public.events
        add constraint events_storage_folder_unique
        unique (storage_folder);
    end if;
end;
$$;

create table if not exists public.guests (
    id uuid primary key default gen_random_uuid(),
    event_id uuid not null references public.events(id) on delete cascade,
    name text not null,
    created_at timestamptz not null default now()
);

create table if not exists public.media (
    id uuid primary key default gen_random_uuid(),
    event_id uuid not null references public.events(id) on delete cascade,
    guest_id uuid references public.guests(id) on delete set null,
    file_url text,
    thumbnail_url text,
    storage_path text not null,
    thumbnail_path text,
    file_type text not null check (file_type like 'image/%'),
    file_size bigint not null check (file_size > 0 and file_size <= 10485760),
    created_at timestamptz not null default now(),
    status text not null default 'uploaded' check (status in ('uploaded', 'deleted'))
);

create index if not exists events_owner_id_idx on public.events(owner_id);
create index if not exists events_slug_idx on public.events(slug);
create index if not exists events_period_idx on public.events(start_date, end_date);
create index if not exists guests_event_id_idx on public.guests(event_id);
create index if not exists media_event_id_idx on public.media(event_id);
create index if not exists media_guest_id_idx on public.media(guest_id);

alter table public.users enable row level security;
alter table public.events enable row level security;
alter table public.guests enable row level security;
alter table public.media enable row level security;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
    insert into public.users as target (id, email, first_name, last_name)
    values (
        new.id,
        coalesce(new.email, ''),
        nullif(trim(coalesce(new.raw_user_meta_data->>'first_name', '')), ''),
        nullif(trim(coalesce(new.raw_user_meta_data->>'last_name', '')), '')
    )
    on conflict (id) do update
    set email = excluded.email,
        first_name = coalesce(excluded.first_name, target.first_name),
        last_name = coalesce(excluded.last_name, target.last_name);

    return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

insert into public.users as target (id, email, first_name, last_name)
select
    id,
    coalesce(email, ''),
    nullif(trim(coalesce(raw_user_meta_data->>'first_name', '')), ''),
    nullif(trim(coalesce(raw_user_meta_data->>'last_name', '')), '')
from auth.users
on conflict (id) do update
set email = excluded.email,
    first_name = coalesce(excluded.first_name, target.first_name),
    last_name = coalesce(excluded.last_name, target.last_name);

drop policy if exists "Users can read own profile" on public.users;
create policy "Users can read own profile"
on public.users for select
to authenticated
using (auth.uid() = id);

drop policy if exists "Users can update own profile" on public.users;
create policy "Users can update own profile"
on public.users for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

drop policy if exists "Organizers can read own events" on public.events;
create policy "Organizers can read own events"
on public.events for select
to authenticated
using (owner_id = auth.uid());

drop policy if exists "Guests can read active event landing pages" on public.events;
create policy "Guests can read active event landing pages"
on public.events for select
to anon, authenticated
using (
    status = 'active'
    and public.current_app_date() >= start_date
    and public.current_app_date() <= end_date
);

drop policy if exists "Organizers can create own events" on public.events;
create policy "Organizers can create own events"
on public.events for insert
to authenticated
with check (
    owner_id = auth.uid()
    and start_date >= public.current_app_date()
    and end_date >= start_date
    and end_date <= start_date + 2
);

drop policy if exists "Organizers can update own events" on public.events;
create policy "Organizers can update own events"
on public.events for update
to authenticated
using (owner_id = auth.uid())
with check (
    owner_id = auth.uid()
    and end_date >= start_date
    and end_date <= start_date + 2
);

drop policy if exists "Organizers can read guests for own events" on public.guests;
create policy "Organizers can read guests for own events"
on public.guests for select
to authenticated
using (
    exists (
        select 1
        from public.events
        where events.id = guests.event_id
          and events.owner_id = auth.uid()
    )
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
          and public.current_app_date() >= events.start_date
          and public.current_app_date() <= events.end_date
    )
);

drop policy if exists "Organizers can read media for own events" on public.media;
create policy "Organizers can read media for own events"
on public.media for select
to authenticated
using (
    exists (
        select 1
        from public.events
        where events.id = media.event_id
          and events.owner_id = auth.uid()
    )
);

drop policy if exists "Organizers can update media for own events" on public.media;
create policy "Organizers can update media for own events"
on public.media for update
to authenticated
using (
    exists (
        select 1
        from public.events
        where events.id = media.event_id
          and events.owner_id = auth.uid()
    )
)
with check (
    exists (
        select 1
        from public.events
        where events.id = media.event_id
          and events.owner_id = auth.uid()
    )
);

drop policy if exists "Guests can create media records for active events" on public.media;
create policy "Guests can create media records for active events"
on public.media for insert
to anon, authenticated
with check (
    file_type like 'image/%'
    and file_size <= 10485760
    and exists (
        select 1
        from public.events
        where events.id = media.event_id
          and events.status = 'active'
          and public.current_app_date() >= events.start_date
          and public.current_app_date() <= events.end_date
    )
);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
    'event-photos',
    'event-photos',
    false,
    10485760,
    array['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/heic', 'image/heif']
)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

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
          and public.current_app_date() >= events.start_date
          and public.current_app_date() <= events.end_date
    )
);

drop policy if exists "Organizers can read own event photos" on storage.objects;
create policy "Organizers can read own event photos"
on storage.objects for select
to authenticated
using (
    bucket_id = 'event-photos'
    and exists (
        select 1
        from public.media
        join public.events on events.id = media.event_id
        where (
            media.storage_path = storage.objects.name
            or media.thumbnail_path = storage.objects.name
          )
          and events.owner_id = auth.uid()
          and media.status = 'uploaded'
    )
);

drop policy if exists "Organizers can delete own event photos" on storage.objects;
create policy "Organizers can delete own event photos"
on storage.objects for delete
to authenticated
using (
    bucket_id = 'event-photos'
    and exists (
        select 1
        from public.media
        join public.events on events.id = media.event_id
        where (
            media.storage_path = storage.objects.name
            or media.thumbnail_path = storage.objects.name
          )
          and events.owner_id = auth.uid()
    )
);

drop policy if exists "Organizers can upload own event covers" on storage.objects;
create policy "Organizers can upload own event covers"
on storage.objects for insert
to authenticated
with check (
    bucket_id = 'event-photos'
    and (storage.foldername(storage.objects.name))[1] = 'event-covers'
    and exists (
        select 1
        from public.events
        where events.id::text = (storage.foldername(storage.objects.name))[2]
          and events.owner_id = auth.uid()
    )
);

drop policy if exists "Organizers can read own event covers" on storage.objects;
create policy "Organizers can read own event covers"
on storage.objects for select
to authenticated
using (
    bucket_id = 'event-photos'
    and exists (
        select 1
        from public.events
        where events.cover_image_path = storage.objects.name
          and events.owner_id = auth.uid()
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
          and public.current_app_date() >= events.start_date
          and public.current_app_date() <= events.end_date
    )
);

drop policy if exists "Organizers can delete own event covers" on storage.objects;
create policy "Organizers can delete own event covers"
on storage.objects for delete
to authenticated
using (
    bucket_id = 'event-photos'
    and exists (
        select 1
        from public.events
        where events.cover_image_path = storage.objects.name
          and events.owner_id = auth.uid()
    )
);
