# Prompt: Diagnose and Fix ScholarPress Content and Admin Dashboard Latency

You are troubleshooting the existing ScholarPress / Dr Fraction Dzinjalamala Next.js application. Users are experiencing noticeable latency while site content loads, especially data in the admin dashboard. Think like a systems designer, not only a frontend developer.

The goal is to identify the actual latency budget and remove avoidable round trips, oversized queries, repeated authentication work, client-side waterfalls, missing indexes, and poor loading behavior without weakening RLS, privacy, or owner-only access.

Work from the existing repository. Do not guess at the cause and immediately rewrite the dashboard. Instrument first, measure the slow path, then implement the smallest safe architecture change that improves real time-to-content.

## Current architecture clues to investigate

The current codebase already suggests several possible contributors:

- `src/app/admin/page.tsx` is a client component that fires approximately thirteen Supabase queries on mount. The dashboard waits for the slowest request before showing the populated state.
- Several dashboard queries use `count: "exact"`, which can be more expensive than necessary on large tables.
- The dashboard loads activity rows and counts separately instead of receiving one purpose-built summary response.
- `src/app/admin/analytics/page.tsx` fetches up to 10,000 raw `page_views` rows into the browser and performs daily grouping, top-page grouping, and referrer grouping client-side.
- The admin layout is `force-dynamic` and calls `getOwnerSession()`. The server helper calls `auth.getUser()` and then performs a profile-role query. Middleware also calls `supabase.auth.getUser()` on every matched request.
- The middleware matcher covers nearly every non-static request, including public pages, so session refresh work may occur even when the visitor is not using the admin area.
- Supabase data access is client-side in several admin screens, so the browser must hydrate, create/use the client, establish the network connection, run RLS-aware queries, and then render data.
- The current analytics query selects `*`, orders raw events, returns a large result set, and performs aggregation in JavaScript.
- The schema has some useful indexes, but all dashboard access paths must be checked against the actual production schema and query plans rather than assumed to be indexed.
- Supabase region and Vercel region may be geographically distant, making multiple sequential or parallel requests feel slow even when individual database queries are acceptable.

Treat these as hypotheses, not conclusions.

## Phase 1: measure before changing behavior

Create a short latency report for the current production-like environment. Record measurements separately for:

1. First visit to `/admin` when no browser cache is warm.
2. Repeat visit to `/admin`.
3. Browser refresh on `/admin`.
4. Navigation from one admin page to another.
5. `/admin/analytics` for 7, 30, and 90 days.
6. Public content pages such as `/`, `/blog`, `/papers`, and `/webinars`.
7. Authenticated versus unauthenticated requests.
8. A local/dev environment versus deployed environment if available.

Use browser network timing and server/runtime logs to distinguish:

- DNS/TLS/connect time.
- Middleware time.
- Next.js server render time.
- Browser hydration time.
- Supabase request time.
- Database execution time.
- Response transfer time.
- Client-side data transformation/render time.

Add temporary or permanent structured timing instrumentation. Each measurement should include a request or trace ID, route, query group, row count, and duration. Do not log emails, service keys, access tokens, private host links, or raw personal data.

Use the following target thresholds as starting goals, not promises:

- Public cached content should reach useful visible content in under 1 second on a normal connection after warm deployment.
- Admin should show shell and navigation immediately, then show an actionable skeleton state.
- Admin first useful content should normally arrive within 1.5 seconds on a warm deployment and within 3 seconds on a cold or geographically distant deployment.
- Analytics should return summaries within 2 seconds for normal ranges instead of transferring thousands of raw rows.
- No single dashboard query should silently dominate the entire response without being identified in logs.

## Phase 2: verify the most likely bottlenecks

### A. Dashboard query fan-out

Measure all current dashboard queries independently. Determine:

- Which requests are slowest.
- Which tables have the largest row counts.
- Whether `count: "exact"` is required for each card.
- Whether the same table is queried repeatedly for related information.
- Whether RLS policy evaluation or joins are contributing materially.
- Whether activity queries lack appropriate `limit`, ordering, or covering indexes.

Do not assume that `Promise.all` makes the page fast. It reduces serial waiting, but the page still waits for the slowest query and creates a large request burst.

### B. Analytics payload size

Measure the number of `page_views` rows and response bytes for each range. Confirm whether the browser is receiving far more information than it needs. The UI needs daily totals, top pages, and referrer totals—not every raw event.

### C. Auth and middleware duplication

Measure the time and frequency of:

- Middleware `auth.getUser()`.
- Admin layout `getOwnerSession()` / `auth.getUser()`.
- Profile-role lookup.
- Any repeated auth requests during client hydration.

Do not remove authentication checks. Decide whether public requests can skip session refresh safely, whether the middleware matcher can be narrowed, and whether the admin route can avoid duplicating work while preserving secure owner checks.

### D. Database region and query plans

Check the Supabase project region and deployed application region. If the regions are far apart, document the round-trip impact before changing infrastructure.

Use Supabase query analysis / `EXPLAIN (ANALYZE, BUFFERS)` or the platform’s supported performance tooling for the actual slow queries. Inspect:

- Sequential scans on large tables.
- Sorts caused by missing indexes.
- Count queries scanning entire tables.
- RLS policy subqueries and function calls.
- Excessive JSON or wide-row transfer.
- Queries that select `*` when only a few columns are needed.

Add indexes only when supported by real query plans and expected access patterns. Avoid indexing every column or adding indexes that slow writes unnecessarily.

## Phase 3: implement the preferred architecture

### 1. Make the admin shell render immediately

Keep the admin page shell, navigation, title, and primary actions available without waiting for all data. Use route-level loading UI and meaningful skeletons that match the final layout.

A slow analytics panel must not block drafts, upcoming events, or other actionable information.

Show panel-level loading and error states. Preserve successfully loaded panels when another query fails.

### 2. Replace dashboard fan-out with a summary read model

Create a single purpose-built admin dashboard data path. Choose the safest option after measuring:

- A server-side route handler using the authenticated server Supabase client.
- A dedicated owner-guarded Postgres RPC returning a compact JSON summary.
- A server component query layer that fetches only required fields and composes one response.

The response should contain only the dashboard’s required data:

- Attention counts and deep links.
- Published/draft/scheduled content counts.
- Subscriber and view summaries.
- Upcoming webinars and registration/funnel summaries.
- Recent posts, comments, and events.
- Data freshness timestamps.
- Per-panel error information where feasible.

Do not use the service-role key in the browser. If a server-side privileged client is used, enforce owner authorization before the privileged query and keep the endpoint private to the authenticated owner. Prefer authenticated RLS-aware access or an owner-checked security-definer function with a narrow return shape.

Use exact counts only where they are operationally meaningful. For cards where an approximate or bounded count is sufficient, use a cheaper strategy. Document any approximation so the owner understands it.

### 3. Move analytics aggregation to the database

Replace raw `select("*")` page-view transfer with a compact analytics query or RPC that returns:

- Daily page-view totals.
- Top pages.
- Referrer totals.
- Total views.
- Optional first/last event timestamps.

Parameterize the date range. Validate allowed ranges server-side. Do not accept arbitrary SQL, arbitrary table names, or unbounded limits from the client.

Add suitable indexes based on measured plans, likely involving `page_views.created_at` and carefully chosen aggregate access paths. If scale justifies it, add a daily rollup table or materialized summary refreshed by a scheduled job. Do not introduce rollups before measuring whether indexed aggregation is sufficient.

Keep the existing privacy promise: no IPs, no fingerprints, and only consent-gated analytics.

### 4. Improve caching without exposing private data

Separate public content from owner-only admin data:

- Public published content can use short-lived revalidation or cache headers where safe.
- Admin responses must not be publicly cached and must vary correctly by authenticated user.
- Do not cache subscriber lists, comments moderation data, attendance, course-interest signals, or private settings in a shared cache.
- Avoid `force-dynamic` on public routes unless a real request-time dependency requires it.
- Use `revalidatePath` or targeted invalidation after publish/update mutations where appropriate.
- Do not add random client cache durations that make the owner think data is current when it is stale.

Document the freshness policy for each major surface.

### 5. Reduce auth work safely

Inspect the middleware matcher and narrow it only if public pages do not require session refresh. Preserve routes that need auth callbacks, account sessions, admin access, or authenticated interaction.

Avoid blindly calling `auth.getUser()` multiple times in the same server request if the existing framework/client pattern can safely reuse a verified result. Never replace secure user verification with an unverified cookie or decoded JWT claim.

If role checks are centralized, keep the owner check server-side and make failures explicit. Do not weaken RLS to improve latency.

### 6. Make client requests resilient

For remaining client-side reads:

- Cancel stale requests when the selected range or page changes.
- Prevent duplicate fetches in React development and navigation transitions.
- Keep previous data visible while a new range loads when that is less confusing than blanking the panel.
- Add retry only for transient failures and cap retries with backoff.
- Show the last successful update time.
- Avoid refetching the entire dashboard after a local mutation if a targeted update is possible.
- Keep query keys and filters stable so equivalent requests can be deduplicated.

Do not hide latency by showing an infinite spinner. Always provide a useful recovery path.

## Phase 4: database and schema work

After measuring, propose a migration containing only justified changes. Possible candidates to evaluate include:

- `page_views(created_at)` for date-range analytics.
- `posts(status, updated_at)` for dashboard attention/activity.
- `comments(status, created_at)` for moderation counts and recent comments.
- `webinars(status, starts_at)` for upcoming events.
- `email_sends(purpose, webinar_id, created_at)` for event communications.
- `webinar_registrations(webinar_id, status, created_at)` for funnel summaries.
- Narrow partial indexes for frequently queried statuses.

Use `CREATE INDEX IF NOT EXISTS` where appropriate and make migrations safe to rerun. Confirm index usefulness with query plans. Include rollback or removal guidance for indexes that prove unnecessary.

If an aggregate RPC is added:

- Validate all parameters.
- Enforce owner access inside the database function or immediately before calling it.
- Return narrow typed data.
- Avoid dynamic SQL unless strictly necessary.
- Do not return secrets or private content accidentally.
- Add a test or documented SQL verification path.

## Phase 5: frontend UX for latency

Improve perceived performance without misrepresenting the state:

- Render the page header and key actions immediately.
- Use skeletons shaped like the real content.
- Use panel-level status messages such as “Updated 12 seconds ago.”
- Show “No data yet” separately from “Could not load data.”
- Show partial results when partial results are valid.
- Include a Retry action for failed panels.
- Keep filters visible while data loads.
- Preserve scroll position and selected range.
- Do not use layout-shifting spinners that move controls after the user starts interacting.
- Use accessible `role="status"` and `aria-live` announcements where necessary.

## Testing and validation

Validate with:

1. Typecheck.
2. ESLint.
3. Production build.
4. Database migration validation.
5. Query-plan comparison before and after.
6. Browser network waterfall before and after.
7. Cold and warm admin visits.
8. Slow-network simulation.
9. Authenticated owner and non-owner access.
10. Public unauthenticated access.
11. Empty database state.
12. Large synthetic or staging dataset.
13. Analytics ranges of 7, 30, and 90 days.
14. Partial Supabase failure or timeout.
15. Mobile viewport behavior.

Report:

- Baseline timings.
- New timings.
- Request count before and after.
- Response size before and after.
- Slowest queries before and after.
- Database indexes/RPCs added.
- Cache and freshness behavior.
- Security/RLS implications.
- Any remaining bottleneck.

## Non-goals

Do not:

- Disable RLS.
- Put the service-role key in client code.
- Cache private admin data publicly.
- Delete analytics or historical data merely to make queries faster.
- Replace real measurements with arbitrary timeouts.
- Add a client-side state library solely to mask slow server queries.
- Fetch more data “in advance” without evidence that it improves the user journey.
- Make every route dynamic or every route static by default.
- Add a database index without checking its plan and write cost.
- Remove authentication checks because they are slow.

## Expected implementation order

1. Produce a latency audit with request waterfall and query timings.
2. Fix the largest measured bottleneck first.
3. Add dashboard panel-level loading and error behavior.
4. Introduce a compact dashboard summary endpoint/RPC.
5. Move analytics aggregation server-side/database-side.
6. Narrow auth/middleware work only where safe.
7. Add evidence-backed indexes and migrations.
8. Add safe caching/revalidation for public content.
9. Re-run measurements and document the new latency budget.

Before editing production behavior, return a short diagnosis naming the top three measured causes, the proposed fix for each, and the expected risk. Then implement the first safe milestone and validate it completely.


## Status and next operational step — 17 October 2026

Treat this document as an operational playbook, not an unfinished feature specification. The next performance pass should instrument the slowest real admin routes first, record server/query/render timings, and fix the top measured bottleneck before adding indexes, caching, rollups, or client-side complexity. No latency change should be accepted without before/after measurements and a check that RLS behavior and freshness expectations remain correct.
