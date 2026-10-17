# ScholarPress product roadmap and plan completion ledger

**Status date:** 17 October 2026  
**Product:** ScholarPress / Dr Fraction Dzinjalamala  
**Roadmap owner:** Dr Fraction  
**Implementation branch:** `phase-7-person-led-platform`  
**Canonical source:** This document resolves the sequencing and status conflicts across the earlier architecture, CMS, email, navigation, webinar, and product-design plans.

---

## 1. Product direction

ScholarPress is a **person-led publishing house and intellectual studio** for Dr Fraction Dzinjalamala. It is not only an academic CV, a malaria website, a blog, a webinar tool, or a course platform.

The durable visitor journey is:

> **Discover → Understand → Follow → Participate → Return → Learn or enquire**

The public product has five active pillars:

- **Blog** — essays, notes, explainers, reflections, and public thinking.
- **Research** — scholarly outputs, papers, reports, preprints, protocols, datasets, and accessible summaries.
- **Events** — webinars, lectures, seminars, workshops, talks, and recordings.
- **Topics** — cross-cutting subject pages connecting Blog, Research, Events, and selected assets.
- **Follow** — newsletter and preference relationship.

The CMS uses more precise operational terms: **Research outputs**, **Event workspace**, **Broadcasts**, **Automations**, **Transactional messages**, **Segments**, **Topics**, **Campaigns**, and **Discussions**.

### Product guardrails

1. Public content earns trust before account participation is requested.
2. Dr Fraction’s authorship and point of view remain visible across the platform.
3. A database field is not automatically a marketing strategy.
4. Publishing an item must not silently send a broadcast.
5. Every important workflow must be usable as a full-page task; modals are for confirmation or small focused actions only.
6. Migrations remain additive, idempotent, RLS-protected, and reversible.
7. No empty Books, Projects, Courses, or Membership routes appear until there is real content and a meaningful visitor task.
8. No guessed social URLs, fabricated proof, placeholder implementation notes, or generic stock imagery in production.

---

## 2. Current status: what is actually shipped

### Shipped and validated in the current branch

| Area | Current state | Evidence |
|---|---|---|
| Public shell | Public SiteChrome is separated from the admin shell; responsive navigation, dropdowns, mobile drawer, keyboard/Escape behavior, Search, Topics, Research, Events, Blog, About, and Follow are present. | `src/components/site-chrome.tsx`, `src/components/site-navigation.tsx` |
| Homepage | Person-led homepage with live Blog, Research, Event, and newsletter data; v0-inspired controlled editorial hero slideshow and dismissible Topics strip are included. | `src/app/page.tsx`, `src/components/hero-slideshow.tsx`, `src/components/announcement-strip.tsx` |
| Topics discovery | Public `/topics` and `/topics/[slug]` pages, search discovery, admin topic CRUD, and topic-to-content selection exist. | `src/app/topics`, `src/app/admin/topics`, `src/lib/topics.ts` |
| Search | Search page covers Blog, Research, Events, and Topics with useful empty-state topic links. | `src/app/search/page.tsx` |
| Webinar funnel foundation | Dedicated event detail route, first-party registration, interest capture, ICS route, announcement/reminder foundations, attribution fields, and replay-related fields exist. | `src/app/webinars`, `src/app/api/webinars`, webinar migrations |
| Research DOI import | DOI normalization, server-side Crossref lookup, loading/error states, and blank-field preservation are implemented. | `src/app/admin/papers/page.tsx`, `src/app/api/admin/papers/crossref/route.ts`, `src/lib/crossref.ts` |
| CMS shell | Persistent admin navigation, shared cards/headers/buttons, action-oriented dashboard, Settings readiness workspace, and terminology updates exist. | `src/app/admin`, `src/components/admin-ui.tsx` |
| Additive schema foundation | Topics, content-topic links, research metadata columns, general event fields, sender/reply-to fields, and expanded event email purposes have migration files. | `supabase/migrations/2026-10-16-topics-content-relationships.sql`, `2026-10-16-cms-workflows.sql` |
| Validation | TypeScript, ESLint, production build, and diff checks pass on the current branch. | Latest validation run: `npm run typecheck`, `npm run lint`, `npm run build`, `git diff --check` |

### Implemented but not complete as a product workflow

| Area | What exists | What is still missing |
|---|---|---|
| Topics | CRUD and content selection | Explicit typed content relations with reasons, series, CTA management, bulk assignment, preview, and topic analytics |
| Research outputs | Expanded fields, DOI import, contributor JSON field | Full-page type-specific editor, normalized people/contributor model, version history, publication checklist, review queue, structured citations/JSON-LD |
| Events | `webinars` compatibility table with generic event fields | Full generic Event workspace, series, event people, lifecycle history, campaign kit, attendance import, replay/resource management |
| Email | Newsletter and webinar announcement/reminder helpers, delivery log, Resend webhook foundation | Sender identity records, audience topics/segments, campaign drafts, approval, templates, idempotent generic automations, conversion reporting |
| Community | Comments and replies with existing moderation states | Source-content/topic filters, reports, internal notes, moderation audit history, queues, notifications |
| Analytics | Page views and admin analytics | Funnel-specific events, definitions, attribution views, event dashboard, content relationship health |
| Settings | Readiness/status checks | Production deployment verification and safe owner-facing migration/runbook status |

### Unknown or explicitly outside code control

- Whether production Supabase migrations have been applied.
- Whether `NEXT_PUBLIC_SITE_URL` is set to the final production domain.
- Whether Resend sender identities and domain authentication are verified.
- Which real portrait, field, lab, teaching, event, and book images are approved for production.
- Which social/profile URLs beyond ResearchGate and Facebook are confirmed.
- Newsletter cadence, primary audience priority, and first monetization priority.

---

## 3. Completed plan ledger

| Earlier plan | Resolution | Superseded by |
|---|---|---|
| Product/content workflow architecture | Direction is approved; Milestone 1 is shipped, Milestones 2–6 are now sequenced below with explicit exit criteria. | Sections 4–10 of this document |
| Database schema implementation plan | Topic foundation and CMS workflow migration are written; the original six-PR plan is split into smaller safe migrations with concrete compatibility rules. | Section 6 |
| Email automation workflows | Sender conventions and workflow behavior are approved; only the first newsletter/webinar helpers exist in code. Campaigns and automations remain planned. | Section 8 |
| Navigation wireframe | Public labels and core interactions are implemented; menu content, focus tests, dynamic announcement data, and route-level QA remain. | Section 5 |
| Webinar/course funnel prompt | Foundation and public funnel are shipped; generic event lifecycle, campaign orchestration, attendance, replay follow-up, and course-interest operations remain. | Section 7 |
| Final product design plan | Product direction is approved. Books, Projects, Membership, and full course experiences remain intentionally gated behind real content/offers. | Sections 4 and 10 |
| Public-site critique | Core diagnosis is addressed by person-led shell, Topics, Search, and homepage refinement. Article trust layers, newsletter sample/archive, real imagery, and richer recirculation remain. | Section 9 |
| Latency troubleshooting plan | Remains an operational workstream, not a feature milestone. Instrument first, then optimize measured slow paths. | Section 11 |
| Project handoff | Historical record only. Its stale “DOI outstanding” and uncommitted-work notes are superseded by this ledger. | This document |

---

## 4. Prioritized feature roadmap

### Now: production safety and workflow completion

These tasks have the highest leverage because the code can look complete while production remains unverified.

1. Apply and verify all pending Supabase migrations in a non-destructive order.
2. Set and verify `NEXT_PUBLIC_SITE_URL` in the deployed environment.
3. Verify Resend domain authentication and sender addresses:
   - `newsletter@dr-fraction.me` for broadcasts;
   - `events@dr-fraction.me` for event logistics;
   - `hello@dr-fraction.me` for relationship mail;
   - `notifications@dr-fraction.me` for operational alerts;
   - `noreply@dr-fraction.me` only where replies are not expected.
4. Run a production smoke test for public reading, owner access, Topics, DOI import, registration, ICS, reminders, unsubscribe, webhook handling, and RLS.
5. Replace or deliberately approve temporary imagery before public launch.

**Exit:** production row counts and RLS checks are recorded; canonical links and emails use the intended domain; no test email is sent to an unintended audience.

### Next feature: Research output workspace v2

**Goal:** make Research a credible scholarly publishing workflow rather than an upgraded paper form.

Deliver:

- full-page `/admin/research/new` and `/admin/research/[id]` editor;
- output type and publication-stage driven field groups;
- Authors and contributors editor with author order, corresponding author, ORCID, and optional CRediT roles;
- DOI/PMID import as a reviewable draft, never an overwrite;
- publication dates with precision, venue/identifier/access sections, abstract and public summary;
- version records for submitted, accepted, posted, and version-of-record states;
- preview, save-state, unsaved-change warning, validation summary, and publish checklist;
- accessible public citation block, structured data, access status, and related content.

**Exit:** owner can publish a journal article, report, preprint, dataset, protocol, or presentation without irrelevant required fields; all required metadata is visible before publishing; old `/papers` URLs continue to work.

### Next feature: Event workspace v2

**Goal:** turn webinar CRUD into a provider-agnostic Event workspace.

Deliver:

- generic Event editor with format, attendance mode, venue, provider, registration mode, replay, speakers, agenda, takeaways, assets, and related content;
- lifecycle history for draft, review, published, registration open, live, completed, replay available, postponed, rescheduled, cancelled, archived;
- Event Series and event-instance support;
- duplicate event and preview actions;
- registration completeness checklist and calendar/join testing;
- manual attendance import and explicit distinction between join click and confirmed attendance;
- cancellation/reschedule notifications without deleting history;
- event dashboard with registration conversion, attendance conversion when known, no-show, replay, CTA, and learning-interest metrics.

**Exit:** owner can create a lecture, workshop, seminar, webinar, or course session through the same workflow; public event pages explain value, logistics, registration, replay, and next step.

### Connected library v2

**Goal:** make the relationship graph useful to readers and editors.

Deliver:

- `content_relations` with allow-listed relation types and display labels;
- `content_series` and series items;
- `content_ctas` with one primary CTA and optional secondary actions;
- relation editor reusable in Blog, Research, Event, and Topic workspaces;
- public labels such as Background, Related evidence, Discussed at this event, Further reading, and Next step;
- topic preview and orphan-content reports;
- safe backfill from existing tags only after a reviewed mapping.

**Exit:** a reader can move from Topic → Blog → Research → Event → learning-interest action, and every link explains why it is present.

### Messages workspace v1

**Goal:** separate publication from promotion and make email operations safe.

Deliver:

- sender identities and Reply-To records;
- message templates and versioning;
- campaigns and campaign steps;
- draft generation from published Blog, Research, and Event items;
- explicit audience Segment and subscriber Topic selection;
- mobile/link/unsubscribe preview;
- test send, approval, schedule, send history, delivery issues;
- idempotency keys and suppression handling for every transactional workflow;
- conversion identity on links and reports.

**Exit:** no Broadcast can be scheduled without an explicit audience, topic, sender, Reply-To, CTA, approval state, and test result; registration confirmation is delivered exactly once per registration.

### Community workspace v1

**Goal:** replace the flat comments log with an operational moderation queue.

Deliver:

- source content, topic, status, author, date, and report filters;
- thread context and source-content preview;
- reports, internal notes, pinning, replies, soft deletion, and moderation history;
- owner-only moderation actions with audit records;
- notification preferences and safe comment/reply email purposes.

**Exit:** a moderator can find, understand, act on, and audit a discussion without loading the entire comment history or losing context.

### Editorial discovery and quality

Deliver only after real content exists:

- richer Blog metadata: dek, content type, series, author context, revision date, source/method notes;
- newsletter sample and browsable archive;
- RSS feed and canonical metadata verification;
- real image credits/captions and replacement of temporary assets;
- deliberate next-path modules and relation reasons;
- Most read only after enough privacy-respecting engagement data exists.

**Exit:** a new visitor can understand what to read first, why each item matters, and what to do next without a forced signup.

### Later: Books, Projects, and learning

Do not expose empty destinations. Plan but do not implement full experiences until there is real material or an offer:

- book landing pages and purchase links;
- project landing pages and collaborations;
- course/curriculum/cohort/enrollment model;
- payments only after the commercial offer, provider, refund policy, and tax/legal requirements are decided;
- membership only after benefits and operating capacity are real.

---

## 5. Proposed implementation PR sequence

| PR | Deliverable | Depends on | Primary acceptance |
|---|---|---|---|
| 8 | v0 editorial UI refinement | Current branch | Hero controls, announcement strip, Settings readiness, build green |
| 9 | Production readiness and migration verification docs/tests | Current branch | Migration checklist, RLS smoke checks, env/sender verification |
| 10 | Research output editor v2 | PR 9; existing CMS workflow migration | Type-specific full-page editor, DOI review, publish checklist |
| 11 | Research contributors and versions | PR 10 | Structured authors/contributors and version history without data loss |
| 12 | Generic Event workspace | PR 9 | Event formats, lifecycle, full-page editor, compatibility routes |
| 13 | Event series, attendance, replay, and campaign kit | PR 12 | History-preserving event operations and explicit funnel metrics |
| 14 | Relations, series, CTAs, and connected-library UI | PR 10 and PR 12 | Human-labeled contextual relationships across content types |
| 15 | Messages workspace v1 | PR 9, PR 14 | Draft/approval/test/schedule/delivery flow with sender conventions |
| 16 | Community moderation workspace | PR 14 | Filtered, contextual, audited moderation queue |
| 17 | Editorial discovery quality | PR 10, PR 14 | Article trust layers, newsletter archive/sample, RSS, image credits |

PR numbers are planning identifiers, not guarantees that GitHub numbers will remain sequential.

---

## 6. Database execution plan

### Migration order

1. Back up production and record row counts for `posts`, `papers`, `webinars`, `subscribers`, `webinar_registrations`, `comments`, and `email_sends`.
2. Apply the existing additive topic and CMS workflow migrations.
3. Verify RLS and grants using anonymous, authenticated non-owner, and owner test sessions.
4. Add research people/contributors/versions tables.
5. Add Event Series, event people, attendance history, and generic event registration compatibility structures.
6. Add content relations, series, and CTA tables.
7. Add contacts, topic preferences, consents, and lifecycle events.
8. Add sender identities, campaigns, templates, automation runs, and delivery extensions.
9. Add discussion source references and moderation events.
10. Remove compatibility structures only after a documented observation window; never use `drop ... cascade` for these migrations.

### Migration requirements

Every schema PR must include:

- idempotent SQL;
- explicit grants and RLS policies;
- indexes justified by query paths;
- bounded backfill SQL or a documented manual backfill;
- before/after row-count queries;
- compatibility reads and writes;
- rollback or forward-fix instructions;
- CI assertions for public visibility, owner writes, non-owner denial, and no future-content leakage;
- a production application checklist.

### Current schema gaps to resolve

- `content_topics` is polymorphic but `content_relations`, `content_series`, and `content_ctas` do not yet exist.
- Research contributors are currently stored as JSON rather than normalized people/affiliation/version records.
- `webinars` remains the physical event table; generic `events` is a future compatibility decision.
- Email purpose constraints and fields are extended, but there is no campaign/sender/segment model.
- Comments remain post-oriented and lack the planned moderation audit layer.

---

## 7. Email and sender operating plan

### Sender policy

| Purpose | From | Reply-To | Class |
|---|---|---|---|
| Newsletter/publication broadcast | `newsletter@dr-fraction.me` | `hello@dr-fraction.me` | Broadcast |
| Event promotion and logistics | `events@dr-fraction.me` | `events@dr-fraction.me` | Broadcast or transactional |
| Relationship/collaboration | `hello@dr-fraction.me` | `hello@dr-fraction.me` | Transactional |
| Operational alerts | `notifications@dr-fraction.me` | `hello@dr-fraction.me` | Transactional |
| Genuine no-reply system mail | `noreply@dr-fraction.me` | `hello@dr-fraction.me` | Transactional only |

### Minimum safe workflows

1. Follow form → stored preference → one idempotent confirmation.
2. Published Blog/Research → editable campaign draft; never immediate broadcast.
3. Event registration → one confirmation with calendar and timezone information.
4. Event reminder → configurable, idempotent, cancellable, and recorded.
5. Event change → all affected registrants receive operational notice.
6. Attendance/replay → behavior-aware follow-up with consent-aware suppression.
7. Learning interest → acknowledgement, owner visibility, and Learning-topic-only future campaigns.

### Campaign UI states

`Draft → Internal review → Test sent → Approved → Scheduled → Sending → Sent → Reported`

The UI must name consequential actions precisely: **Send test**, **Schedule broadcast**, **Send transactional test**, and **Cancel scheduled send**. Avoid an ambiguous generic **Send** button.

---

## 8. Navigation and public experience completion

### Already implemented

- Blog, Research, Events, Topics, About, Follow, and Search labels.
- Click and delayed hover desktop dropdowns.
- Escape, outside click, route-change close behavior.
- Mobile drawer, accordions, focus return, and background-scroll prevention.
- Optional dismissible announcement strip.

### Remaining QA and refinement

- Add automated keyboard/touch tests for all menu states.
- Replace duplicate placeholder destinations such as repeated Research/Topics child links with real filtered routes once those archives exist.
- Make the announcement strip data-driven from a current Event/Campaign rather than hard-coded copy.
- Add an explicit `/research` and `/events` route only when compatibility redirects and content volume justify the public rename; retain `/papers` and `/webinars` during transition.
- Verify long labels at compact desktop widths and ensure the header never wraps into an ambiguous second row.

---

## 9. Measurement plan

Track only metrics that change an editorial or operational decision:

- **Discovery:** landing visits, referral/source, search terms, topic entry points.
- **Engagement:** engaged read, related-content clicks, return visits, replies, bookmarks.
- **Audience:** subscription conversion, topic preference, unsubscribe, bounce, complaint.
- **Events:** page-to-registration conversion, source/campaign, attendance conversion when verified, no-show, replay, CTA, learning-interest.
- **Editorial health:** orphaned content, broken relationships, missing CTA, stale metadata, publishing cadence.
- **Email:** delivery, bounce, complaint, unsubscribe, click, conversion by campaign and topic.

Definitions must be displayed in admin. A join click is not attendance. An email open is directional, not the primary success metric.

---

## 10. Definition of done for the platform

The roadmap is materially complete when the owner can execute this journey without manual duplication or unsafe assumptions:

1. Create a public Topic with a visitor-facing description.
2. Publish a Blog post, Research output, or Event with appropriate type-specific fields.
3. Connect the item to a Topic and related items with human-readable reasons.
4. Preview and publish the public page with correct metadata and structured data.
5. Create a reviewable campaign draft with explicit audience, Topic, sender, Reply-To, CTA, and UTM identity.
6. Send a test, approve, schedule, and inspect delivery history without silently broadcasting.
7. Register for an Event and receive exactly one confirmation with calendar/access details.
8. Record attendance/replay state without confusing clicks with attendance.
9. Send behavior- and consent-aware follow-up.
10. Find and moderate discussions with source context and an audit trail.
11. Verify all of the above under RLS with no data leakage and no destructive migration.

---

## 11. Decisions to record, not repeatedly reopen

Use these defaults unless Dr Fraction explicitly changes them:

- **Public access:** public reading and research abstracts; accounts are for participation and personalization.
- **Primary audience:** a deliberate mix of researchers, health professionals, learners, and curious public readers, with each page stating its intended audience.
- **Newsletter:** one considered recurring letter until a sustainable cadence is confirmed; do not invent weekly promises.
- **Events:** provider-agnostic first; manual external join URL is acceptable.
- **Courses:** capture interest now; do not build payments or a full LMS yet.
- **Books/Projects:** keep hidden until real content exists.
- **Social profiles:** only add exact URLs supplied or verified by the owner.
- **Images:** temporary assets may support previews, but production launch requires approved real or deliberate image-free treatments.

These are working defaults, not hidden product decisions. A change should be recorded in this roadmap and the affected workflow plan.
