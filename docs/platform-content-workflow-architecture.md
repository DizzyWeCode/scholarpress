# ScholarPress Product, Content, Research, Events, Email, and Community Workflow Architecture

## Purpose

This brief revises ScholarPress from a set of separate admin screens into a connected publishing platform for Dr Fraction Dzinjalamala.

The key change is conceptual:

> Articles, research outputs, events, newsletters, topics, comments, and future courses should be different expressions of one connected body of work—not unrelated database tables exposed through unrelated forms.

The public site should use language visitors understand. The CMS should use language that helps the owner make correct publishing decisions. The database should preserve enough structure to connect content, measure relationships, and automate safe follow-up.

This brief is informed by the current ScholarPress repository and by established patterns from Huberman Lab’s topic-first content platform, Crossref metadata guidance, ORCID, CRediT, Schema.org and Google event requirements, Resend contact/topic management, Postmark message streams, Discourse moderation, and Ghost article comments.

## Terminology decisions

### Public navigation

Use intentional visitor-facing labels rather than exposing internal table names.

- **Blog** — essays, articles, notes, reflections, explainers, and public thinking.
- **Research** — scholarly outputs, publications, reports, protocols, data, and research summaries.
- **Events** — webinars, seminars, lectures, workshops, conferences, book launches, and teaching sessions; recordings appear as related event resources.
- **Topics** — cross-cutting subject pages that connect Blog posts, Research outputs, Events, and selected resources.
- **About** — Dr Fraction, current interests, methods, affiliation, and ways to work together.
- **Newsletter** or **Follow** — the relationship and email preference route.
- **Search** — global discovery across the connected library.

Make **Research** a top-level navigation item because it is central to Dr Fraction’s credibility and work. In the CMS, use **Research outputs** or **Research library** because the collection may include reports, conference proceedings, preprints, datasets, protocols, and other scholarly outputs. Use **Research Papers** as a child label only when a destination specifically contains papers; do not imply that every research output is peer-reviewed.

Do not use **Webinars** as the main event concept. A webinar is one format of an event. Use **Events** publicly and **Event workspace** in admin. Keep the format field for Webinar, Seminar, Lecture, Workshop, Course session, Conference presentation, Book launch, Office hours, or Other.

Do not call every public written item an **article** if the owner also publishes notes, letters, field notes, explainers, and essays. Use **Blog** as the public umbrella and retain a more precise internal content type or series label. The existing `/blog` route makes this more concrete than introducing a new `/writing` route.

Do not use **Resources** as a generic public navigation bucket. Images, PDFs, recordings, and downloadable files are **Assets** in the CMS; curated collections belong to **Topics** or **Series**; research belongs to **Research**; and event recordings remain attached to **Events**.

Do not use **newsletter** as the purpose for every email. Distinguish newsletters, publication announcements, event logistics, comment notifications, account messages, and system notifications.

### Terminology audit: the precise terms to use

The following distinctions are important enough to be part of the product vocabulary, database enums, validation messages, and documentation. Informal language may still appear in explanatory copy, but it should not be used as an ambiguous data type.

| Avoid as a data type or primary label | Use instead | Meaning |
| --- | --- | --- |
| Paper | **Research output** | Umbrella term for a scholarly work represented in the library. |
| Article for every written item | **Blog** with a specific content type | Public editorial work such as an article, essay, note, explainer, or field note. |
| Manuscript as a publication type | **Version** or **publication stage** | A manuscript is a work-in-progress/version in a publication process, not necessarily the final record. |
| Preprint = published journal article | **Preprint / posted content** | A publicly posted, generally not-yet-peer-reviewed work; its status must be explicit. |
| Accepted paper | **Accepted manuscript** | The author version accepted after peer review but before publisher typesetting. |
| Published paper | **Version of record** or **published version** | The final publisher-formatted version, normally with its definitive citation and DOI. |
| Conference proceeding or presentation | **Conference proceeding** or **Conference presentation** | A proceeding is a scholarly publication; a presentation is an activity/event contribution. |
| Research author for everyone involved | **Authors** plus **contributors** | Authors are the credited authors; contributors may include people acknowledged through CRediT roles. |
| CRediT role as proof of authorship | **Contributor role** | CRediT describes contributions; it does not decide who qualifies as an author. |
| Webinar as the event entity | **Event** with format = Webinar | An event is the scheduled occurrence; webinar describes its delivery format. |
| Recording as an event | **Event recording** or **on-demand resource** | A recording is an asset or follow-up resource related to an event. |
| Repeating webinar records | **Event series** plus event instances | A series groups related occurrences; each occurrence remains its own event. |
| Newsletter for all outbound email | **Broadcast**, **transactional email**, or **notification** | Newsletter is one broadcast content type, not the transport or all-purpose category. |
| Audience as a recipient filter | **Segment** | Sender-controlled grouping used to target a broadcast. |
| Segment as an unsubscribe preference | **Topic** or **preference** | Recipient-controlled category used to decide what they want to receive. |
| Tags as the relationship system | **Topics** and **content relationships** | Topics classify content; relationships explain why two items are connected. |
| Comments as a flat list | **Discussion** with **comments**, **reports**, and **moderation states** | The content and operational context around a conversation. |

Crossref distinguishes journal articles, conference proceedings, datasets, dissertations, reports and working papers, and posted content such as preprints and eprints. COPE describes preprints as a form of publication that is disseminated before peer review and says platforms should make that status clear. Therefore ScholarPress should not collapse all of these into “paper” or imply peer review where none occurred. [11] [12]

CRediT is a taxonomy of contributor roles, not an authorship test. A person can have multiple roles, multiple people can share a role, and contributors may be listed even when they are not formal authors. The CMS should therefore label the section **Authors and contributors**, with CRediT appearing as optional contribution metadata. [13]

Schema.org uses **EventSeries** for a collection of related events and **Event** for each occurrence. A recording should normally be modeled as an asset or on-demand resource related to the event, not as a replacement for the original scheduled event. [14]

For email, Resend uses **Broadcasts** for bulk marketing mail and **Sending** for transactional email. It uses **Segments** for sender-controlled targeting and **Topics** for recipient-controlled preferences. ScholarPress should use those terms consistently rather than calling every message a newsletter or every recipient group an audience. [15] [16]

## Product and marketing framing

The site should not be designed as an academic archive with marketing added at the end. It is a knowledge product with a public editorial front door, a research library, an event engine, an owned audience, and a future learning offer.

That means every major page needs two descriptions:

1. **What the thing is.** This is the editorial or scholarly definition: a journal article, research report, event, topic, or newsletter issue.
2. **What job the thing performs.** This is the product definition: attract the right visitor, explain a difficult idea, build trust, capture an email preference, register an attendee, create a return visit, or open a path toward a course or professional enquiry.

Do not force every visitor into a commercial sales funnel. For Dr Fraction, the more accurate model is a **relationship journey**:

**Discover → Understand → Follow → Participate → Return → Learn or enquire.**

The equivalent product states are:

- **Visitor** — has arrived through search, a shared link, social media, a partner, or a direct visit.
- **Engaged reader** — has consumed or explored meaningful content.
- **Subscriber** — has explicitly opted into one or more email topics.
- **Registrant** — has registered for an event or resource.
- **Attendee** — has attended or meaningfully engaged with an event.
- **Learning-interest contact** — has asked to hear about a future course, cohort, or learning opportunity.
- **Client or learner** — should only be introduced when the platform actually supports a paid course, service, or learner relationship.

Use **lifecycle stage** for this broad relationship progression and **interaction status** for the current action, such as registered, attended, no-show, replay-viewed, or replied. Do not label every subscriber or event registrant a “lead.” HubSpot’s lifecycle-stage model distinguishes a subscriber from a person who has converted through a deeper interaction, and Customer.io similarly separates people, events, segments, automations, broadcasts, and transactional messages. [17] [18]

### The product vocabulary

Use these terms in product decisions and admin copy:

- **Audience** — the people ScholarPress serves as a whole.
- **Persona or audience group** — a meaningful human group, such as clinicians, researchers, students, or malaria-program professionals. Do not create personas without evidence.
- **Contact** — a known person with an email or account record.
- **Segment** — a sender-defined group used for targeting.
- **Topic** — a subscriber-facing preference or a subject area, depending on context; label the distinction clearly in the UI.
- **Content type** — the schema of an item, such as Blog post, Research output, Event, or Asset.
- **Content item** — one entry of a content type.
- **Content asset** — a reusable image, PDF, recording, slide deck, or downloadable file.
- **Series** — a planned set of related content or events with a shared promise.
- **Campaign** — a coordinated promotion with an objective, audience, message, channel, CTA, and measurement window.
- **Journey** — a sequence of experiences or messages across lifecycle stages.
- **Call to action (CTA)** — the next action the page is asking a visitor to take.
- **Conversion** — a defined completion, such as subscribing, registering, attending, downloading, replying, or expressing course interest.
- **Offer** — what the visitor receives in exchange for the requested action. For a newsletter, this may be ongoing insight; for an event, it is the promised experience; for a course, it is the learning outcome.

The CMS should use **content type** and **content item** for structure. Contentful uses this distinction to model structured fields, reusable assets, and references between content types. [21] The marketing workspace should use **campaign**, **journey**, **audience**, **CTA**, and **conversion** for growth operations. Mixing these layers is what makes many CMSs feel confusing: a database field is not automatically a marketing strategy.

### Every page needs a promise and a next step

Each public content item should have an editorial promise and a primary CTA. The promise answers, “Why should this person spend time here?” The CTA answers, “What is the most useful next step after they have done so?”

Examples:

- A Blog post may use **Read the practical explanation** or **Explore the research behind this idea**.
- A Research output may use **Read the accessible summary**, **View the publication**, or **Join the related discussion**.
- An Event may use **Register**, **Add to calendar**, **Watch the replay**, or **Explore the learning pathway**.
- A Topic page may use **Follow this topic** or **Start with the essential reading**.
- A future Course page may use **Join the interest list**, **View the syllabus**, or **Apply**, depending on the actual offer.

Do not place five competing buttons on every card. Store a primary CTA and optional secondary CTAs with a reason, destination, and tracking identity. A link to an external publisher is a legitimate CTA when that is the visitor’s intent; it should not be hidden behind an unnecessary ScholarPress detour.

### Campaign and journey layer

Publishing content and marketing content are related but not identical actions. Publishing makes an item available. A campaign decides whether, where, when, and to whom that item should be promoted.

For each promotion, store:

- objective;
- audience or segment;
- lifecycle stage;
- source content or offer;
- primary CTA;
- channels;
- campaign name and UTM identity;
- start and end dates;
- approval state;
- owner;
- success metric;
- resulting conversions.

The minimum campaign types should be **publication announcement**, **newsletter issue**, **event promotion**, **event reminder**, **replay promotion**, **course-interest nurture**, and **re-engagement**. A campaign may use email, the website, social links, partner links, or a combination of channels.

An automation is not the same thing as a campaign. A **campaign** is a coordinated initiative with a goal and reporting window. An **automation** is the rule or workflow that executes a step when a trigger or condition occurs. A **broadcast** is a bulk message send. A **transactional message** responds to an individual action. A **journey** is the sequence of experiences or messages a person moves through.

### Product metrics that matter

Do not optimize for page views alone. Track the smallest useful set of metrics by product job:

- **Discovery:** qualified landing visits, source/referral, search impressions, and topic entry points.
- **Engagement:** engaged reading, scroll or completion signals where reliable, return visits, related-content clicks, and replies.
- **Audience growth:** new subscribers, subscription conversion rate, topic preference, consent source, and unsubscribe rate.
- **Event performance:** landing-page conversion, registration count, attendance conversion, no-show rate, engagement, replay views, and post-event CTA conversion.
- **Learning demand:** course-interest submissions, syllabus views, waitlist conversion, and source event/topic.
- **Editorial health:** publishing frequency, content freshness, orphaned content, broken relationships, and percentage of items with a clear CTA.
- **Email health:** delivery, bounce, complaint, unsubscribe, click, and conversion metrics by campaign and topic.

Event marketing platforms commonly separate registration, attendance, engagement, and post-event conversion. ON24 calls the proportion of registrants who attend the **attendance conversion rate**, while HubSpot emphasizes tracking attendee behavior from registration through post-event conversion. Those terms should appear in the Event analytics workspace instead of a single vague “views” number. [19] [20]

## Information architecture

### Public site

The homepage should orient visitors by intention:

- Start with a current idea or featured work.
- Explore the Blog.
- Explore Research.
- Browse by Topic.
- Join an Event.
- Follow the work.

The public navigation should use one home for each visitor job:

- Blog — read the public prose.
- Research — find scholarly outputs and publication context.
- Events — register, attend, or watch a replay.
- Topics — browse the connected body of work by subject.
- About — understand Dr Fraction and ways to engage.
- Follow — subscribe and manage the relationship.
- Search — find anything across the library.

Do not add a generic Resources route. Research Papers belong under Research; guides and explainers belong under Blog or Topics; event recordings belong under Events; and Start here belongs in the homepage hero, footer, and contextual CTAs.

The public content graph should be visible in small, useful ways:

- an article can show related research outputs;
- a research output can show an accessible explanation or related article;
- an event can show the articles, papers, topics, or course pathway behind it;
- a topic can collect Blog posts, Research outputs, Events, and selected Assets together;
- a newsletter issue can point to the source content it announced;
- a course interest route can show the event or research theme that generated it.

Every relationship should have a human reason. Use labels such as **Background**, **Related evidence**, **A practical explanation**, **Discussed at this event**, **Further reading**, or **Next step** instead of a generic random “Related posts” block.

### Admin site

The admin should be organized around workspaces:

- **Dashboard** — what needs attention now.
- **Library** — Blog, Research outputs, Events, Topics, Assets.
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

Use a join table such as `content_topics` with a content kind and content id, or separate typed join tables if that produces safer foreign-key behavior in Supabase. The implementation should make it possible to attach topics to Blog posts, Research outputs, Events, Assets, and newsletter issues.

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

Where useful, Blog posts, Research outputs, Events, and Assets should share:

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
- Conference proceeding
- Conference presentation
- Preprint
- Working paper
- Technical report
- Policy brief
- Dataset
- Research protocol or registered report
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
- authors and contributors;
- corresponding author or editorial contact where relevant;
- topics;
- publication status;
- publication date or date precision;
- canonical landing-page URL;
- external full-text URL or uploaded/public PDF when permitted;
- access and license information;
- image/visual metadata when the output is featured;
- related Blog posts, Events, Topics, and Assets;
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
- author order for formal authors;
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
- related topics, Blog posts, Research, Assets, and course pathway;
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

Use a real page with hero, summary, speaker/context, agenda, logistics, registration, calendar, access state, replay assets, and next step. Never make event creation itself a popup-only interaction.

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
- topic preferences: Blog, Research, Events, Courses, Announcements;
- internal segments: readers, event registrants, research interests, course-interest leads;
- suppression/bounce state;
- last engagement timestamps;
- source and first-touch attribution.

Do not infer consent from a user’s account or event registration without recording the relevant purpose and consent language.

### Automations

Implement a safe event-driven automation layer:

- When a Blog post is published, optionally create a publication-announcement draft.
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

Keep comments attached to their source content, but support more than `post_id` as the platform grows. Use a content reference or typed association that can point to Blog posts, Research outputs, and Events.

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

- Use Blog, Research, Events, Topics, About, Follow, and Search as the public navigation pillars; keep Research outputs and Event workspace as admin terms.
- Add a real Topics landing page and place Research Papers under Research; keep Start here in the homepage hero, footer, and contextual CTAs.
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
- Show blog posts, research, events, and resources together on topic pages.
- Add relationship editing to content workspaces.
- Add related-content reasons and public contextual links.

### Milestone 5: messages and automation

- Create message drafts from published Blog posts, Research, and Events.
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

A topic page should bring together Blog posts, Research outputs, Events, and selected Assets. A visitor should be able to move from a blog post to evidence, from evidence to an event, and from an event to a future learning path.

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
[11]: https://www.crossref.org/services/content-registration/ "Crossref content registration types"
[12]: https://publicationethics.org/guidance/discussion-document/best-practices-preprints "COPE best practices for preprints"
[13]: https://credit.niso.org/contributor-roles/ "CRediT contributor roles and authorship distinction"
[14]: https://schema.org/EventSeries "Schema.org EventSeries"
[15]: https://resend.com/docs/dashboard/broadcasts/introduction "Resend Broadcasts versus transactional Sending"
[16]: https://resend.com/docs/knowledge-base/why-use-topics "Resend Topics versus Segments"
[17]: https://knowledge.hubspot.com/records/use-lifecycle-stages "HubSpot contact and company lifecycle stages"
[18]: https://docs.customer.io/messaging/journeys-overview/ "Customer.io people, objects, segments, journeys, broadcasts, and transactional messages"
[19]: https://www.on24.com/glossary/attendance-conversion-rate/ "ON24 attendance conversion rate"
[20]: https://www.hubspot.com/marketing-hub-for-events "HubSpot event registration, engagement, follow-up, and conversion tracking"
[21]: https://www.contentful.com/help/content-models/content-modelling-basics/ "Contentful content models, content types, fields, assets, and references"
