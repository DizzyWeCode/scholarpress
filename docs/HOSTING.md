# Hosting the site for free

A complete, step-by-step guide to putting this site on the public internet without
paying anything. Everything below is on a **free tier**: Supabase (database + auth),
Vercel (hosting), GitHub (code), and a free subdomain — with an optional path to a
real custom domain later.

**Final monthly cost: $0** (domain optional, ~$10/year if you want one).

---

## Table of contents

1. [What runs where](#1-what-runs-where)
2. [Free-tier comparison — which host to pick](#2-free-tier-comparison--which-host-to-pick)
3. [Prerequisites](#3-prerequisites)
4. [Step 1 — Put the code on GitHub](#step-1--put-the-code-on-github)
5. [Step 2 — Create the Supabase project (free)](#step-2--create-the-supabase-project-free)
6. [Step 3 — Enable Google sign-in (and fix redirect_uri_mismatch)](#step-3--enable-google-sign-in-and-fix-redirect_uri_mismatch)
7. [Step 4 — Deploy to Vercel (free)](#step-4--deploy-to-vercel-free)
8. [Step 5 — Post-deploy checklist](#step-5--post-deploy-checklist)
9. [Step 6 — Become the site owner](#step-6--become-the-site-owner)
10. [Custom domains on a budget](#custom-domains-on-a-budget)
11. [Alternative hosts (Netlify, Cloudflare, a VPS)](#alternative-hosts-netlify-cloudflare-a-vps)
12. [Costs, limits and when free stops being free](#costs-limits-and-when-free-stops-being-free)
13. [Troubleshooting](#troubleshooting)
14. [Going further (still free)](#going-further-still-free)

---

## 1. What runs where

| Piece | Runs on | Free tier covers |
|---|---|---|
| Next.js app (pages, API routes, middleware) | **Vercel** | Serverless functions, CDN, HTTPS, automatic deploys from GitHub |
| Postgres database (posts, papers, webinars, subscribers, analytics) | **Supabase** | 500 MB database, backups, dashboard |
| Authentication (Google OAuth + email magic links) | **Supabase Auth** | Tens of thousands of monthly users |
| Row Level Security / owner role | **Supabase** | Included |
| Source code | **GitHub** | Unlimited public/private repos |
| HTTPS certificate | Vercel + Supabase | Automatic, auto-renewing |

There is **no server to manage**: `git push` = deploy.

---

## 2. Free-tier comparison — which host to pick

| Host | Free allowance | Best for | Watch out |
|---|---|---|---|
| **Vercel (Hobby)** — *recommended* | Generous serverless + bandwidth for personal sites | Next.js 14 first-class support, previews on every PR, 1-click rollback | Hobby plan is for **personal/non-commercial** use. If the site ever earns money, move to Netlify/Cloudflare or pay Pro |
| **Netlify** | 100 GB bandwidth/month | Same GitHub-driven workflow, forms/email add-ons | Slightly less tight Next.js integration than Vercel |
| **Cloudflare Pages/Workers** | Very generous (unlimited requests) | Lowest cost long-term, edge speed | Next.js support needs the `OpenNext` adapter — more setup |
| **A free VPS (Oracle Cloud Always Free / Fly.io free allowance)** | Full VM | Total control | You must install Node, run a process manager, renew certs — not worth it for this project |

**Recommendation: Vercel.** This README and the rest of this guide assume Vercel;
the alternative section covers Netlify if Vercel's non-commercial clause matters to you.

---

## 3. Prerequisites

- A **GitHub** account — https://github.com
- A **Supabase** account (free, no credit card) — https://supabase.com
- A **Google** account for Google sign-in (a personal Gmail is fine) —
  Google Cloud Console: https://console.cloud.google.com
- A **Vercel** account (free, no credit card) — https://vercel.com
  (all three support "Continue with GitHub", so one login works everywhere)

---

## Step 1 — Put the code on GitHub

```bash
cd scholarpress
git add -A
git commit -m "Initial site"
git branch -M main
git remote add origin https://github.com/<you>/scholarpress.git   # if not set already
git push -u origin main
```

This repo already has a remote: `https://github.com/DizzyWeCode/scholarpress.git`.
If that's your repo, just `git push`.

> **Never commit `.env` or `.env.local`** — they are already in `.gitignore`.
> The `.env.example` file is the committed template that lists which variables exist.

---

## Step 2 — Create the Supabase project (free)

1. Sign in at https://supabase.com → **New project**.
   - **Plan:** Free.
   - Pick a project name (this becomes your reference ID, e.g. `yapnisvhvxfbmquqlnob`).
   - Save the **database password** somewhere safe (you only need it for direct DB access).
2. Wait ~2 minutes for provisioning.
3. **Build the schema:** left sidebar → **SQL Editor** → **New query** → paste the
   entire contents of `supabase/schema.sql` → **Run**.
   This creates all tables (`profiles`, `posts`, `papers`, `webinars`,
   `subscribers`, `page_views`, …) with **Row Level Security policies**.
4. **Optional sample content:** run `supabase/seed.sql` the same way (delete it from
   `/admin` later if you don't want it).
5. **Copy your credentials:** **Project Settings → API**:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

   (The `anon` key is safe to expose in the browser — RLS is what protects your data.
   Never put the `service_role` key in the app or in git.)

---

## Step 3 — Enable Google sign-in (and fix `redirect_uri_mismatch`)

1. **Supabase → Authentication → Providers → Google** → enable, then follow the
   guided link to create an OAuth client in Google Cloud Console:
   - **APIs & Services → Credentials → Create Credentials → OAuth client ID → Web application**
   - **Authorised JavaScript origins:** `http://localhost:3000` and, after deploy,
     `https://<your-site>.vercel.app`
   - **Authorised redirect URIs:** must include the Supabase callback:

     ```
     https://<PROJECT-REF>.supabase.co/auth/v1/callback
     ```

     For this project that is:

     ```
     https://yapnisvhvxfbmquqlnob.supabase.co/auth/v1/callback
     ```

     **This single line is the fix for Google's
     `Error 400: redirect_uri_mismatch`** — Google rejects any callback URL that is
     not listed here, and Supabase (not your site) is the party that receives the
     redirect.

2. **Supabase → Authentication → URL Configuration:**
   - **Site URL:** `https://<your-site>.vercel.app` (then your real domain later)
   - **Redirect URLs:** add all of these patterns:
     ```
     http://localhost:3000/**
     https://<your-site>.vercel.app/**
     https://<your-domain>/**
     ```
     The app's own OAuth code sends users to `<origin>/auth/callback`, so the
     wildcard entries are what keep login working after you change domains.

---

## Step 4 — Deploy to Vercel (free)

### Option A — GitHub integration (recommended)

1. Go to https://vercel.com/new → **Import** your `scholarpress` repository.
2. Framework preset is detected automatically (Next.js).
3. **Environment Variables** — add exactly these three:

   | Name | Value |
   |---|---|
   | `NEXT_PUBLIC_SUPABASE_URL` | `https://<PROJECT-REF>.supabase.co` |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | your `anon public` key |
   | `NEXT_PUBLIC_SITE_URL` | `https://<your-site>.vercel.app` |

4. **Deploy.** First build takes 1–3 minutes.
5. Every future `git push` to `main` auto-deploys; every pull request gets a
   preview URL you can share.

### Option B — Vercel CLI (no browser clicking)

```bash
npm i -g vercel
vercel login
vercel                       # first deploy (preview)
vercel --prod                # production deploy
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add NEXT_PUBLIC_SITE_URL
```

### After the first deploy

1. Open your live URL and confirm `/`, `/blog`, `/papers`, `/webinars` render.
2. Update `NEXT_PUBLIC_SITE_URL` in Vercel to the **final** URL
   (Settings → Environment Variables → edit → **Redeploy**).
   This value drives canonical URLs, `sitemap.xml` and Open Graph tags
   (`src/lib/site.ts` → `absoluteUrl()`).
3. Add the live URL to Supabase **Auth → URL Configuration** (Step 3) and to the
   Google client's **Authorised JavaScript origins**.

---

## Step 5 — Post-deploy checklist

- [ ] `/` loads with styling (if it's unstyled HTML, the build output is wrong — rebuild).
- [ ] `/login` → **Continue with Google** completes without
      `redirect_uri_mismatch`.
- [ ] `/login` → email magic link arrives and the link opens on the right domain.
- [ ] `https://<site>/sitemap.xml` and `/robots.txt` return 200 and use `https`.
- [ ] An article page shows correct Open Graph tags
      (check with https://www.opengraph.xyz or LinkedIn's post preview).
- [ ] Cookie banner: **Reject** → no `page_views` rows appear; **Allow** → rows appear
      (Supabase → Table Editor → `page_views`).
- [ ] Newsletter form: submit an address → row appears in `subscribers`.
- [ ] `npm run lint` and `npm run typecheck` pass locally (both should be green
      before you push).

---

## Step 6 — Become the site owner

Only an `owner` can open `/admin`.

1. Sign in on the live site once (Google or magic link).
2. Supabase → **SQL Editor**:

   ```sql
   update public.profiles set role = 'owner' where email = 'you@example.com';
   ```

3. Visit `/admin`. The owner-guarded layout now allows the studio: posts, papers,
   webinars, subscribers (CSV export), analytics, settings.

---

## Custom domains on a budget

**Free options**

- Your default `https://<project>.vercel.app` URL — permanent and fine for most uses.
- Free subdomain providers that support CNAME records (e.g. a subdomain of a domain
  you already own, configured through Vercel's DNS).

**Paid-but-cheap (~$7–15/year for a .com/.dev)**

1. Buy a domain (Cloudflare Registrar sells at-cost, no markup; Porkbun/Namecheap
   are cheap and simple).
2. Vercel → **Settings → Domains → Add** → choose one of:
   - **Use a subdomain I already own** (e.g. `www.yoursite.com`),
   - or apex domain (`yoursite.com`).
3. Vercel shows the exact DNS records (an `A` record or `CNAME`). Add them at your
   registrar. Propagation is usually < 1 hour, HTTPS is issued automatically.
4. **Update three places to the new domain:**
   - Vercel env var `NEXT_PUBLIC_SITE_URL`
   - Supabase **Auth → URL Configuration** (Site URL + Redirect URLs)
   - Google OAuth client (origins + no redirect change needed — the redirect stays
     on `*.supabase.co`)

---

## Alternative hosts (Netlify, Cloudflare, a VPS)

### Netlify (free, commercial use OK)

1. App → **Add new site → Import from Git** → pick the repo.
2. Build command `npm run build`, publish directory `.next` (the Netlify Next.js
   runtime detects this automatically).
3. Add the same three environment variables → Deploy.
4. Point the same Supabase/Google URL settings at your `*.netlify.app` domain.

### Cloudflare Pages

Full Next.js 14 SSR needs the OpenNext adapter (`@opennextjs/cloudflare`) — more
setup, and this project doesn't ship that config. Choose it only if you already
live in the Cloudflare ecosystem.

### Self-hosting (not recommended for a free goal)

`npm run build && npm run start` needs a machine running 24/7. Free VMs (Oracle
Cloud Always Free tier) work but require system updates, firewall rules, TLS
renewal and a process manager — you gain nothing for a site of this size.

---

## Costs, limits and when free stops being free

| Service | Free tier (approx.) | You'll need to pay when… |
|---|---|---|
| Vercel Hobby | Personal use, plenty of serverless hours + bandwidth for a low-traffic academic site | The site is commercial, or traffic consistently exceeds hobby limits |
| Supabase Free | 2 projects, ~500 MB database, ~5 GB egress, generous auth MAU | The database grows past ~500 MB or you need daily backups / point-in-time recovery |
| GitHub | Unlimited repos | You need team audit features |
| Domain | $0 with a subdomain | You want a custom domain (~$10/year) |

Numbers move — always re-check https://vercel.com/pricing and
https://supabase.com/pricing before relying on them.

**Typical trigger to upgrade:** a real custom domain + a few hundred daily
visitors + a database that outgrows 500 MB. All of that still fits comfortably in
free tiers for a personal academic site; the first paid thing is usually the domain.

---

## Troubleshooting

**`redirect_uri_mismatch` from Google**
Google Cloud Console → your OAuth client → **Authorised redirect URIs** must contain
`https://<PROJECT-REF>.supabase.co/auth/v1/callback` exactly (https, no trailing
slash). See Step 3.

**Login loops back to `/login?error=auth`**
Supabase → Authentication → URL Configuration → the production origin must be in
**Redirect URLs** (`https://<site>/**`). The callback exchanges the code on
`/auth/callback` and redirects to `origin + next` — if that origin isn't allowed,
Supabase rejects the exchange.

**"Missing NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY"**
The variable isn't set in that environment (Vercel preview vs production, or your
local `.env.local` was wiped). `NEXT_PUBLIC_*` values are inlined at **build**
time — after changing one in Vercel you must **redeploy**, not just restart.

**Styles missing / `className` not applying on first paint**
`npm run build` must succeed locally first. Check the Vercel build log for a
compile error — a failed build serves a stale deployment.

**Blank page on a route that worked locally**
Run `npm run build` locally and read the route table: routes that read
`searchParams` (e.g. `/blog?tag=…`) are **dynamic** and cost one serverless
invocation per visit — expected and free-tier friendly at this scale.

**Email magic links point at localhost in production**
`NEXT_PUBLIC_SITE_URL` or Supabase's Site URL is still `http://localhost:3000`.
Update both and redeploy.

**Content not showing after editing in `/admin`**
Some public routes cache. Hard-refresh; if it persists, wait for the ISR window or
redeploy from the Vercel dashboard.

---

## Going further (still free)

- **Automatic SEO checks:** add a GitHub Action that runs
  `npm run lint && npm run typecheck && npm run build` on every push (free for
  public repos).
- **Newsletter sending:** export `subscribers` as CSV from `/admin/subscribers`
  and import into Buttondown/Resend's free tier, or trigger a Supabase Edge
  Function on `posts` insert (free allowance covers a monthly newsletter).
- **Backups:** Supabase free keeps daily backups for 7 days; additionally run
  `supabase db dump` on a schedule and store the file in a private GitHub repo or
  your own storage.
- **Custom email domain for magic links:** Supabase free lets you set the sender
  name/address for transactional auth emails — verify a domain you own to avoid
  spam-foldered login links.

---

*Guide maintained alongside the code — if the deployment steps change (new env
var, new auth route), update this file in the same commit.*
