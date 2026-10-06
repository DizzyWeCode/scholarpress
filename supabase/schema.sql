-- ============================================================
-- ScholarPress — Supabase schema
-- Run in: Supabase Dashboard -> SQL Editor -> New query -> paste -> Run
-- ============================================================

-- ---------- Profiles (mirrors auth.users) ----------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  avatar_url text,
  role text not null default 'reader' check (role in ('owner', 'reader')),
  created_at timestamptz not null default now()
);

-- Auto-create a profile when a user signs up (Google OAuth or magic link)
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name'),
    new.raw_user_meta_data ->> 'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------- Posts (blog articles) ----------
create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  excerpt text,
  content jsonb,                       -- TipTap JSON document
  cover_image_url text,
  cover_image_credit text,             -- e.g. "Photo by Jane Doe on Unsplash"
  cover_image_credit_url text,         -- link to the image source
  tags text[] not null default '{}',
  status text not null default 'draft' check (status in ('draft', 'published', 'scheduled')),
  published_at timestamptz,
  seo_title text,
  seo_description text,
  "references" jsonb not null default '[]',  -- [{ "label": "...", "url": "..." }]
  reading_time_minutes int,
  author_id uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------- Research papers ----------
create table if not exists public.papers (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  abstract text,
  authors text[] not null default '{}',
  venue text,
  year int,
  doi text,
  url text,
  pdf_url text,
  tags text[] not null default '{}',
  featured boolean not null default false,
  status text not null default 'draft' check (status in ('draft', 'published')),
  created_at timestamptz not null default now()
);

-- ---------- Webinars ----------
create table if not exists public.webinars (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  starts_at timestamptz not null,
  duration_minutes int,
  platform text,                        -- e.g. "Zoom", "Google Meet"
  registration_url text,
  recording_url text,
  status text not null default 'upcoming' check (status in ('upcoming', 'past', 'draft')),
  created_at timestamptz not null default now()
);

-- ---------- Newsletter subscribers ----------
create table if not exists public.subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  user_id uuid references auth.users(id) on delete set null,
  source text,
  created_at timestamptz not null default now()
);

-- ---------- Page views (consent-gated analytics) ----------
create table if not exists public.page_views (
  id bigint generated always as identity primary key,
  path text not null,
  referrer text,                        -- referring host only, never full URL
  user_agent text,
  created_at timestamptz not null default now()
);

-- ============================================================
-- Row Level Security
-- ============================================================

alter table public.profiles enable row level security;
alter table public.posts enable row level security;
alter table public.papers enable row level security;
alter table public.webinars enable row level security;
alter table public.subscribers enable row level security;
alter table public.page_views enable row level security;

-- Helper: is the current user the site owner?
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

-- profiles: readable by owner + self; self may update own name/avatar only
create policy "profiles_read" on public.profiles
  for select using (auth.uid() = id or public.is_owner());
create policy "profiles_update_self" on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

-- posts: public reads published; owner does everything
create policy "posts_public_read" on public.posts
  for select using (status = 'published' or public.is_owner());
create policy "posts_owner_write" on public.posts
  for all using (public.is_owner()) with check (public.is_owner());

-- papers: public reads published; owner does everything
create policy "papers_public_read" on public.papers
  for select using (status = 'published' or public.is_owner());
create policy "papers_owner_write" on public.papers
  for all using (public.is_owner()) with check (public.is_owner());

-- webinars: public reads upcoming/past; owner does everything
create policy "webinars_public_read" on public.webinars
  for select using (status in ('upcoming', 'past') or public.is_owner());
create policy "webinars_owner_write" on public.webinars
  for all using (public.is_owner()) with check (public.is_owner());

-- subscribers: anyone can subscribe (insert); only owner can list/delete;
-- a signed-in user may delete their own row (unsubscribe)
create policy "subscribers_insert" on public.subscribers
  for insert with check (true);
create policy "subscribers_owner_read" on public.subscribers
  for select using (public.is_owner() or auth.jwt() ->> 'email' = email);
create policy "subscribers_delete" on public.subscribers
  for delete using (public.is_owner() or auth.jwt() ->> 'email' = email);

-- page_views: anyone can record a view; only the owner can read analytics
create policy "page_views_insert" on public.page_views
  for insert with check (true);
create policy "page_views_owner_read" on public.page_views
  for select using (public.is_owner());

-- ============================================================
-- IMPORTANT: make yourself the owner (run after your first sign-in)
-- ============================================================
-- update public.profiles set role = 'owner' where email = 'you@example.com';
