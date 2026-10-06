import type { Metadata } from "next";
import { SITE } from "@/lib/site";

export const metadata: Metadata = { title: "Cookie Policy" };

const LAST_UPDATED = "6 October 2026";

export default function CookiesPage() {
  return (
    <div className="mx-auto max-w-3xl px-5 py-20 sm:px-8">
      <p className="text-xs uppercase tracking-[0.25em] text-ink-4">Legal</p>
      <h1 className="mt-4 font-serif text-4xl tracking-tight text-ink">
        Cookie Policy
      </h1>
      <p className="mt-3 text-sm text-ink-4">Last updated: {LAST_UPDATED}</p>

      <div className="article-body mt-10">
        <h2>1. Cookies this site uses</h2>
        <p>This site uses two categories:</p>
        <ul>
          <li>
            <strong>Strictly necessary (always on).</strong> Authentication
            session cookies set by Supabase Auth (names beginning with{" "}
            <code>sb-</code>). These keep you signed in and protect the
            sign-in flow. They cannot be disabled while using sign-in
            features, and they are not used for tracking.
          </li>
          <li>
            <strong>Analytics (opt-in only).</strong> If you click
            &ldquo;Allow&rdquo; on the cookie banner, your consent choice is
            stored in your browser&rsquo;s local storage (
            <code>sp-cookie-consent</code>) and page-view events are sent to
            the site&rsquo;s own analytics table. No third-party advertising
            or cross-site tracking cookies are used.
          </li>
        </ul>

        <h2>2. Managing your choice</h2>
        <p>
          You can change your consent at any time by clearing this
          browser&rsquo;s local storage for this site and reloading — the
          banner will reappear. Choosing &ldquo;Reject&rdquo; stops all
          analytics collection immediately; page views are simply never sent.
        </p>

        <h2>3. Third-party cookies</h2>
        <p>
          When you sign in with Google, Google may set its own cookies as part
          of that flow; these are governed by Google&rsquo;s privacy policy.
          Webinar registration and recording links lead to external platforms
          that may set their own cookies.
        </p>

        <h2>4. Questions</h2>
        <p>
          Contact <a href={`mailto:${SITE.email}`}>{SITE.email}</a> with any
          questions about cookies on this site.
        </p>
      </div>
    </div>
  );
}
