# ScholarPress Content, Research, Events, Email, and Community Workflow Architecture

## Purpose

This brief revises ScholarPress from a set of separate admin screens into a connected publishing platform for Dr Fraction Dzinjalamala.

The key change is conceptual:

> Articles, research outputs, events, newsletters, topics, comments, and future courses should be different expressions of one connected body of work—not unrelated database tables exposed through unrelated forms.

The public site should use language visitors understand. The CMS should use language that helps the owner make correct publishing decisions. The database should preserve enough structure to connect content, measure relationships, and automate safe follow-up.

This brief is informed by the current ScholarPress repository and by established patterns from Huberman Lab’s topic-first content platform, Crossref metadata guidance, ORCID, CRediT, Schema.org and Google event requirements, Resend contact/topic management, Postmark message streams, Discourse moderation, and Ghost article comments.

## Terminology decisions

### Public navigation

Use intentional visitor-facing labels rather than exposing internal table names.

- **Writing** — essays, articles, notes, reflections, explainers, and public thinking.
- **Research** — scholarly outputs, publications, reports, protocols, data, and research summaries.
- **Events** — webinars, seminars, lectures, workshops, conferences, book launches, teaching sessions, and recordings.
- **Resources** — a dropdown containing Topics, Start here, Reading lists, Guides, Newsletter archive, and other reusable material.
- **About** — Dr Fraction, current interests, methods, affiliation, and ways to work together.
- **Newsletter** or **Follow** — the relationship and email preference route.
- **Search** — global discovery across the connected library.

Do not use **Papers** as the main navigation label. It is too narrow for reports, conference proceedings, preprints, datasets, protocols, and future scholarly outputs. In the CMS, use **Research outputs** or **Research library**. On the public site, use **Research** unless the content is genuinely only journal papers.

Do not use **Webinars** as the main event concept. A webinar is one format of an event. Use **Events** publicly and **Event workspace** in admin. Keep the format field for Webinar, Seminar, Lecture, Workshop, Course session, Conference presentation, Book launch, Office hours, or Other.

Do not call every public written item an **article** if the owner also publishes notes, letters, field notes, explainers, and essays. Use **Writing** as the umbrella and retain a content type or series label.

Do not use **newsletter** as the purpose for every email. Distinguish newsletters, publication announcements, event logistics, comment notifications, account messages, and system notifications.

## Information architecture

### Public site

The homepage should orient visitors by intention:

- Start with a current idea or featured work.
- Explore Writing.
- Explore Research.
- Browse by Topic.
- Join an Event.
- Follow the work.

The Resources dropdown should be the main discovery surface rather than a miscellaneous bucket. It should include:

- Topics;
- Start here;
- Research guides or explainers;
- Reading lists;
- Newsletter archive;
- Event recordings when enough exist.

The public content graph should be visible in small, useful ways:

- an article can show related research outputs;
- a research output can show an accessible explanation or related article;
- an event can show the articles, papers, topics, or course pathway behind it;
- a topic can collect writing, research, events, and resources together;
- a newsletter issue can point to the source content it announced;
- a course interest route can show the event or research theme that generated it.

Every relationship should have a human reason. Use labels such as **Background**, **Related evidence**, **A practical explanation**, **Discussed at this event**, **Further reading**, or **Next step** instead of a generic random “Related posts” block.

### Admin site

The admin should be organized around workspaces:

- **Dashboard** — what needs attention now.
- **Library** — Writing, Research outputs, Events, Topics, Resources.
- **Community** — comments, reports, moderation, and discussion settings.
- **Audience** — subscribers, preferences, segments, and consent.
- **Messages** — newsletter drafts, publication announcements, event campaigns, transactional email, delivery history.
- **Analytics** — content, audience, event funnel, email delivery, and search behavior.
- **Settings** — sender identities, domains, site identity, legal defaults, integrations, and launch checks.

The current screens should not be deleted blindly. They should be migrated behind clearer workspaces and terminology.

## Navigation interaction requirements

Implement the Huberman-style mechanism, not a copy of its design.

On desktop:

- a navigation item with children opens on hover after a short intent delay;
- it also opens and closes on click;
- moving from the trigger into the dropdown keeps it open;
- moving across sibling triggers changes the open menu without flicker;
- leaving the trigger and dropdown closes after a short delay;
- Escape closes the menu and returns focus to the trigger;
- keyboard focus opens the menu and arrow keys can move between items;
- the dropdown has a visible active state and a clear boundary;
- links remain usable without hover.

On touch and mobile:

- hover must not be required;
- tapping a trigger toggles the menu;
- the menu uses a full-width or drawer layout that is easy to scan;
- opening the menu manages focus and prevents background scroll where appropriate;
- a second tap or explicit close dismisses it;
- nested sections do not become an impossible accordion maze.

Use a reusable navigation component with tests for hover, click, keyboard, touch, Escape, outside click, reduced motion, and route changes. Do not implement hover-only links.

## The connected content model

Do not prematurely merge every table into one giant polymorphic table. Keep the existing specialized tables where their fields and lifecycles differ, then connect them with shared concepts.

### Topics

Create first-class topic records instead of storing only free-form tag strings.

A topic should have:

- id;
- name;
- slug;
- short description;
- parent topic or hierarchy position when needed;
- image or visual treatment if editorially justified;
- public visibility;
- sort order;
- SEO metadata;
- created and updated timestamps.

Use a join table such as `content_topics` with a content kind and content id, or separate typed join tables if that produces safer foreign-key behavior in Supabase. The implementation should make it possible to attach topics to posts, research outputs, events, resources, and newsletter issues.

Do not use a loose comma-separated tags field as the long-term relationship model. Keep tags only as an import or lightweight alias if needed.

### Content relationships

Add a deliberate relationship table or typed relation layer. It should support:

- source content type and id;
- target content type and id;
- relationship kind;
- optional display label;
- sort order;
- public visibility;
- created by and timestamps.

Initial relationship kinds should include:

- related;
- background;
- evidence_for;
- explanation_of;
- discussed_at;
- recording_of;
- follow_up;
- further_reading;
- course_pathway;
- announced_by.

Do not allow arbitrary self-referential URLs when an internal relationship exists. Preserve external links for publishers, repositories, event platforms, and partner sites.

### Shared editorial fields

Where useful, Writing, Research outputs, Events, and Resources should share:

- slug or canonical route;
- title;
- short dek/promise;
- description;
- cover/hero/thumbnail media;
- image alt text and credit;
- topics;
- public visibility;
- editorial status;
- featured/priority state;
- canonical URL;
- SEO title and description;
- created, updated, published, and archived timestamps;
- author or contributor references.

Do not show a content item publicly until its required fields for its type pass validation.

## Research outputs: make this a real scholarly workflow

The current `Paper` form is too small, too generic, and presented as a popup. It treats a research publication as a title, abstract, author string, venue, year, DOI, URLs, tags, featured flag, and status. That is enough for a card, but not enough for a trustworthy research library.

Rename the admin area to **Research outputs** and the creation action to **Add research output**.

Use a full-page editor or a persistent right-side workspace with sections, not a small modal. The editor must support draft saving, validation, preview, and a clear publication checklist.

### Research output type

Require an output type before asking for type-specific metadata:

- Journal article
- Conference proceeding or presentation
- Preprint
- Working paper
- Technical report
- Policy brief
- Dataset
- Protocol or methods paper
- Thesis or dissertation
- Book chapter
- Other scholarly output

The type controls which fields are required and which fields are optional. Do not force journal volume and issue fields onto a report. Do not force a DOI onto a working paper that has none.

### Core fields

Every research output should have:

- title;
- abstract or public summary;
- output type;
- contributor list;
- primary author or owner;
- topics;
- publication status;
- publication date or date precision;
- canonical landing-page URL;
- external full-text URL or uploaded/public PDF when permitted;
- access and license information;
- image/visual metadata when the output is featured;
- related Writing, Events, Topics, and Resources;
- citation preview;
- internal editorial notes kept private.

Use a public **summary** separately from the formal abstract when the owner wants to explain why the work matters to a general reader. Do not rewrite an abstract silently.

### Structured contributors

Replace a comma-separated `authors` string with structured contributors over time. At minimum store:

- given name;
- family name;
- display name;
- ORCID iD when available;
- affiliation name;
- affiliation identifier when available;
- contributor role;
- author order;
- corresponding-author flag where relevant.

Use CRediT roles where they add value, including Conceptualization, Data curation, Formal analysis, Funding acquisition, Investigation, Methodology, Project administration, Resources, Software, Supervision, Validation, Visualization, Writing—original draft, and Writing—review & editing. Do not make the form overwhelming for a simple solo paper; use a compact contributor editor with an optional advanced contribution section.

Crossref recommends surname as required contributor metadata and recommends given name, role, affiliations, affiliation identifiers, and ORCID when available. For journal articles it requires titles, publication year, and DOI data when a DOI deposit is being made, and recommends contributors, ORCID, more precise publication dates, pages, citations, funding, license, and structured abstracts. [1]

ORCID treats publications, datasets, conference presentations, and more as works, supports DOI/PMID imports, and distinguishes manual entry from trusted-source imports. The workflow should therefore support DOI and PMID lookup without pretending that every work has a DOI. [2]

### Publication and venue metadata

For journal articles, support:

- journal full title;
- journal abbreviation;
- ISSN or eISSN;
- volume;
- issue;
- article number;
- first and last page;
- online publication date;
- print publication date;
- accepted date where useful;
- publisher;
- DOI;
- PMID or other identifier;
- publisher landing page;
- version of record URL;
- open-access status;
- license.

For reports, briefs, protocols, datasets, and presentations, provide type-specific sections instead of one generic venue field:

- institution or issuing body;
- report number;
- version;
- repository;
- dataset identifier;
- conference name and location;
- presentation date;
- funder;
- grant identifier;
- ethics approval or registration reference where appropriate.

### DOI/identifier import

Keep the current Crossref fetch feature, but make its behavior more scholarly and transparent:

- normalize DOI, PMID, and URL input;
- show the source and retrieval time of imported metadata;
- display a field-by-field import preview;
- never overwrite non-empty manual values without explicit approval;
- flag conflicts instead of silently choosing one value;
- permit the owner to accept all, accept selected fields, or cancel;
- preserve the raw response privately for audit/debugging if lawful and useful;
- allow manual entry when Crossref has no result;
- validate DOI uniqueness and canonical DOI URL;
- make clear that Crossref metadata is a suggestion, not a final editorial record.

### Publication states

Replace the current binary draft/published model with a visible state machine:

- Draft
- Metadata incomplete
- Ready for review
- Scheduled
- Published
- Updated
- Withdrawn
- Archived

A withdrawn output should retain its landing page and explain the status rather than disappearing. A correction or update should preserve the original publication date and show the updated date and version notes where appropriate.

### Research publication checklist

Before publication, validate:

- title is present;
- output type is selected;
- at least one contributor exists;
- publication date has a defined precision;
- abstract or public summary exists;
- landing page or full-text route is present;
- DOI/identifier is valid if entered;
- journal-specific required fields are present for journal articles;
- topics are assigned;
- accessibility text exists for featured media;
- license/access statement is clear;
- citation preview renders correctly;
- metadata/SEO preview is available;
- relationships are reviewed;
- announcement behavior is selected or explicitly skipped.

The editor should show missing requirements before the owner can publish. It should not use a popup that hides the context of the work.

## Events: replace Webinar CRUD with an Event workspace

A webinar should become one event format, not the underlying entity.

Create an **Event workspace** with a full-page editor and a lifecycle dashboard. The creation flow should ask first what kind of event is being created.

### Event types

Support:

- Webinar
- Public lecture
- Seminar
- Workshop
- Conference presentation
- Course session
- Book launch
- Community conversation
- Office hours
- Recording or on-demand session
- Other

### Event fields

Every event should support:

- title;
- short promise or why-attend statement;
- description;
- format;
- audience;
- speakers/hosts with structured profiles;
- start date/time and end date/time;
- timezone;
- attendance mode: online, in-person, or hybrid;
- online provider and external event id when relevant;
- physical venue and address when relevant;
- registration mode: first-party, external, hybrid, invite-only, or none;
- registration URL or form;
- capacity or ticket/offer details when relevant;
- hero image, thumbnail, alt text, credit, and aspect variants;
- agenda and takeaways;
- related topics, Writing, Research, Resources, and course pathway;
- recording URL and replay visibility;
- cancellation/reschedule information;
- contact/support email;
- event status;
- publication/registration windows;
- email campaign settings;
- analytics and attribution settings.

Schema.org defines Event around name, start/end dates, location, attendance mode, event status, organizer, performers, offers, and related properties. Google’s event guidance requires a meaningful name, precise start date/time, and location data, and recommends description, end date, status, image, and offer details. Online events should still have a real event page and clear attendance information. [3] [4]

### Event lifecycle

Use separate concepts for editorial visibility, operational state, and replay state. A practical initial lifecycle is:

- Draft
- Internal review
- Published
- Registration open
- Registration closed
- Live
- Completed
- Replay available
- Postponed
- Rescheduled
- Cancelled
- Archived

Do not delete cancelled or postponed events. Keep their history, show the changed state publicly, and preserve original dates where useful for clarity and structured data. Google specifically recommends retaining key event identity properties such as start date and location when an event is cancelled or postponed. [4]

### Event page

Every public event should have a dedicated marketing and information page. A compact card is only a discovery surface.

The page should answer:

- What is this?
- Why should I attend or watch?
- Is it for me?
- When is it, in my timezone?
- Where does it happen?
- Who is involved?
- What will I leave with?
- How do I register or add it to my calendar?
- What happens after registration?
- Is there a replay or related course path?

Use a real page with hero, summary, speaker/context, agenda, logistics, registration, calendar, access state, replay, resources, and next step. Never make event creation itself a popup-only interaction.

## Newsletter and email architecture

The current implementation has useful delivery primitives, but the admin is still a manual “compose one article email and send to everyone” screen. Upgrade it to a message system.

### Email purposes

Separate message purposes at the type, template, sender, and delivery-policy level:

- account and authentication;
- welcome and confirmation;
- publication announcement;
- newsletter digest;
- event announcement;
- event registration confirmation;
- event reminder;
- event change/cancellation;
- replay available;
- comment reply or mention;
- moderation/report notification;
- course-interest follow-up;
- unsubscribe and preference messages;
- system/operational alerts.

Marketing/broadcast messages must not be treated as transactional mail. Postmark’s message-stream guidance distinguishes messages triggered by a user action from broadcasts sent to many recipients and recommends separating traffic and sender infrastructure for deliverability. [6]

### Sender identities

Use purpose-specific sender identities, but do not use `noreply@` for messages where replies are useful.

Recommended defaults:

- `Dr Fraction <newsletter@dr-fraction.me>` for newsletters and publication digests;
- `Dr Fraction <events@dr-fraction.me>` for event announcements and event logistics where replies are monitored;
- `Dr Fraction <hello@dr-fraction.me>` for relationship and contact messages;
- `Dr Fraction <notifications@dr-fraction.me>` for system notifications;
- `Dr Fraction <noreply@dr-fraction.me>` only for truly automated messages that do not need a reply, with a visible support/contact address in the body.

Configure `Reply-To` separately from `From`. Do not put every purpose through `newsletter@`. Store sender identity and reply policy in settings, not scattered in helper files.

### Topics, segments, and preferences

Resend’s current contact model distinguishes internal Segments from subscriber-controlled Topics. Segments define who is targeted; Topics define what kind of message the subscriber agrees to receive. Contacts can have properties, multiple segments, and topic preferences. [5]

Model these concepts explicitly:

- subscriber/contact;
- consent source and timestamp;
- global subscription status;
- topic preferences: Writing, Research, Events, Courses, Announcements;
- internal segments: readers, event registrants, research interests, course-interest leads;
- suppression/bounce state;
- last engagement timestamps;
- source and first-touch attribution.

Do not infer consent from a user’s account or event registration without recording the relevant purpose and consent language.

### Automations

Implement a safe event-driven automation layer:

- When a Writing item is published, optionally create a publication-announcement draft.
- When a Research output is published, optionally create a research-announcement draft with citation metadata and accessible summary.
- When an Event is published or registration opens, optionally create an event-announcement draft.
- When someone registers for an Event, send transactional confirmation and calendar information.
- When an event approaches, send configured reminders to registrants.
- When an event is postponed or cancelled, send operational updates to registrants.
- When a replay is published, send a replay message to eligible registrants and selected audience topics.
- When a comment receives a reply or report, notify the relevant party with preferences respected.

Default to **draft for approval** for broadcast messages. Allow fully automatic sends only after the owner explicitly enables that automation and chooses the audience/topic/template. Never send to the entire subscriber list merely because content was published.

Every automation needs:

- trigger;
- conditions;
- audience/topic;
- template;
- sender identity;
- delay or schedule;
- approval mode;
- idempotency key;
- delivery history;
- pause/disable control;
- test action;
- audit trail.

### Newsletter admin

Replace the single compose page with a Messages workspace containing:

- Drafts;
- Scheduled;
- Sent;
- Automations;
- Templates;
- Sender identities;
- Audience and topic preferences;
- Delivery events and errors.

A newsletter issue should support a subject, preview text, title, intro, selected content blocks, related links, optional featured research/event, UTM campaign, sender identity, reply-to, topic, audience segment, test recipients, preview, schedule, approval, and send history.

The owner should be able to create an issue manually or generate a draft from a published content item. The generated draft must remain editable and must not make unsupported claims about the research or event.

## Comments and community management

The current comments screen loads up to 500 comments into one long list and filters only by status. This will become unmanageable as the site grows.

Rename the admin area **Community** and make comments one part of a moderation workspace.

### Article-centered discussion model

Keep comments attached to their source content, but support more than `post_id` as the platform grows. Use a content reference or typed association that can point to Writing, Research outputs, Events, and future Resources.

A comment should have:

- source content type and id;
- topic context inherited from the source content;
- parent comment for one-level replies initially;
- author/user identity;
- body;
- status;
- moderation reason;
- report count;
- internal note;
- pinned/featured state;
- notification preferences;
- created and updated timestamps;
- moderation history.

Start with article-based comments if that is the safest migration, but design the UI and relationship layer for research and event discussions.

### Moderation workspace

Provide:

- Needs review;
- Reported;
- Visible;
- Hidden;
- Deleted/retained for audit;
- By article or research output;
- By topic;
- By author;
- By date;
- Search full text;
- Replies awaiting attention;
- Unanswered questions;
- Pinned comments;
- Moderation history.

Each row should show the source title, content type, topic, author, excerpt, date, status, report count, and quick actions. A detail view should show the comment in its thread and the source content context before moderation.

Ghost’s article comments are limited to logged-in members and provide edit/delete, replies, reactions, reports, pinning, post/author filters, full-text search, and notification flows. Discourse adds categories, tags, trust levels, flags, staff communication, and moderation guidance as a community scales. ScholarPress does not need to become a forum, but it should borrow the operational idea: moderators need queues, context, reports, and history—not only a flat list. [7] [8]

### Moderation actions

Use reversible actions by default:

- Approve/show;
- Hide;
- Mark as spam;
- Mark as reported/resolved;
- Pin;
- Lock discussion for a source item;
- Reply as owner;
- Add internal note;
- Notify or suppress notifications;
- Delete permanently only with a clear confirmation and audit record.

Keep a moderation history rather than overwriting the explanation for a status change.

## Form and page interaction rules

The research and event forms should no longer be tiny popups. Use:

- full-page routes for creation/editing;
- a persistent header with title, status, Save draft, Preview, and Publish actions;
- sections or tabs with URL-addressable state;
- autosave or explicit save-state feedback;
- validation summaries;
- type-specific field groups;
- import/review panels for DOI or external metadata;
- a publish checklist;
- unsaved-change protection;
- keyboard-accessible controls;
- responsive layouts that work on a laptop and tablet;
- a narrow modal only for confirmation, destructive actions, or small focused tasks.

A form should guide the owner through the work in the order decisions are made:

1. What is this?
2. What is it called?
3. Who contributed?
4. What does the visitor need to know?
5. Where does it belong?
6. What is its public status?
7. What relationships and follow-up should it create?
8. Is it ready to publish or send?

## Implementation sequence

### Milestone 1: vocabulary and navigation

- Rename public/admin labels from Papers/Webinars to Research/Events where appropriate.
- Create the Resources dropdown with Topics, Start here, and Newsletter archive placeholders only when routes exist.
- Implement responsive hover/click/keyboard navigation behavior.
- Add a global search entry point that can later cover all content types.

### Milestone 2: research output workspace

- Replace the paper popup with a full-page Research output editor.
- Add output type, structured contributor editor, publication metadata sections, status checklist, preview, and safe DOI import review.
- Preserve existing records through a non-destructive migration.
- Add topics and content relationships.

### Milestone 3: event workspace

- Rename and refactor webinars into generic Events while preserving existing webinar records.
- Add event format, attendance mode, venue/online details, speakers, status history, marketing fields, and structured data.
- Add full-page editor, event preview, lifecycle actions, and reusable event campaign kit.

### Milestone 4: connected library

- Add first-class topics and content relations.
- Show research, writing, events, and resources together on topic pages.
- Add relationship editing to content workspaces.
- Add related-content reasons and public contextual links.

### Milestone 5: messages and automation

- Create message drafts from published Writing, Research, and Events.
- Add email-purpose enum expansion, sender identities, Reply-To, Topics, Segments, and consent records.
- Add scheduled/approval-based automations and delivery audit.
- Keep Resend’s current idempotency and webhook handling.

### Milestone 6: community workspace

- Replace the flat Comments screen with Community queues and filters.
- Add source-content context, topic filters, full-text search, reports, moderation actions, pinning, internal notes, and history.
- Add notification preferences and article-author/replier notifications.

## Acceptance criteria

The owner should be able to create and publish a journal article, report, preprint, event, lecture, workshop, or webinar without being forced through the wrong fields or a tiny popup.

A research output should have enough metadata to be credible, citeable, discoverable, and connected to the rest of the site. The system should distinguish what is required for a journal article from what is appropriate for a report, dataset, protocol, or presentation.

A public event should have a complete page, not only a date and an external URL. The owner should be able to postpone or cancel it without deleting history.

Publishing an item should never silently broadcast to everyone. It should create a configurable draft or automation run with a visible audience, topic, sender, reply-to, approval state, and delivery history.

Newsletters, event messages, account messages, comment notifications, and system alerts should have distinct purposes and sender conventions.

The community admin should be able to find all comments for an article, research output, topic, author, date range, or moderation state without loading the entire history into one flat page.

A topic page should bring together writing, research, events, and resources. A visitor should be able to move from an article to evidence, from evidence to an event, and from an event to a future learning path.

The system should preserve current public routes and data while migrations are introduced. No destructive migration should be performed without an explicit data audit and rollback plan.

## Validation requirements

For every milestone, validate:

- TypeScript;
- ESLint;
- production build;
- database migration syntax and RLS assumptions;
- public route rendering;
- admin owner protection;
- keyboard navigation;
- hover/click/touch menu behavior;
- mobile and tablet layouts;
- reduced-motion behavior;
- empty, loading, error, and permission states;
- duplicate/idempotent email behavior;
- publication and event status transitions;
- metadata previews and structured data;
- no accidental email sends in test mode;
- no data loss during migrations.

## References

[1]: https://www.crossref.org/documentation/schema-library/required-recommended-elements/ "Crossref required, recommended, and optional metadata"
[2]: https://support.orcid.org/hc/en-us/articles/360006973133-Add-works-to-your-ORCID-record "ORCID adding works and identifiers"
[3]: https://schema.org/Event "Schema.org Event type and properties"
[4]: https://developers.google.com/search/docs/appearance/structured-data/event "Google Event structured data requirements and event-status guidance"
[5]: https://resend.com/docs/dashboard/contacts/introduction "Resend contacts, segments, topics, and broadcast preferences"
[6]: https://postmarkapp.com/message-streams "Postmark transactional and broadcast message streams"
[7]: https://ghost.org/help/commenting/ "Ghost article comments and moderation workflow"
[8]: https://meta.discourse.org/t/discourse-moderation-guide-part-1-getting-started/63116?tl=en "Discourse moderation, categories, trust, flags, and community stewardship"
[9]: https://www.hubermanlab.com/ "Huberman Lab homepage navigation and topic-first visitor pathways"
[10]: https://www.8020.inc/blog/from-podcast-to-platform-crafting-huberman-labs-digital-home-in-webflow "Huberman Lab platform case study: topic architecture, search, CMS, and email conversion"
