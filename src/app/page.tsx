import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { ArrowRight, BookOpen, CalendarDays, Compass, FileText } from "lucide-react";
import { SITE } from "@/lib/site";
import { getSupabaseAnon } from "@/lib/supabase/public";
import { Reveal } from "@/components/reveal";
import { PostRow } from "@/components/post-card";
import { PaperCard } from "@/components/paper-card";
import { WebinarCard } from "@/components/webinar-card";
import { NewsletterForm } from "@/components/newsletter-form";
import type { Post, Paper, Webinar } from "@/lib/types";
import { isWebinarPast } from "@/lib/utils";

export const revalidate = 60;

export const metadata: Metadata = {
  title: SITE.siteTitle,
  description: SITE.platformDescription,
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
        .or(`status.eq.published,and(status.eq.scheduled,published_at.lte.${new Date().toISOString()})`)
        .order("published_at", { ascending: false })
        .limit(6),
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
        .in("status", ["upcoming", "past"])
        .order("starts_at", { ascending: true })
        .limit(3),
    ]);
    posts = (postsRes.data ?? []) as Post[];
    papers = (papersRes.data ?? []) as Paper[];
    webinars = ((webinarsRes.data ?? []) as Webinar[]).filter((webinar) => !isWebinarPast(webinar));
  }

  const [featured, ...latest] = posts;
  const startHerePosts = posts.slice(0, 3);
  const primaryPaper = papers[0];
  const primaryWebinar = webinars[0];

  return (
    <>
      <section className="border-b border-line">
        <div className="mx-auto grid max-w-6xl gap-12 px-5 pb-20 pt-20 sm:px-8 sm:pb-28 sm:pt-28 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <Reveal>
              <p className="text-xs uppercase tracking-[0.25em] text-ink-4">{SITE.name}</p>
            </Reveal>
            <Reveal delay={90}>
              <h1 className="mt-6 max-w-3xl font-serif text-5xl leading-[1.04] tracking-[-0.025em] text-ink sm:text-7xl">
                {SITE.platformPromise}
              </h1>
            </Reveal>
            <Reveal delay={180}>
              <p className="mt-7 max-w-xl text-lg leading-relaxed text-ink-3">
                {SITE.platformDescription}
              </p>
            </Reveal>
            <Reveal delay={240}>
              <div className="mt-9 flex flex-wrap gap-3">
                <Link href="#start-here" className="rounded-full bg-ink px-6 py-2.5 text-sm text-paper transition-opacity hover:opacity-80">
                  Start here
                </Link>
                <Link href="/about" className="rounded-full border border-ink px-6 py-2.5 text-sm text-ink transition-colors hover:bg-ink hover:text-paper">
                  About Dr Fraction
                </Link>
              </div>
            </Reveal>
            <Reveal delay={300}>
              <div className="mt-9 flex flex-wrap gap-x-5 gap-y-2 text-sm text-ink-3">
                <Link href="/blog" className="underline underline-offset-4 hover:text-ink">Writing</Link>
                <Link href="/papers" className="underline underline-offset-4 hover:text-ink">Research</Link>
                <Link href="/webinars" className="underline underline-offset-4 hover:text-ink">Events</Link>
              </div>
            </Reveal>
          </div>
          <Reveal delay={160}>
            <figure>
              <div className="relative aspect-[4/3] overflow-hidden rounded border border-line bg-paper-2">
                <Image src={SITE.images.hero.src} alt={SITE.images.hero.alt} fill sizes="(max-width: 1024px) 100vw, 480px" className="object-cover" priority />
              </div>
              <figcaption className="mt-3 max-w-sm text-xs leading-relaxed text-ink-4">
                A personal platform for work in progress, published work, and the questions between them.
              </figcaption>
            </figure>
          </Reveal>
        </div>
      </section>

      <section id="start-here" className="mx-auto max-w-6xl scroll-mt-20 px-5 py-20 sm:px-8 sm:py-24">
        <Reveal>
          <div className="flex items-end justify-between gap-6">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-ink-4">A way in</p>
              <h2 className="mt-4 font-serif text-4xl tracking-tight text-ink sm:text-5xl">Start here</h2>
            </div>
            <Compass className="hidden h-7 w-7 text-ink-4 sm:block" aria-hidden />
          </div>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-ink-3">
            A small selection for new readers: current writing, published research, and the conversations around the work.
          </p>
        </Reveal>
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {startHerePosts.map((post, index) => (
            <Reveal key={post.id} delay={index * 80}>
              <Link href={`/blog/${post.slug}`} className="group block h-full rounded border border-line p-6 transition-colors hover:border-ink">
                <p className="text-xs uppercase tracking-widest text-ink-4">Writing</p>
                <h3 className="mt-8 font-serif text-2xl leading-tight tracking-tight text-ink group-hover:opacity-65">{post.title}</h3>
                {post.excerpt ? <p className="mt-4 line-clamp-3 text-sm leading-relaxed text-ink-3">{post.excerpt}</p> : null}
                <span className="mt-8 inline-flex items-center gap-1.5 text-sm text-ink-3">Read the piece <ArrowRight className="h-3.5 w-3.5" aria-hidden /></span>
              </Link>
            </Reveal>
          ))}
          {startHerePosts.length === 0 ? (
            <Reveal><div className="rounded border border-line p-6 text-sm leading-relaxed text-ink-3 md:col-span-3">The first selection is taking shape. Follow the newsletter to hear when new work is published.</div></Reveal>
          ) : null}
          {primaryPaper ? (
            <Reveal delay={240}>
              <Link href={`/papers/${primaryPaper.id}`} className="group block h-full rounded border border-line p-6 transition-colors hover:border-ink">
                <p className="text-xs uppercase tracking-widest text-ink-4">Research</p>
                <h3 className="mt-8 font-serif text-2xl leading-tight tracking-tight text-ink group-hover:opacity-65">{primaryPaper.title}</h3>
                <p className="mt-4 text-sm leading-relaxed text-ink-3">{primaryPaper.abstract ?? "A selected research output from the archive."}</p>
                <span className="mt-8 inline-flex items-center gap-1.5 text-sm text-ink-3">View research <ArrowRight className="h-3.5 w-3.5" aria-hidden /></span>
              </Link>
            </Reveal>
          ) : null}
          {primaryWebinar ? (
            <Reveal delay={300}>
              <Link href="/webinars" className="group block h-full rounded border border-line p-6 transition-colors hover:border-ink">
                <p className="text-xs uppercase tracking-widest text-ink-4">Event</p>
                <h3 className="mt-8 font-serif text-2xl leading-tight tracking-tight text-ink group-hover:opacity-65">{primaryWebinar.title}</h3>
                <p className="mt-4 text-sm leading-relaxed text-ink-3">Join the next conversation or explore the recordings archive.</p>
                <span className="mt-8 inline-flex items-center gap-1.5 text-sm text-ink-3">View events <ArrowRight className="h-3.5 w-3.5" aria-hidden /></span>
              </Link>
            </Reveal>
          ) : null}
        </div>
      </section>

      {featured ? (
        <section className="border-y border-line bg-paper-2">
          <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8 sm:py-24">
            <Reveal>
              <div className="flex items-baseline justify-between gap-6">
                <div>
                  <p className="text-xs uppercase tracking-[0.25em] text-ink-4">Current writing</p>
                  <h2 className="mt-4 font-serif text-4xl tracking-tight text-ink sm:text-5xl">The latest piece</h2>
                </div>
                <Link href="/blog" className="inline-flex items-center gap-1.5 text-sm text-ink-3 hover:text-ink">All writing <ArrowRight className="h-3.5 w-3.5" aria-hidden /></Link>
              </div>
            </Reveal>
            <Reveal delay={100}>
              <Link href={`/blog/${featured.slug}`} className="group mt-10 block border-y border-ink py-10">
                {featured.cover_image_url ? <span className="relative mt-0 block aspect-[21/9] w-full overflow-hidden rounded bg-paper"><Image src={featured.cover_image_url} alt="" fill sizes="(max-width: 1024px) 100vw, 1024px" className="object-cover" /></span> : null}
                <div className="mt-6 max-w-3xl">
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs uppercase tracking-widest text-ink-4">
                    <span>Featured essay</span>
                    <span>{featured.reading_time_minutes ?? 1} min read</span>
                  </div>
                  <h3 className="mt-4 font-serif text-4xl leading-tight tracking-tight text-ink transition-opacity group-hover:opacity-60 sm:text-6xl">{featured.title}</h3>
                  {featured.excerpt ? <p className="mt-5 max-w-2xl text-lg leading-relaxed text-ink-3">{featured.excerpt}</p> : null}
                </div>
              </Link>
            </Reveal>
            <div className="mt-2">{latest.slice(0, 3).map((post, i) => <Reveal key={post.id} delay={i * 70}><PostRow post={post} /></Reveal>)}</div>
          </div>
        </section>
      ) : null}

      {webinars.length > 0 ? (
        <section className="bg-ink text-paper">
          <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8 sm:py-24">
            <Reveal>
              <div className="flex items-end justify-between gap-6">
                <div>
                  <p className="text-xs uppercase tracking-[0.25em] text-paper/60">In public</p>
                  <h2 className="mt-4 font-serif text-4xl tracking-tight sm:text-5xl">Events and conversations</h2>
                </div>
                <CalendarDays className="hidden h-7 w-7 text-paper/50 sm:block" aria-hidden />
              </div>
              <p className="mt-5 max-w-2xl text-base leading-relaxed text-paper/65">Talks, webinars, launches, and public conversations around the work.</p>
            </Reveal>
            <div className="mt-10 grid gap-6 md:grid-cols-3">{webinars.map((w, i) => <Reveal key={w.id} delay={i * 90}><WebinarCard webinar={w} dark /></Reveal>)}</div>
          </div>
        </section>
      ) : null}

      <section className="mx-auto max-w-6xl px-5 py-20 sm:px-8 sm:py-24">
        <Reveal>
          <div className="flex items-end justify-between gap-6">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-ink-4">Research</p>
              <h2 className="mt-4 font-serif text-4xl tracking-tight text-ink sm:text-5xl">Selected publications</h2>
            </div>
            <BookOpen className="hidden h-7 w-7 text-ink-4 sm:block" aria-hidden />
          </div>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-ink-3">Peer-reviewed work, methods, and findings. The research archive is one part of a wider publishing practice.</p>
        </Reveal>
        <div className="mt-8">{papers.length > 0 ? papers.map((paper, i) => <Reveal key={paper.id} delay={i * 80}><PaperCard paper={paper} /></Reveal>) : <p className="border-t border-line py-12 text-sm text-ink-3">Publications will appear here as they are released.</p>}</div>
      </section>

      <section className="border-t border-line bg-paper-2">
        <div className="mx-auto grid max-w-6xl gap-10 px-5 py-20 sm:px-8 sm:py-24 lg:grid-cols-[1fr_1.1fr] lg:items-center">
          <Reveal>
            <p className="text-xs uppercase tracking-[0.25em] text-ink-4">The person behind the work</p>
            <h2 className="mt-5 max-w-xl font-serif text-4xl leading-tight tracking-tight text-ink sm:text-5xl">A career in research, teaching, and public conversation.</h2>
          </Reveal>
          <Reveal delay={100}>
            <p className="max-w-xl text-base leading-relaxed text-ink-3">From clinical pharmacology and malaria research to books, events, teaching, and future projects, this is a place to follow the questions that continue to shape the work.</p>
            <Link href="/about" className="mt-7 inline-flex items-center gap-1.5 text-sm text-ink-3 hover:text-ink">Read the story <ArrowRight className="h-3.5 w-3.5" aria-hidden /></Link>
          </Reveal>
        </div>
      </section>

      <section id="newsletter" className="scroll-mt-20 border-t border-line">
        <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8 sm:py-24">
          <Reveal>
            <div className="max-w-2xl">
              <p className="text-xs uppercase tracking-[0.25em] text-ink-4">Follow the work</p>
              <h2 className="mt-5 font-serif text-4xl tracking-tight text-ink sm:text-5xl">A letter from Dr Fraction</h2>
              <p className="mt-5 text-base leading-relaxed text-ink-3">Ideas, research, books, events, and the questions connecting them. Occasional, considered emails; unsubscribe anytime.</p>
              <div className="mt-8"><NewsletterForm /></div>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
