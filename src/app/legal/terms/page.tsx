import type { Metadata } from "next";
import { SITE } from "@/lib/site";

export const metadata: Metadata = { title: "Terms of Service" };

const LAST_UPDATED = "6 October 2026";

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-5 py-20 sm:px-8">
      <p className="text-xs uppercase tracking-[0.25em] text-ink-4">Legal</p>
      <h1 className="mt-4 font-serif text-4xl tracking-tight text-ink">
        Terms of Service
      </h1>
      <p className="mt-3 text-sm text-ink-4">Last updated: {LAST_UPDATED}</p>

      <div className="article-body mt-10">
        <h2>1. What this site is</h2>
        <p>
          This website is the personal academic publishing platform of{" "}
          {SITE.name} (&ldquo;the Owner&rdquo;). It provides access to research
          papers, essays, webinar announcements, and a newsletter subscription
          service (collectively, &ldquo;the Service&rdquo;).
        </p>

        <h2>2. Accounts and subscriptions</h2>
        <p>
          You may subscribe to the newsletter with an email address, or sign in
          using Google OAuth or a one-time email link. You are responsible for
          the accuracy of the email address you provide. You may unsubscribe at
          any time from your account page, from the unsubscribe link in any
          newsletter email, or by contacting the Owner.
        </p>

        <h2>3. Acceptable use</h2>
        <p>You agree not to:</p>
        <ul>
          <li>misrepresent your identity or affiliation when registering for webinars;</li>
          <li>scrape, harvest, or bulk-download subscriber data or site content beyond normal personal use;</li>
          <li>attempt to interfere with the Service&rsquo;s infrastructure or security;</li>
          <li>use the Service for any unlawful purpose.</li>
        </ul>

        <h2>4. Intellectual property</h2>
        <p>
          Essays, articles, and original materials on this site are © {SITE.name}{" "}
          unless stated otherwise. Research papers remain subject to the
          licences of their respective publishers — the DOI link on each paper
          leads to the publisher&rsquo;s terms. Third-party images are credited
          alongside the image or in the site footer and remain the property of
          their creators, used under their stated licences.
        </p>
        <p>
          You may share links to any public page and quote brief excerpts with
          attribution. Systematic republication requires written permission.
        </p>

        <h2>5. Academic integrity</h2>
        <p>
          Content on this site is provided for informational and scholarly
          discussion. It does not constitute professional advice. Where an
          article cites sources, they are listed in the References section at
          the end of that article.
        </p>

        <h2>6. Third-party services</h2>
        <p>
          The Service relies on third-party providers, including Supabase
          (database and authentication), Google (sign-in), and Vercel or
          equivalent (hosting). Your use of Google sign-in is additionally
          governed by Google&rsquo;s own terms and privacy policy. Webinar
          registration links may lead to third-party platforms with their own
          terms.
        </p>

        <h2>7. Availability and changes</h2>
        <p>
          The Service is provided &ldquo;as is&rdquo; without warranties of any
          kind. The Owner may modify, suspend, or discontinue any part of the
          Service, and may update these Terms with notice on this page.
          Continued use after changes constitutes acceptance.
        </p>

        <h2>8. Limitation of liability</h2>
        <p>
          To the maximum extent permitted by law, the Owner is not liable for
          any indirect, incidental, or consequential damages arising from your
          use of the Service.
        </p>

        <h2>9. Contact</h2>
        <p>
          Questions about these Terms:{" "}
          <a href={`mailto:${SITE.email}`}>{SITE.email}</a>.
        </p>
      </div>
    </div>
  );
}
