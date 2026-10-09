-- ============================================================
-- CI ONLY — assertions run after schema.sql (twice) + seed.sql.
--
-- Every check raises an exception so that psql exits non-zero with
-- ON_ERROR_STOP=1 and the `schema` job fails loudly.
-- ============================================================

-- ---------- 1. Tables ----------
do $$
declare
  missing text[] := '{}';
  tbl text;
begin
  foreach tbl in array array[
    'profiles', 'posts', 'papers', 'webinars', 'subscribers', 'page_views',
    'comments', 'comment_likes', 'post_likes', 'polls', 'poll_options',
    'poll_votes', 'email_sends', 'webinar_registrations'
  ] loop
    if to_regclass('public.' || tbl) is null then
      missing := missing || tbl;
    end if;
  end loop;

  if array_length(missing, 1) is not null then
    raise exception 'Missing tables: %', array_to_string(missing, ', ');
  end if;
  raise notice 'OK — all 14 tables present';
end
$$;

-- ---------- 2. Row Level Security is actually enabled ----------
do $$
declare
  bad text[] := '{}';
  tbl text;
begin
  foreach tbl in array array[
    'profiles', 'posts', 'papers', 'webinars', 'subscribers', 'page_views',
    'comments', 'comment_likes', 'post_likes', 'polls', 'poll_options',
    'poll_votes', 'email_sends', 'webinar_registrations'
  ] loop
    if not exists (
      select 1
      from pg_class c
      join pg_namespace n on n.oid = c.relnamespace
      where n.nspname = 'public' and c.relname = tbl and c.relrowsecurity
    ) then
      bad := bad || tbl;
    end if;
  end loop;

  if array_length(bad, 1) is not null then
    raise exception 'Row Level Security not enabled on: %', array_to_string(bad, ', ');
  end if;
  raise notice 'OK — RLS enabled on all 14 tables';
end
$$;

-- ---------- 3. Policies ----------
do $$
declare
  missing text[] := '{}';
  pol record;
begin
  for pol in
    select * from (values
      ('profiles',    'profiles_read'),
      ('profiles',    'profiles_update_self'),
      ('posts',       'posts_public_read'),
      ('posts',       'posts_owner_write'),
      ('papers',      'papers_public_read'),
      ('papers',      'papers_owner_write'),
      ('webinars',    'webinars_public_read'),
      ('webinars',    'webinars_owner_write'),
      ('subscribers', 'subscribers_insert'),
      ('subscribers', 'subscribers_owner_read'),
      ('subscribers', 'subscribers_delete'),
      ('page_views',  'page_views_insert'),
      ('page_views',  'page_views_owner_read'),
      ('comments',    'comments_read'),
      ('comments',    'comments_insert'),
      ('comments',    'comments_update_own'),
      ('comments',    'comments_owner_write'),
      ('comment_likes', 'comment_likes_read_own'),
      ('comment_likes', 'comment_likes_insert_own'),
      ('comment_likes', 'comment_likes_delete_own'),
      ('post_likes',  'post_likes_read_own'),
      ('post_likes',  'post_likes_insert_own'),
      ('post_likes',  'post_likes_delete_own'),
      ('polls',       'polls_read'),
      ('polls',       'polls_owner_write'),
      ('poll_options','poll_options_read'),
      ('poll_options','poll_options_owner_write'),
      ('poll_votes',  'poll_votes_read_own'),
      ('poll_votes',  'poll_votes_insert_own'),
      ('poll_votes',  'poll_votes_update_own'),
      ('email_sends', 'email_sends_owner_read'),
      ('email_sends', 'email_sends_owner_write'),
      ('webinar_registrations', 'webinar_registrations_owner_read'),
      ('webinar_registrations', 'webinar_registrations_owner_write')
    ) as expected(tab, name)
  loop
    if not exists (
      select 1 from pg_policies
      where schemaname = 'public' and tablename = pol.tab and policyname = pol.name
    ) then
      missing := missing || (pol.tab || '.' || pol.name);
    end if;
  end loop;

  if array_length(missing, 1) is not null then
    raise exception 'Missing RLS policies: %', array_to_string(missing, ', ');
  end if;
  raise notice 'OK — all 34 RLS policies present';
end
$$;

-- ---------- 4. Functions and triggers ----------
do $$
declare
  missing text[] := '{}';
  fn text;
  trg record;
begin
  foreach fn in array array[
    'public.handle_new_user',
    'public.protect_profile_fields',
    'public.set_comment_author_name',
    'public.protect_comment_fields',
    'public.refresh_comment_like_count',
    'public.refresh_post_like_count',
    'public.refresh_poll_option_vote_count',
    'public.is_owner',
    'auth.uid',
    'auth.jwt'
  ] loop
    if to_regprocedure(fn || '()') is null then
      missing := missing || fn;
    end if;
  end loop;

  for trg in
    select * from (values
      ('auth',        'users',              'on_auth_user_created'),
      ('public',      'profiles',           'profiles_protect_fields'),
      ('public',      'comments',           'comments_set_author_name'),
      ('public',      'comments',           'comments_protect_fields'),
      ('public',      'comment_likes',      'comment_likes_refresh_count'),
      ('public',      'post_likes',         'post_likes_refresh_count'),
      ('public',      'poll_votes',          'poll_votes_refresh_count')
    ) as expected(sch, tab, name)
  loop
    if not exists (
      select 1 from pg_trigger t
      join pg_class c on c.oid = t.tgrelid
      join pg_namespace n on n.oid = c.relnamespace
      where not t.tgisinternal
        and n.nspname = trg.sch
        and c.relname = trg.tab
        and t.tgname = trg.name
    ) then
      missing := missing || (trg.tab || '.' || trg.name);
    end if;
  end loop;

  if array_length(missing, 1) is not null then
    raise exception 'Missing functions/triggers: %', array_to_string(missing, ', ');
  end if;
  raise notice 'OK — all functions and triggers present';
end
$$;

-- ---------- 5. Seed data ----------
do $$
declare
  n bigint;
begin
  select count(*) into n from public.posts where status = 'published';
  if n = 0 then raise exception 'Seed did not insert any published posts'; end if;

  select count(*) into n from public.papers where status = 'published';
  if n = 0 then raise exception 'Seed did not insert any published papers'; end if;

  select count(*) into n from public.webinars where status = 'upcoming';
  if n = 0 then raise exception 'Seed did not insert any upcoming webinars'; end if;

  raise notice 'OK — seed data present (posts/papers/webinars)';
end
$$;

-- ---------- 6. auth.uid() / auth.jwt() ----------
do $$
begin
  if auth.uid() is not null then
    raise exception 'auth.uid() should be null when no JWT claims are set';
  end if;

  if auth.jwt() ->> 'email' is not null then
    raise exception 'auth.jwt() should have no email when no JWT claims are set';
  end if;

  perform set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000001', true);
  if auth.uid() is distinct from '00000000-0000-0000-0000-000000000001'::uuid then
    raise exception 'auth.uid() did not read request.jwt.claim.sub';
  end if;

  perform set_config(
    'request.jwt.claims',
    '{"sub":"00000000-0000-0000-0000-000000000001","email":"ci@example.org"}',
    true
  );
  if auth.jwt() ->> 'email' <> 'ci@example.org' then
    raise exception 'auth.jwt() did not read request.jwt.claims';
  end if;

  raise notice 'OK — auth.uid() and auth.jwt() behave as expected';
end
$$;

-- ---------- 7. Sign-up trigger creates a profile ----------
insert into auth.users (id, email, raw_user_meta_data)
values ('10000000-0000-0000-0000-000000000001', 'ci@example.org', '{"full_name":"CI Runner"}')
on conflict (id) do nothing;

do $$
begin
  if not exists (
    select 1 from public.profiles
    where id = '10000000-0000-0000-0000-000000000001'::uuid
      and email = 'ci@example.org'
      and full_name = 'CI Runner'
  ) then
    raise exception 'on_auth_user_created did not create a matching profile';
  end if;
  raise notice 'OK — on_auth_user_created trigger creates a profile';
end
$$;

delete from auth.users where id = '10000000-0000-0000-0000-000000000001';

-- ---------- 8. RLS smoke test as `anon` ----------
-- Supabase's `anon` role is unauthenticated traffic. It must reach the
-- security policies (not fail with "permission denied"), and those
-- policies must hide private rows.
do $$
declare
  n bigint;
  draft_id uuid;
  future_scheduled_id uuid;
  past_scheduled_id uuid;
begin
  insert into public.posts (slug, title, excerpt, status)
  values ('ci-rls-draft', 'CI RLS draft', 'not for public eyes', 'draft')
  returning id into draft_id;
  insert into public.posts (slug, title, status, published_at)
  values ('ci-future-scheduled', 'CI future scheduled', 'scheduled', now() + interval '1 day')
  returning id into future_scheduled_id;
  insert into public.posts (slug, title, status, published_at)
  values ('ci-past-scheduled', 'CI past scheduled', 'scheduled', now() - interval '1 day')
  returning id into past_scheduled_id;

  set role anon;

  select count(*) into n from public.subscribers;
  if n <> 0 then
    raise exception 'RLS leak: anon could read % subscriber rows', n;
  end if;

  select count(*) into n from public.profiles;
  if n <> 0 then
    raise exception 'RLS leak: anon could read % profile rows', n;
  end if;

  select count(*) into n from public.page_views;
  if n <> 0 then
    raise exception 'RLS leak: anon could read % page_view rows', n;
  end if;

  select count(*) into n from public.email_sends;
  if n <> 0 then
    raise exception 'RLS leak: anon could read % email_send rows', n;
  end if;

  select count(*) into n from public.webinar_registrations;
  if n <> 0 then
    raise exception 'RLS leak: anon could read % webinar_registration rows', n;
  end if;

  if exists (select 1 from public.posts where id = draft_id) then
    raise exception 'RLS leak: anon could read a draft post';
  end if;
  if exists (select 1 from public.posts where id = future_scheduled_id) then
    raise exception 'RLS leak: anon could read a future scheduled post';
  end if;
  if not exists (select 1 from public.posts where id = past_scheduled_id) then
    raise exception 'RLS regression: anon could not read a past scheduled post';
  end if;

  select count(*) into n from public.posts where status = 'published';
  if n = 0 then
    raise exception 'anon cannot read published posts — RLS is too permissive in the wrong direction';
  end if;

  update public.posts set title = 'hijacked' where status = 'published';
  get diagnostics n = row_count;
  if n <> 0 then
    raise exception 'RLS leak: anon updated % published posts', n;
  end if;

  -- Analytics and newsletter sign-up are intentionally open to anon.
  insert into public.page_views (path) values ('/ci-rls-smoke-test');
  insert into public.subscribers (email) values ('ci-smoke@example.org');

  reset role;

  delete from public.subscribers where email = 'ci-smoke@example.org';
  delete from public.page_views where path = '/ci-rls-smoke-test';
  delete from public.posts where id in (draft_id, future_scheduled_id, past_scheduled_id);

  raise notice 'OK — RLS smoke test passed for role anon';
end
$$;

-- ---------- 9. Behavioral RLS tests for authenticated users ----------
do $$
declare
  test_user uuid := '20000000-0000-0000-0000-000000000001';
  post_a uuid;
  post_b uuid;
  root_comment uuid;
  test_poll_id uuid;
  test_option_id uuid;
begin
  insert into auth.users (id, email, raw_user_meta_data)
  values (test_user, 'rls-user@example.org', '{"full_name":"RLS User"}')
  on conflict (id) do nothing;

  insert into public.posts (slug, title, status)
  values ('ci-rls-published-a', 'CI RLS published A', 'published')
  on conflict (slug) do update set status = 'published'
  returning id into post_a;
  insert into public.posts (slug, title, status)
  values ('ci-rls-published-b', 'CI RLS published B', 'published')
  on conflict (slug) do update set status = 'published'
  returning id into post_b;
  insert into public.polls (post_id, question, status)
  values (post_a, 'CI RLS poll', 'open')
  returning id into test_poll_id;
  insert into public.poll_options (poll_id, label)
  values (test_poll_id, 'Option A')
  returning id into test_option_id;

  perform set_config('request.jwt.claim.sub', test_user::text, true);
  perform set_config('request.jwt.claims', json_build_object('sub', test_user::text, 'email', 'rls-user@example.org')::text, true);
  set local role authenticated;

  insert into public.comments (post_id, user_id, body, status)
  values (post_a, test_user, 'CI top-level comment', 'visible')
  returning id into root_comment;
  insert into public.comments (post_id, parent_id, user_id, body, status)
  values (post_a, root_comment, test_user, 'CI reply on same post', 'visible');

  begin
    insert into public.comments (post_id, parent_id, user_id, body, status)
    values (post_b, root_comment, test_user, 'CI cross-post reply', 'visible');
    raise exception 'Cross-post reply unexpectedly succeeded';
  exception when others then
    if sqlerrm = 'Cross-post reply unexpectedly succeeded' then raise; end if;
  end;

  begin
    update public.comments set like_count = 99 where id = root_comment;
    raise exception 'Comment like_count tampering unexpectedly succeeded';
  exception when others then
    if sqlerrm = 'Comment like_count tampering unexpectedly succeeded' then raise; end if;
  end;

  begin
    update public.profiles set role = 'owner' where id = test_user;
    raise exception 'Profile role escalation unexpectedly succeeded';
  exception when others then
    if sqlerrm = 'Profile role escalation unexpectedly succeeded' then raise; end if;
  end;

  reset role;
  set local role anon;
  begin
    insert into public.comments (post_id, user_id, body, status)
    values (post_a, test_user, 'CI anon comment', 'visible');
    raise exception 'Anon comment insert unexpectedly succeeded';
  exception when others then
    if sqlerrm = 'Anon comment insert unexpectedly succeeded' then raise; end if;
  end;
  begin
    insert into public.post_likes (post_id, user_id) values (post_a, test_user);
    raise exception 'Anon post like insert unexpectedly succeeded';
  exception when others then
    if sqlerrm = 'Anon post like insert unexpectedly succeeded' then raise; end if;
  end;
  begin
    insert into public.poll_votes (poll_id, option_id, user_id)
    values (test_poll_id, test_option_id, test_user);
    raise exception 'Anon poll vote insert unexpectedly succeeded';
  exception when others then
    if sqlerrm = 'Anon poll vote insert unexpectedly succeeded' then raise; end if;
  end;

  reset role;
  delete from public.poll_votes where public.poll_votes.poll_id = test_poll_id;
  delete from public.poll_options where public.poll_options.id = test_option_id;
  delete from public.polls where public.polls.id = test_poll_id;
  delete from public.comments where post_id in (post_a, post_b);
  delete from public.posts where id in (post_a, post_b);
  delete from auth.users where id = test_user;

  raise notice 'OK — behavioral authenticated and anonymous RLS tests passed';
end
$$;

do $$ begin raise notice 'All schema assertions passed.'; end $$;
