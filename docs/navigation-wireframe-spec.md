# Navigation wireframe specification

## Product intent

The navigation should help a first-time visitor answer “where do I begin?” and help a returning visitor reach the latest work quickly. It should borrow Huberman Lab’s intent-led information architecture, not its visual identity.

The shell should expose a small number of durable routes while making deeper discovery available through intentional dropdowns, Topics, Search, and contextual CTAs. Every top-level label should own one visitor job; do not create a generic Resources bucket.

## Desktop wireframe

```text
┌──────────────────────────────────────────────────────────────────────────────┐
│ Optional current-message banner                                  Dismiss     │
├──────────────────────────────────────────────────────────────────────────────┤
│ [Dr Fraction mark]  Blog  Research⌄  Events⌄  Topics⌄  About⌄  Follow [⌕] │
└──────────────────────────────────────────────────────────────────────────────┘
```

### Header regions

The header has three layers at most:

1. An optional announcement strip for one real, current item.
2. The primary navigation row.
3. A dropdown panel or search panel attached to the active trigger.

Do not put a permanent sales message into the announcement strip. If there is no current campaign or event, do not render the strip.

### Top-level navigation

| Trigger | Destination | Dropdown purpose |
| --- | --- | --- |
| Blog | `/blog` | Help visitors browse essays, notes, explainers, and the blog archive. |
| Research | `/papers` initially, later `/research` | Help visitors discover scholarly outputs, papers, preprints, reports, and methods. |
| Events | `/webinars` initially, later `/events` | Show upcoming events, event series, and recordings/assets. |
| Topics | `/topics` | Browse the connected body of work by subject. |
| About | `/about` | Explain Dr Fraction, current interests, and ways to work together. |
| Follow | `/#newsletter` or `/newsletter` | Make the relationship offer and preference choices clear. |
| Search | Search overlay/page | Search the connected library by title, topic, content type, and date. |

Do not expose empty Teaching, Books, Courses, or Projects routes. Add them only when a visitor can complete a meaningful task there.

### Dropdown panel

```text
                         ┌──────────────────────────────────────────┐
                         │ RESEARCH                                 │
                         │ Scholarly outputs and publication context│
                         ├──────────────────────────────────────────┤
                         │ Research library                         │
                         │ Browse papers and other outputs           │
                         │                                          │
                         │ Preprints and reports                    │
                         │ Read work beyond journal articles          │
                         │                                          │
                         │ Browse topics →                           │
                         └──────────────────────────────────────────┘
```

Use one primary landing link, two or three meaningful child links, and an optional footer link. A dropdown is not a sitemap.

Recommended menus:

**Blog**

- Blog archive
- Latest posts
- Essays and notes

**Research**

- Research library
- Publications and papers
- Preprints and reports
- Datasets and protocols, when they exist

**Events**

- Upcoming events
- Event series
- Replays
- Speaking or teaching enquiries

**Topics**

- Featured topics
- All topics
- Follow a topic

**About**

- About Dr Fraction
- Current interests
- Work with me

The active top-level label should have a small accent rule or color change. The panel should use a strong heading, one-sentence explanation, and generous hit areas. Do not rely on color alone to communicate the active state.

## Interaction behavior

### Desktop hover and click

The trigger opens on click immediately. Hover may open after a short intent delay of approximately 120–200ms. This supports pointer users without making hover the only interaction method.

When the pointer moves from the trigger into the panel, keep the panel open. Use a safe hover corridor or the panel’s bounding box so the menu does not close while the pointer crosses the gap. Moving to another trigger changes the open panel without a close/reopen flicker.

Close the panel when:

- the user clicks the active trigger again;
- the user clicks outside the trigger and panel;
- the user presses Escape;
- the user follows a link;
- the route changes;
- focus leaves the navigation system.

Escape must return focus to the trigger that opened the panel. Outside click must not accidentally activate an underlying page control.

### Keyboard

Use semantic buttons or disclosure controls for triggers. Do not rely on native `details` behavior if it prevents consistent keyboard/focus behavior across browsers.

Required behavior:

- Tab reaches each top-level trigger and Search.
- Enter and Space toggle a dropdown.
- Arrow Down moves focus into the first panel item.
- Arrow Up from the first item returns to the trigger.
- Arrow keys move between sibling items when the panel uses a roving tabindex.
- Escape closes and returns focus to the trigger.
- Tab can leave the panel predictably without trapping focus in desktop navigation.
- Screen readers receive `aria-expanded`, `aria-controls`, and a meaningful menu/panel relationship.

### Mobile wireframe

```text
┌─────────────────────────────────────┐
│ [Dr Fraction mark]       [Follow] [☰]│
├─────────────────────────────────────┤
│                                     │
│         Full-width menu panel       │
│                                     │
│ Blog                            →   │
│ Research                        ›   │
│ Events                          ›   │
│ Topics                          ›   │
│ About                           ›   │
│ Follow the work                 →   │
│ Search                          ⌕   │
│                                     │
└─────────────────────────────────────┘
```

Mobile opens from a menu button. The menu should be a full-width panel or drawer attached to the header, not a tiny floating desktop dropdown. It should:

- manage focus on open;
- prevent background scroll while open;
- provide a visible close button;
- use disclosure rows for child links;
- show descriptions only where they improve decision-making;
- close after a destination is selected;
- return focus to the menu button;
- support reduced motion.

Do not place a second “Newsletter & sign in” link at the bottom if the product does not actually have a member-account journey. Use the honest label **Follow the work** and expose sign-in only when it has a real purpose.

## Search state wireframe

```text
┌──────────────────────────────────────────────────────────────────────────────┐
│ Search the work                                                   [Close]    │
│ [ clinical pharmacology                                           ] [Search]  │
├──────────────────────────────────────────────────────────────────────────────┤
│ Suggested topics: Malaria treatment · Evidence · Drug resistance             │
│                                                                              │
│ Results                                                                       │
│ [Research] Title                                                   2026       │
│ Short excerpt and topic context                                             │
│                                                                              │
│ [Blog] Title                                                       2025       │
│ Short excerpt and topic context                                             │
└──────────────────────────────────────────────────────────────────────────────┘
```

Search should be a useful discovery state, not merely an input in the header. Persist the query in the URL. Support content-type filters and useful empty states such as Start here, Browse Topics, Latest Blog Posts, Research Papers, and Upcoming Events.

## Current-message banner wireframe

```text
┌──────────────────────────────────────────────────────────────────────────────┐
│ New public session: evidence and treatment decisions  View event       ×     │
└──────────────────────────────────────────────────────────────────────────────┘
```

The banner must have one message, one CTA, and a dismiss action. Store dismissal in the current browser. Do not create urgency that does not exist.

## Responsive breakpoints

The implementation should use behavior-based breakpoints rather than device names:

- **Wide desktop:** full navigation and hover/click dropdowns.
- **Compact desktop/tablet:** full navigation only if all triggers fit without wrapping; otherwise switch to menu mode.
- **Mobile:** menu button, full-width drawer/panel, no hover dependency.

The header must never wrap into two confusing navigation rows. At the point where labels collide, switch to the mobile pattern.

## Visual and content rules

Keep the product identity person-led, scholarly, warm, and editorial. Do not copy Huberman Lab’s logo, typography, colors, title formulas, imagery, or commercial language.

Use visual hierarchy to distinguish:

- a route from a submenu item;
- a primary CTA from a secondary link;
- a content type from a topic;
- current work from evergreen navigation.

Descriptions should state visitor value, not database labels. Prefer “A curated route into the work” over “Featured posts.” Prefer “Upcoming events and recordings” over “Webinars table.”

## Acceptance criteria

The navigation is ready when:

- every top-level item has a meaningful destination;
- every dropdown has no more than four or five useful destinations;
- desktop users can open menus with click, hover, and keyboard;
- menus remain open while moving into the panel;
- Escape, outside click, link activation, and route changes close menus correctly;
- mobile users can complete the same tasks without hover;
- focus is visible and returns to the correct control;
- the page does not scroll behind an open mobile menu;
- no empty product section appears in navigation;
- the current announcement strip is optional and dismissible;
- navigation labels match the product terminology: Blog, Research, Events, Topics, About, Follow, and Search;
- Research Papers is discoverable within Research, while Topics remains a first-class cross-cutting route;
- automated tests cover pointer, keyboard, touch, route-change, and reduced-motion states.
