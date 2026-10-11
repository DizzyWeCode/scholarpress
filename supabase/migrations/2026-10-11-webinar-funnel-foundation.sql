-- Webinar funnel foundation
-- Extends public event content without storing private host credentials on the
-- publicly readable webinars table. Run in Supabase SQL Editor.

alter table public.webinars
  add column if not exists slug text,
  add column if not exists promise text,
  add column if not exists timezone text not null default 'Africa/Blantyre',
  add column if not exists format text,
  add column if not exists hero_image_url text,
  add column if not exists hero_image_alt text,
  add column if not exists thumbnail_image_url text,
  add column if not exists thumbnail_image_alt text,
  add column if not exists image_credit text,
  add column if not exists image_credit_url text,
  add column if not exists speaker_name text,
  add column if not exists speaker_role text,
  add column if not exists speaker_bio text,
  add column if not exists speaker_image_url text,
  add column if not exists speaker_image_alt text,
  add column if not exists takeaways jsonb not null default '[]'::jsonb,
  add column if not exists agenda jsonb not null default '[]'::jsonb,
  add column if not exists resources jsonb not null default '[]'::jsonb,
  add column if not exists registration_mode text not null default 'first_party',
  add column if not exists registration_open_at timestamptz,
  add column if not exists registration_close_at timestamptz,
  add column if not exists replay_visibility text not null default 'public',
  add column if not exists replay_available_at timestamptz,
  add column if not exists course_cta_label text,
  add column if not exists course_cta_url text,
  add column if not exists related_post_ids uuid[] not null default '{}';

-- Existing rows need stable, human-readable URLs before the unique index is added.
update public.webinars
set slug = left(
  trim(both '-' from regexp_replace(lower(title), '[^a-z0-9]+', '-', 'g'))
  || '-' || left(id::text, 8),
  180
)
where slug is null or btrim(slug) = '';

alter table public.webinars
  alter column slug set not null;

alter table public.webinars
  drop constraint if exists webinars_status_check;

alter table public.webinars
  add constraint webinars_status_check
  check (status in ('draft', 'scheduled', 'registration_open', 'upcoming', 'live', 'past', 'replay_available', 'archived', 'cancelled'));

alter table public.webinars
  drop constraint if exists webinars_registration_mode_check;

alter table public.webinars
  add constraint webinars_registration_mode_check
  check (registration_mode in ('first_party', 'external', 'hybrid'));

alter table public.webinars
  drop constraint if exists webinars_replay_visibility_check;

alter table public.webinars
  add constraint webinars_replay_visibility_check
  check (replay_visibility in ('unpublished', 'public', 'registered_only', 'members_only'));

create unique index if not exists webinars_slug_unique_idx
  on public.webinars (slug);

create index if not exists webinars_funnel_status_starts_idx
  on public.webinars (status, starts_at);

-- Provider credentials and attendee access links are intentionally kept out of
-- public.webinars because that table has an anonymous read policy.
create table if not exists public.webinar_access (
  webinar_id uuid primary key references public.webinars(id) on delete cascade,
  provider text not null default 'manual',
  provider_event_id text,
  join_url text,
  host_url text,
  updated_at timestamptz not null default now()
);

alter table public.webinar_access enable row level security;

grant select, insert, update, delete on public.webinar_access to authenticated;

drop policy if exists "webinar_access_owner_only" on public.webinar_access;
create policy "webinar_access_owner_only" on public.webinar_access
  for all using (public.is_owner()) with check (public.is_owner());

create table if not exists public.webinar_interest_signals (
  id uuid primary key default gen_random_uuid(),
  webinar_id uuid references public.webinars(id) on delete set null,
  email text not null,
  full_name text,
  signal_type text not null default 'course_interest',
  experience_level text,
  preferred_format text,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  utm_content text,
  first_touch_at timestamptz,
  created_at timestamptz not null default now(),
  unique (webinar_id, email, signal_type)
);

create index if not exists webinar_interest_signals_webinar_idx
  on public.webinar_interest_signals (webinar_id, created_at desc);

create index if not exists webinar_interest_signals_email_idx
  on public.webinar_interest_signals (email);

alter table public.webinar_interest_signals enable row level security;

grant select, insert, update, delete on public.webinar_interest_signals to authenticated;

drop policy if exists "webinar_interest_signals_owner_only" on public.webinar_interest_signals;
create policy "webinar_interest_signals_owner_only" on public.webinar_interest_signals
  for all using (public.is_owner()) with check (public.is_owner());
