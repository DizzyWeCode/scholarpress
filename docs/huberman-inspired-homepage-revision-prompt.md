# Prompt: Revise ScholarPress’s Homepage and Public UI Using the Strongest Huberman Lab Patterns

You are improving the existing ScholarPress / Dr Fraction Dzinjalamala platform. The reference site is [Huberman Lab](https://www.hubermanlab.com/). Study and borrow its **information architecture, visitor-intent patterns, content-discovery mechanisms, and conversion clarity**. Do not copy its logo, colors, typography, health/wellness language, title formulas, imagery, layout pixel-for-pixel, or commercial identity.

The aim is to make ScholarPress feel more immediately useful and alive. A visitor should understand what this platform offers, find a relevant entry point quickly, and know what to do next without needing to understand the entire biography, database, or academic career first.

Work from the current repository and preserve the existing Dr Fraction direction: person-led, scholarly but warm, research-rooted, editorial, credible, and capable of expanding into writing, research, events, teaching, books, and courses.

## What the reference site does well

The current Huberman Lab homepage demonstrates several strong mechanisms:

- A thin, dismissible promotional banner at the top makes a current event or offer visible without rewriting the main navigation.
- The navigation is compact and intent-oriented: Podcast, Resources, Newsletter, Events, Book, About, Search, and account/premium access.
- The opening page presents a concrete relationship offer: a newsletter with a named benefit, a clear audience promise, and a single action.
- The hero communicates the platform in one plain sentence: “Science-based tools for everyday life.” It also states a predictable publishing cadence.
- The page promotes a current product or project with a distinct visual section instead of making every section compete for attention.
- “Latest Episodes” serves returning visitors who want what is new.
- “Featured Episodes” serves visitors who need a curated starting point rather than chronology.
- Topic labels connect individual content to broader questions and let people continue exploring.
- Search is available both in the header and in a full-page discovery area. Its search state also exposes popular topics, latest episodes, and protocol/toolkit entry points.
- The dedicated Topics page turns a large content library into a browsable map.
- The newsletter has a concrete lead magnet, an archive, a visible value proposition, and social proof.
- The footer provides another navigation layer for podcast, topics, events, book, membership, about, FAQ, contact, and policies.

The implementation agency’s case study explains that the site’s redesign was built around a topic-first content architecture, clear entry points for new and returning visitors, a flexible design system, searchable content, and a lead magnet for email conversion. The underlying system reportedly organized hundreds of hours of content into topics and subtopics and used dedicated search infrastructure rather than treating the homepage as the archive. [5]

These are mechanisms to adapt, not a visual template to copy.

## Current ScholarPress problem to solve

The current homepage is credible and thoughtful, but it still reads partly like a portfolio organized around what exists in the database:

- a broad hero;
- Start here;
- latest writing;
- webinars;
- publications;
- biography;
- newsletter.

Each section makes sense independently, but a first-time visitor is not yet being offered enough explicit choices based on their intention. The platform needs to answer more directly:

- “I am new here. Where do I begin?”
- “I want the latest thinking.”
- “I want the research.”
- “I want to understand a specific problem or theme.”
- “I want to attend something.”
- “I want to follow the work.”
- “I want to understand Dr Fraction as a person and practitioner.”
- “I am interested in future teaching or courses.”

Do not solve this by adding more generic cards. Solve it with clearer visitor routes, more specific copy, stronger content relationships, and a homepage that changes emphasis based on real editorial priorities.

## The design principle

Build the homepage as a **guided entrance into a living body of work**, not as a static personal profile and not as a SaaS dashboard.

The page should serve three groups at once:

- **New visitors:** need orientation, trust, and a good first piece.
- **Returning readers:** need latest work, current events, and a quick path back into familiar themes.
- **Potential participants or learners:** need events, teaching, course signals, and a clear way to express interest.

The page must remain calm. It should not become a loud sales funnel or imitate a health influencer site.

## Proposed homepage structure

### 1. A restrained current-message banner

Add an optional, dismissible announcement strip above the main navigation. It should be managed from content/configuration rather than hard-coded.

Use it only for a genuinely current item:

- next webinar or public lecture;
- a new paper;
- a book/project launch;
- an important newsletter issue;
- course-interest or teaching announcement.

The banner needs:

- one short message;
- one destination;
- a dismiss action;
- accessible labels;
- persistence for the dismissal in the current browser;
- no fake urgency;
- no banner if there is no real current announcement.

Example structure, not final copy:

> New public session: what treatment evidence can and cannot tell us → View the event

### 2. A clearer navigation shell

Refine the existing public navigation around visitor intent rather than internal data types.

Recommended top-level routes:

- Writing
- Research
- Events
- Teaching / Learning, only when there is real content
- About
- Newsletter or Follow
- Search

Use dropdowns only when they help people choose. A dropdown should contain a short description and a small number of meaningful destinations:

**Writing**

- Essays and notes
- Start here
- Writing archive

**Research**

- Publications
- Research themes
- Methods and findings

**Events**

- Upcoming events
- Webinars
- Recordings
- Speaking or teaching enquiries

**About**

- About Dr Fraction
- Current interests
- Work with me

Do not expose Books, Projects, Courses, or other empty sections merely because the data model can support them. The navigation should grow as the work grows.

Use the existing navigation interaction improvements as a base. Desktop menus must open by click, support keyboard access, close on Escape and outside click, and show clear active states. Mobile navigation must manage focus, prevent background scrolling while open, and return focus to the menu button after close.

### 3. A reader-oriented hero

Replace generic or overly broad opening copy with a two-level proposition:

- A memorable platform promise.
- A current question, project, or body of work being explored now.

The hero should tell visitors what they can do here, not only who owns the site.

Possible structure:

> Research, writing, and public learning for better decisions about medicines and health.
>
> Follow Dr Fraction’s work across clinical pharmacology, malaria treatment, evidence, teaching, and the questions connecting them.

Do not use this wording automatically. Derive final copy from the real editorial positioning.

Give the hero one dominant action and one orientation action:

- Explore the current work.
- Start with a guided selection.

Optional tertiary links can point to Research, Events, or Newsletter, but do not make the first viewport look like a link directory.

Use a real image, research object, annotated diagram, field/lab image, or intentional typographic treatment. Do not show temporary filename notes or generic science stock photography in the final experience.

### 4. A “choose your way in” module

Adapt the reference site’s clear entry points into a compact ScholarPress choice module immediately after the hero or integrated into it.

The options should reflect actual visitor intentions:

- **Start with an idea** — selected essays and notes.
- **Start with the evidence** — papers, findings, and methods.
- **Start with a question** — themes such as treatment, resistance, access, evidence, or research ethics.
- **Join a conversation** — upcoming webinars, talks, and recordings.
- **Follow the work** — newsletter and future announcements.

Each route needs a one-sentence explanation and one clear destination. These are not decorative cards. They are an orientation device for new visitors.

### 5. A current project or featured work section

The reference site gives one current book/project a strong visual block. ScholarPress should use the same mechanism for the most important current work, but the content should be editorially honest.

Possible current-work types:

- a newly published paper;
- a research project;
- an active field or teaching initiative;
- an upcoming webinar series;
- a book or course project;
- a question Dr Fraction is actively investigating.

Allow the owner to feature one item with:

- short label;
- concrete title;
- promise or significance;
- image/diagram with credit;
- one action;
- optional secondary context link.

Do not make this a permanent product advertisement. It should be a rotating editorial spotlight.

### 6. Latest work for returning visitors

Create a stronger Latest module with the clearest equivalent of “Latest Episodes.” It should be driven by actual recent content and support multiple content types without becoming confusing.

Show:

- content type;
- date;
- specific title;
- concise dek/excerpt;
- meaningful image where available;
- one primary action.

Use editorial ordering, not only database order. The owner should be able to pin or select the most important current item without corrupting chronological archive behavior.

### 7. Featured “Start Here” work for new visitors

Keep a curated Start Here route separate from Latest. This distinction is essential.

Start Here should contain three to six pieces selected for different reasons:

- a clear introduction to Dr Fraction’s work;
- one representative essay or note;
- one research output explained accessibly;
- one event or conversation;
- one piece that reveals voice, method, or values.

Show a short reason for inclusion, such as:

- “A good first look at the questions behind the research.”
- “The clearest introduction to treatment resistance.”
- “A practical explanation of how evidence becomes a decision.”

Do not label everything “featured.” Curation needs a reason.

### 8. Topic and theme discovery

Adapt Huberman Lab’s topic architecture without copying its volume or taxonomy.

Start with a small number of real ScholarPress themes, such as:

- Clinical pharmacology
- Malaria treatment
- Drug resistance
- Evidence and decision-making
- Research ethics
- Medicines and access
- Teaching and learning

The exact taxonomy must be derived from the actual content. Avoid creating twenty empty topics.

Each topic page should eventually contain:

- topic explanation;
- related subtopics if enough material exists;
- selected starting pieces;
- latest related work;
- relevant papers;
- related events;
- newsletter or follow action;
- clear link back to all themes.

On the homepage, show a restrained “Explore a question” or “Browse themes” module. It should help visitors self-select without turning the page into a tag cloud.

### 9. Search as a discovery experience

Borrow the reference site’s search model: search should be available in the header and should feel like a route through the archive, not only a database field.

Create a full-screen or large search state with:

- one clear input;
- recent or popular searches only if real data exists;
- topic suggestions;
- latest work;
- papers and events in results;
- content-type filters;
- empty and no-result states with useful alternatives;
- keyboard navigation;
- URL-persisted queries;
- accessible labels and Escape-to-close behavior.

Do not implement Algolia merely because the reference site used it. Start with a measured Supabase/Postgres search appropriate to the current content volume. Add full-text indexes or an external search service only when the archive justifies it.

Search results should expose why a result is relevant. Show title, type, date, excerpt, and topic context. Avoid returning only a list of titles.

### 10. Events and teaching without competing with the editorial core

Huberman Lab makes events and products visible through current banners and dedicated routes. ScholarPress should make events findable, but not let webinars dominate the home page unless they are truly the main current activity.

The homepage event module should communicate:

- what the visitor will gain;
- who it is for;
- date/time/timezone;
- registration or replay action;
- speaker/context;
- whether it is free, paid, or invitation-based.

If there is no active event, replace the block with a relevant recording, teaching interest form, or newsletter route. Never leave an empty event placeholder.

### 11. A newsletter that behaves like a product

Borrow the reference site’s specificity and lead-magnet logic, but create an honest Dr Fraction promise.

The newsletter section should state:

- what arrives;
- how often;
- who it is for;
- a sample issue or archive;
- any useful first-delivery resource;
- privacy and unsubscribe expectations.

Possible benefit framing:

> A considered letter about medicines, evidence, research, teaching, books, and the questions connecting the work.

If a lead magnet is created, it must be real and maintainable. Possible examples:

- a short guide to reading clinical evidence;
- a research methods field note;
- a curated starter reading list;
- a practical guide to understanding malaria treatment evidence.

Do not invent subscriber counts or testimonials. If there is no real social proof, use a concrete sample issue instead.

### 12. Footer as an orientation layer

The footer should repeat the durable routes, not every possible database destination.

Include:

- short person/platform description;
- Explore: Writing, Research, Events, About;
- Follow: Newsletter, RSS if available, social links;
- Work with Dr Fraction: speaking, teaching, collaboration, contact;
- legal and privacy links;
- branded, colored social marks where appropriate;
- clear external-link treatment.

Use the footer to answer “What else can I do here?” without creating a second complicated navigation system.

## Content and data model implications

This redesign requires editorial controls, not only frontend changes. Inspect and extend the existing models carefully.

Support, when justified:

- homepage announcement banner;
- featured current project;
- curated Start Here selections;
- topic/theme and optional subtopic;
- content type;
- featured/latest/editorial priority;
- related-content reason;
- newsletter sample/archive status;
- event homepage visibility;
- image caption, credit, and temporary status.

Avoid adding empty fields for every future idea. Add the smallest model changes that let the owner operate the homepage without editing source code for every content change.

The admin should eventually provide:

- homepage preview;
- feature/unfeature action;
- Start Here ordering;
- announcement banner schedule and dismissal behavior;
- theme assignment;
- search-index status;
- image credit and fallback checks;
- newsletter issue/sample management.

## Visual direction

The reference site has a bright, high-contrast, product-aware visual system. Do not reproduce it.

Keep ScholarPress’s warm paper, serif display, readable sans interface, and editorial restraint. Add energy through:

- one signature accent used for active states and key routes;
- stronger image-led feature blocks;
- more decisive section hierarchy;
- restrained color-coded content types;
- clearer CTA contrast;
- typography that communicates editorial importance;
- more dynamic but still accessible content selection.

Avoid:

- copied cyan/blue branding;
- health-influencer aesthetics;
- oversized promotional book blocks when Dr Fraction has no equivalent project;
- generic “science-based tools” language;
- fake statistics;
- excessive sliders;
- content density that makes the homepage feel like a media portal;
- auto-rotating carousels that users cannot control.

If a carousel is used, it must have visible controls, keyboard support, reduced-motion behavior, stable height, and a non-carousel fallback for mobile and assistive technology. Prefer a selected feature plus a compact list when that is clearer.

## Implementation sequence

### Phase 1 — homepage intent and hierarchy

Rework the homepage copy and section ordering. Add the choose-your-way-in module, distinguish Latest from Start Here, improve the featured current-work block, and make the newsletter promise specific.

### Phase 2 — topic and search foundations

Add a small editorial theme model, theme pages, a topic browse module, and measured search with content-type context.

### Phase 3 — owner controls

Add admin controls for the announcement banner, homepage feature, Start Here order, theme assignment, and image credits/fallbacks.

### Phase 4 — relationship and funnel refinement

Connect newsletter sample/archive, event promotion, course-interest, related reads, and return paths. Track which homepage routes visitors use without compromising privacy.

## Technical and accessibility requirements

Use the existing Next.js, TypeScript, Supabase, RLS, image, and design-system conventions.

Preserve public performance. The homepage must not become a slow dashboard. Use narrow queries, cache/revalidation where safe, optimized images, explicit loading states, and no unnecessary client-side data fan-out.

All new interactions must support:

- keyboard navigation;
- Escape-to-close overlays and menus;
- visible focus states;
- screen-reader labels;
- reduced motion;
- touch-sized controls;
- stable layout during loading;
- direct links and shareable URLs;
- clear external-link behavior.

Public content may be cached. Private account, subscriber, admin, course-interest, and attendance data must not be publicly cached or embedded in public responses.

## Acceptance criteria

A new visitor should be able to identify at least three relevant next actions within the first viewport or immediate scroll: begin with selected work, explore research/themes, or follow/attend something.

A returning visitor should be able to reach the latest work without passing through the biography or a generic archive.

A visitor with a specific question should be able to search or browse themes and see related writing, research, and events together.

The owner should be able to change the current homepage feature, Start Here selection, announcement, and topic associations without source-code edits.

The homepage should communicate value with real content and specific wording rather than invented audience numbers or generic claims.

The design should feel more dynamic and useful after the revision, while still being recognizably Dr Fraction rather than a Huberman Lab imitation.

Before implementation, return:

1. A comparison of the current ScholarPress homepage and the transferable Huberman Lab mechanisms.
2. The proposed revised homepage information architecture.
3. The smallest content-model changes needed to operate the homepage.
4. A copy and CTA plan using real ScholarPress content.
5. A performance and accessibility risk assessment.
6. A first milestone that can be implemented and validated without waiting for every future content type.

Then implement the first milestone, validate typecheck, lint, build, responsive layouts, keyboard interactions, reduced-motion behavior, empty states, and public performance.

## Sources and reference observations

[1]: https://www.hubermanlab.com/ "Huberman Lab homepage: current banner, hero promise, newsletter offer, latest/featured episodes, topics, search, and footer navigation"
[2]: https://www.hubermanlab.com/podcast "Huberman Lab podcast page: platform positioning, listening destinations, latest/featured/recent episodes, topics, and archive route"
[3]: https://www.hubermanlab.com/topics "Huberman Lab topics page: popular topics, all topics, topic-led content discovery, and taxonomy presentation"
[4]: https://www.hubermanlab.com/newsletter "Huberman Lab newsletter page: specific signup promise, lead magnet, newsletter archive, and social proof"
[5]: https://www.8020.inc/blog/from-podcast-to-platform-crafting-huberman-labs-digital-home-in-webflow "Agency case study: topic-first architecture, search, scalable CMS, homepage entry points, email lead magnet, and premium integration"
