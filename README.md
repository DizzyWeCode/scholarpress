# Dr Fraction Dzinjalamala — academic site

A personal academic publishing platform: research papers, long-form articles,
webinar announcements, newsletter subscriptions, and readership analytics —
behind a medium-to-advanced content management studio.

**Stack (100% free to host):** Next.js 14 · TypeScript · Tailwind CSS ·
Supabase (Postgres, Auth with Google, RLS) · TipTap editor · Recharts ·
Vercel free tier for hosting.

---

## Features

| Area | What you get |
|---|---|
| **CMS studio** (`/admin`) | Owner-only dashboard; posts, papers, webinars, subscribers, analytics, settings |
| **Rich article editor** | TipTap block editor: headings, bold/italic/underline, lists, quotes, code blocks, links, images *with attribution captions*, dividers, undo/redo |
| **References** | Every article can carry a numbered References section (label + DOI/URL) rendered at its end |
| **Research papers** | Publication archive with authors, venue, year, DOI link, PDF link, tags, homepage featuring |
| **Webinars** | Announce upcoming sessions (date, duration, platform, registration link); past sessions show recordings |
| **Subscriptions** | Newsletter by email, or reader accounts via **Google OAuth** or email magic link |
| **Analytics** | Consent-gated page views (no IPs/fingerprints): daily trend, most-read pages, referrer hosts |
| **Sharing** | Native share sheet, X, LinkedIn, copy-link on every article; Open Graph/Twitter cards + JSON-LD |
| **Legal** | Terms of Service, Privacy Policy, Cookie Policy — written to match this exact implementation; cookie banner with Allow/Reject gating analytics |
| **Image attribution** | Cover images and in-article images carry credit + source link; site-wide note in the footer |
| **SEO** | Per-article title/description overrides, canonical URLs, sitemap.xml, robots.txt |
| **Security** | Supabase Row Level Security on every table; owner role; sanitized server-side article rendering (no raw HTML injection) |

## Quick start (≈ 15 minutes)

### 1. Create the Supabase project (free tier)

1. Go to [supabase.com](https://supabase.com) → **New project** (free plan is fine).
2. In the dashboard → **SQL Editor** → paste and run `supabase/schema.sql`.
3. (Optional) run `supabase/seed.sql` for sample content you can later delete.
4. In **Project Settings → API**, copy the **Project URL** and **anon public key**.

### 2. Enable Google sign-in

1. In Supabase: **Authentication → Providers → Google** → enable.
2. Follow Supabase's on-screen guide to create a Google OAuth client
   (Google Cloud Console → APIs & Services → Credentials).
3. Add the redirect URL Supabase shows you to the Google client's
   **Authorized redirect URIs**.
4. In **Authentication → URL Configuration**, set Site URL to your production
   domain (e.g. `https://your-site.vercel.app`) and add
   `http://localhost:3000/**` for local dev.

### 3. Configure the app

```bash
cp .env.example .env.local
# fill in NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY
# set NEXT_PUBLIC_SITE_URL to your production URL
```

Edit `src/lib/site.ts` — name, tagline, affiliation, email, scholarly
profiles. This rebrands the entire site, including legal pages.

### 4. Run locally

```bash
npm install
npm run dev     # http://localhost:3000
```

### 5. Become the owner

1. Visit `/login` and sign in with Google (or email link).
2. In Supabase SQL Editor:

```sql
update public.profiles set role = 'owner' where email = 'you@example.com';
```

3. Visit `/admin` — your studio is live.

### 6. Deploy free on Vercel

1. Push this repo to GitHub.
2. [vercel.com](https://vercel.com) → **Add New → Project** → import the repo.
3. Add the three environment variables from step 3.
4. Deploy. Then set `NEXT_PUBLIC_SITE_URL` to the live URL and add the domain
   to Supabase **Authentication → URL Configuration** (Site URL +
   `https://your-domain/auth/callback` redirect).

### 7. Pre-launch checklist (custom domain)

- [ ] Custom domain attached in Vercel (e.g. `https://dr-fraction.me`)
- [ ] `NEXT_PUBLIC_SITE_URL` = canonical `https://…` domain (production never falls back to localhost — see `src/lib/site.ts`)
- [ ] Supabase Auth → URL Configuration: Site URL + redirect URLs include the custom domain
- [ ] `https://<domain>/sitemap.xml` and `/robots.txt` return 200 with `https` URLs
- [ ] Share an article: link + OG image use the custom domain
- [ ] Default OG image at `public/covers/default-og.png` (1200×630 branded) + per-post `cover_image_url` with alt/credit
- [ ] Replace hero (`SITE.images.hero`) and about portrait (`SITE.images.aboutPortrait`) slots with real photos
- [ ] Run migration `supabase/migrations/2026-10-07-account-bookmarks-avatars.sql` (or full `schema.sql`) for bookmarks + profile fields + `avatars` bucket
- [ ] Smoke test: account page shows only your own saved/liked/comments; bookmarks RLS blocks cross-user reads

## Continuous integration & deployment

`.github/workflows/ci.yml` runs on every pull request and on every push to
`main`:

| Job      | What it does |
| -------- | ------------ |
| `web`    | `npm ci` → `npm run typecheck` → `npm run lint` → `npm run build`, deliberately **without** any environment variables so the build can never quietly start depending on secrets. |
| `schema` | Starts a throwaway Postgres 16, applies `supabase/ci/00-auth-shim.sql` (a CI stand-in for Supabase's `auth` schema), runs `supabase/schema.sql` **twice** to prove it is idempotent, applies `supabase/seed.sql`, then runs `supabase/ci/10-assertions.sql`. |
| `deploy` | On pushes to `main` only, and only after both jobs above pass. |

`deploy` builds with the Vercel CLI and ships the prebuilt output to
production. It needs three repository secrets:

| Secret               | Where it comes from |
| -------------------- | ------------------- |
| `VERCEL_TOKEN`       | vercel.com → **Settings → Tokens** |
| `VERCEL_ORG_ID`      | `cat .vercel/repo.json` locally, or `vercel link` then `cat .vercel/project.json` |
| `VERCEL_PROJECT_ID`  | same file, `projectId` field |

Until all three are set the job prints a notice and skips — the build and
schema checks still gate every merge. If you prefer Vercel's own Git
integration (step 6 above), you can leave the secrets unset and deploy is a
no-op.

To reproduce CI locally:

```bash
npm ci && npm run typecheck && npm run lint && npm run build
psql -v ON_ERROR_STOP=1 -f supabase/ci/00-auth-shim.sql   # against an empty DB
psql -v ON_ERROR_STOP=1 -f supabase/schema.sql
psql -v ON_ERROR_STOP=1 -f supabase/schema.sql            # must be a no-op
psql -v ON_ERROR_STOP=1 -f supabase/seed.sql
psql -v ON_ERROR_STOP=1 -f supabase/ci/10-assertions.sql
```

`supabase/ci/` exists only for CI — never run those two files against a real
Supabase project.

## Sending newsletter emails

Subscriptions are stored in `subscribers` (exportable as CSV from
`/admin/subscribers`). To send announcements on a free tier:

- **Buttondown / Resend free tiers**: import the CSV, or
- wire a **Supabase Edge Function** triggered on `posts` insert
  (`status` → `published`) that calls your email provider's API.

Ready-made HTML templates for Resend live in `resend/templates/`. Publish them
in the Resend dashboard (welcome, newsletter, webinar announcement, webinar
reminder) and paste their IDs or aliases into `RESEND_TEMPLATE_*` in
`.env.example`.

## Privacy & analytics model

- The cookie banner stores the visitor's choice in their browser
  (`localStorage: sp-cookie-consent`).
- Page views are **only** sent after explicit "Allow" — see
  `src/components/analytics-tracker.tsx` and `src/app/api/track/route.ts`.
- Stored per view: page path, referring **host** (never full URL), user-agent
  string. No IP addresses, no fingerprinting.
- Auth cookies (`sb-*`) are strictly necessary and not used for tracking.

## Project structure

```
src/
  app/                 # routes: public pages, /admin studio, /api/track, auth callback
  components/          # header/footer, editor, cards, share buttons, cookie banner…
  lib/
    site.ts            # ← rebrand here
    types.ts           # DB row types
    supabase/          # browser / server / anon clients + middleware
supabase/
  schema.sql           # tables + RLS policies (run first)
  seed.sql             # sample content (optional)
  ci/                  # CI-only Postgres shim + assertions (never run in prod)
.github/workflows/
  ci.yml               # typecheck, lint, build, schema validation, deploy
```

## Licensing note on images

Sample content uses generated cover art in `public/covers/`
(see `scripts/generate-brand-assets.py`) — no third-party imagery ships
with the site. When you add your own images, always fill the credit
fields in the editor for anything you did not create.
