# Email automation workflows for ScholarPress

## Operating rule

ScholarPress should separate **Broadcasts**, **Automations**, and **Transactional messages**.

- A **Broadcast** is a campaign sent to a selected segment at a planned time. Examples: newsletter, publication announcement, event promotion, replay promotion.
- An **Automation** is a rule or journey that responds to a trigger and may send one or more messages over time.
- A **Transactional message** is a one-to-one operational response to an individual action. Examples: registration confirmation, calendar link, event change, password reset, or unsubscribe confirmation.

Publishing a Blog post, Research output, or Event should never send a broadcast automatically unless the owner has explicitly enabled that automation and its audience, topic, sender, and approval policy.

## Sender conventions

Use a verified domain and make the sender recognizable as Dr Fraction. Store sender identities in configuration/database records rather than hard-coding them in individual helpers.

| Purpose | From | Reply-To | Message class | Notes |
| --- | --- | --- | --- | --- |
| Newsletter and publication broadcasts | `Dr Fraction <newsletter@dr-fraction.me>` | `hello@dr-fraction.me` | Broadcast | Use for regular letters, Blog post announcements, and research announcements. |
| Event promotion and event logistics | `Dr Fraction <events@dr-fraction.me>` | `events@dr-fraction.me` | Broadcast or transactional | Replies should be monitored during active event campaigns. |
| Relationship and collaboration | `Dr Fraction <hello@dr-fraction.me>` | `hello@dr-fraction.me` | Transactional | Use for contact, speaking, teaching, and collaboration responses. |
| Operational notifications | `Dr Fraction <notifications@dr-fraction.me>` | `hello@dr-fraction.me` | Transactional | Use for moderation, delivery, and system notices. |
| No-reply system mail | `Dr Fraction <noreply@dr-fraction.me>` | `hello@dr-fraction.me` | Transactional | Use sparingly. Do not use for newsletters or event invitations. |

A `From` address communicates identity and purpose. `Reply-To` communicates where a human response should go. Do not use `noreply@` for a message that invites questions or participation.

## Audience and preference rules

Use **Segments** to define who receives a broadcast and **Topics** to define what a subscriber has agreed to receive.

Initial public topics should remain small and clear:

- **Newsletter** — regular letters and selected work.
- **Research** — research outputs, findings, and methods.
- **Events** — event invitations, event reminders, and replay notices.
- **Learning** — future course and teaching opportunities.

Internal segments may include:

- all opted-in contacts;
- newsletter subscribers;
- research-topic subscribers;
- event-topic subscribers;
- registrants for a specific event;
- attendees for a specific event;
- replay viewers;
- learning-interest contacts;
- recently engaged contacts;
- inactive contacts for re-engagement.

A registration for an event grants permission for event logistics only unless the form separately records marketing consent. An event registration must not silently subscribe someone to the newsletter or Learning topic.

## Workflow 1: welcome and preference confirmation

**Trigger:** a person submits the Follow/Newsletter form.

**Message:** transactional confirmation or welcome message.

**From:** `Dr Fraction <hello@dr-fraction.me>` or `newsletter@dr-fraction.me` if the message is a newsletter preference confirmation.

**Reply-To:** `hello@dr-fraction.me`.

**Timing:** immediately after successful subscription; do not send before the subscription is stored.

**Content:** confirm the selected topics, explain expected frequency, link to preference management, and offer one honest starting resource.

**Suppression:** do not send again for the same consent event. Use an idempotency key based on contact, purpose, and consent timestamp.

**Success event:** `subscription_confirmed`.

## Workflow 2: publication announcement draft

**Trigger:** a Blog post or Research output changes to `published`.

**Default behavior:** create a Broadcast draft, do not send automatically.

**Owner choices:**

- Send to Newsletter topic.
- Send to Research topic for a research output.
- Send to a selected segment.
- Skip announcement.
- Schedule for later.

**From:** `newsletter@dr-fraction.me`.

**Reply-To:** `hello@dr-fraction.me`.

**Campaign type:** `publication_announcement`.

**Draft contents:**

- subject;
- preview text;
- short editorial introduction;
- title and content type;
- one-sentence promise;
- primary CTA to the owned landing page;
- optional external publisher CTA for a research output;
- topic label;
- unsubscribe/preferences link;
- UTM campaign identity.

**Guardrail:** the system may propose copy from structured fields, but the owner must be able to edit it and review the audience before scheduling.

**Success events:** `broadcast_scheduled`, `broadcast_sent`, `publication_cta_clicked`, `publication_conversion`.

## Workflow 3: newsletter issue

**Trigger:** manual creation, scheduled editorial calendar, or an owner-approved recurring automation.

**Campaign type:** `newsletter_issue`.

**From:** `newsletter@dr-fraction.me`.

**Reply-To:** `hello@dr-fraction.me`.

**Audience:** a Segment of contacts subscribed to the Newsletter topic.

**Content model:** a newsletter issue is a campaign/content item with a subject, preview text, intro, selected Blog/Research/Event blocks, primary CTA, secondary links, topic, send time, and archive URL.

**Lifecycle:** Draft → Internal review → Test sent → Scheduled → Sending → Sent → Reported.

**Required review before scheduling:**

- subject and preview;
- sender and Reply-To;
- recipient Segment;
- topic and unsubscribe behavior;
- links and UTM parameters;
- mobile preview;
- test email result;
- primary CTA;
- publication/announcement claims;
- send time and timezone.

**Metrics:** delivery, bounce, complaint, unsubscribe, click-through, primary CTA conversion, and return visits. Open rate may be shown as a directional signal, not the only success measure.

## Workflow 4: event promotion

**Trigger:** an Event enters `published` or `registration_open`.

**Default behavior:** create a campaign draft. Do not send to all subscribers by default.

**From:** `events@dr-fraction.me`.

**Reply-To:** `events@dr-fraction.me`.

**Campaign type:** `event_promotion`.

**Audience:** Events topic subscribers, relevant topic segments, previous attendees, or a manually selected segment.

**Message contents:**

- event promise;
- audience fit;
- date/time/timezone;
- format and attendance mode;
- speaker/host;
- hero image or thumbnail;
- agenda/takeaways;
- registration CTA;
- calendar/landing-page link;
- preference and unsubscribe controls.

**Suggested sequence:**

1. Initial announcement after the event page and registration are ready.
2. Optional second message to non-registrants when the campaign has a genuine new reason, such as a speaker addition or agenda release.
3. Final reminder only when useful and not artificially urgent.

Do not send a promotion if registration is closed, the event is cancelled, or the event page fails its completeness checklist.

## Workflow 5: event registration confirmation

**Trigger:** successful registration.

**Message class:** transactional.

**From:** `events@dr-fraction.me`.

**Reply-To:** `events@dr-fraction.me`.

**Timing:** immediately after the registration transaction succeeds.

**Contents:** event title, date/time in the registrant’s timezone where possible, attendance mode, owned event page, calendar link, access instructions when available, contact address, and preference explanation.

**Data rule:** store the registration event and consent separately. If the registrant opted into Events marketing, update the Events topic. Otherwise only send logistics tied to the registration.

**Idempotency:** `event-registration-confirmation:{event_id}:{normalized_email}`.

## Workflow 6: event reminders

**Trigger:** a registered person is eligible and the event is not cancelled or postponed.

**Message class:** transactional event logistics.

**From:** `events@dr-fraction.me`.

**Reply-To:** `events@dr-fraction.me`.

**Suggested schedule:**

- 24 hours before start;
- 1 hour before start;
- optional start-time access message for online events.

The exact schedule should be configurable per event. Do not send duplicate reminders if a cron job retries. Store each reminder type and delivery outcome against the registration.

**Eligibility:** registration status is confirmed/registered, the contact is not cancelled or unsubscribed from event logistics, and the event is still scheduled.

**Contents:** title, localized date/time, join/access CTA, event page, support email, and what to prepare.

## Workflow 7: event change or cancellation

**Trigger:** an Event changes to postponed, rescheduled, or cancelled.

**Message class:** transactional operational update.

**From:** `events@dr-fraction.me`.

**Reply-To:** `events@dr-fraction.me`.

**Recipients:** all registrants for the affected event, regardless of whether they opted into the Events marketing topic. This is operational mail tied to their registration.

**Contents:** what changed, old and new date/time when relevant, current status, updated calendar link, access/refund/contact instructions, and the event page.

**Guardrail:** do not delete the original event or registration history before the update is delivered and recorded.

## Workflow 8: attendance and replay follow-up

**Trigger:** attendance is recorded, or replay becomes available.

**Message class:** transactional for registrant-specific follow-up, Broadcast for broader replay promotion.

**From:** `events@dr-fraction.me`.

**Reply-To:** `events@dr-fraction.me`.

**Branches:**

- Attended: thank-you, replay/resources, feedback CTA, and related next step.
- Registered but no-show: replay/resources and a low-pressure next step.
- Replay viewer: related research or Learning-topic CTA, if consent allows.
- Public replay campaign: send only to the Events topic or selected segment.

Track `attended`, `no_show`, `replay_viewed`, `feedback_submitted`, and `next_step_clicked` as separate events. Do not infer attendance from an email click.

## Workflow 9: learning-interest nurture

**Trigger:** a person submits a course or learning-interest form, or explicitly selects the Learning topic.

**Message class:** transactional acknowledgement followed by an optional Automation journey.

**From:** first acknowledgement from `hello@dr-fraction.me`; later learning campaign from `newsletter@dr-fraction.me` or a future `learning@` identity if the volume justifies it.

**Reply-To:** `hello@dr-fraction.me`.

**Sequence:**

1. Confirm the interest signal and the type of learning requested.
2. Provide an honest current resource, if one exists.
3. Ask one optional preference question only when it improves future relevance.
4. Notify the owner or create an internal task when personal follow-up is promised.
5. Send future course updates only to the Learning topic.

Do not call these contacts “customers,” “qualified leads,” or “students” before they actually enroll.

## Failure, suppression, and audit rules

Every send attempt needs a campaign or automation reference, message purpose, sender identity, topic, segment, recipient, idempotency key, provider id, status, timestamps, and error message where applicable.

Broadcasts must be reviewable before send. Transactional messages must be retryable without duplication. Bounces and complaints must suppress future broadcasts. Unsubscribes must be honored by topic and globally according to the provider and legal requirements.

A failed email should create an actionable error in the admin Messages workspace, not silently disappear into a log. The owner should be able to see whether a message was drafted, approved, queued, accepted, delivered, opened, clicked, bounced, failed, or suppressed.

## Admin workflow wireframe

```text
Messages
├── Drafts
├── Scheduled
├── Sent
├── Automations
├── Templates
├── Sender identities
├── Audience & topics
└── Delivery issues
```

Creating a campaign should use a stepper:

1. Choose campaign type.
2. Choose source content or create message.
3. Choose audience Segment and subscriber Topic.
4. Choose sender and Reply-To.
5. Write/adjust content.
6. Preview links, mobile layout, and unsubscribe behavior.
7. Send a test.
8. Approve and schedule.
9. Review delivery and conversion results.

The final action must say **Schedule broadcast**, **Send test**, or **Send transactional test**. Avoid a generic **Send** button with unclear audience consequences.

## Acceptance criteria

The system is ready when a published item can produce a reviewable campaign draft, an event registration produces exactly one confirmation, event reminders are idempotent, event changes reach all affected registrants, and every Broadcast has an explicit Segment, Topic, sender, Reply-To, CTA, and approval state.


## Implementation status and next build sequence — 17 October 2026

The sender conventions and workflow rules in this document are approved. Current code provides a newsletter sender, welcome flow, webinar announcement/reminder helpers, delivery logging, Resend webhook handling, and idempotency for the existing webinar paths. It does not yet provide the complete Messages workspace described above.

### Current gaps

- `email_sends` remains a delivery log rather than a campaign/broadcast model.
- Sender identities are environment/helper defaults, not owner-managed records.
- Newsletter and webinar sends do not yet share a generic campaign draft/approval/scheduling workflow.
- Subscriber Topics and sender-defined Segments are not yet modeled as separate concepts.
- Event confirmation, event-change, replay, no-show, and learning-interest journeys need generic idempotent implementations.
- Delivery issues need actionable admin states, not only historical rows.

### Safe implementation sequence

1. Create sender identity and message-purpose allow-lists.
2. Add campaign drafts and explicit audience/topic/sender/CTA fields.
3. Add preview, test send, approval, and schedule states.
4. Generalize event confirmation/reminder/change/replay workflows.
5. Add suppression, bounce, complaint, and unsubscribe enforcement.
6. Add conversion tracking and delivery issue triage.

No future feature may send a broadcast directly from a publish button without creating a reviewable draft or an explicitly enabled automation run.
