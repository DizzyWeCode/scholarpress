-- ============================================================
-- Migration: email delivery tracking + RLS hardening
-- Run in: Supabase Dashboard -> SQL Editor -> New query -> paste -> Run
--
-- What this does
--   1. Creates public.email_sends        — one row per outbound marketing
--      email (newsletter, webinar announcement, webinar reminder, welcome),
--      written by the app and updated by the Resend webhook with
--      delivered / opened / clicked / bounced status.
--   2. Recreates public.webinar_registrations in its intended shape
--      (reserved for a future in-app registration flow; nothing reads it yet).
--   3. Enables Row Level Security on every public table as a safety net,
--      in case it was ever disabled on the live project.
--   4. Adds owner-only RLS policies for the two new tables.
--
-- Safety notes (read before running)
--   * public.email_sends and public.webinar_registrations were verified to
--     contain 0 rows and to be referenced by no code, so DROP + CREATE only
--     rebuilds empty tables in their correct shape. If you have added rows
--     to them manually, back them up first.
--   * Everything below is idempotent — running it twice is a no-op.
--   * No service role key or password is used; run it as the SQL Editor
--     session (postgres / supabase_admin), which bypasses RLS.
-- ============================================================

-- ---------- 1. Outbound email log -------------------------------------
drop table if exists public.email_sends cascade;

create table public.email_sends (
  id uuid primary key default gen_random_uuid(),
  purpose text not null check (purpose in ('welcome', 'newsletter', 'webinar_announcement', 'webinar_reminder')),
  recipient_email text not null,
  subject text,
  post_id uuid references public.posts(id) on delete set null,
  webinar_id uuid references public.webinars(id) on delete set null,
  resend_email_id text unique,            -- Resend's email id, set on accepted send
  status text not null default 'queued'
    check (status in ('queued', 'sent', 'delivered', 'opened', 'clicked', 'bounced', 'failed')),
  error_message text,                     -- populated when status = 'failed'
  sent_at timestamptz,
  delivered_at timestamptz,
  opened_at timestamptz,
  clicked_at timestamptz,
  bounced_at timestamptz,
  created_at timestamptz not null default now()
);

create index email_sends_purpose_sent_idx
  on public.email_sends (purpose, sent_at desc);
create index email_sends_status_idx
  on public.email_sends (status);
create index email_sends_post_idx
  on public.email_sends (post_id) where post_id is not null;
create index email_sends_webinar_idx
  on public.email_sends (webinar_id) where webinar_id is not null;
create index email_sends_recipient_purpose_idx
  on public.email_sends (recipient_email, purpose);

-- ---------- 2. Webinar registrations -----------------------------------
drop table if exists public.webinar_registrations cascade;

create table public.webinar_registrations (
  id uuid primary key default gen_random_uuid(),
  webinar_id uuid not null references public.webinars(id) on delete cascade,
  email text not null,
  user_id uuid references auth.users(id) on delete set null,
  reminder_sent_at timestamptz,
  created_at timestamptz not null default now(),
  unique (webinar_id, email)
);

create index webinar_registrations_webinar_idx
  on public.webinar_registrations (webinar_id);

-- ---------- 3. RLS safety net for every public table --------------------
alter table public.profiles              enable row level security;
alter table public.posts                 enable row level security;
alter table public.papers                enable row level security;
alter table public.webinars              enable row level security;
alter table public.subscribers           enable row level security;
alter table public.page_views            enable row level security;
alter table public.comments              enable row level security;
alter table public.comment_likes         enable row level security;
alter table public.post_likes            enable row level security;
alter table public.polls                 enable row level security;
alter table public.poll_options          enable row level security;
alter table public.poll_votes            enable row level security;
alter table public.email_sends           enable row level security;
alter table public.webinar_registrations enable row level security;

-- Data API table privileges. RLS still decides which rows each role can touch;
-- these grants prevent SQL-created tables from being invisible to PostgREST.
grant select, insert, delete on public.subscribers to anon, authenticated;
grant insert on public.page_views to anon, authenticated;
grant select, insert, update, delete on public.email_sends to authenticated;
grant select, insert, update, delete on public.webinar_registrations to authenticated;

-- ---------- 4. Owner-only access to the two new tables -----------------
-- The cron job and the Resend webhook use the service_role key, which
-- bypasses RLS, so anon/authenticated users must see nothing here.
create or replace function public.is_owner()
returns boolean
language sql
security definer set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'owner'
  );
$$;

drop policy if exists "email_sends_owner_read" on public.email_sends;
drop policy if exists "email_sends_owner_write" on public.email_sends;
create policy "email_sends_owner_read" on public.email_sends
  for select using (public.is_owner());
create policy "email_sends_owner_write" on public.email_sends
  for all using (public.is_owner()) with check (public.is_owner());

drop policy if exists "webinar_registrations_owner_read" on public.webinar_registrations;
drop policy if exists "webinar_registrations_owner_write" on public.webinar_registrations;
create policy "webinar_registrations_owner_read" on public.webinar_registrations
  for select using (public.is_owner());
create policy "webinar_registrations_owner_write" on public.webinar_registrations
  for all using (public.is_owner()) with check (public.is_owner());
