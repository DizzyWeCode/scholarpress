import type { Metadata } from "next";
import { SITE } from "@/lib/site";
import { Reveal } from "@/components/reveal";
import { NewsletterForm } from "@/components/newsletter-form";

export const metadata: Metadata = {
  title: "About",
  description: `About ${SITE.name} — ${SITE.tagline}.`,
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-5 py-20 sm:px-8">
      <Reveal>
        <p className="text-xs uppercase tracking-[0.25em] text-ink-4">About</p>
        <h1 className="mt-4 font-serif text-4xl tracking-tight text-ink sm:text-5xl">
          {SITE.name}
        </h1>
        <p className="mt-3 text-lg text-ink-3">{SITE.tagline}</p>
      </Reveal>

      <Reveal delay={100}>
        <div className="article-body mt-10">
          <p>
            I am a researcher working at the intersection of information
            systems and digital society. My work examines how digital
            platforms reshape institutions — how knowledge is produced,
            shared, and governed in networked environments.
          </p>
          <p>
            This site is my academic home on the web: a place to publish
            peer-reviewed research alongside less formal writing, and to open
            up my work through public webinars and talks.
          </p>
          <p>
            <em>
              This is placeholder biography text — the site owner can replace
              it from src/lib/site.ts and this page.
            </em>
          </p>
        </div>
      </Reveal>

      <Reveal delay={160}>
        <div className="mt-12 border-t border-line pt-10">
          <h2 className="text-xs uppercase tracking-[0.25em] text-ink-4">
            Contact
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-ink-2">
            For collaborations, speaking invitations, or press enquiries:{" "}
            <a
              href={`mailto:${SITE.email}`}
              className="underline underline-offset-2 transition-colors hover:text-ink"
            >
              {SITE.email}
            </a>
          </p>
          <div className="mt-8">
            <NewsletterForm />
          </div>
        </div>
      </Reveal>
    </div>
  );
}
