-- Topics and typed content relationships
-- Additive foundation for the public Topics library.

create table if not exists public.topics (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  parent_id uuid references public.topics(id) on delete set null,
  is_public boolean not null default false,
  sort_order integer not null default 0,
  seo_title text,
  seo_description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (char_length(trim(name)) between 1 and 120),
  check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$')
);

create table if not exists public.content_topics (
  id uuid primary key default gen_random_uuid(),
  topic_id uuid not null references public.topics(id) on delete cascade,
  content_type text not null check (content_type in ('blog_post', 'research_output', 'event', 'asset', 'newsletter_issue', 'event_recording')),
  content_id uuid not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  unique (topic_id, content_type, content_id)
);

create index if not exists topics_public_order_idx
  on public.topics (is_public, sort_order, name);
create index if not exists topics_parent_order_idx
  on public.topics (parent_id, sort_order, name);
create index if not exists content_topics_topic_order_idx
  on public.content_topics (topic_id, sort_order, created_at desc);
create index if not exists content_topics_content_idx
  on public.content_topics (content_type, content_id);

alter table public.topics enable row level security;
alter table public.content_topics enable row level security;

grant select on public.topics to anon, authenticated;
grant select on public.content_topics to anon, authenticated;
grant insert, update, delete on public.topics to authenticated;
grant insert, update, delete on public.content_topics to authenticated;

drop policy if exists "topics_public_read" on public.topics;
create policy "topics_public_read" on public.topics
  for select using (is_public or public.is_owner());

drop policy if exists "topics_owner_write" on public.topics;
create policy "topics_owner_write" on public.topics
  for all using (public.is_owner()) with check (public.is_owner());

drop policy if exists "content_topics_public_read" on public.content_topics;
create policy "content_topics_public_read" on public.content_topics
  for select using (
    exists (
      select 1 from public.topics t
      where t.id = content_topics.topic_id
        and (t.is_public or public.is_owner())
    )
  );

drop policy if exists "content_topics_owner_write" on public.content_topics;
create policy "content_topics_owner_write" on public.content_topics
  for all using (public.is_owner()) with check (public.is_owner());

comment on table public.topics is 'Public subject pages connecting Blog, Research, Events, and selected assets.';
comment on table public.content_topics is 'Typed polymorphic links from published content to topics; public writes are owner-only.';
