-- Account area upgrade: richer profiles + bookmarks + avatars bucket
-- Apply in Supabase SQL editor or via migration tooling.

alter table public.profiles
  add column if not exists bio text,
  add column if not exists institution text,
  add column if not exists title text,
  add column if not exists newsletter_format text not null default 'all'
    check (newsletter_format in ('all', 'essays', 'announcements', 'none'));

create table if not exists public.bookmarks (
  user_id uuid not null references public.profiles(id) on delete cascade,
  post_id uuid not null references public.posts(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, post_id)
);

create index if not exists bookmarks_user_created_idx
  on public.bookmarks (user_id, created_at desc);

alter table public.bookmarks enable row level security;

drop policy if exists "bookmarks_read_own" on public.bookmarks;
drop policy if exists "bookmarks_insert_own" on public.bookmarks;
drop policy if exists "bookmarks_delete_own" on public.bookmarks;
create policy "bookmarks_read_own" on public.bookmarks
  for select to authenticated using (user_id = auth.uid() or public.is_owner());
create policy "bookmarks_insert_own" on public.bookmarks
  for insert to authenticated
  with check (
    user_id = auth.uid()
    and exists (select 1 from public.posts where posts.id = post_id and posts.status = 'published')
  );
create policy "bookmarks_delete_own" on public.bookmarks
  for delete to authenticated using (user_id = auth.uid() or public.is_owner());

-- Avatars: public read, users manage their own folder (<uid>/...)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'avatars',
  'avatars',
  true,
  2097152,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "avatars_public_read" on storage.objects;
drop policy if exists "avatars_insert_own" on storage.objects;
drop policy if exists "avatars_update_own" on storage.objects;
drop policy if exists "avatars_delete_own" on storage.objects;
create policy "avatars_public_read" on storage.objects
  for select using (bucket_id = 'avatars');
create policy "avatars_insert_own" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "avatars_update_own" on storage.objects
  for update to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text)
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "avatars_delete_own" on storage.objects
  for delete to authenticated
  using (bucket_id = 'avatars' and ((storage.foldername(name))[1] = auth.uid()::text or public.is_owner()));
