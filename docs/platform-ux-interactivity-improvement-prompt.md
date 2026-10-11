# Prompt: Make ScholarPress More Interactive, Usable, and Operationally Excellent

You are improving the existing ScholarPress / Dr Fraction Dzinjalamala platform. The goal is not to add decoration. The goal is to make the site feel easier to understand for visitors and much more useful in real life for the owner who publishes writing, manages research, runs webinars, grows an audience, and may later offer courses.

Work from the existing repository. Before changing code, inspect the current routes, Supabase schema, RLS policies, admin pages, public pages, shared UI components, forms, loading states, error states, and existing design documentation. Reuse existing conventions where they are sound. Do not create a second design system or invent a separate admin product.

## Product direction

ScholarPress should feel like a **person-led publishing and learning studio** with a calm public reading experience and a practical private workspace.

The public site should help a visitor answer:

- Who is Dr Fraction?
- What is he thinking, researching, teaching, or hosting now?
- Where should I begin?
- What can I read, watch, attend, or learn next?
- How do I follow the work without being pressured?

The admin should help the owner answer:

- What needs my attention today?
- What is ready to publish or send?
- What is blocked or missing?
- What happened after I published or hosted something?
- What should I do next?

Avoid turning the platform into a generic SaaS dashboard. Keep the public site authored, editorial, warm, and research-led. Make the admin workspace clear, compact, fast, and operational.

## Current friction and odd habits to fix

### Public navigation

The desktop navigation uses native `<details>` dropdowns. Improve it so menus open on click, close when clicking outside, close on Escape, and have correct keyboard focus behavior. Hover may preview a menu but must never be the only way to access it.

The mobile drawer currently opens and closes, but it needs stronger interaction behavior: focus should move into the drawer, Escape should close it, focus should return to the menu button, background scrolling should be prevented while open, and the drawer should not trap users in an inaccessible state.

Keep the broad navigation model: Home, Writing, Research, Events, About, Newsletter/Follow. Do not expose empty future categories just because the database could support them. Labels should match user intent. “Events” should lead to registration, attendance, and recordings. “Follow” should lead to newsletter and account actions. Avoid vague labels such as “Explore” when the destination is operationally specific.

### Public interaction quality

Every important action needs visible feedback. Registration, subscription, bookmarking, likes, comments, polls, sharing, and account actions should show loading, success, duplicate, and failure states without requiring a page refresh.

Do not use a button that silently fails. Do not use “…” as the only loading state. Use accessible status text, disabled states, and clear recovery instructions.

Make empty states useful. “No webinars yet” should offer the newsletter or the next relevant route. Empty research, writing, recordings, and search states should explain what is empty and what the visitor can do next.

Make links behave conventionally. Use normal links for navigation, buttons for mutations, and explicit external-link treatment when leaving ScholarPress. Avoid opening external pages in new tabs unless there is a clear reason.

Add copy/share actions only where they serve a real purpose. When sharing fails, offer a copy-link fallback. Make copied states temporary but visible.

Preserve reading-first behavior. Do not add popups, auto-playing media, aggressive sticky CTAs, carousels, notification badges, or repeated newsletter prompts unless they solve a demonstrated problem.

### Admin dashboard

The current dashboard mixes useful counts, activity, and quick actions, but the owner still has to interpret the numbers manually. Redesign it around **attention, work, and outcomes**.

The first screen should show:

1. **Needs attention:** drafts awaiting decisions, scheduled items, webinars needing promotion, unpublished replays, unanswered comments, failed email sends, incomplete site setup, and course-interest signals waiting for review.
2. **Today/next:** upcoming event, next scheduled publication, next email, and any deadline.
3. **Quick actions:** new writing, new paper, new event, review comments, view subscribers, open analytics.
4. **Recent work:** recently edited content with status and last updated time.
5. **Outcome snapshot:** publishing activity, audience growth, event registration, replay/course-interest activity, and email delivery health.

Each attention item must be actionable. Clicking it should land on the filtered screen with the relevant records already visible. Do not make a card that only reports a number and sends the owner to a blank general list.

Show data freshness and error states. If one query fails, explain which area is unavailable while preserving the other panels. A manual refresh is useful, but do not make refresh the only way to see updated state after a mutation.

### Admin navigation

Keep grouped navigation, but make the groups reflect real work:

- **Publish:** Writing, Research, Events.
- **Audience:** Subscribers, Comments, Polls, Course interest.
- **Communicate:** Newsletters, Email delivery, Campaigns.
- **Measure:** Analytics, Event funnels.
- **System:** Settings, media, access, and data tools.

Use labels people understand. “Delivery log” is useful for technical diagnosis, but it should sit under a clearly named communication area and explain what it contains. If a screen is primarily for troubleshooting, say so.

Preserve active states for nested routes. Ensure mobile navigation supports focus management and closes after navigation.

### Admin forms and editing behavior

The current admin experience uses modal CRUD forms for important content. Keep dialogs for short, low-risk edits. Use dedicated full-page editors for workflows that need context, preview, metadata, media, scheduling, or multiple sections.

A content editor should make the current state obvious:

- Draft, scheduled, published, archived, or cancelled.
- Last saved time.
- Unsaved changes warning.
- Save draft.
- Preview.
- Publish or schedule.
- Revert or cancel.
- Validation errors beside the relevant field.
- A summary of missing required fields before submission.

Do not make destructive deletion the default recovery path. Prefer archive, unpublish, cancel, or move to trash where historical records matter. If deletion remains available, explain consequences and require a deliberate confirmation.

Use autosave only if it can be reliable and clearly communicated. Otherwise provide an explicit Save draft action and warn before navigation with unsaved changes.

Add search, filtering, sorting, and pagination to lists that can grow. Preserve filter state in the URL so attention cards and browser back navigation work naturally.

Use bulk actions only where they reduce real work. Always show the selected count and a confirmation summary before bulk mutations.

### Settings must become a real operational tool

The current Settings page is mostly a static launch checklist and explanatory text. Replace it with a practical settings workspace that helps the owner configure, test, and understand the platform.

Do not pretend that server environment variables can be edited safely from the browser. For environment-managed settings, show status, what the setting controls, where it is configured, and the exact next action. Provide copy buttons for values or commands only when that is safe. Never reveal secrets.

Organize Settings into clear sections:

#### General identity

Editable site name, tagline, description, affiliation, contact email, social/profile links, and public author information. Explain where each value appears on the site. Preview the effect where practical.

#### Domain and sharing

Show canonical site URL status, favicon/icon status, Open Graph default image, sitemap/robots status, and the current public domain. Provide a “check now” action and a human-readable result. Link to the exact deployment configuration step for values that live outside Supabase.

#### Email and communication

Show whether email delivery is configured, the sender identity, reply-to identity, cron/reminder status, last successful send, recent failures, and unsubscribe configuration. Provide safe “send test email” actions and make the recipient explicit before sending.

#### Events and webinars

Show default timezone, default duration, registration mode, reminder cadence, provider mode, replay defaults, and event image defaults. Explain the difference between first-party registration, external provider registration, join clicks, and confirmed attendance.

#### Audience and consent

Show newsletter signup behavior, event-consent wording, marketing-consent wording, retention/export behavior, and links to privacy/cookie pages. Make it possible to review the exact text visitors see.

#### Media and imagery

Show the current hero, portrait, default OG, webinar hero, thumbnail, and course-cover assets. Display dimensions, credit, source URL, and whether an asset is temporary. Make replacement and removal safe. Never allow an asset to disappear from a live page without a fallback.

#### Ownership and access

Show the current owner account, role status, sign-in configuration, and safe instructions for changing ownership through the approved database/admin process. Do not expose service keys, auth secrets, or sensitive user data.

#### Data and maintenance

Show pending migrations, last-known migration state if available, export actions, scheduled jobs, webhook status, and a maintenance log. Make warnings distinguish “must do before launch,” “recommended,” and “optional.”

Each setting needs a state: configured, incomplete, warning, failing, or not applicable. Replace static checkboxes with real checks wherever the application can verify the state. Every warning should include a next action.

### Webinars and event workflows

Treat webinars as a managed campaign, not a title/date/URL record.

The owner should be able to move through a guided flow:

1. Define the event promise and audience.
2. Add date, timezone, duration, format, speaker, takeaways, agenda, and related reading.
3. Choose first-party, external, or hybrid registration.
4. Add hero/thumbnail imagery and credits.
5. Configure external provider access without exposing host credentials.
6. Preview the public page.
7. Test registration, calendar generation, email rendering, and join behavior.
8. Publish the registration page.
9. Announce and remind.
10. Record or import attendance.
11. Publish replay and resources.
12. Review registration, attendance, replay, CTA, and course-interest outcomes.

Make missing steps visible. Do not allow the owner to publish a page with no clear value proposition, date/time, CTA, or image fallback. Support cancellation, postponement, and replay publication without deleting the event record.

### Future course workflows

Do not build a full LMS yet. Add the operational foundations:

- Course-interest list.
- Topic and experience-level signals.
- Waitlist status.
- Source webinar and campaign attribution.
- Exportable list.
- A simple “reviewed,” “contacted,” or “invited” state for the owner.

Later, courses should be able to contain cohorts, modules, lessons, resources, progress, completion, and optional community/events. Keep the webinar as a reusable entry point into that learning system.

## Interaction standards

Apply these standards across public and admin surfaces:

- Keyboard access for every interactive control.
- Visible focus states that meet contrast requirements.
- Minimum 44px touch targets on mobile.
- No hover-only information or action.
- Labels connected to inputs.
- Errors announced with `role="alert"` or equivalent.
- Success and loading states announced with `aria-live` where appropriate.
- No layout shift when a message, spinner, or validation error appears.
- Preserve user input after recoverable errors.
- Disable only the action currently in progress.
- Avoid double submissions with idempotent server operations.
- Use confirmation only for consequential or destructive actions, not every routine save.
- Use toasts for brief confirmation and inline messaging for errors or decisions that need reading.
- Deep links should preserve filters, tabs, and return destinations where practical.
- Timezones should be explicit for events.
- Dates, statuses, and labels should use one consistent vocabulary.

## Visual and content direction

Keep the public design editorial and authored. Keep the admin design lighter and more information-dense, but not visually unrelated.

Introduce color with purpose:

- Indigo or violet for actions and platform navigation.
- Warm gold for live events.
- Teal for research and evidence.
- Coral for attention or action-required states.
- Neutral slate for routine metadata.

Do not turn every element into a colored card. Color should communicate status, category, urgency, or a next action.

Use plain, human labels:

- “Save draft” instead of “Commit.”
- “Publish” instead of “Execute.”
- “Send a test” instead of “Run.”
- “What needs attention” instead of “System metrics.”
- “Join the course interest list” instead of “Convert lead.”
- “Join the live session” instead of “Open provider URL.”

## Technical requirements

Use the existing Next.js, TypeScript, Supabase, Resend, and RLS architecture. Keep private host links, service credentials, attendance data, and subscriber data behind server-side or owner-only boundaries.

Use reusable primitives for:

- Page headers.
- Cards.
- Buttons.
- Inputs and selects.
- Form sections.
- Status badges.
- Empty states.
- Error panels.
- Save state.
- Confirmations.
- Tabs and filters.
- Setup checks.

Avoid one-off JSX-heavy screens when a shared primitive would improve consistency. Preserve the current public site’s typography and editorial layout while progressively improving the admin UI.

Add or update migrations for new persisted state. Keep public data minimal and owner-only data private. Use idempotency for registrations, interest signals, emails, and webhook/event ingestion.

Do not silently change existing production behavior. If a data migration is required, document it, make it safe to rerun, and show its application status in Settings.

## Delivery phases

### Phase 1: interaction foundation

Improve shared buttons, forms, status messages, focus behavior, mobile drawers, dropdowns, dialogs, loading states, error states, empty states, and unsaved-change handling.

### Phase 2: operational dashboard

Redesign the dashboard around needs attention, next actions, recent work, outcome summaries, data freshness, and deep links into filtered screens.

### Phase 3: real Settings workspace

Replace static information with grouped settings, verified status checks, safe editable configuration, test actions, migration/job status, media management, and clear next steps.

### Phase 4: workflow upgrades

Improve writing, research, events, newsletter, comments, and audience flows with dedicated editors where context is needed, filters, search, previews, scheduling, archive states, and bulk actions where justified.

### Phase 5: event and course operations

Add event campaign management, first-party registration, attendance/replay states, course-interest review, waitlist workflow, and funnel reporting.

### Phase 6: quality pass

Run a complete keyboard, mobile, error-recovery, empty-state, timezone, privacy, and responsive-layout review. Remove odd behavior, duplicated wording, dead links, stale launch instructions, and any placeholder content that looks final.

## Non-goals

Do not add a chat widget, social-feed behavior, gamification, excessive motion, intrusive popups, fake testimonials, fabricated metrics, or a full course platform before the operating need exists.

Do not turn Settings into a dangerous control panel. Do not expose secrets or allow arbitrary database commands from the UI.

Do not optimize only for a polished screenshot. Every design change must improve a real decision, action, or recovery path.

## Acceptance criteria

The improved platform should make a first-time visitor understand where to go next without explanation. It should let the owner complete common publishing, event, audience, and communication workflows without guessing which screen or field is responsible. Every important action should have visible success, loading, error, and recovery behavior. Every attention item should deep-link to the work that resolves it. Settings should show verified state and actionable next steps instead of static instructions. The event and future-course workflows should retain attribution and consent without leaking private data.

Before implementation, return:

1. A prioritized UX audit with severity, user impact, and affected routes/components.
2. A short interaction and information-architecture plan.
3. The shared component changes required to avoid one-off fixes.
4. The Settings information architecture and which checks can be verified automatically.
5. The smallest first milestone that improves daily owner workflow without requiring a full redesign.
6. Any migration, RLS, or privacy implications.

Then implement the first milestone, validate it with typecheck, lint, build, keyboard-oriented code inspection, and responsive-state inspection, and document any remaining follow-up work.
