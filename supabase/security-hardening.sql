-- =============================================================
-- Security hardening — 2026-10
-- Run once in the Supabase SQL editor (safe to re-run).
--
-- Why: the anon key is public (it ships in the browser bundle), so anyone can
-- call the Supabase REST API directly and skip every check in our Next.js API
-- routes. Row-level security is the only thing that protects these tables
-- from such direct calls. This script closes the gaps found in the review:
--
--   1. bookings         — direct inserts could set status='confirmed' (skip
--                         payment) or impersonate another user_id; owners could
--                         rewrite any column of their booking.
--   2. service_requests — "FOR ALL" policy let a user set their own request to
--                         status='paid' or change `amount` (pay 1 cent).
--   3. search_chunks()  — callable by anyone, so the whole chatbot knowledge
--                         base could be dumped through the REST API.
--   4. avatars bucket   — public SELECT policy allowed listing every user's
--                         folder (= user ids). Public URLs keep working.
--   5. profiles         — update had no WITH CHECK.
--   6. Length limits as a database backstop for the public insert tables.
--   7. Indexes for the dashboard / admin queries.
-- =============================================================

-- 1. bookings -------------------------------------------------
drop policy if exists "bookings public insert" on public.bookings;
create policy "bookings public insert" on public.bookings
  for insert with check (
    status = 'pending'
    and (user_id is null or user_id = auth.uid())
  );

-- Owners may only cancel their own booking — nothing else.
drop policy if exists "bookings owner update" on public.bookings;
create policy "bookings owner update" on public.bookings
  for update using (user_id = auth.uid())
  with check (user_id = auth.uid() and status = 'cancelled');

revoke update on public.bookings from anon, authenticated;
grant update (status) on public.bookings to authenticated;

alter table public.bookings drop constraint if exists bookings_field_lengths;
alter table public.bookings add constraint bookings_field_lengths check (
  char_length(coalesce(guest_name, '')) <= 120
  and char_length(coalesce(guest_email, '')) <= 254
  and char_length(service_type) <= 40
  and char_length(coalesce(notes, '')) <= 2000
) not valid;

-- 2. service_requests (marketplace) ----------------------------
do $$
begin
  if to_regclass('public.service_requests') is null then
    raise notice 'service_requests does not exist — skipping';
    return;
  end if;

  execute 'drop policy if exists "users_own_service_requests" on public.service_requests';
  execute 'drop policy if exists "service_requests owner read" on public.service_requests';
  execute 'drop policy if exists "service_requests owner insert" on public.service_requests';

  -- Users can read their own requests…
  execute $p$create policy "service_requests owner read" on public.service_requests
    for select using (auth.uid() = user_id)$p$;

  -- …and create new ones, but only in the initial state.
  execute $p$create policy "service_requests owner insert" on public.service_requests
    for insert with check (
      auth.uid() = user_id
      and status = 'pending'
      and result is null
      and stripe_payment_intent_id is null
    )$p$;

  -- No UPDATE / DELETE policy: status, amount, result and payment fields are
  -- changed by the server (service role) only.

  -- One open request per user and service (prevents duplicate rows from
  -- parallel submissions). Skipped with a notice if duplicates already exist.
  begin
    execute 'create unique index if not exists service_requests_one_open_per_service
      on public.service_requests (user_id, service_type) where status <> ''delivered''';
  exception when unique_violation then
    raise notice 'Existing duplicate open service_requests — clean them up, then re-run to add the unique index.';
  end;
end
$$;

-- 3. Knowledge-base search: server (service role) only ---------
do $$
begin
  if to_regprocedure('public.search_chunks(text, integer)') is null then
    raise notice 'search_chunks() does not exist — skipping';
    return;
  end if;
  revoke execute on function public.search_chunks(text, integer) from public, anon, authenticated;
  grant execute on function public.search_chunks(text, integer) to service_role;
end
$$;

-- 4. avatars: owners can list their own folder; files stay public by URL
drop policy if exists "avatars public read" on storage.objects;
drop policy if exists "avatars owner read" on storage.objects;
create policy "avatars owner read" on storage.objects
  for select using (
    bucket_id = 'avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

-- 5. profiles ---------------------------------------------------
drop policy if exists "profiles self update" on public.profiles;
create policy "profiles self update" on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

-- 6. Length limits on public insert tables (NOT VALID = existing rows untouched)
do $$
begin
  if to_regclass('public.contacts') is not null then
    execute $q$alter table public.contacts drop constraint if exists contacts_field_lengths;
    alter table public.contacts add constraint contacts_field_lengths check (
      char_length(name) <= 120
      and char_length(email) <= 254
      and char_length(coalesce(subject, '')) <= 200
      and char_length(message) <= 5000
    ) not valid$q$;
  end if;
  if to_regclass('public.discovery_requests') is not null then
    execute $q$alter table public.discovery_requests drop constraint if exists discovery_field_lengths;
    alter table public.discovery_requests add constraint discovery_field_lengths check (
      char_length(full_name) <= 120
      and char_length(email) <= 254
      and char_length(coalesce(company, '')) <= 160
      and char_length(coalesce(website, '')) <= 200
      and char_length(coalesce(industry, '')) <= 160
      and char_length(coalesce(business_description, '')) <= 2000
      and char_length(service_type) <= 40
      and char_length(project_goal) <= 2000
      and char_length(coalesce(target_audience, '')) <= 40
      and cardinality(platform) <= 10
      and char_length(coalesce(current_tools, '')) <= 1000
      and char_length(coalesce(integrations, '')) <= 1000
      and char_length(coalesce(has_content, '')) <= 40
      and char_length(coalesce(language, '')) <= 160
      and char_length(coalesce(tone, '')) <= 40
      and char_length(coalesce(timeline, '')) <= 40
      and char_length(coalesce(budget, '')) <= 40
      and char_length(coalesce(maintenance, '')) <= 40
      and char_length(coalesce(extra_notes, '')) <= 2000
      and char_length(coalesce(locale, '')) <= 5
    ) not valid$q$;
  end if;
end
$$;

-- 7. Indexes for dashboard / admin queries -----------------------
create index if not exists bookings_user_id_idx
  on public.bookings (user_id, booking_date);
do $$
begin
  if to_regclass('public.contacts') is not null then
    create index if not exists contacts_created_at_idx on public.contacts (created_at desc);
  end if;
  if to_regclass('public.discovery_requests') is not null then
    create index if not exists discovery_requests_created_at_idx on public.discovery_requests (created_at desc);
  end if;
end
$$;
