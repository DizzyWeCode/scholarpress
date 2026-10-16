# Navigation decision memo: Blog, Research, Events, Topics

## Decision

Adopt this public navigation:

```text
[Dr Fraction]  Blog  Research  Events  Topics  About  Follow  Search
```

Remove **Resources** as a top-level route and do not use it as a general-purpose dropdown.

This is the strongest synthesis of the outside critique and the current ScholarPress repository. The external critique correctly identifies **Resources** as a possible junk drawer. The current repository also already has concrete routes for `/blog`, `/papers`, `/webinars`, and `/about`, while it does not yet have a `/resources` or `/topics` route. The navigation should therefore promote the platform’s real editorial pillars and add Topics as the cross-cutting discovery layer.

## Why the outside critique is right

The critique’s central principle is sound: each top-level label should own one visitor job. **Blog** is for reading Dr Fraction’s public prose. **Research** is for scholarly outputs. **Events** is for participating or watching. **Topics** is for browsing by subject across all three. **About** is for understanding the person and ways to engage. **Follow** is the relationship action. **Search** is the discovery utility.

A generic Resources bucket mixes content types, browsing modes, lifecycle actions, and media assets. That makes the visitor open a menu to discover what the product actually offers. The same distinction matters in the CMS: an image, a research output, a topic, and a newsletter archive are not interchangeable resources.

The critique is also right that **Start here** should be a homepage/hero and footer route rather than a permanent top-level nav item. It is an orientation action, not a durable content pillar.

## What should be adapted for ScholarPress

### Use Blog, not Writing, for now

The outside critique makes a useful distinction: “Writing” is broader and more literary, while “Blog” is concrete and familiar. ScholarPress already has `/blog`, `posts`, `post-card`, blog detail pages, and admin post editors. Therefore **Blog** is the correct public label at this stage.

The content model can still support essays, notes, explainers, and field notes as subtypes or series within Blog. If the publishing product later becomes a journal or a multi-genre publication with a meaningful distinction between blog posts and essays, the label can be revisited. Do not change the route merely to sound more academic.

### Promote Research

Research should be a top-level public pillar because it is central to Dr Fraction’s credibility and work. The public label should be **Research**, while the admin workspace can use **Research outputs**. Keep `/papers` as a compatibility route initially and introduce `/research` only when the new landing page is ready.

The Research dropdown should contain:

- Research library;
- Publications and papers;
- Preprints and reports;
- Datasets and protocols, only when those records exist;
- Research themes or Browse Topics.

Do not imply that every research output is a peer-reviewed paper.

### Promote Topics

Topics should be top-level because Topics are the cross-cutting layer. A visitor should be able to move from a Blog post to related evidence, from a Research output to an Event, and from an Event to other work about the same subject.

Topics needs a real landing page and should not be a static dropdown of guessed labels. The first version should show only topics with enough published material, plus an All topics link. Each topic page should explain the theme and collect Blog posts, Research outputs, Events, and selected resources.

### Keep Events generic

Events remains top-level. The existing `/webinars` route should remain compatible while the public information architecture shifts to Events. Webinar, seminar, lecture, workshop, conference presentation, book launch, and teaching session are formats of an Event.

The Events dropdown should contain Upcoming, Event series, and Replays. Replays remain attached to their original Event; they are not a separate content pillar.

### Keep Follow and Search as utilities

Follow should be visually distinct from content routes but easy to find. Search should be a utility that can eventually cover Blog, Research, Events, and Topics. Neither needs to compete with the editorial pillars.

## Public navigation map

| Label | Current/target route | Job |
| --- | --- | --- |
| Blog | `/blog` | Browse and read public prose. |
| Research | `/papers` compatibility, target `/research` | Discover scholarly outputs and publication context. |
| Events | `/webinars` compatibility, target `/events` | Register for, attend, or watch events. |
| Topics | target `/topics` | Browse the connected body of work by subject. |
| About | `/about` | Understand Dr Fraction, interests, and ways to work together. |
| Follow | `/#newsletter` initially, target `/newsletter` | Subscribe and manage relationship preferences. |
| Search | target search route/overlay | Find content across the connected library. |

## Admin consequence

The public nav should not be copied literally into the database or admin URL structure. The admin should use workspaces:

```text
Dashboard   Library   Audience   Messages   Community   Analytics   Settings
```

Library contains Blog, Research outputs, Events, Topics, and Assets. There is no generic Resources screen. Images, PDFs, recordings, and downloadable files belong in Assets. Curated collections belong in Topics or Series. Research belongs in Research outputs. Newsletter issues belong in Messages or the newsletter archive workflow.

This preserves the user’s mental model while allowing the CMS to use more precise internal terms.

## Implementation impact

1. Update the public navigation from the current Writing/Research/Events/About arrangement to Blog/Research/Events/Topics/About/Follow/Search.
2. Keep `/blog`, `/papers`, `/webinars`, and `/about` working.
3. Add `/topics` as the first new discovery route.
4. Add a Research landing page before changing `/papers` to a redirect or alias.
5. Add an Events landing page before changing `/webinars` to a redirect or alias.
6. Move Research Papers, guides, reading lists, and newsletter archive out of a generic Resources concept.
7. Keep Start here in the homepage hero, footer, and contextual CTAs.
8. Update admin navigation toward Library, Audience, Messages, Community, Analytics, and Settings as separate workspaces.

## Guardrail

Do not implement all seven labels as empty sections. A top-level route earns its place only when a visitor can complete a meaningful task there. Topics is the next route to build because it improves the relationship between the existing Blog, Research, and Events records.
