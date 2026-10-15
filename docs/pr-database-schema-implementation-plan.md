# PR implementation plan: connected content, audience, campaigns, and event schema

## Goal

Implement the product architecture without breaking the current ScholarPress routes or losing existing posts, papers, webinars, subscribers, registrations, comments, or email history.

The migration should be additive first. Public language can move from **Papers** to **Research** and from **Webinars** to **Events** before physical tables are renamed. Avoid a large table rename while the public and admin code still depends on `papers` and `webinars`.

## Current baseline

The repository currently has specialized tables for `posts`, `papers`, `webinars`, `subscribers`, `comments`, `webinar_registrations`, and `email_sends`. Existing migrations already add webinar slugs, event marketing fields, first-party registration attribution, course-interest signals, and email delivery tracking.

Important compatibility constraints:

- `webinars` is already publicly readable under an anonymous policy; private provider credentials must stay out of it.
- `webinar_access` and `webinar_interest_signals` are owner-only and should remain protected.
- `email_sends.purpose` currently supports only `welcome`, `newsletter`, `webinar_announcement`, and `webinar_reminder`.
- `webinar_registrations` is unique by webinar and email and already records consent, attribution, attendance, and replay state.
- `comments` currently uses a `post_id`-oriented model and visible/pending/deleted moderation behavior.
- The current email admin page loads up to 500 sends and is a log, not a campaign system.

## PR sequence

### PR 1 — Shared taxonomy and content relationships

**Purpose:** give the library a stable product structure without changing the existing content tables.

Create:

- `topics` — `id`, `name`, `slug`, `description`, `parent_id`, `is_public`, `sort_order`, SEO fields, timestamps.
- `content_topics` — `topic_id`, `content_type`, `content_id`, `sort_order`, timestamps, unique constraint across topic/type/id.
- `content_relations` — source type/id, target type/id, `relation_type`, display label, sort order, public flag, timestamps.
- `content_series` — name, slug, description, image, public status, timestamps.
- `content_series_items` — series id, content type/id, position, optional role, timestamps.
- `content_ctas` — content type/id, label, URL or internal target, CTA kind, position, tracking key, is_primary, public flag.

Use a documented allow-list for `content_type` and `relation_type`. Start with `writing`, `research_output`, `event`, `resource`, `newsletter_issue`, and `event_recording`. Do not use an unrestricted arbitrary type field in public write paths.

Recommended `relation_type` values:

- `background`
- `related_evidence`
- `accessible_explanation`
- `discussed_at`
- `recording_of`
- `follow_up`
- `further_reading`
- `course_pathway`
- `announced_by`

Add owner-only writes, public reads only when both endpoints are public, indexes for source and target lookups, and checks preventing self-relations. Backfill current post/paper/webinar tags into topics only after a reviewed mapping; do not automatically create hundreds of low-quality topics from raw strings.

**Acceptance:** topic pages and related-content queries can be built without changing existing public records; all new writes are owner-protected.

### PR 2 — Research output metadata and publication versions

**Purpose:** make research a credible library rather than a title/abstract/DOI card.

Keep `papers` as the compatibility table for now. Add:

- `output_type`: `journal_article`, `conference_proceeding`, `conference_presentation`, `preprint`, `working_paper`, `technical_report`, `policy_brief`, `dataset`, `research_protocol`, `registered_report`, `thesis_dissertation`, `book_chapter`, `other`.
- `publication_stage`: `submitted_manuscript`, `under_review`, `accepted_manuscript`, `version_of_record`, `posted_content`, `withdrawn`, `unknown`.
- `abstract`, `public_summary`, `publication_date_precision`, `online_publication_date`, `print_publication_date`, `accepted_date`.
- journal/venue metadata: `journal_title`, `journal_abbreviation`, `issn`, `eissn`, `volume`, `issue`, `article_number`, `first_page`, `last_page`, `publisher`.
- identifiers: normalized DOI, PMID, ISBN, repository identifier, publisher URL, version-of-record URL.
- access metadata: `access_status`, `license`, `full_text_url`, `file_asset_id` when an asset table exists.
- scholarly context: `funder`, `grant_identifier`, `ethics_reference`, `citation_text`, `metadata_source`, `metadata_retrieved_at`.

Create structured tables rather than a single authors string:

- `people` — display name, given name, family name, ORCID, bio, image, public visibility.
- `organizations` — name, ROR identifier, URL.
- `research_output_contributors` — output id, person id or organization name, contributor kind, author order, corresponding flag, CRediT roles, contribution degree.
- `research_output_affiliations` — contributor id, organization id/name, display label.
- `research_output_versions` — output id, stage, version label, URL/asset, date, DOI, notes, public flag.

The contributor model must distinguish formal authors from other contributors. CRediT roles are optional metadata and must not silently define authorship.

Backfill existing `papers` into `output_type = journal_article` only when the existing fields support that assumption. Otherwise use `other` and show a review queue. Do not invent journal metadata.

**Acceptance:** an owner can create a journal article, report, preprint, dataset, or presentation without irrelevant required fields; DOI import can populate a reviewable metadata draft.

### PR 3 — Generic events and event series

**Purpose:** make webinars one event format instead of the platform’s underlying business object.

Keep `webinars` as a compatibility view/table during migration. Add either a new `events` table with a compatibility view or extend `webinars` in place after a migration decision. Prefer a new `events` table if the existing name is deeply coupled to routes and types.

Event fields:

- `slug`, `title`, `promise`, `description`, `format`;
- `status`: `draft`, `review`, `published`, `registration_open`, `live`, `completed`, `replay_available`, `postponed`, `rescheduled`, `cancelled`, `archived`;
- `starts_at`, `ends_at`, `timezone`;
- `attendance_mode`: `online`, `offline`, `mixed`;
- venue name/address and provider name/event id;
- registration mode and registration window;
- hero/thumbnail asset references and credits;
- speakers/hosts through `event_people`;
- agenda/takeaways/resources as validated JSON or child tables;
- replay URL, replay visibility, and replay availability;
- capacity and offer fields only when relevant;
- related content through `content_relations`;
- campaign and CTA references.

Create:

- `event_series` — name, slug, promise, description, public status.
- `event_series_items` — series id, event id, position.
- `event_people` — event id, person id, role, order.
- `event_registrations` as the future generic name, with a compatibility view over `webinar_registrations` during transition.
- `event_attendance` or registration status history if one status column cannot preserve changes.

Backfill existing webinars as events with `format = webinar`. Preserve their slugs and public URLs. Do not delete or redirect until route compatibility is tested.

**Acceptance:** the owner can create a lecture, workshop, seminar, webinar, or course session with the right fields; cancelled and rescheduled events retain their history; event pages expose registration, attendance, replay, and next-step states.

### PR 4 — Audience, consent, and lifecycle state

**Purpose:** make the owned audience useful for product and marketing without treating everyone as a sales lead.

Create or extend:

- `contacts` — normalized email, name, user id, lifecycle stage, source, first touch, last engagement, created/updated timestamps.
- `contact_topics` — contact id, topic id, subscription status, source, consent timestamp, unsubscribed timestamp.
- `audience_segments` — owner-defined segment name, rule definition, description, status.
- `contact_segment_memberships` — contact id, segment id, source, timestamps.
- `contact_events` — contact id, event name, source content, metadata, occurred_at.
- `consents` — contact id, purpose, version, source, granted/revoked timestamps, legal text reference.

Use lifecycle values such as `visitor`, `engaged_reader`, `subscriber`, `registrant`, `attendee`, `learning_interest`, `learner`, and `client` only when those states are supported by product behavior. Keep current subscribers as a compatibility source and deduplicate by normalized email.

Do not store marketing consent as a single boolean when multiple topics and purposes exist. Preserve existing `consent_events` and `consent_marketing` values during backfill.

**Acceptance:** a subscriber can manage topic preferences; an event registrant can be targeted for event logistics without being automatically enrolled in all marketing; lifecycle transitions are auditable.

### PR 5 — Campaigns, broadcasts, journeys, and sender identities

**Purpose:** separate content publication from promotion and separate broadcast mail from one-to-one transactional messages.

Create:

- `sender_identities` — purpose, display name, from address, reply-to address, verified domain, active flag.
- `message_templates` — message type, subject template, preview text, body reference, sender identity, version, active flag.
- `campaigns` — name, type, objective, status, audience/segment, topic, source content, primary CTA, UTM identity, start/end, approval state, owner.
- `campaign_steps` — campaign id, step type, delay, condition, template, sender identity.
- `broadcasts` — campaign id, audience segment, topic, scheduled/sent times, provider id, status, metrics snapshot.
- `automation_rules` — trigger event, conditions, action, approval mode, active flag, idempotency policy.
- `automation_runs` — rule id, contact id, source event, status, next run, completed/failed timestamps.
- `message_deliveries` — replace or extend `email_sends` with campaign id, automation run id, message type, sender identity, topic, segment, provider id, status, event timestamps, error, idempotency key.

Keep `email_sends` as a compatibility view or retain it as the delivery ledger until all reporting queries move to `message_deliveries`. Extend purpose values through a migration-safe constraint update; never drop delivery history.

Recommended sender defaults:

- `newsletter@` for newsletter and publication broadcasts;
- `events@` for event campaigns and monitored event replies;
- `hello@` for relationship/contact messages;
- `notifications@` for operational notifications;
- `noreply@` only for messages that genuinely do not accept replies.

**Acceptance:** publishing content can create a draft campaign without sending; broadcast sends record topic, segment, sender, campaign, and conversion identity; transactional confirmations remain one-to-one and idempotent.

### PR 6 — Discussion and moderation context

**Purpose:** make community management workable as the library grows.

Add to `comments` or create a compatibility layer:

- `content_type` and `content_id` for source content;
- `topic_id` when inherited or explicitly assigned;
- `parent_id` for replies;
- `report_count`, `moderation_reason`, `internal_note`, `pinned_at`;
- `moderation_status`, `moderated_by`, `moderated_at`;
- `moderation_events` audit table.

Backfill current `post_id` into `content_type = writing`. Keep `post_id` until all reads and writes use the new reference. Add indexes for source content, topic, status, author, and created date. Keep public RLS limited to visible comments and owner-only moderation writes.

**Acceptance:** Community can filter by source, topic, status, author, date, and reports without loading the entire table; every destructive moderation action is auditable.

## Migration and rollout rules

1. Take a schema/data backup and export row counts before each production migration.
2. Apply additive tables and nullable columns first.
3. Backfill in bounded batches and record counts.
4. Deploy code that reads both old and new shapes.
5. Switch writes to the new shape.
6. Verify public pages, admin pages, RLS, and email suppression behavior.
7. Remove compatibility columns or tables only in a later PR after a clean observation window.

Every PR should include migration SQL, TypeScript types, RLS/grants, backfill notes, tests, and rollback instructions. Do not use `drop table ... cascade` in production migrations for these features.

## PR order and dependencies

| PR | Deliverable | Depends on |
| --- | --- | --- |
| 1 | Topics, relationships, series, CTA references | None |
| 2 | Research output metadata and contributor model | PR 1 |
| 3 | Events and event series | PR 1 |
| 4 | Contacts, consent, lifecycle, segments | PR 3 for registration signals |
| 5 | Campaigns, journeys, sender identities, delivery ledger | PR 1 and PR 4 |
| 6 | Discussion source references and moderation history | PR 1 |

## Definition of done

The schema work is complete only when the owner can trace one real journey end to end: a visitor discovers a topic, reads a Writing item, follows a CTA, registers for an Event, receives the correct transactional messages, attends or watches the replay, and can be offered a future learning path without being sent unrelated broadcasts.
