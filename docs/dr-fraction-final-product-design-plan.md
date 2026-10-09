# Dr Fraction — final product design plan

## Product direction

Dr Fraction should become a **person-led publishing house and intellectual studio** rather than a single-topic blog, academic CV, or crowded portfolio.

The durable attraction is Dr Fraction’s way of thinking and working. The subjects can expand over time:

- research and papers;
- essays and shorter notes;
- books and reading projects;
- events, webinars, talks, and launches;
- teaching and public education;
- collaborations and future projects;
- selected professional or commercial opportunities.

The site should feel like a place people return to **follow a person’s evolving body of work**.

## Product-design principles

### 1. Person-first, project-aware

The site should lead with Dr Fraction, but not turn into a biography page. The homepage should show what the person is thinking, making, researching, hosting, or publishing now.

Projects and topics should be flexible. “Malaria” can be an important current topic without becoming a permanent ceiling on the platform.

### 2. Broad navigation, specific dropdowns

The main navigation should contain a small number of durable activity areas. Dropdowns should expose the more specific forms inside each area.

This approach follows patterns visible across comparable editorial platforms:

- Farnam Street uses broad destinations such as Articles, Podcast, Books, Newsletter, and About, then provides deeper topic and archive routes. [1]
- The Marginalian combines broad shell navigation with subject browsing, archive continuity, newsletter, RSS, and curated starting points. [2]
- Aeon separates Essays, Videos, Popular, subjects, Newsletter, About, and Support rather than putting every content type into one crowded header. [3]
- Ness Labs uses a compact top-level structure—Knowledge Base, Newsletter, Book, Community—then expands into topic and archive pathways. [4]
- The Frontkit reference shows a conventional CMS using a persistent rail and grouped operational destinations rather than an unstructured list of every screen. [5]

### 3. The homepage is an editorial selection, not a sitemap

The navigation gives the complete map. The homepage should show what deserves attention now.

It should not display every future category or every available feature.

### 4. Content before components

No new card, badge, carousel, or section should be added unless it has a real editorial job. Use real work, real images, real event information, and real reader actions.

### 5. Earn monetization through trust

Books, paid events, speaking, courses, collaborations, memberships, or other offers should appear as natural extensions of the person’s work. They should not dominate before the visitor understands the value of the platform.

### 6. Original, not derivative

The design may learn from the information architecture and publishing mechanics of comparable sites, but it must not copy their branding, typography, title formulas, color systems, or page composition.

## Proposed information architecture

### Primary navigation

```text
Home
Writing ▾
Research ▾
Books ▾
Events ▾
Projects ▾
About ▾
Follow
```

The exact items shown should depend on what is active. Empty sections should not appear just because the system supports them.

### Writing ▾

```text
Writing
├── Essays
├── Notes
├── Reviews
├── Interviews
└── Writing archive
```

Use **Writing** as the durable umbrella. Do not force Essays, Notes, Reviews, and Interviews into separate top-level navigation items.

Recommended definitions:

- **Essays** — substantial arguments, reflections, and public thinking.
- **Notes** — shorter observations, working ideas, field notes, or updates.
- **Reviews** — books, papers, events, or works discussed through Dr Fraction’s perspective.
- **Interviews** — conversations hosted by or featuring Dr Fraction.
- **Writing archive** — chronological and searchable view.

### Research ▾

```text
Research
├── Papers
├── Research themes
├── Methods and tools
├── Selected findings
└── Research archive
```

Do not expose all of these until there is enough material. Start with Papers and Research themes if those are the only meaningful destinations.

Research themes should be flexible. Malaria may be one theme among others rather than the site’s permanent top-level identity.

### Books ▾

```text
Books
├── Books by Dr Fraction
├── Edited books
├── Current book projects
├── Reading lists
└── Book-related events
```

This structure supports future monetization without prematurely pretending there is already a large catalogue.

### Events ▾

```text
Events
├── Upcoming events
├── Webinars
├── Talks and lectures
├── Book launches
├── Past events and recordings
└── Speaking enquiries
```

Each event should have a clear action:

- Register;
- Buy a ticket;
- Join a free session;
- Watch a recording;
- Request a speaking engagement;
- Join a launch or mailing list.

### Projects ▾

```text
Projects
├── Current projects
├── Collaborations
├── Teaching and learning
└── Past projects
```

Projects are useful for work that crosses writing, research, books, and events. They should be editorial landing pages, not simply database categories.

### About ▾

```text
About
├── About Dr Fraction
├── Biography and credentials
├── Current interests
├── Teaching and speaking
├── Work with me
└── Contact
```

“Work with me” can eventually support speaking, teaching, consulting, collaborations, editorial work, or other professional opportunities.

### Follow

```text
Follow
├── Newsletter
├── Newsletter archive
├── RSS
├── Social links
└── Member account
```

Follow should be visually important but not aggressive. It is the relationship layer, not a popup strategy.

## Dropdown behavior

### Desktop

Dropdowns should open on click and support keyboard access. Hover may provide a preview, but hover must not be the only interaction.

Each dropdown should contain:

- the parent area title;
- a short description;
- three to five active destinations;
- a “View all …” link where useful;
- optional featured project or current item only when there is real content.

Example:

```text
Writing
────────────────────────────────
Essays                 Notes
Long-form arguments    Shorter working thoughts

Reviews                Interviews
Books, papers, and     Conversations and
works worth discussing public dialogue

View all writing →
```

Avoid large mega menus until the content actually requires them. A dropdown should help a visitor choose, not display the entire database.

### Mobile and tablet

On smaller screens, the navigation becomes a drawer with accordions:

```text
Menu

Home
Writing +
Research +
Books +
Events +
Projects +
About +
Follow +
```

Expanded sections should show the same destinations as desktop. The system should include:

- clear open and close controls;
- `aria-expanded` state;
- keyboard focus management;
- Escape-to-close;
- visible focus indicators;
- 44px minimum touch targets;
- no horizontal scrolling for primary navigation.

Tablet should use the mobile drawer before the desktop header becomes crowded. The breakpoint should be selected by content width, not by device-name assumptions.

## Homepage plan

### Section 1 — identity and current point of view

The opening should establish:

- Dr Fraction’s name;
- a concise person-led promise;
- what is currently being explored or made;
- one primary action;
- one secondary route for newcomers.

Working direction:

> **Ideas, research, books, and conversations from Dr Fraction Dzinjalamala.**

This broad line should be paired with a current, more specific statement that changes as the work evolves.

Primary actions could be:

- Explore the latest work;
- Start here;
- See current projects.

Avoid leading with only affiliation and credentials. Those should support trust, not carry the entire opening.

### Section 2 — Start here

Show three to six real pieces selected for different visitor needs:

- one accessible introduction to the person’s work;
- one representative essay;
- one important research output;
- one event, talk, or book-related item;
- optionally one personal or reflective piece that reveals voice.

Each selection should explain why it is included. This is more valuable than simply showing the latest posts.

### Section 3 — Current work

Use a compact set of active project modules:

- current writing;
- active research;
- forthcoming book or book project;
- next event;
- current collaboration.

Only show modules with real content.

### Section 4 — Latest writing

Use editorial story cards or a restrained list containing:

- type label;
- specific title;
- dek;
- date;
- reading time;
- cover or meaningful image where appropriate.

Separate Latest from curated work so that recency and editorial judgment are not confused.

### Section 5 — Selected research or publications

Show a small number of important outputs with:

- title;
- authors;
- venue/year;
- one-sentence significance;
- DOI or paper link;
- clear route to the full research archive.

### Section 6 — Events and opportunities

Show only upcoming or currently relevant events. Include the action, date, location/platform, and whether it is free, paid, or invitation-based.

### Section 7 — About the person

Use a concise human introduction, not a full CV. Link to the deeper biography, credentials, current interests, and Work with me routes.

### Section 8 — Follow

Explain what the newsletter contains, how often it arrives, and what a typical issue looks like. Link to a sample or archive before asking for an email.

## Content model changes

The current Post model has useful basics: title, excerpt, tags, status, cover image, references, reading time, and publication dates. To support the broader platform, the content system should eventually distinguish:

- content type: essay, note, review, interview, research note, announcement;
- project or collection;
- topic/theme;
- series;
- featured/start-here status;
- related-content rationale;
- author/contributor;
- event or book relationship;
- revision date;
- source/method note;
- public/member visibility.

Do not add every field immediately. Add them when the editorial workflows require them. A small, well-curated model is better than a complex CMS filled with empty metadata.

## Article and content-page plan

Every substantial content page should expose:

- content type;
- specific title;
- dek/excerpt;
- author and relevant credentials;
- publication date;
- reading time, and word count where useful;
- project, topic, or series context;
- cover image with caption and credit when meaningful;
- the content itself;
- sources, references, or method where appropriate;
- revision date when relevant;
- Save/Share actions that do not interrupt reading;
- Related Reads with a reason for each recommendation;
- a next route: another essay, project page, event, book, or newsletter;
- author context and a restrained follow/support action.

The article should remain reading-first. The CTA comes after the reader has received value.

## Monetization architecture

The platform should support several revenue paths without making the homepage look like a sales funnel.

### Books

- Book landing page with premise, audience, contents, author/editor information, reviews, purchase links, sample material, and related events.
- Separate authored, edited, recommended, and forthcoming books.
- Book-related essays and events should link back to the book naturally.

### Events

- Free registration;
- paid ticketing;
- recordings;
- book launches;
- workshops;
- speaking requests.

Each event needs a clear value proposition and a clear action, not only a date card.

### Teaching and professional work

- speaking;
- teaching;
- collaborations;
- consulting or advisory work where appropriate;
- editorial or research partnerships.

These belong under Work with me rather than interrupting the editorial homepage.

### Newsletter and membership

Start with one newsletter promise and cadence. Add membership only when the benefits are real and sustainable.

The relationship ladder should be:

```text
Public work
→ newsletter or RSS
→ account participation
→ event, book, support, or membership
```

Do not force account creation before a visitor can understand the work unless there is a strong legal or commercial reason.

## Visual direction

### Character

The visual system should feel:

- authored;
- intelligent;
- warm but not casual;
- scholarly without becoming institutional;
- capable of holding books, events, research, and personal writing;
- distinctive without being theatrical.

### Typography

The existing serif/sans pairing can remain a foundation, but the hierarchy should be recalibrated:

- reduce the oversized hero treatment when it competes with content;
- use stronger title/dek contrast;
- make metadata quieter but more useful;
- make UI labels consistent;
- preserve generous reading measure;
- give books, events, and research slightly different metadata treatments without creating separate visual identities.

### Color

Use one signature accent associated with Dr Fraction/the publishing house. Do not choose an accent because it is currently fashionable in SaaS design.

Use accent color for:

- active navigation;
- key links;
- primary actions;
- selected project states;
- small editorial markers.

Do not use it on every card, badge, border, or decorative shape.

### Imagery

Prioritize:

- real portraiture;
- real field/lab/teaching/event images;
- book covers;
- meaningful diagrams;
- commissioned illustration;
- images with clear captions and credits.

If an image does not clarify the work or atmosphere, use typography and whitespace instead.

## Anti-AI-slop quality bar

The redesign must reject:

- generic “ideas and insights” headlines;
- invented testimonials and social proof;
- placeholder images in production;
- stock-photo science clichés;
- gradients and glass cards without a functional purpose;
- excessive pills and badges;
- random related-content carousels;
- fake urgency;
- forced newsletter popups;
- unexplained “academic” or “science-backed” claims;
- visual copying from The Frontkit or any benchmark site;
- an overbuilt navigation showing empty future ambitions;
- AI-generated decorative artwork used to imply authenticity.

The proof of quality should come from specificity, real work, clear authorship, evidence, and consistent editorial judgment.

## Implementation sequence

### Phase 0 — decisions and content inventory

Confirm:

- primary audiences;
- person-led promise;
- public access model;
- active categories;
- first Start Here items;
- available image assets;
- newsletter cadence;
- first monetization priority.

### Phase 1 — information architecture and shell

- redesign desktop header and dropdowns;
- implement mobile/tablet drawer with accordions;
- add route labels and active states;
- introduce person-first navigation without exposing empty sections;
- preserve account/auth routes.

### Phase 2 — homepage

- replace the profile-style opening with a person-led editorial opening;
- add Start Here;
- add Current work;
- separate Latest from curated content;
- introduce active books/events/projects only when content exists;
- remove all public-facing placeholder instructions.

### Phase 3 — article and project templates

- improve title/dek/byline/provenance hierarchy;
- add project/topic context;
- add Related Reads and next routes;
- improve research/source/method presentation;
- add book, event, and project templates.

### Phase 4 — archive and discovery

- Writing archive;
- Research archive;
- Topics;
- Start Here;
- search when the content volume justifies it;
- newsletter archive;
- RSS and canonical metadata;
- Popular/Most read only when based on real data.

### Phase 5 — monetization and audience relationship

- newsletter sample and archive;
- book pages and purchase links;
- event registration/ticket flows;
- Work with me page;
- optional support/membership;
- privacy-respecting analytics for engaged reading and conversion.

### Phase 6 — responsive and quality assurance

Test at representative phone, tablet, and desktop widths:

- dropdown and drawer interaction;
- keyboard navigation and focus return;
- long titles and deks;
- touch targets;
- image crop/caption behavior;
- article reading measure;
- citation/reference layout;
- event and book purchase actions;
- newsletter states;
- reduced motion;
- loading performance;
- empty and future-category states.

## Decisions required before implementation

1. **Primary identity:** Is the preferred public name “Dr Fraction,” “Fraction Dzinjalamala,” or another publishing identity?
2. **First active navigation areas:** Should the initial navigation expose Writing, Research, Events, About, and Follow, with Books and Projects added when populated?
3. **Public access:** Should essays and research abstracts be public, with accounts reserved for participation and personalization?
4. **Primary audience:** Which audience should the homepage serve first—professionals, researchers, students, general readers, or a deliberate mix?
5. **First Start Here set:** Which three to six real pieces best represent the person’s range?
6. **First monetization priority:** Books, paid events, speaking/teaching, consulting, membership, or another path?
7. **Newsletter promise:** What cadence can Dr Fraction realistically sustain?
8. **Visual assets:** Which real portrait, event, research, teaching, or book images are available?

## Recommendation

Approve this as the product direction:

> **A public, person-led publishing house with member participation, organized by broad activity areas and specific dropdowns.**

The platform should be public enough to attract readers, structured enough to support future work, and personal enough that Dr Fraction—not one topic or one content format—is the reason people return.

## References

[1]: https://fs.blog/ "Farnam Street"
[2]: https://www.themarginalian.org/ "The Marginalian — Maria Popova"
[3]: https://aeon.co/essays "Aeon Essays"
[4]: https://nesslabs.com/ "Ness Labs"
[5]: https://thefrontkit.com/products/templates/blog-cms-kit/images/carousel/5.png "The Frontkit Blog CMS Kit reference image"
