-- Emad portfolio — Supabase schema
-- Run this in the Supabase SQL editor (or via `supabase db push` if you wire up the CLI).

-- =============================================================
-- profiles  (extends auth.users)
-- =============================================================
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text,
  phone text,
  avatar_url text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "profiles self read"   on public.profiles;
drop policy if exists "profiles self insert" on public.profiles;
drop policy if exists "profiles self update" on public.profiles;

create policy "profiles self read"   on public.profiles
  for select using (auth.uid() = id);
create policy "profiles self insert" on public.profiles
  for insert with check (auth.uid() = id);
create policy "profiles self update" on public.profiles
  for update using (auth.uid() = id);

-- Auto-create a profile row when a new auth user signs up.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', ''))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- =============================================================
-- contacts  (public contact form submissions)
-- =============================================================
create table if not exists public.contacts (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  subject text,
  message text not null,
  created_at timestamptz not null default now()
);

alter table public.contacts enable row level security;

drop policy if exists "contacts public insert" on public.contacts;
create policy "contacts public insert" on public.contacts
  for insert with check (true);
-- (No select policy — only the service role / dashboard can read submissions.)

-- =============================================================
-- bookings  (consultation bookings, anonymous + authenticated)
-- =============================================================
create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete set null,
  guest_name text,
  guest_email text,
  service_type text not null,
  booking_date date not null,
  booking_time time not null,
  notes text,
  status text not null default 'pending'
    check (status in ('pending', 'confirmed', 'cancelled', 'completed')),
  created_at timestamptz not null default now()
);

create index if not exists bookings_date_time_idx
  on public.bookings (booking_date, booking_time);

create unique index if not exists bookings_slot_unique
  on public.bookings (booking_date, booking_time)
  where status in ('pending', 'confirmed');

alter table public.bookings enable row level security;

drop policy if exists "bookings public insert"   on public.bookings;
drop policy if exists "bookings public availability read" on public.bookings;
drop policy if exists "bookings owner read"      on public.bookings;
drop policy if exists "bookings owner update"    on public.bookings;

-- Anyone (incl. anon) may book a slot.
create policy "bookings public insert" on public.bookings
  for insert with check (true);

-- Authenticated users see their own bookings.
create policy "bookings owner read" on public.bookings
  for select using (user_id = auth.uid());

-- Authenticated users can cancel/edit their own bookings.
create policy "bookings owner update" on public.bookings
  for update using (user_id = auth.uid());

-- =============================================================
-- avatars storage bucket
-- =============================================================
-- Object naming convention: `{user_id}/avatar.{ext}` so the foldername
-- check below scopes uploads to each user's own folder.
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

drop policy if exists "avatars public read"   on storage.objects;
drop policy if exists "avatars owner insert"  on storage.objects;
drop policy if exists "avatars owner update"  on storage.objects;
drop policy if exists "avatars owner delete"  on storage.objects;

create policy "avatars public read" on storage.objects
  for select using (bucket_id = 'avatars');

create policy "avatars owner insert" on storage.objects
  for insert with check (
    bucket_id = 'avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "avatars owner update" on storage.objects
  for update using (
    bucket_id = 'avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "avatars owner delete" on storage.objects
  for delete using (
    bucket_id = 'avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
  );
