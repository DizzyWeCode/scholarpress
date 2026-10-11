# ScholarPress webinar funnel benchmark

## Recommendation

The strongest shared pattern across established webinar, event, and course services is not “host the video inside the website.” It is **own the audience journey and treat the webinar as an event record with measurable states**.

ScholarPress should keep live delivery external, but own the public event page, first-party registration, calendar confirmation, campaign attribution, event emails, replay page, course-interest signal, and admin reporting. This matches the way mature products separate delivery from marketing operations: Zoom provides event and attendance signals; HubSpot turns registrations and attendance into marketing-event records and attribution; Kajabi connects registration, event emails, confirmation, sales page, and checkout; Thinkific treats webinars as one learning product alongside courses, communities, downloads, and memberships. [1] [2] [3] [4] [5]

## Proven patterns to carry into ScholarPress

### Make registration a real event workflow

Zoom’s own webinar workflow separates registration, confirmation, reminders, and post-event messages. It supports reminders one week, one day, and one hour before the start, then branches follow-up between attendees and absentees. It also includes calendar attachments and explicit change/cancellation communications. [1]

Eventbrite follows the same principle with order/registration confirmation, an automatic 48-hour reminder, abandoned-registration recovery, and event-change messages. [4]

**Implementation decision:** ScholarPress should send a confirmation immediately, use a configurable seven-day/one-day/one-hour reminder sequence, and branch follow-up into attendee/no-show paths. The sequence should be idempotent and tied to the event’s start time, not to a generic daily newsletter.

### Use the site as the system of record

HubSpot’s Marketing Events model is useful because it represents an event independently from the delivery provider. Participants can arrive through connected apps or imports, and the event keeps registered, cancelled, and attended states. HubSpot also connects event registration and attendance to campaigns and revenue attribution. [3]

**Implementation decision:** Keep `webinars` as the public event record and add provider metadata plus an access table. Keep raw registration, attendance, and provider-import events separate from the content record. Never put private host links into a publicly readable row.

### Measure behavior, not only registrations

Zoom reports registration details, join/leave times, total session time, performance, Q&A, polls, and surveys, with CSV export after the webinar. [2] ON24 goes further by measuring viewing time, poll responses, questions, content clicks, resource downloads, CTA conversion, meetings, and pipeline. [6]

**Implementation decision:** Start with reliable first-party signals: page view, registration started/completed, confirmation click, calendar click, join click, replay view, resource click, CTA click, and course-interest submission. Import provider attendance later, but label a join redirect as a join click rather than confirmed attendance.

### Design the replay as a second conversion surface

ON24 treats on-demand as a planned nurture experience rather than a file link. Its recommended pattern is to follow up both attendees and no-shows, place the replay alongside clips and useful resources, and use first-party engagement data to route people into different nurture paths. [7]

**Implementation decision:** A past webinar should have a replay page with the recording, key takeaways, resources, related reading, and one next action. Use the same event record and campaign attribution rather than creating a separate untracked recording page.

### Keep the next offer visible but not aggressive

Kajabi’s webinar funnel template connects a registration page, confirmation page, event email sequence, sales page, and checkout. Thinkific positions webinars and coaching as lead magnets or paid products alongside courses, communities, downloads, and memberships. [5] [8]

**Implementation decision:** ScholarPress should first capture a clearly labelled course-interest or waitlist signal. Do not build payments or a full LMS before the course offer, delivery model, and support operation are known. A webinar can later become a course preview, orientation session, or lead-in to a cohort.

### Treat visual marketing as part of the event system

The mature products consistently connect event content to a dedicated registration page, branded email content, replay presentation, and follow-up offer. ON24 specifically recommends a multi-week promotion runway, repeated owned-channel promotion, strong speaker framing, clear takeaways, visual consistency, and planned interaction points. [6]

**Implementation decision:** Store event hero, thumbnail, speaker, takeaways, agenda, and related-resource fields on the event. Generate the public page, social metadata, newsletter block, replay card, and email context from the same source.

## What not to copy

Do not recreate Zoom’s video platform, ON24’s enterprise engagement suite, HubSpot’s CRM, Kajabi’s checkout, or Thinkific’s complete LMS. Those products are valuable because of their operational depth, integrations, and scale; their feature volume would create unnecessary maintenance for ScholarPress.

Do not treat a pasted external registration URL as the main funnel. It fragments attribution, consent, confirmation, and post-event follow-up. Support external registration only as a fallback or hybrid mode.

Do not call a click on the external join link “attendance.” Keep join click, imported attendance, and replay view as separate states.

Do not create a generic email blast for every stage. The established pattern is event-specific, time-based, and behavior-aware.

## Execution scope now

The first implementation slice should be:

1. Use the existing webinar foundation migration, with the new public event fields and owner-only access table.
2. Add a dedicated public webinar detail route with a benefit-led hero, date/time/timezone, speaker, takeaways, agenda, registration CTA, calendar action, and replay state.
3. Add first-party registration that is duplicate-safe, records consent and UTM attribution, and redirects to a confirmation view.
4. Route registered attendees through a tracked join endpoint that redirects to the external provider without exposing host credentials.
5. Refactor the existing reminder job around event-specific confirmation, one-day, one-hour, attendee, and no-show states where the current mailer permits it.
6. Add a replay presentation and a course-interest CTA without adding payment or LMS features.
7. Add only the funnel events needed for the first admin report.

## Defer until evidence and operating needs justify it

Defer provider-specific webhooks until the manual first-party flow works. Defer payment, checkout, certificates, course progress, automated evergreen webinars, advanced lead scoring, and multi-provider synchronization. The first provider adapter should be selected based on the provider actually used for the next real event, not on abstract feature comparison.

## Sources

[1]: https://support.zoom.com/hc/en/article?id=zm_kb&sysparm_article=KB0065074 "Zoom webinar email settings and reminder workflow"
[2]: https://support.zoom.com/hc/en/article?id=zm_kb&sysparm_article=KB0066245 "Zoom webinar reports for registration, attendance, engagement, Q&A, polls, and surveys"
[3]: https://knowledge.hubspot.com/integrations/use-marketing-events "HubSpot Marketing Events, participant states, integrations, campaigns, and attribution"
[4]: https://www.eventbrite.com/help/en-us/articles/748624/what-emails-will-attendees-automatically-receive/ "Eventbrite automatic attendee emails and event-change communications"
[5]: https://help.kajabi.com/en/articles/17175224-set-up-a-zoom-webinar-funnel "Kajabi Zoom webinar funnel with registration, confirmation, event emails, sales page, and checkout"
[6]: https://www.on24.com/guides/webinar/ "ON24 webinar planning, engagement, promotion, and funnel measurement guidance"
[7]: https://www.on24.com/blog/three-top-tactics-to-get-more-from-your-on-demand-webinars/ "ON24 on-demand webinar replay, nurture, and first-party engagement patterns"
[8]: https://support.thinkific.com/hc/en-us/articles/9942695724695-An-Introduction-to-Selling-Thinkific-Learning-Products "Thinkific learning products, webinars as lead magnets, courses, communities, and memberships"
