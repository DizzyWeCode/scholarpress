# CMS workflow benchmark and implementation decisions

## Topics and relationships

Contentful treats content types as structured outlines with typed fields and reference fields for reusable relationships. Ghost provides a useful editorial pattern: a manageable tag directory, metadata per tag, public tag collections, and an ordered primary tag. ScholarPress should combine these patterns without creating a generic catch-all resource type.

**Decision:** Topics are owner-managed records with a name, slug, description, public visibility, ordering, and optional parent. Content relationships remain typed in `content_topics`, and the CMS should assign existing topics from each content editor or from a dedicated topic workspace. Topic pages are public collections, not merely filters.

Sources: [1] [2]

## Research outputs

Crossref distinguishes required, recommended, and optional metadata by output type. For journal articles, title, publication year, and DOI data are core; contributors, ORCID, dates, pages, abstracts, funding, license, references, and relationships improve the record. Crossref also recommends accurate titles, all contributors, affiliations, abstracts, funding, license, relationship metadata, full-text URLs, and update/retraction information. ORCID recommends collecting validated identifiers where possible and using them to reduce name ambiguity and manual entry.

**Decision:** The paper editor should begin with output type and publication stage, then reveal only relevant fields. DOI import creates a reviewable draft and never overwrites intentional edits. The first implementation adds output type, publication stage, publication dates, journal identifiers, pages/article number, publisher, abstract/public summary, license/access, funding, repository identifier, and structured contributor rows with ORCID, affiliation, corresponding-author flag, and CRediT roles. It remains compatible with the legacy `authors` array.

Sources: [3] [4] [5]

## General events

Eventbrite’s creation flow separates event page content, date/time and location, online-event access, tickets or registration, attendee questions, confirmation, preview, and publication settings. Google’s event guidance requires a descriptive name, start date, and location, and recommends end date, event status, description, images, and accurate cancellation/rescheduling semantics. This supports a provider-agnostic event model.

**Decision:** Keep `webinars` as the compatibility table for now, but call the CMS workspace **Events**. Add event type, attendance mode, venue/online location, speaker/agenda fields, registration mode, replay, and lifecycle status. Webinar is one event type, not the underlying product concept.

Sources: [6] [7]

## Email automation and sender conventions

Resend distinguishes marketing Broadcasts from transactional sends, recommends verified domains, test sends, segments, topics, and preference-aware unsubscribe handling. Resend Topics represent what recipients want to receive, while Segments represent who is targeted. Postmark similarly separates transactional and broadcast message streams and recommends separate streams and subdomains.

**Decision:** use purpose-specific sender identities: `newsletter@` for editorial broadcasts, `events@` for event announcements, and `noreply@` only for system receipts/reminders. Store the configured sender and reply-to policy, but never allow arbitrary owner-entered From addresses. Event announcement automation must be opt-in, testable, deduplicated, and tied to a publish transition. Existing explicit announcement actions remain available.

Sources: [8] [9] [10]

## References

[1]: https://www.contentful.com/help/content-models/content-modelling-basics/ "Content modeling basics"
[2]: https://ghost.org/help/tags/ "Ghost tags"
[3]: https://www.crossref.org/documentation/schema-library/required-recommended-elements/ "Required, recommended, and optional metadata"
[4]: https://www.crossref.org/documentation/principles-practices/journals/ "Crossref journals and articles"
[5]: https://info.orcid.org/documentation/workflows/integrating-orcid-into-your-journal-workflow/ "ORCID journal article workflow"
[6]: https://www.eventbrite.com/help/en-us/articles/551351/how-to-create-an-event/ "Eventbrite event creation"
[7]: https://developers.google.com/search/docs/appearance/structured-data/event "Google event structured data"
[8]: https://resend.com/docs/dashboard/broadcasts/introduction "Resend broadcasts"
[9]: https://resend.com/docs/knowledge-base/why-use-topics "Resend topics and preferences"
[10]: https://postmarkapp.com/support/article/how-to-create-and-send-through-message-streams "Postmark message streams"
