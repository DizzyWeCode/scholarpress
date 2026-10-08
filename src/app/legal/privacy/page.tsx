import type { Metadata } from "next";
import { SITE } from "@/lib/site";

export const metadata: Metadata = { title: "Privacy Policy" };

const LAST_UPDATED = "6 October 2026";

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-5 py-20 sm:px-8">
      <p className="text-xs uppercase tracking-[0.25em] text-ink-4">Legal</p>
      <h1 className="mt-4 font-serif text-4xl tracking-tight text-ink">
        Privacy Policy
      </h1>
      <p className="mt-3 text-sm text-ink-4">Last updated: {LAST_UPDATED}</p>

      <div className="article-body mt-10">
        <p>
          This policy describes what data this site collects, why, and the
          control you have over it. The short version: we collect the minimum
          needed to run a newsletter, reader accounts, and readership
          analytics — nothing is sold, ever.
        </p>

        <h2>1. Data we collect</h2>
        <ul>
          <li>
            <strong>Account data.</strong> If you sign in with Google or email,
            we store your email address, display name, and profile picture URL
            as provided by the sign-in provider.
          </li>
          <li>
            <strong>Subscription data.</strong> Your email address and how you
            subscribed (newsletter form, account page).
          </li>
          <li>
            <strong>Analytics data — only with your consent.</strong> If you
            accept cookies, we record page views: the page path, the referring
            website&rsquo;s domain, and your browser&rsquo;s user-agent string.
            We do <em>not</em> record IP addresses, fingerprints, or precise
            locations.
          </li>
        </ul>

        <h2>2. How we use it</h2>
        <ul>
          <li>To send you essays, papers, and webinar announcements you subscribed to.</li>
          <li>To authenticate your account.</li>
          <li>To understand aggregate readership (which articles are read, where readers arrive from) so the Owner can improve the content.</li>
        </ul>

        <h2>3. Where data lives</h2>
        <p>
          Data is stored in a Supabase-hosted PostgreSQL database with row-level
          security enabled. Authentication is handled by Supabase Auth and
          Google OAuth. Hosting is provided by Vercel (or an equivalent static
          host). These providers process data under their own privacy terms.
        </p>

        <h2>4. What we never do</h2>
        <ul>
          <li>Sell or rent your personal data.</li>
          <li>Share your email with third parties for their marketing.</li>
          <li>Track you across other websites.</li>
        </ul>

        <h2>5. Your rights</h2>
        <p>
          You may unsubscribe at any time from your account page, or by using
          the unsubscribe link at the bottom of any newsletter email. You may
          request a copy or deletion of your data by emailing{" "}
          <a href={`mailto:${SITE.email}`}>{SITE.email}</a>. Deletion removes
          your profile and subscription record; anonymised aggregate analytics
          may be retained. If you are in the EEA/UK, you additionally have the
          right to lodge a complaint with your supervisory authority.
        </p>

        <h2>6. Retention</h2>
        <p>
          Account and subscription records are kept until you unsubscribe or
          request deletion. Page-view records are kept for up to 24 months and
          then deleted or aggregated.
        </p>

        <h2>7. Changes</h2>
        <p>
          Changes to this policy will be posted on this page with an updated
          date. Material changes will be announced to subscribers by email.
        </p>
      </div>
    </div>
  );
}
