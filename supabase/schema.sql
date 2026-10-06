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

create or replace function public.protect_profile_fields()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  if new.role is distinct from old.role and not public.is_owner() then
    raise exception 'Only the site owner can change profile roles';
  end if;
  return new;
end;
$$;

drop trigger if exists profiles_protect_fields on public.profiles;
create trigger profiles_protect_fields
  before update on public.profiles
  for each row execute function public.protect_profile_fields();

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
  like_count int not null default 0,
  author_id uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.posts
  add column if not exists like_count int not null default 0;

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

-- ---------- Member discussion ----------
create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  parent_id uuid references public.comments(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete set null,
  author_name text not null default 'Reader',
  body text not null check (char_length(trim(body)) between 1 and 2000),
  status text not null default 'visible' check (status in ('visible', 'hidden', 'deleted')),
  like_count int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists comments_post_created_idx
  on public.comments (post_id, created_at);
create index if not exists comments_parent_idx
  on public.comments (parent_id);

create table if not exists public.comment_likes (
  comment_id uuid not null references public.comments(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (comment_id, user_id)
);

create table if not exists public.post_likes (
  post_id uuid not null references public.posts(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (post_id, user_id)
);

-- ---------- Polls ----------
create table if not exists public.polls (
  id uuid primary key default gen_random_uuid(),
  post_id uuid references public.posts(id) on delete cascade,
  question text not null check (char_length(trim(question)) between 1 and 240),
  status text not null default 'draft' check (status in ('draft', 'open', 'closed')),
  allow_results_before_vote boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.poll_options (
  id uuid primary key default gen_random_uuid(),
  poll_id uuid not null references public.polls(id) on delete cascade,
  label text not null check (char_length(trim(label)) between 1 and 160),
  sort_order int not null default 0,
  vote_count int not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists poll_options_poll_sort_idx
  on public.poll_options (poll_id, sort_order);

create table if not exists public.poll_votes (
  poll_id uuid not null references public.polls(id) on delete cascade,
  option_id uuid not null references public.poll_options(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (poll_id, user_id)
);

create or replace function public.set_comment_author_name()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  profile_name text;
begin
  select nullif(trim(full_name), '') into profile_name
  from public.profiles
  where id = new.user_id;

  new.author_name := coalesce(profile_name, 'Reader');
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists comments_set_author_name on public.comments;
create trigger comments_set_author_name
  before insert on public.comments
  for each row execute function public.set_comment_author_name();

create or replace function public.refresh_comment_like_count()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  update public.comments
  set like_count = (
    select count(*)::int from public.comment_likes
    where comment_id = coalesce(new.comment_id, old.comment_id)
  )
  where id = coalesce(new.comment_id, old.comment_id);
  return null;
end;
$$;

drop trigger if exists comment_likes_refresh_count on public.comment_likes;
create trigger comment_likes_refresh_count
  after insert or delete on public.comment_likes
  for each row execute function public.refresh_comment_like_count();

create or replace function public.refresh_post_like_count()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  update public.posts
  set like_count = (
    select count(*)::int from public.post_likes
    where post_id = coalesce(new.post_id, old.post_id)
  )
  where id = coalesce(new.post_id, old.post_id);
  return null;
end;
$$;

drop trigger if exists post_likes_refresh_count on public.post_likes;
create trigger post_likes_refresh_count
  after insert or delete on public.post_likes
  for each row execute function public.refresh_post_like_count();

create or replace function public.refresh_poll_option_vote_count()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  if tg_op = 'UPDATE' and old.option_id is distinct from new.option_id then
    update public.poll_options
    set vote_count = (select count(*)::int from public.poll_votes where option_id = old.option_id)
    where id = old.option_id;
  end if;
  update public.poll_options
  set vote_count = (
    select count(*)::int from public.poll_votes
    where option_id = coalesce(new.option_id, old.option_id)
  )
  where id = coalesce(new.option_id, old.option_id);
  return null;
end;
$$;

drop trigger if exists poll_votes_refresh_count on public.poll_votes;
create trigger poll_votes_refresh_count
  after insert or delete or update of option_id on public.poll_votes
  for each row execute function public.refresh_poll_option_vote_count();

-- ============================================================
-- Row Level Security
-- ============================================================

alter table public.profiles enable row level security;
alter table public.posts enable row level security;
alter table public.papers enable row level security;
alter table public.webinars enable row level security;
alter table public.subscribers enable row level security;
alter table public.page_views enable row level security;
alter table public.comments enable row level security;
alter table public.comment_likes enable row level security;
alter table public.post_likes enable row level security;
alter table public.polls enable row level security;
alter table public.poll_options enable row level security;
alter table public.poll_votes enable row level security;

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
drop policy if exists "profiles_read" on public.profiles;
drop policy if exists "profiles_update_self" on public.profiles;
create policy "profiles_read" on public.profiles
  for select using (auth.uid() = id or public.is_owner());
create policy "profiles_update_self" on public.profiles
  for update to authenticated using (auth.uid() = id) with check (auth.uid() = id);

-- posts: public reads published; owner does everything
drop policy if exists "posts_public_read" on public.posts;
drop policy if exists "posts_owner_write" on public.posts;
create policy "posts_public_read" on public.posts
  for select using (status = 'published' or public.is_owner());
create policy "posts_owner_write" on public.posts
  for all using (public.is_owner()) with check (public.is_owner());

-- papers: public reads published; owner does everything
drop policy if exists "papers_public_read" on public.papers;
drop policy if exists "papers_owner_write" on public.papers;
create policy "papers_public_read" on public.papers
  for select using (status = 'published' or public.is_owner());
create policy "papers_owner_write" on public.papers
  for all using (public.is_owner()) with check (public.is_owner());

-- webinars: public reads upcoming/past; owner does everything
drop policy if exists "webinars_public_read" on public.webinars;
drop policy if exists "webinars_owner_write" on public.webinars;
create policy "webinars_public_read" on public.webinars
  for select using (status in ('upcoming', 'past') or public.is_owner());
create policy "webinars_owner_write" on public.webinars
  for all using (public.is_owner()) with check (public.is_owner());

-- subscribers: anyone can subscribe (insert); only owner can list/delete;
-- a signed-in user may delete their own row (unsubscribe)
drop policy if exists "subscribers_insert" on public.subscribers;
drop policy if exists "subscribers_owner_read" on public.subscribers;
drop policy if exists "subscribers_delete" on public.subscribers;
create policy "subscribers_insert" on public.subscribers
  for insert with check (true);
create policy "subscribers_owner_read" on public.subscribers
  for select using (public.is_owner() or auth.jwt() ->> 'email' = email);
create policy "subscribers_delete" on public.subscribers
  for delete using (public.is_owner() or auth.jwt() ->> 'email' = email);

-- page_views: anyone can record a view; only the owner can read analytics
drop policy if exists "page_views_insert" on public.page_views;
drop policy if exists "page_views_owner_read" on public.page_views;
create policy "page_views_insert" on public.page_views
  for insert with check (true);
create policy "page_views_owner_read" on public.page_views
  for select using (public.is_owner());

-- comments: signed-in readers can discuss published posts; owner can moderate
drop policy if exists "comments_read" on public.comments;
drop policy if exists "comments_insert" on public.comments;
drop policy if exists "comments_update_own" on public.comments;
drop policy if exists "comments_owner_write" on public.comments;
create policy "comments_read" on public.comments
  for select using (status = 'visible' or user_id = auth.uid() or public.is_owner());
create policy "comments_insert" on public.comments
  for insert to authenticated
  with check (
    user_id = auth.uid()
    and status = 'visible'
    and exists (
      select 1 from public.posts
      where posts.id = post_id and posts.status = 'published'
    )
    and (
      parent_id is null
      or exists (
        select 1 from public.comments parent
        where parent.id = parent_id
          and parent.post_id = post_id
          and parent.parent_id is null
          and parent.status = 'visible'
      )
    )
  );
create policy "comments_update_own" on public.comments
  for update to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid() and status in ('visible', 'deleted'));
create policy "comments_owner_write" on public.comments
  for all using (public.is_owner()) with check (public.is_owner());

drop policy if exists "comment_likes_read_own" on public.comment_likes;
drop policy if exists "comment_likes_insert_own" on public.comment_likes;
drop policy if exists "comment_likes_delete_own" on public.comment_likes;
create policy "comment_likes_read_own" on public.comment_likes
  for select to authenticated using (user_id = auth.uid() or public.is_owner());
create policy "comment_likes_insert_own" on public.comment_likes
  for insert to authenticated
  with check (
    user_id = auth.uid()
    and exists (
      select 1 from public.comments
      where comments.id = comment_id and comments.status = 'visible'
    )
  );
create policy "comment_likes_delete_own" on public.comment_likes
  for delete to authenticated using (user_id = auth.uid() or public.is_owner());

drop policy if exists "post_likes_read_own" on public.post_likes;
drop policy if exists "post_likes_insert_own" on public.post_likes;
drop policy if exists "post_likes_delete_own" on public.post_likes;
create policy "post_likes_read_own" on public.post_likes
  for select to authenticated using (user_id = auth.uid() or public.is_owner());
create policy "post_likes_insert_own" on public.post_likes
  for insert to authenticated
  with check (
    user_id = auth.uid()
    and exists (
      select 1 from public.posts
      where posts.id = post_id and posts.status = 'published'
    )
  );
create policy "post_likes_delete_own" on public.post_likes
  for delete to authenticated using (user_id = auth.uid() or public.is_owner());

-- polls: owner authors; signed-in readers vote once
drop policy if exists "polls_read" on public.polls;
drop policy if exists "polls_owner_write" on public.polls;
drop policy if exists "poll_options_read" on public.poll_options;
drop policy if exists "poll_options_owner_write" on public.poll_options;
drop policy if exists "poll_votes_read_own" on public.poll_votes;
drop policy if exists "poll_votes_insert_own" on public.poll_votes;
drop policy if exists "poll_votes_update_own" on public.poll_votes;
create policy "polls_read" on public.polls
  for select using (status in ('open', 'closed') or public.is_owner());
create policy "polls_owner_write" on public.polls
  for all using (public.is_owner()) with check (public.is_owner());
create policy "poll_options_read" on public.poll_options
  for select using (
    exists (
      select 1 from public.polls
      where polls.id = poll_id and (polls.status in ('open', 'closed') or public.is_owner())
    )
  );
create policy "poll_options_owner_write" on public.poll_options
  for all using (public.is_owner()) with check (public.is_owner());
create policy "poll_votes_read_own" on public.poll_votes
  for select to authenticated using (user_id = auth.uid() or public.is_owner());
create policy "poll_votes_insert_own" on public.poll_votes
  for insert to authenticated
  with check (
    user_id = auth.uid()
    and exists (
      select 1
      from public.polls
      join public.poll_options on poll_options.poll_id = polls.id
      where polls.id = poll_votes.poll_id
        and poll_options.id = poll_votes.option_id
        and polls.status = 'open'
    )
  );
create policy "poll_votes_update_own" on public.poll_votes
  for update to authenticated
  using (user_id = auth.uid())
  with check (
    user_id = auth.uid()
    and exists (
      select 1
      from public.polls
      join public.poll_options on poll_options.poll_id = polls.id
      where polls.id = poll_votes.poll_id
        and poll_options.id = poll_votes.option_id
        and polls.status = 'open'
    )
  );

-- ============================================================
-- IMPORTANT: make yourself the owner (run after your first sign-in)
-- ============================================================
-- update public.profiles set role = 'owner' where email = 'you@example.com';
