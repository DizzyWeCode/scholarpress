-- First-party webinar registration fields
alter table public.webinar_registrations
  add column if not exists full_name text,
  add column if not exists consent_events boolean not null default true,
  add column if not exists consent_marketing boolean not null default false,
  add column if not exists status text not null default 'registered',
  add column if not exists utm_source text,
  add column if not exists utm_medium text,
  add column if not exists utm_campaign text,
  add column if not exists utm_content text,
  add column if not exists referrer text,
  add column if not exists first_touch_at timestamptz,
  add column if not exists attended_at timestamptz,
  add column if not exists replay_viewed_at timestamptz;

alter table public.webinar_registrations
  drop constraint if exists webinar_registrations_status_check;

alter table public.webinar_registrations
  add constraint webinar_registrations_status_check
  check (status in ('registered', 'confirmed', 'attended', 'no_show', 'replay_viewed', 'cancelled', 'unsubscribed'));

create index if not exists webinar_registrations_status_idx
  on public.webinar_registrations (webinar_id, status, created_at desc);

create index if not exists webinar_registrations_campaign_idx
  on public.webinar_registrations (utm_source, utm_campaign);
