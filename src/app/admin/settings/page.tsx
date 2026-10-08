import { SITE, isSiteUrlConfigured } from "@/lib/site";

export const dynamic = "force-dynamic";

const siteUrlConfigured = isSiteUrlConfigured();

export default function AdminSettingsPage() {
  return (
    <div>
      <h1 className="font-serif text-3xl tracking-tight text-ink">Settings</h1>

      <div className="mt-8 space-y-8">
        {!siteUrlConfigured ? (
          <section role="alert" className="border-l-4 border-amber-600 bg-paper-2 p-6" style={{ borderRadius: 7 }}>
            <h2 className="text-sm font-medium text-ink">Production domain is not configured</h2>
            <p className="mt-2 text-sm leading-relaxed text-ink-3">
              <code className="rounded bg-paper px-1.5 py-0.5 text-xs">NEXT_PUBLIC_SITE_URL</code> is
              missing, so share links, canonical URLs, sitemap, Open Graph tags, and emails fall
              back to a safe production default instead of localhost. Set it to your canonical
              domain (e.g. <code>https://dr-fraction.me</code>) in Vercel → redeploy.
            </p>
          </section>
        ) : null}

        <section className="border border-line p-6" style={{ borderRadius: 7 }}>
          <h2 className="text-xs uppercase tracking-widest text-ink-4">
            Launch checklist
          </h2>
          <ul className="mt-4 space-y-2 text-sm text-ink-2">
            <li>☐ Custom domain attached in Vercel (e.g. dr-fraction.me)</li>
            <li>☐ <code>NEXT_PUBLIC_SITE_URL</code> set to the canonical https domain — {siteUrlConfigured ? "looks set ✓" : "missing ⚠"}</li>
            <li>☐ Supabase Auth → URL Configuration: Site URL + redirect URLs include the custom domain</li>
            <li>☐ <code>/sitemap.xml</code> + <code>/robots.txt</code> return 200 on the custom domain</li>
            <li>☐ Share an article — link and OG image use the custom domain, not localhost</li>
            <li>☐ Replace <code>/covers/field-notes.png</code> hero + portrait slots with real photos (1200×630 OG default at <code>/covers/default-og.png</code>)</li>
            <li>☐ Run the new migration: <code>supabase/migrations/2026-10-07-account-bookmarks-avatars.sql</code> (bookmarks, profile fields, avatars bucket)</li>
          </ul>
        </section>
        <section className="border border-line p-6" style={{ borderRadius: 7 }}>
          <h2 className="text-xs uppercase tracking-widest text-ink-4">
            Site identity
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-ink-2">
            Name, tagline, affiliation, contact email, and scholarly profile
            links live in one file:{" "}
            <code className="rounded bg-paper-2 px-1.5 py-0.5 text-xs">
              src/lib/site.ts
            </code>
            . Edit it, redeploy, and the whole site rebrands — masthead,
            metadata, structured data, and legal pages included.
          </p>
          <dl className="mt-5 space-y-2 text-sm">
            <div className="flex gap-4">
              <dt className="w-28 text-ink-4">Name</dt>
              <dd className="text-ink">{SITE.name}</dd>
            </div>
            <div className="flex gap-4">
              <dt className="w-28 text-ink-4">Tagline</dt>
              <dd className="text-ink">{SITE.tagline}</dd>
            </div>
            <div className="flex gap-4">
              <dt className="w-28 text-ink-4">Email</dt>
              <dd className="text-ink">{SITE.email}</dd>
            </div>
          </dl>
        </section>

        <section className="border border-line p-6" style={{ borderRadius: 7 }}>
          <h2 className="text-xs uppercase tracking-widest text-ink-4">
            Ownership
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-ink-2">
            The owner is whoever has{" "}
            <code className="rounded bg-paper-2 px-1.5 py-0.5 text-xs">
              role = &apos;owner&apos;
            </code>{" "}
            in the <code className="rounded bg-paper-2 px-1.5 py-0.5 text-xs">profiles</code> table.
            After your first sign-in, run in the Supabase SQL editor:
          </p>
          <pre className="mt-4 overflow-x-auto rounded bg-ink p-4 text-xs leading-relaxed text-paper">
{`update public.profiles
set role = 'owner'
where email = 'you@example.com';`}
          </pre>
        </section>

        <section className="border border-line p-6" style={{ borderRadius: 7 }}>
          <h2 className="text-xs uppercase tracking-widest text-ink-4">
            Email notifications
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-ink-2">
            Subscriptions are stored in the{" "}
            <code className="rounded bg-paper-2 px-1.5 py-0.5 text-xs">subscribers</code>{" "}
            table and exportable as CSV (Subscribers → Export CSV). To send
            announcements, plug any free-tier email service (e.g. Resend,
            Buttondown) into a Supabase Edge Function or your own workflow —
            see README.md.
          </p>
        </section>
      </div>
    </div>
  );
}
