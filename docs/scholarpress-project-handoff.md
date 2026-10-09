# ScholarPress / Dr Fraction — Project Handoff Context

**Purpose:** This document consolidates the work completed in the prior sessions, the product/design decisions, technical changes, validation results, known limitations, and next actions. A future agent should read this file before changing the project.

**Project path:** `/home/ubuntu/scholarpress`

**Current branch:** `phase-7-person-led-platform`

**Current HEAD at handoff:** `4a72737 feat: add contextual related reading`

**Current date of handoff:** 2026-10-09

---

## 1. Product direction

ScholarPress is being evolved into a **person-led publishing house and intellectual studio for Dr Fraction Dzinjalamala**, not a narrow malaria blog, academic CV, or generic portfolio.

The durable attraction is Dr Fraction’s way of thinking and working. The platform should be able to hold a changing body of work, including:

- essays, notes, reviews, and interviews;
- peer-reviewed research and research notes;
- books, edited books, reading projects, and future book projects;
- webinars, talks, lectures, launches, and recordings;
- teaching and public education;
- collaborations and cross-disciplinary projects;
- speaking, consulting, and other professional opportunities;
- future paid books, events, workshops, or memberships.

Malaria and clinical pharmacology remain important founding subjects, but they must not permanently define the whole platform. The person is the organizing principle; topics and projects can expand over time.

The site should feel like a place visitors return to **follow Dr Fraction’s evolving body of work**.

### Core product principles

1. **Person-first, project-aware:** Lead with Dr Fraction, while showing what he is currently thinking, researching, teaching, hosting, or publishing.
2. **Broad navigation, specific dropdowns:** Use durable activity areas in the main navigation, then expose content forms through dropdowns rather than making every category a top-level item.
3. **Homepage as editorial selection:** The homepage should show what deserves attention now, not act as a sitemap or database dump.
4. **Content before components:** Every card, badge, section, image, or CTA must have a real editorial or reader task.
5. **Trust before monetization:** Books, paid events, speaking, courses, collaborations, and memberships should feel like natural extensions of the work rather than an aggressive sales funnel.
6. **Original, not derivative:** Research comparable sites for mechanisms and information architecture, but do not copy their branding, title formulas, colors, or compositions.
7. **No AI-slop design:** Avoid generic “ideas and insights” language, fabricated testimonials, placeholder production imagery, unnecessary gradients/glass cards, excessive pills, fake social proof, and decorative components without editorial purpose.

---

## 2. User requirements captured during the work

The user’s requirements and concerns were:

- The public platform should be **person-led**; Dr Fraction is the attraction, not only the subject matter.
- Public articles and research should be readable without an account so the site can attract visitors.
- Accounts should be reserved for interaction such as comments, bookmarks, and other participation features.
- The public site must support more than malaria: books, events, papers, articles, teaching, collaborations, and future work.
- Navigation should use dropdowns/accordions for specificity instead of an overcrowded top-level menu.
- The CMS should look like a conventional professional SaaS CMS, not inherit the public header/footer or resemble the old custom studio.
- CMS screens should use white cards, neutral backgrounds, persistent navigation, standard headers, status badges, and predictable editor/list patterns.
- Loading states should use animated spinners or skeletons instead of plain “Loading…” text.
- Social accounts should be promoted in meaningful locations beyond only the footer/about page.
- Login and sign-up/passwordless authentication must be clear to visitors.
- The site must feel authored, scholarly, human, and polished—not generic or over-designed.
- The project must remain hostable on a 100% free-tier setup.
- Supabase schema changes should remain idempotent.
- CI/typechecking/lint/build must continue to pass.

---

## 3. Strategic research and design diagnosis

The earlier public-site critique identified that the old site was technically credible but visually and editorially underpowered as a publication. It looked closer to a professional portfolio or academic profile than a publication people return to.

The key reader questions the site needed to answer were:

1. Why should I read this person rather than another expert?
2. Where should I begin?
3. Why should I come back?

Comparable publishing/reference patterns were studied from sites and products such as The Marginalian, Farnam Street, Aeon, Ness Labs, Paul Graham, and The Frontkit CMS reference. The useful lessons were:

- make authorship and curation visible;
- provide a clear Start Here path;
- distinguish curated work from the latest work;
- use archives and topics for discovery;
- make the newsletter a product with a clear promise;
- let public content earn trust before asking for an account;
- use a conventional persistent CMS rail for operational work;
- keep the visual system restrained and content-led.

The detailed design documents are:

- [Final product design plan](dr-fraction-final-product-design-plan.md)
- [Public-site critique](public-site-critique.md)

---

## 4. Information architecture decision

The intended durable navigation model is:

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

Only active areas should be exposed prominently; empty future sections should not clutter the navigation.

### Writing

- Essays
- Notes
- Reviews
- Interviews
- Writing archive

### Research

- Papers
- Research themes
- Methods and tools
- Selected findings
- Research archive

### Books

- Books by Dr Fraction
- Edited books
- Current book projects
- Reading lists
- Book-related events

### Events

- Upcoming events
- Webinars
- Talks and lectures
- Book launches
- Past events and recordings
- Speaking enquiries

### Projects

- Current projects
- Collaborations
- Teaching and learning
- Past projects

### About

- About Dr Fraction
- Biography and credentials
- Current interests
- Teaching and speaking
- Work with me
- Contact

### Follow

- Newsletter
- Newsletter archive
- RSS
- Social links
- Member account

Desktop dropdowns should open on click and support keyboard access. Hover may preview but must never be the only interaction. Mobile/tablet navigation should become a drawer with accordions, `aria-expanded`, focus management, Escape-to-close, visible focus states, and 44px minimum touch targets.

The currently implemented public navigation is a practical first version with active Writing, Research, Events, About, Follow, and Sign in routes. Books and Projects remain part of the future IA rather than being exposed as empty routes prematurely.

---

## 5. Work completed by phase

### Phase 0 — product/editorial direction

Completed decisions:

- Move from an academic/portfolio presentation to a person-led publishing house.
- Keep Dr Fraction’s identity central while allowing the topics to expand.
- Reject generic AI-generated visual language and generic growth tactics.
- Establish public reading as the acquisition layer.
- Keep accounts for participation, not first access to the work.
- Use a curated Start Here route to orient new readers.

### Phase 1 — security, RLS, and platform foundations

Completed in the earlier work:

- Hardened Supabase row-level security policies.
- Fixed critical comment-reply RLS logic.
- Added behavioral CI tests around the relevant access rules.
- Updated scheduled-post access behavior.
- Added tracking constraints and hardened the analytics tracking endpoint against bot/flood behavior.
- Kept schema changes intended to be idempotent.

**Manual deployment still deferred:** The production `supabase/schema.sql` needs to be run in the Supabase SQL editor once the user’s Supabase account issues are resolved. Do not assume that the local schema has already been deployed to production.

### Phase 2 — functional fixes and failure handling

The codebase contains the earlier functional/failure-handling work, including account, newsletter, webinar, and interaction flows. The phase history is visible in Git:

```text
6957bbc security: complete phase 1 RLS hardening
ee6de81 fix: complete phase 2 functional and failure handling
a66517e seo: align discovery with members-only content
```

### Phase 3 — accessibility and editor improvements

Completed:

- Added a reusable focus-managed Dialog component.
- Improved keyboard/focus behavior for dialogs and editor flows.
- Improved admin accessibility.
- Maintained WCAG 2.2 AA contrast compliance for key text tokens.
- Added/retained rich-editor image upload behavior and accessible interaction patterns.

### Phase 4 — auth clarity

Completed:

- Clarified passwordless sign-in and account creation language.
- Improved login/sign-in affordances so visitors understand the authentication model.
- Public content is no longer blocked behind sign-in as the default reader journey.

Relevant historical commit:

```text
07fe0ff fix: clarify passwordless sign-in and account creation
```

### Phase 5 — admin workflow and content operations

Completed earlier:

- Improved admin workflow and post scheduling.
- Added/retained conventional post editing and publishing paths.
- Maintained support for papers, webinars, polls, comments, subscribers, newsletter, email, analytics, settings, and post preview.

Historical commit:

```text
e8a21b4 feat: improve admin workflow and post scheduling
```

### Phase 6 — conventional CMS visual redesign

Completed/currently applied:

- Converted the custom studio into a modern SaaS-style CMS.
- Added persistent left navigation on large screens.
- Added a responsive sticky top header for smaller screens.
- Added standard page headers with eyebrow, title, description, and actions.
- Added reusable card primitives, card headers, buttons, inputs, status badges, spinners, and list skeletons.
- Introduced an `.admin-theme` scope so CMS styling can use a neutral/warm editorial palette without leaking into the public site.
- Admin no longer inherits the public site header/footer.
- Changed the admin shell branding to **Dr Fraction Studio** / **Publishing workspace**.
- Added “View live site” links in the admin shell.
- Standardized admin loading states using skeletons and animated spinners.

Historical commits:

```text
416f4ad feat: convert admin studio to conventional cms
b631ae6 style: align email log with cms header
```

### Phase 7 — person-led public platform

Completed/currently applied:

- Reworked homepage around:
  - Dr Fraction’s name and point of view;
  - “Ideas, research, books, and conversations from Dr Fraction Dzinjalamala.”;
  - Start here;
  - selected publications/research;
  - the person behind the work;
  - newsletter/follow relationship.
- Added a public dropdown navigation with broad activity areas.
- Made public reading routes available for blog, research, and webinars rather than requiring an account for initial access.
- Kept sign-in for account participation.
- Added public article recirculation via contextual “Related Reads”.
- Preserved article engagement, comments, bookmarks, citations, references, sharing, and newsletter functionality.
- Added social-link configuration and strategic public-site promotion support.
- Added `SiteChrome` to make public header/footer composition explicit and keep admin screens isolated.

Historical commits:

```text
d1308b8 feat: establish person-led public platform shell
4a72737 feat: add contextual related reading
```

---

## 6. Important implementation details

### Public shell

Relevant files:

- `src/app/layout.tsx`
- `src/components/site-chrome.tsx`
- `src/components/site-header.tsx`
- `src/components/site-footer.tsx`
- `src/components/site-navigation.tsx`
- `src/app/page.tsx`
- `src/app/about/page.tsx`

`SiteChrome` is used to keep the public site’s header/footer composition separate from the admin shell. Be careful not to reintroduce `SiteHeader` or `SiteFooter` inside `/admin` layouts.

### Admin shell

Relevant files:

- `src/app/admin/layout.tsx`
- `src/components/admin-nav-links.tsx`
- `src/components/admin-ui.tsx`

The admin layout is a server component and protects the owner-only area using Supabase session/ownership checks. It currently handles three states:

1. Supabase is not configured: show “Studio is not connected”.
2. No authenticated owner: redirect to `/login`.
3. Authenticated non-owner: show “Owner access only”.

When connected, it renders the admin-themed SaaS shell with persistent navigation and children inside the workspace content area.

### Admin UI primitives

`src/components/admin-ui.tsx` currently contains reusable primitives including:

- `AdminPageHeader`
- `AdminCard`
- `AdminCardHeader`
- `AdminButton`
- `AdminInput`
- `StatusBadge`
- `AdminSpinner`
- `AdminListSkeleton`

Use these primitives when refining remaining admin screens. Avoid inventing a separate visual language for individual screens.

### Admin routes

Current admin routes include:

```text
/admin
/admin/analytics
/admin/comments
/admin/email
/admin/newsletter
/admin/papers
/admin/polls
/admin/posts
/admin/posts/new
/admin/posts/[id]
/admin/posts/[id]/preview
/admin/settings
/admin/subscribers
/admin/webinars
```

Most list screens now use `AdminPageHeader` and `AdminListSkeleton`. The polls screen was the last discovered legacy loading state and now uses `AdminSpinner`.

### Public routes

Current public/content routes include:

```text
/
/about
/blog
/blog/[slug]
/papers
/papers/[id]
/webinars
/login
/account
/legal/terms
/legal/privacy
/legal/cookies
/unsubscribe
```

Public content is open for reading. Account/authentication remains relevant for interaction and personal features.

### Site configuration

`src/lib/site.ts` is the central configuration file.

Current identity/configuration includes:

```text
Name: Dr Fraction Dzinjalamala
Platform promise: Ideas, research, books, and conversations from Dr Fraction Dzinjalamala.
Affiliation: Department of Clinical Sciences, MUST
Email: fdzinjalamala@must.ac.mw
ResearchGate: https://www.researchgate.net/profile/Fraction-Dzinjalamala
Facebook: https://www.facebook.com/fraction.b.dzinjalamala/
Twitter/X: empty
LinkedIn: empty
Instagram: empty
YouTube: empty
ORCID: empty
Google Scholar: empty
```

The Facebook profile was found publicly and verified as a profile titled “Fraction Dzinjalamala”. Do not populate the other social fields based on guesses. Add exact URLs only when the user supplies or confirms them.

`getSiteUrl()` uses `NEXT_PUBLIC_SITE_URL` when configured. In production it falls back to `https://dr-fraction.me` and logs a warning if the environment variable is missing. In development it falls back to `http://localhost:3000`.

---

## 7. Loading-state policy

The user specifically requested animated loading indicators rather than plain loading text.

Completed changes:

- Admin list screens use `AdminListSkeleton`.
- Dashboard metrics use `AdminSpinner` while loading.
- Admin polls now renders an animated spinner with `role="status"` and an accessible label.
- Article discussion loading now renders an animated spinner with `role="status"` and a visible “Loading discussion” label.
- A final repository search found no remaining plain `Loading…` or `Loading...` labels in `src/app/admin` or `src/components`.

Do not regress this by adding bare loading paragraphs to new screens. Use a skeleton for lists/cards and a spinner for compact or inline asynchronous states.

---

## 8. Article/content experience

The content model and article experience already support much of the following:

- title;
- excerpt/dek where available;
- author;
- publication date;
- reading time;
- tags;
- cover image;
- body content;
- references;
- share/citation actions;
- bookmarks;
- comments and replies;
- newsletter relationship;
- related reading.

The related-reading work added contextual recirculation rather than random recommendations. Preserve the editorial logic: a related item should have a reason such as shared theme, contrasting evidence, foundational context, or a natural next step.

Still desirable in later work:

- stronger article deks where content is missing;
- author credentials/“why this matters” context;
- project or series context;
- revision dates;
- source/method presentation where appropriate;
- a more intentional next-path module;
- a newsletter sample/archive;
- improved real imagery and captions/credits.

---

## 9. Social promotion status

Social links are intended to appear in more meaningful public locations than only the footer. The site’s shared social configuration can be consumed by public components such as:

- the public navigation’s Follow destination;
- homepage follow section;
- About/contact area;
- footer;
- future article author/follow modules.

Currently confirmed/configured:

- ResearchGate
- Facebook

Not yet confirmed/configured:

- Twitter/X
- LinkedIn
- Instagram
- YouTube
- ORCID
- Google Scholar

Do not fabricate or infer these profile URLs. Ask the user for the exact handles/links when social promotion work resumes.

---

## 10. DOI / Crossref work still outstanding

The admin paper form still needs the planned **“Fetch from DOI”** feature from Phase 4.

Expected behavior:

1. Admin enters a DOI.
2. Normalize DOI input, accepting forms such as:
   - `10.xxxx/xxxxx`
   - `https://doi.org/10.xxxx/xxxxx`
   - `doi:10.xxxx/xxxxx`
3. Call Crossref’s public API from a safe server-side route or server action rather than exposing unnecessary client-side behavior.
4. Populate available fields such as title, authors, journal/container title, publication date, publisher, volume/issue/pages, and DOI URL.
5. Preserve manual edits; fetching must not silently overwrite fields after the editor has changed them without clear user intent.
6. Handle invalid DOI, no result, network error, rate limiting, and incomplete metadata states visibly.
7. Keep the feature free-tier compatible.

Before implementing, inspect the current paper form and existing DOI normalization utilities so the new behavior does not duplicate or conflict with them.

---

## 11. Supabase and production deployment reminders

The local project has Supabase integration, auth, RLS, and schema files. The user previously reported Supabase account issues and explicitly deferred SQL deployment.

Manual action still required:

1. Open the production Supabase project.
2. Review the current `supabase/schema.sql`.
3. Run it in the Supabase SQL editor once account access is working.
4. Confirm the statements remain idempotent and do not accidentally destroy production data.
5. Verify RLS policies and comment-reply behavior after deployment.

Do not claim that production database deployment is complete until the user confirms it or it is verified through the connected project.

Production environment action:

- Set `NEXT_PUBLIC_SITE_URL` to the canonical deployed domain, currently expected to be `https://dr-fraction.me` unless the user changes the domain.
- This removes repeated build warnings and ensures canonical URLs, sitemap links, Open Graph URLs, and emails use the intended domain.

---

## 12. Validation status

The latest final validation completed successfully after correcting a polls-screen import regression.

Commands run:

```bash
npm run typecheck
npm run lint
npm run build
```

Results:

- TypeScript: passed.
- ESLint: passed with no warnings or errors.
- Next.js production build: passed.
- Static generation: passed for 36 pages.
- The build emitted Node’s `punycode` deprecation warning from a dependency; this was not a project failure.
- The build emitted the expected `NEXT_PUBLIC_SITE_URL` fallback warning described above.

The first attempted final validation failed because `src/app/admin/polls/page.tsx` incorrectly imported `createClient` from `@/lib/supabase/client` while the project exports `getSupabaseBrowser`. This was corrected and the full validation passed.

A local preview server was also started on port 3000. The public homepage was checked through the sandbox preview URL and rendered correctly with:

- person-led hero;
- broad dropdown navigation;
- Start here route;
- public Writing/Research/Events paths;
- newsletter follow section;
- ResearchGate footer link;
- cookie consent controls.

Preview URL during the session:

```text
https://3000-ibf4oks0yh04f0v0t913e-08f0a777.us1.manus.computer/
```

The preview server is a temporary sandbox service and should not be treated as production deployment.

---

## 13. Current working tree and commit state

At the time of writing, the latest CMS/person-led changes are present in the working tree but not all are committed.

Modified files include:

```text
src/app/about/page.tsx
src/app/admin/comments/page.tsx
src/app/admin/layout.tsx
src/app/admin/page.tsx
src/app/admin/papers/page.tsx
src/app/admin/polls/page.tsx
src/app/admin/posts/page.tsx
src/app/admin/subscribers/page.tsx
src/app/admin/webinars/page.tsx
src/app/globals.css
src/app/layout.tsx
src/components/admin-nav-links.tsx
src/components/admin-ui.tsx
src/components/article-engagement.tsx
src/components/site-footer.tsx
src/lib/site.ts
```

Untracked file:

```text
src/components/site-chrome.tsx
```

Before creating a PR or handing off to production, inspect and commit these changes intentionally. Do not blindly discard the working tree; it contains the CMS shell separation, visual updates, loading-state changes, public-site changes, and social configuration.

Recent history:

```text
4a72737 feat: add contextual related reading
d1308b8 feat: establish person-led public platform shell
b631ae6 style: align email log with cms header
416f4ad feat: convert admin studio to conventional cms
e8a21b4 feat: improve admin workflow and post scheduling
07fe0ff fix: clarify passwordless sign-in and account creation
ad0eab6 seo: align discovery with members-only content
a66517e improve editor dialogs and admin accessibility
ee6de81 fix: complete phase 2 functional and failure handling
6957bbc security: complete phase 1 RLS hardening
```

---

## 14. Recommended next sequence for the next agent

### Immediate

1. Read this handoff, `docs/dr-fraction-final-product-design-plan.md`, and `docs/public-site-critique.md`.
2. Inspect the current working tree and review the uncommitted diff.
3. Run typecheck/lint/build before making new changes.
4. Preserve the separation between public `SiteChrome` and the admin shell.
5. Use the shared admin primitives when refining remaining admin screens.

### Next implementation task

Implement DOI/Crossref fetching in the admin paper form, including normalization, loading state, error handling, and preservation of manual edits.

### After DOI work

- Review the remaining admin pages visually, especially analytics, settings, newsletter, email, polls, and post editor/preview.
- Confirm responsive behavior on desktop, tablet, and mobile.
- Replace the current `/covers/field-notes.png` placeholder/temporary hero treatment with a real approved portrait, field/lab/teaching image, meaningful diagram, or deliberate typographic treatment. Do not use generic stock or invented AI imagery.
- Add confirmed Twitter/X, LinkedIn, Instagram, YouTube, ORCID, or Google Scholar URLs only after user confirmation.
- Consider a newsletter archive/sample and RSS once there is real content to support them.
- Consider Books and Projects routes only when there is actual content; do not expose empty navigation items.

### Production readiness

- User must run/deploy `supabase/schema.sql` in the production Supabase editor after the account issue is resolved.
- Set `NEXT_PUBLIC_SITE_URL` in production.
- Confirm the production Supabase project’s RLS policies, auth redirect URLs, email settings, storage policies, and cron/webhook configuration.
- Test public reading, sign-in, bookmarks, comments, replies, newsletter subscription, webinar registration/ICS, and admin owner access against production data.

---

## 15. Things to avoid

- Do not revert the public site to members-only reading without revisiting the acquisition strategy.
- Do not put the public header/footer inside the CMS.
- Do not introduce another bespoke admin design instead of the shared primitives.
- Do not add Books/Projects as empty top-level destinations merely because they are future plans.
- Do not use generic hero copy, fake testimonials, invented metrics, or fake publication data.
- Do not use placeholder implementation notes as public-facing copy.
- Do not add random related posts.
- Do not create a large component/card system without real editorial content.
- Do not enter guessed social URLs.
- Do not assume production SQL has been deployed.
- Do not silently overwrite manually entered paper metadata when adding DOI fetching.
- Do not add paid infrastructure that violates the free-tier requirement.

---

## 16. One-paragraph handoff summary

ScholarPress is now in the middle of a Phase 7 person-led platform transition and a Phase 6-style conventional CMS redesign. The public experience is intended to present Dr Fraction Dzinjalamala as the author and attraction behind a growing publishing house spanning research, essays, books, events, teaching, and projects. Public reading is open; accounts support participation. The admin area is separated from public chrome and uses a persistent SaaS-style shell with reusable headers, cards, badges, skeletons, and spinners. The homepage and navigation have been reframed around identity, Start here, current work, selected research, and following the work. RLS/security, accessibility, auth clarity, related reading, analytics hardening, and public content access have been addressed. The latest typecheck, lint, and production build pass. The main outstanding tasks are DOI/Crossref fetching, production Supabase SQL deployment once the user’s account is available, setting `NEXT_PUBLIC_SITE_URL`, replacing/approving the real hero imagery, confirming the remaining social profiles, and intentionally committing/reviewing the current working-tree changes.
