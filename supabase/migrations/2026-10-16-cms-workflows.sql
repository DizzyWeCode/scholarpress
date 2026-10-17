-- CMS workflow improvements: research metadata, contributors, general events, and email purposes.
-- Additive and backwards-compatible with existing papers and webinars routes.

alter table public.papers
  add column if not exists output_type text not null default 'journal_article',
  add column if not exists publication_stage text not null default 'version_of_record',
  add column if not exists public_summary text,
  add column if not exists publication_date_precision text not null default 'year',
  add column if not exists online_publication_date date,
  add column if not exists print_publication_date date,
  add column if not exists accepted_date date,
  add column if not exists journal_title text,
  add column if not exists journal_abbreviation text,
  add column if not exists issn text,
  add column if not exists eissn text,
  add column if not exists volume text,
  add column if not exists issue text,
  add column if not exists article_number text,
  add column if not exists first_page text,
  add column if not exists last_page text,
  add column if not exists publisher text,
  add column if not exists pmid text,
  add column if not exists isbn text,
  add column if not exists repository_identifier text,
  add column if not exists publisher_url text,
  add column if not exists version_of_record_url text,
  add column if not exists access_status text not null default 'unknown',
  add column if not exists license text,
  add column if not exists funder text,
  add column if not exists grant_identifier text,
  add column if not exists ethics_reference text,
  add column if not exists citation_text text,
  add column if not exists metadata_source text,
  add column if not exists metadata_retrieved_at timestamptz,
  add column if not exists contributors jsonb not null default '[]'::jsonb;

alter table public.papers drop constraint if exists papers_output_type_check;
alter table public.papers add constraint papers_output_type_check check (output_type in ('journal_article','conference_proceeding','conference_presentation','preprint','working_paper','technical_report','policy_brief','dataset','research_protocol','registered_report','thesis_dissertation','book_chapter','other'));
alter table public.papers drop constraint if exists papers_publication_stage_check;
alter table public.papers add constraint papers_publication_stage_check check (publication_stage in ('submitted_manuscript','under_review','accepted_manuscript','version_of_record','posted_content','withdrawn','unknown'));
alter table public.papers drop constraint if exists papers_access_status_check;
alter table public.papers add constraint papers_access_status_check check (access_status in ('open_access','restricted','repository','unknown'));

alter table public.webinars
  add column if not exists event_type text not null default 'webinar',
  add column if not exists attendance_mode text not null default 'online',
  add column if not exists location_name text,
  add column if not exists location_address text,
  add column if not exists online_url text,
  add column if not exists end_at timestamptz,
  add column if not exists notification_enabled boolean not null default false,
  add column if not exists notification_topic text not null default 'events',
  add column if not exists notification_from text not null default 'events@dr-fraction.me',
  add column if not exists notification_reply_to text,
  add column if not exists notification_sent_at timestamptz;

alter table public.webinars drop constraint if exists webinars_event_type_check;
alter table public.webinars add constraint webinars_event_type_check check (event_type in ('webinar','lecture','seminar','workshop','roundtable','conference','course_session','other'));
alter table public.webinars drop constraint if exists webinars_attendance_mode_check;
alter table public.webinars add constraint webinars_attendance_mode_check check (attendance_mode in ('online','offline','mixed'));

alter table public.email_sends drop constraint if exists email_sends_purpose_check;
alter table public.email_sends add constraint email_sends_purpose_check check (purpose in ('welcome','newsletter','webinar_announcement','webinar_reminder','event_announcement','event_reminder'));
alter table public.email_sends add column if not exists sender_address text;
alter table public.email_sends add column if not exists reply_to_address text;
alter table public.email_sends add column if not exists topic text;

create index if not exists papers_output_type_idx on public.papers (output_type, publication_stage);
create index if not exists webinars_event_type_starts_idx on public.webinars (event_type, starts_at);
create index if not exists email_sends_event_purpose_idx on public.email_sends (webinar_id, purpose);

comment on column public.webinars.event_type is 'Provider-agnostic event format; webinar is one supported format.';
comment on column public.webinars.notification_from is 'Allow-listed sender identity, normally events@ verified domain.';
comment on column public.webinars.notification_reply_to is 'Optional reply destination; never used as the From identity.';
