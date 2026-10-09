import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { SITE } from "@/lib/site";
import { getSupabaseAnon } from "@/lib/supabase/public";
import { Reveal } from "@/components/reveal";
import { PostRow } from "@/components/post-card";
import { PaperCard } from "@/components/paper-card";
import { WebinarCard } from "@/components/webinar-card";
import { NewsletterForm } from "@/components/newsletter-form";
import type { Post, Paper, Webinar } from "@/lib/types";
import { isWebinarPast } from "@/lib/utils";
import { ArrowRight } from "lucide-react";

export const revalidate = 60;

export const metadata: Metadata = {
  title: SITE.siteTitle,
};

export default async function HomePage() {
  const supabase = getSupabaseAnon();

  let posts: Post[] = [];
  let papers: Paper[] = [];
  let webinars: Webinar[] = [];

  if (supabase) {
    const [postsRes, papersRes, webinarsRes] = await Promise.all([
      supabase
        .from("posts")
        .select("id, slug, title, excerpt, tags, status, published_at, reading_time_minutes, updated_at, cover_image_url")
        .eq("status", "published")
        .order("published_at", { ascending: false })
        .limit(4),
      supabase
        .from("papers")
        .select("id, title, abstract, authors, venue, year, doi, url, pdf_url, tags, featured, status, created_at")
        .eq("status", "published")
        .order("featured", { ascending: false })
        .order("year", { ascending: false })
        .limit(3),
      supabase
        .from("webinars")
        .select("id, title, description, starts_at, duration_minutes, platform, registration_url, recording_url, status, created_at")
        .eq("status", "upcoming")
        .order("starts_at", { ascending: true })
        .limit(3),
    ]);
    posts = (postsRes.data ?? []) as Post[];
    papers = (papersRes.data ?? []) as Paper[];
    webinars = ((webinarsRes.data ?? []) as Webinar[]).filter((webinar) => !isWebinarPast(webinar));
  }

  const [featured, ...rest] = posts;

  return (
    <>
      {/* Hero — editorial masthead, ink on paper */}
      <section className="border-b border-line">
        <div className="mx-auto grid max-w-6xl gap-10 px-5 pb-24 pt-28 sm:px-8 sm:pt-36 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
          <div>
          <Reveal>
            <p className="text-xs uppercase tracking-[0.25em] text-ink-4">
              {SITE.affiliation}
            </p>
          </Reveal>
          <Reveal delay={90}>
            <h1 className="mt-6 max-w-4xl font-serif text-5xl leading-[1.05] tracking-[-0.02em] text-ink sm:text-7xl">
              {SITE.tagline}
            </h1>
          </Reveal>
          <Reveal delay={180}>
            <p className="mt-8 max-w-xl text-base leading-relaxed text-ink-3">
              {SITE.description}
            </p>
          </Reveal>
          <Reveal delay={260}>
            <div className="mt-10 flex flex-wrap gap-4">
              <Link
                href="/papers"
                className="rounded-full bg-ink px-6 py-2.5 text-sm text-paper transition-opacity hover:opacity-80"
              >
                Read the research
              </Link>
              <Link
                href="/about"
                className="rounded-full border border-ink px-6 py-2.5 text-sm text-ink transition-colors hover:bg-ink hover:text-paper"
              >
                About {SITE.name.split(" ")[1] ?? "me"}
              </Link>
            </div>
          </Reveal>
          </div>
          <Reveal delay={200}>
            <figure className="relative aspect-[4/3] overflow-hidden rounded border border-line bg-paper-2">
              <Image
                src={SITE.images.hero.src}
                alt={SITE.images.hero.alt}
                fill
                sizes="(max-width: 1024px) 100vw, 480px"
                className="object-cover"
                priority
              />
            </figure>
            <figcaption className="mt-2 text-xs text-ink-4">
              Replace <code>/covers/field-notes.png</code> with a portrait or lab photo — see README image slots.
            </figcaption>
          </Reveal>
        </div>
      </section>

      {/* Featured article + recent articles */}
      <section className="mx-auto max-w-6xl px-5 py-24 sm:px-8">
        <Reveal>
          <div className="flex items-baseline justify-between">
            <h2 className="text-xs uppercase tracking-[0.25em] text-ink-4">
              Articles
            </h2>
            <Link
              href="/blog"
              className="inline-flex items-center gap-1.5 text-sm text-ink-3 transition-colors hover:text-ink"
            >
              All articles <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </Reveal>

        {featured ? (
          <Reveal delay={100}>
            <Link
              href={`/blog/${featured.slug}`}
              className="group mt-10 block border-y border-ink py-12"
            >
              <p className="text-xs uppercase tracking-widest text-ink-4">
                Featured essay
              </p>
              {featured.cover_image_url ? (
                <span className="relative mt-6 block aspect-[21/9] w-full overflow-hidden rounded bg-paper-2">
                  <Image
                    src={featured.cover_image_url}
                    alt=""
                    fill
                    sizes="(max-width: 1024px) 100vw, 1024px"
                    className="object-cover"
                  />
                </span>
              ) : null}
              <h3 className="mt-4 max-w-3xl font-serif text-3xl leading-tight tracking-tight text-ink transition-opacity group-hover:opacity-60 sm:text-5xl">
                {featured.title}
              </h3>
              {featured.excerpt ? (
                <p className="mt-5 max-w-2xl text-base leading-relaxed text-ink-3">
                  {featured.excerpt}
                </p>
              ) : null}
            </Link>
          </Reveal>
        ) : (
          <p className="mt-10 border-t border-line py-12 text-sm text-ink-3">
            The first essays are on their way. Subscribe below to be notified.
          </p>
        )}

        {rest.map((post, i) => (
          <Reveal key={post.id} delay={i * 80}>
            <PostRow post={post} />
          </Reveal>
        ))}
      </section>

      {/* Webinars — dark ink section for contrast */}
      {webinars.length > 0 && (
        <section className="bg-ink text-paper">
          <div className="mx-auto max-w-6xl px-5 py-24 sm:px-8">
            <Reveal>
              <div className="flex items-baseline justify-between">
                <h2 className="text-xs uppercase tracking-[0.25em] text-paper/60">
                  Upcoming webinars
                </h2>
                <Link
                  href="/webinars"
                  className="inline-flex items-center gap-1.5 text-sm text-paper/60 transition-colors hover:text-paper"
                >
                  All webinars <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </Reveal>
            <div
              className={`mt-10 grid gap-6 ${
                webinars.length >= 3
                  ? "md:grid-cols-3"
                  : webinars.length === 2
                    ? "md:grid-cols-2"
                    : "md:max-w-lg"
              }`}
            >
              {webinars.map((w, i) => (
                <Reveal key={w.id} delay={i * 90}>
                  <WebinarCard webinar={w} dark />
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Selected research */}
      <section className="mx-auto max-w-6xl px-5 py-24 sm:px-8">
        <Reveal>
          <div className="flex items-baseline justify-between">
            <h2 className="text-xs uppercase tracking-[0.25em] text-ink-4">
              Selected research
            </h2>
            <Link
              href="/papers"
              className="inline-flex items-center gap-1.5 text-sm text-ink-3 transition-colors hover:text-ink"
            >
              Full archive <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </Reveal>
        <div className="mt-6">
          {papers.length > 0 ? (
            papers.map((p, i) => (
              <Reveal key={p.id} delay={i * 80}>
                <PaperCard paper={p} />
              </Reveal>
            ))
          ) : (
            <p className="border-t border-line py-12 text-sm text-ink-3">
              Publications will appear here as they are released.
            </p>
          )}
        </div>
      </section>

      {/* About teaser — short hook, full story on /about */}
      <section className="border-t border-line">
        <div className="mx-auto max-w-6xl px-5 py-24 sm:px-8">
          <Reveal>
            <div className="max-w-2xl">
              <h2 className="text-xs uppercase tracking-[0.25em] text-ink-4">
                About
              </h2>
              <p className="mt-6 font-serif text-3xl leading-snug tracking-tight text-ink sm:text-4xl">
                Twenty years chasing a moving target: the malaria parasite.
              </p>
              <p className="mt-5 text-base leading-relaxed text-ink-3">
                From the lab bench at the Blantyre Malaria Project to lecture
                halls in Blantyre, Cape Town, and Glasgow — clinician,
                pharmacologist, and bioethicist working to keep antimalarial
                drugs effective.
              </p>
              <Link
                href="/about"
                className="mt-7 inline-flex items-center gap-1.5 text-sm text-ink-3 transition-colors hover:text-ink"
              >
                Read the full story <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Newsletter */}
      <section className="border-t border-line">
        <div className="mx-auto max-w-6xl px-5 py-24 sm:px-8">
          <Reveal>
            <div className="max-w-2xl">
              <h2 className="font-serif text-3xl tracking-tight text-ink sm:text-4xl">
                Follow the work
              </h2>
              <p className="mt-4 text-base leading-relaxed text-ink-3">
                Occasional, considered emails: new essays, fresh publications,
                and webinar announcements. No noise, unsubscribe anytime.
              </p>
              <div className="mt-8">
                <NewsletterForm />
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
