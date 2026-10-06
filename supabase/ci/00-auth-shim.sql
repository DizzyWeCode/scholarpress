-- ============================================================
-- CI ONLY — stand-in for Supabase's managed `auth` schema.
--
-- supabase/schema.sql assumes a real Supabase project, where `auth.users`,
-- `auth.uid()`, `auth.jwt()` and the `anon` / `authenticated` /
-- `service_role` roles already exist. The plain Postgres container used by
-- the GitHub Actions `schema` job has none of that, so this file creates
-- the minimum surface needed to apply and exercise the schema.
--
-- NEVER run this against a real Supabase project.
-- ============================================================

-- ---------- Roles Supabase provisions on every project ----------
do $$
begin
  if not exists (select 1 from pg_roles where rolname = 'anon') then
    create role anon nologin;
  end if;
  if not exists (select 1 from pg_roles where rolname = 'authenticated') then
    create role authenticated nologin;
  end if;
  if not exists (select 1 from pg_roles where rolname = 'service_role') then
    create role service_role nologin;
  end if;
end
$$;

-- ---------- auth schema ----------
create schema if not exists auth;

create table if not exists auth.users (
  id uuid primary key default gen_random_uuid(),
  email text,
  raw_user_meta_data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- Supabase puts the caller's JWT claims into a per-request GUC.
-- Read `request.jwt.claim.sub` first, then fall back to the full claims
-- document — matching what GoTrue sets up.
create or replace function auth.uid()
returns uuid
language sql
stable
as $$
  select nullif(
    coalesce(
      nullif(current_setting('request.jwt.claim.sub', true), ''),
      nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'sub'
    ),
    ''
  )::uuid
$$;

create or replace function auth.jwt()
returns jsonb
language sql
stable
as $$
  select coalesce(
    nullif(current_setting('request.jwt.claims', true), '')::jsonb,
    json_build_object(
      'sub', nullif(current_setting('request.jwt.claim.sub', true), '')
    )::jsonb
  )
$$;

-- ---------- Default grants ----------
-- On a real project Supabase grants the API roles access to `public`, so
-- Row Level Security (not table ownership) is what actually enforces the
-- rules. Without these grants every query from `anon` would fail with
-- "permission denied" and the RLS smoke test would prove nothing.
grant usage on schema public to anon, authenticated, service_role;
grant usage on schema auth to anon, authenticated, service_role;
alter default privileges in schema public
  grant all on tables to anon, authenticated, service_role;
alter default privileges in schema public
  grant usage, select on sequences to anon, authenticated, service_role;
