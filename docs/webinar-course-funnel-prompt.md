# Prompt: Build a Managed Webinar-to-Course Funnel for ScholarPress

You are working on the existing ScholarPress / Dr Fraction Dzinjalamala site. Do not build a video-hosting platform. The site should become the **source of truth for the audience journey**, while live delivery can remain on an external provider such as Zoom, Google Meet, YouTube Live, StreamYard, or another provider selected later.

The goal is to make webinars feel like a managed publishing and learning funnel:

> attract the right people → explain the value clearly → register them on ScholarPress → remind them → send them to the external live room → record attendance and engagement → deliver the replay and resources → continue the relationship → eventually convert qualified interest into a course, cohort, membership, or other learning offer.

Use the existing ScholarPress visual language: editorial, credible, human, research-led, and increasingly colorful. Keep the experience understandable to a visitor who does not know the platform.

## Existing implementation to extend

The repository already has:

- `webinars` records with title, description, start time, duration, platform, registration URL, recording URL, and status.
- A public `/webinars` page and `WebinarCard` component.
- An admin `/admin/webinars` screen for creating, editing, announcing, and deleting webinars.
- An `.ics` calendar endpoint for webinars.
- Resend-based email delivery.
- Webinar announcement and reminder logic.
- `email_sends` and `webinar_registrations` migrations.
- Page-view analytics and an admin analytics area.
- Supabase, RLS, and owner-only admin access.

Before changing code, inspect the current schema, migrations, types, email helpers, admin routes, analytics routes, and public webinar components. Reuse existing conventions instead of creating parallel systems.

## Product decision: external live delivery, first-party funnel ownership

Keep the live room provider-agnostic. A webinar record should support:

- `provider`: manual, Zoom, Google Meet, YouTube Live, StreamYard, or another provider.
- `provider_event_id`: optional external event identifier for future webhook integrations.
- `join_url`: the actual attendee link, kept separate from the public registration page.
- `host_url`: private admin/host link, never exposed to public visitors.
- `registration_mode`: first-party, external, or hybrid.
- `replay_url`: public or gated replay destination.
- `replay_visibility`: public, registered-only, members-only, or unpublished.

For the first implementation, **first-party registration with a manually entered external join URL is acceptable**. Do not block the product on a Zoom or other provider API integration. Design the data model and service boundary so a provider adapter and webhook can be added later without rewriting the public funnel.

The site should own registration, consent, campaign attribution, communications, replay access, and downstream interest signals even when the live session happens elsewhere.

## Funnel stages and visitor experience

### 1. Discover

Create a proper marketing surface for each webinar, not only a card with a date and external URL.

Each webinar should support:

- A benefit-led title and short promise.
- A hero image or branded visual.
- Date, time, timezone, duration, and format.
- Speaker photo, name, role, and short credibility statement.
- Three to five concrete takeaways.
- Who the session is for.
- A short agenda.
- A clear primary CTA: `Save your seat` or `Register free`.
- Secondary actions: `Add to calendar`, `Share`, and `Browse related reading`.
- A visible note explaining whether the session is live, recorded, free, paid, or part of a future course.
- Registration close state and replay state.

Use a dedicated route such as `/webinars/[slug]` or the project’s equivalent. Keep `/webinars` as the browse/index page.

### 2. Register

Move registration onto ScholarPress by default.

The registration form should collect only what is justified:

- Email address.
- Name, if needed for the experience.
- Optional role or interest category only when it will be used.
- Explicit consent for event logistics and optional marketing.
- Hidden campaign fields such as UTM source, medium, campaign, content, referrer, landing page, and first-touch timestamp.

After registration:

- Show a confirmation page with the exact local time and timezone.
- Provide an `.ics` download and Google Calendar link.
- Explain where the join link will arrive.
- Offer an optional next action such as reading one relevant article, without distracting from registration confirmation.
- Make duplicate registration idempotent.
- Do not expose host credentials or private host links.

### 3. Remind

Use a clear event-specific communication sequence. The baseline sequence should be configurable, idempotent, and visible in admin:

- Confirmation immediately after registration.
- Invitation or announcement to the broader opted-in audience.
- Reminder approximately seven days before, when relevant.
- Reminder approximately one day before.
- Final reminder 30–60 minutes before.
- Optional “we are live” message.

Always include the webinar title, date, time, timezone, join action, add-to-calendar action, and one clear reason to attend. Avoid sending reminders to people who have already cancelled or unsubscribed. Support timezone-aware rendering.

The current project already has announcement and reminder logic. Refactor it into a reusable event-campaign system rather than adding one-off email branches for every new message.

### 4. Attend

The site cannot reliably know attendance from a manually pasted external URL. Support three levels:

1. **Manual MVP:** admin records attendance or uploads a CSV after the event.
2. **Provider webhook:** ingest registration, join, leave, duration, poll, Q&A, and replay events when the provider supports them.
3. **Tracked redirect:** send attendees through a signed `/webinars/[id]/join` route that records a join click before redirecting to the external room. Do not present a click as confirmed attendance.

Store an auditable event log. Do not overwrite raw provider events when a correction arrives.

Recommended participant states:

- registered
- confirmed
- attended
- no_show
- replay_viewed
- clicked_offer
- interested
- enrolled
- unsubscribed

Keep attendance and engagement data private and owner-visible only.

### 5. Follow up

Branch follow-up by behavior rather than sending one generic email to everyone:

- Attended: thank-you, replay, slides/resources, one useful next step, and the relevant offer or interest action.
- Registered but no-show: replay, brief summary, and a low-pressure invitation to continue.
- Watched replay: resources and the next relevant action.
- High-engagement participant: invite to a course waitlist, consultation, cohort, or deeper learning path.
- Unsubscribed or opted out: suppress marketing while preserving necessary transactional event records.

The first post-event message should arrive within 24 hours where operationally possible. Give every message one primary CTA. Keep replay availability and expiry explicit.

### 6. Convert into future courses

Do not build a full course platform in the first webinar milestone, but make the webinar system course-ready.

Add a lightweight interest path now:

- `I’m interested in a future course` or `Join the course waitlist`.
- Capture topic interest, experience level, and preferred format only if needed.
- Show a clear expectation about what happens next.
- Let the admin see and export interested people.
- Tag the originating webinar and campaign.

Prepare the domain model for a future learning area:

- courses
- course editions or cohorts
- modules
- lessons
- resources
- enrollments
- progress
- certificates or completion records, if eventually needed
- course payments or checkout references, without inventing payment logic now

A webinar should be able to become a course lead-in, an orientation session, a lesson preview, or a post-course community event.

## Admin workflow

Redesign `/admin/webinars` as an event workspace rather than a simple CRUD list.

Each event should have a clear lifecycle:

`draft → scheduled → registration_open → live → replay_available → archived`

Support cancellation and postponement without deleting the event history.

The admin workflow should make these actions obvious:

- Create or duplicate an event.
- Draft the public page.
- Upload or select hero and thumbnail imagery.
- Add speakers, takeaways, agenda, resources, and related articles.
- Configure provider details and privacy of each URL.
- Preview the public page.
- Test registration, calendar generation, join redirect, and email rendering.
- Open or close registration.
- Send a test message.
- Publish or schedule announcement and reminder campaigns.
- Record or import attendance.
- Publish replay and resources.
- Add the next offer or course waitlist.
- View funnel metrics.
- Archive without destroying historical records.

Include a compact event dashboard with:

- page views
- registration conversion rate
- registrations by source/campaign
- confirmation delivery and click rate
- attendance rate when known
- no-show count
- replay views
- resource downloads or clicks
- CTA clicks
- waitlist or course-interest submissions
- downstream enrollment when courses exist

Show metric definitions and data freshness. Do not imply attendance when only a join click is known.

## Marketing system

Every webinar should have a reusable campaign kit:

- Registration page hero.
- Open Graph image.
- Square social image.
- Email banner or thumbnail.
- Speaker image treatment.
- Short social copy.
- Long social copy.
- Newsletter block.
- Website announcement banner or homepage feature.
- Related article links.
- Replay thumbnail.
- Course or waitlist CTA graphic when relevant.

Build the data model so one event can generate these placements without duplicating content manually.

Use benefit-led copy. Avoid generic titles such as “Webinar on Malaria.” Prefer a clear transformation or question, for example: “What changes when malaria treatment is guided by pharmacology?”

Every marketing surface should answer quickly:

- What is this?
- Who is it for?
- Why should I care?
- What will I leave with?
- When is it?
- What happens after I register?

## Temporary image sourcing and visual direction

Add temporary, replaceable images so the event pages look real during development. Do not imply that a stock person is Dr Fraction. Never use a watermarked image in production.

Source or generate a coherent temporary set for these placements:

1. **Event hero:** a wide, high-contrast image of a research talk, lecture room, or scientist presenting. Leave a text-safe area for the title.
2. **Webinar thumbnail:** a close crop of a microscope, lab work, research notes, or an audience listening to a speaker.
3. **Speaker card:** use a supplied real portrait when available. Until then, use a clearly marked temporary speaker placeholder or a neutral research portrait that is not presented as Dr Fraction.
4. **Course cover:** a calm, editorial image combining clinical research, notes, a laptop, or a teaching environment. Keep it distinct from the webinar hero.
5. **Replay thumbnail:** use a consistent branded frame with the event title, date, and a still from the session once real recordings exist.
6. **Social card:** create a 1:1 or 4:5 crop that remains legible without relying on tiny text.

Current visual references found during planning include a lecture-hall presentation from a research institution, an African health/science speaker portrait, and clinical laboratory/course imagery. Treat these as visual direction only. Verify the license and attribution before using any source image, and prefer Unsplash, Wikimedia Commons, or another clearly licensed source. Keep all temporary images in a clearly named, replaceable asset folder.

Use the existing editorial palette, but introduce event-specific accent colors so webinar and future course pages feel more alive without becoming a generic SaaS dashboard. Suggested accents are warm gold for live sessions, teal for research, and coral or violet for course pathways.

## Analytics and attribution

Track the funnel end to end without selling personal data:

`campaign impression → registration page view → registration started → registration completed → confirmation click → join click → attendance/imported attendance → replay view → resource click → CTA click → waitlist → enrollment`

Persist UTM and first-touch attribution on registration. Keep event analytics separate from general page views where useful. Respect the project’s consent model and privacy policy. Add an admin export that is useful for follow-up but does not expose secrets.

Use idempotency keys for registration, email sends, webhook events, and replay/interest actions. Add indexes and RLS policies deliberately. Document which data is transactional, which is marketing, and which is analytics.

## Delivery phases

Plan and implement in these phases, keeping each phase deployable:

### Phase 1: Event foundation

Improve the webinar schema, types, status lifecycle, slugs, hero/thumbnail fields, speaker fields, takeaways, agenda, resources, public visibility, provider metadata, and course-interest CTA fields. Add migrations and RLS policies.

### Phase 2: Public conversion experience

Build the dedicated webinar detail page, first-party registration, confirmation page, calendar actions, tracked join redirect, richer cards, hero imagery, social/OG metadata, and replay presentation.

### Phase 3: Communications

Refactor announcements and reminders into a configurable event campaign system. Add confirmation, reminder, live, replay, attendee, no-show, and course-interest messages with idempotent delivery and admin preview/test flows.

### Phase 4: Funnel analytics

Add registration attribution, attendance/import support, replay/CTA tracking, a per-event dashboard, exports, and clear metric definitions.

### Phase 5: Course-ready foundation

Add course-interest and waitlist management, then document the next data model and UX for courses, cohorts, modules, lessons, progress, and enrollment. Do not build payments or a full LMS until the offer and operating model are decided.

### Phase 6: Provider integrations

Only after the provider-agnostic flow works, add the first provider adapter and webhook integration. Keep manual fallback paths available.

## Non-goals

Do not build video streaming, video transcoding, a full LMS, payments, a CRM replacement, or a large marketing automation suite in the first pass. Do not force a Zoom integration if a manual external URL supports the real workflow. Do not create a dashboard full of metrics that do not change an action.

## Acceptance criteria

The finished system should let the owner create a webinar, publish a credible marketing page, collect first-party registrations with attribution and consent, send a test and scheduled communications, provide calendar and join actions, keep external live delivery separate from site ownership, record reliable attendance signals when available, publish a replay, send behavior-aware follow-up, measure the funnel, and capture interest for a future course.

A visitor should never wonder whether they registered, where to join, what time the session is in their timezone, whether a replay exists, or what the next step is. The owner should never need to maintain the same event details separately across the website, email copy, and course waitlist.

Before implementation, return:

1. A concise architecture and data-model proposal grounded in the existing repository.
2. The provider-agnostic MVP recommendation and the first provider integration to defer or prioritize.
3. A route and component map.
4. The migration and RLS plan.
5. The email/event state machine.
6. The temporary image asset plan and licensing notes.
7. The smallest first milestone that can be shipped and measured.

Then implement only after those decisions are clear, preserving existing behavior unless the new funnel intentionally replaces it.

## References

[1]: https://www.on24.com/blog/the-best-webinar-email-templates-to-boost-attendance/ "ON24 webinar email sequence and attendance guidance"
[2]: https://www.zenler.com/blog/webinar-funnel-guide-how-to-build-live-automated-webinar-funnels-that-sell "Zenler webinar funnel guide for course creators"
[3]: https://univid.io/webinar-marketing/ "Univid webinar marketing, engagement, and funnel measurement guidance"
