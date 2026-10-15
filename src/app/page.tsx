import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { ArrowRight, BookOpen, CalendarDays, Compass, FileText, Mail } from "lucide-react";
import { SITE } from "@/lib/site";
import { getSupabaseAnon } from "@/lib/supabase/public";
import { Reveal } from "@/components/reveal";
import { PostRow } from "@/components/post-card";
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
      supabase.from("posts").select("id, slug, title, excerpt, tags, status, published_at, reading_time_minutes, updated_at, cover_image_url").or(`status.eq.published,and(status.eq.scheduled,published_at.lte.${new Date().toISOString()})`).order("published_at", { ascending: false }).limit(6),
      supabase.from("papers").select("id, title, abstract, authors, venue, year, doi, url, pdf_url, tags, featured, status, created_at").eq("status", "published").order("featured", { ascending: false }).order("year", { ascending: false }).limit(3),
      supabase.from("webinars").select("id, title, description, starts_at, duration_minutes, platform, registration_url, recording_url, status, created_at").in("status", ["upcoming", "past"]).order("starts_at", { ascending: true }).limit(3),
    ]);
    posts = (postsRes.data ?? []) as Post[];
    papers = (papersRes.data ?? []) as Paper[];
    webinars = ((webinarsRes.data ?? []) as Webinar[]).filter((webinar) => !isWebinarPast(webinar));
  }

  const [featured, ...latest] = posts;
  const primaryPaper = papers[0];
  const primaryWebinar = webinars[0];
  const routes = [
    { label: "Start with an idea", text: "Selected essays and notes for a clear first encounter with the work.", href: featured ? `/blog/${featured.slug}` : "/blog", action: "Read the writing", icon: FileText },
    { label: "Start with the evidence", text: "Papers, findings, and methods from the research archive.", href: "/papers", action: "Explore research", icon: BookOpen },
    { label: "Start with a question", text: "Follow themes such as treatment, resistance, access, and evidence.", href: "/blog", action: "Browse themes", icon: Compass },
    { label: "Join a conversation", text: "Upcoming webinars and recordings around the questions in public.", href: "/webinars", action: "See events", icon: CalendarDays },
  ];

  return (
    <>
      <section className="border-b border-line bg-paper-2">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 pb-12 pt-6 sm:gap-12 sm:px-8 sm:pb-28 sm:pt-24 lg:grid-cols-[1.08fr_0.92fr] lg:items-center">
          <div className="order-2 lg:order-1">
            <p className="text-xs uppercase tracking-[0.25em] text-ink-4">A living scholarly platform</p>
            <h1 className="mt-5 max-w-3xl font-serif text-[2.7rem] leading-[1.02] tracking-[-0.035em] text-ink sm:mt-6 sm:text-7xl">{SITE.tagline}</h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-ink-3 sm:mt-7 sm:text-lg">Research, writing, and public learning for better decisions about medicines and health — and the questions connecting the work.</p>
            <div className="mt-7 flex flex-wrap gap-3 sm:mt-9"><Link href={featured ? `/blog/${featured.slug}` : "/blog"} className="rounded-full bg-ink px-5 py-2.5 text-sm text-paper transition-opacity hover:opacity-80">Explore the current work</Link><Link href="#ways-in" className="rounded-full border border-ink px-5 py-2.5 text-sm text-ink transition-colors hover:bg-ink hover:text-paper">Find your way in</Link></div>
            <div className="mt-7 flex flex-wrap gap-x-5 gap-y-2 text-sm text-ink-3 sm:mt-8"><Link href="/papers" className="underline underline-offset-4 hover:text-ink">Research</Link><Link href="/webinars" className="underline underline-offset-4 hover:text-ink">Events</Link><Link href="#newsletter" className="underline underline-offset-4 hover:text-ink">Follow the work</Link></div>
          </div>
          <Reveal delay={160} className="order-1 lg:order-2"><figure><div className="relative aspect-[4/3] overflow-hidden rounded-[1.25rem] border border-ink/10 bg-ink shadow-[0_18px_50px_rgba(10,10,10,0.14)]"><Image src={SITE.images.hero.src} alt={SITE.images.hero.alt} fill sizes="(max-width: 1024px) 100vw, 480px" className="object-cover opacity-90" priority /><div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/85 via-ink/30 to-transparent p-5 pt-20 text-paper sm:p-7 sm:pt-28"><p className="text-[0.65rem] uppercase tracking-[0.24em] text-paper/70">Current focus</p><p className="mt-2 max-w-xs font-serif text-2xl leading-tight sm:text-3xl">Evidence that can travel beyond the laboratory.</p></div></div><figcaption className="mt-3 px-1 text-xs leading-relaxed text-ink-4">Clinical pharmacology, malaria research, teaching, and public conversation.</figcaption></figure></Reveal>
        </div>
      </section>

      <section id="ways-in" className="mx-auto max-w-6xl scroll-mt-20 px-5 py-20 sm:px-8 sm:py-24">
        <Reveal><div className="flex items-end justify-between gap-6"><div><p className="text-xs uppercase tracking-[0.25em] text-ink-4">Choose your way in</p><h2 className="mt-4 font-serif text-4xl tracking-tight text-ink sm:text-5xl">Begin with what brings you here.</h2></div><Compass className="hidden h-7 w-7 text-ink-4 sm:block" aria-hidden /></div><p className="mt-5 max-w-2xl text-base leading-relaxed text-ink-3">The work moves between research, writing, teaching, and conversation. Take the route that matches your question today.</p></Reveal>
        <div className="mt-10 grid gap-px overflow-hidden rounded border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">{routes.map(({ label, text, href, action, icon: Icon }, index) => <Reveal key={label} delay={index * 70}><Link href={href} className="group flex h-full flex-col bg-paper p-6 transition-colors hover:bg-paper-2"><Icon className="h-5 w-5 text-ink-4" aria-hidden /><h3 className="mt-10 font-serif text-2xl leading-tight tracking-tight text-ink">{label}</h3><p className="mt-3 flex-1 text-sm leading-relaxed text-ink-3">{text}</p><span className="mt-8 inline-flex items-center gap-1.5 text-sm text-ink-2">{action}<ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" aria-hidden /></span></Link></Reveal>)}</div>
      </section>

      {primaryWebinar || primaryPaper ? <section className="border-y border-line bg-paper-2"><div className="mx-auto grid max-w-6xl gap-8 px-5 py-16 sm:px-8 sm:py-20 lg:grid-cols-[1.1fr_0.9fr] lg:items-center"><Reveal><p className="text-xs uppercase tracking-[0.25em] text-ink-4">In focus now</p><h2 className="mt-4 max-w-2xl font-serif text-4xl tracking-tight text-ink sm:text-5xl">The questions are ongoing.</h2><p className="mt-5 max-w-xl text-base leading-relaxed text-ink-3">A selected piece of current work, a public conversation, or a research output worth spending time with.</p></Reveal><Reveal delay={100}><div className="border-l border-ink pl-6">{primaryWebinar ? <><p className="text-xs uppercase tracking-widest text-ink-4">Upcoming event</p><h3 className="mt-3 font-serif text-2xl leading-tight text-ink">{primaryWebinar.title}</h3><p className="mt-3 text-sm leading-relaxed text-ink-3">{primaryWebinar.description ?? "A public conversation around the work."}</p><Link href="/webinars" className="mt-6 inline-flex items-center gap-1.5 text-sm text-ink-2">View the event <ArrowRight className="h-3.5 w-3.5" aria-hidden /></Link></> : <><p className="text-xs uppercase tracking-widest text-ink-4">Selected research</p><h3 className="mt-3 font-serif text-2xl leading-tight text-ink">{primaryPaper?.title}</h3><Link href={`/papers/${primaryPaper?.id}`} className="mt-6 inline-flex items-center gap-1.5 text-sm text-ink-2">Read the paper <ArrowRight className="h-3.5 w-3.5" aria-hidden /></Link></>}</div></Reveal></div></section> : null}

      {featured ? <section className="border-b border-line"><div className="mx-auto max-w-6xl px-5 py-20 sm:px-8 sm:py-24"><Reveal><div className="flex items-baseline justify-between gap-6"><div><p className="text-xs uppercase tracking-[0.25em] text-ink-4">Latest work</p><h2 className="mt-4 font-serif text-4xl tracking-tight text-ink sm:text-5xl">What is new</h2></div><Link href="/blog" className="inline-flex items-center gap-1.5 text-sm text-ink-3 hover:text-ink">All writing <ArrowRight className="h-3.5 w-3.5" aria-hidden /></Link></div></Reveal><Reveal delay={100}><Link href={`/blog/${featured.slug}`} className="group mt-10 block border-y border-ink py-10">{featured.cover_image_url ? <span className="relative block aspect-[21/9] w-full overflow-hidden rounded bg-paper-2"><Image src={featured.cover_image_url} alt="" fill sizes="(max-width: 1024px) 100vw, 1024px" className="object-cover" /></span> : null}<div className="mt-6 max-w-3xl"><div className="flex flex-wrap gap-x-4 gap-y-1 text-xs uppercase tracking-widest text-ink-4"><span>Writing</span><span>{featured.reading_time_minutes ?? 1} min read</span></div><h3 className="mt-4 font-serif text-4xl leading-tight tracking-tight text-ink transition-opacity group-hover:opacity-60 sm:text-6xl">{featured.title}</h3>{featured.excerpt ? <p className="mt-5 max-w-2xl text-lg leading-relaxed text-ink-3">{featured.excerpt}</p> : null}</div></Link></Reveal><div className="mt-2">{latest.slice(0, 3).map((post, i) => <Reveal key={post.id} delay={i * 70}><PostRow post={post} /></Reveal>)}</div></div></section> : <section className="mx-auto max-w-6xl px-5 py-20 sm:px-8"><p className="text-sm text-ink-3">New writing will appear here as it is published. Start with the research archive or follow the newsletter.</p></section>}

      <section className="mx-auto max-w-6xl px-5 py-20 sm:px-8 sm:py-24"><Reveal><div className="flex items-end justify-between gap-6"><div><p className="text-xs uppercase tracking-[0.25em] text-ink-4">Start here, slowly</p><h2 className="mt-4 font-serif text-4xl tracking-tight text-ink sm:text-5xl">A curated first reading.</h2></div><Link href="/about" className="hidden text-sm text-ink-3 hover:text-ink sm:inline-flex">About Dr Fraction <ArrowRight className="ml-1.5 h-3.5 w-3.5" aria-hidden /></Link></div><p className="mt-5 max-w-2xl text-base leading-relaxed text-ink-3">Three ways to understand the questions behind the platform: the voice, the evidence, and the person doing the work.</p></Reveal><div className="mt-10 grid gap-4 md:grid-cols-3">{posts.slice(0, 3).map((post, index) => <Reveal key={post.id} delay={index * 80}><Link href={`/blog/${post.slug}`} className="group block h-full rounded border border-line p-6 transition-colors hover:border-ink"><p className="text-xs uppercase tracking-widest text-ink-4">{index === 0 ? "A first look" : index === 1 ? "A question in practice" : "A voice from the work"}</p><h3 className="mt-8 font-serif text-2xl leading-tight tracking-tight text-ink group-hover:opacity-65">{post.title}</h3>{post.excerpt ? <p className="mt-4 line-clamp-3 text-sm leading-relaxed text-ink-3">{post.excerpt}</p> : null}<span className="mt-8 inline-flex items-center gap-1.5 text-sm text-ink-3">Read the piece <ArrowRight className="h-3.5 w-3.5" aria-hidden /></span></Link></Reveal>)}</div></section>

      {webinars.length > 0 ? <section className="bg-ink text-paper"><div className="mx-auto max-w-6xl px-5 py-20 sm:px-8 sm:py-24"><Reveal><div className="flex items-end justify-between gap-6"><div><p className="text-xs uppercase tracking-[0.25em] text-paper/60">In public</p><h2 className="mt-4 font-serif text-4xl tracking-tight sm:text-5xl">Events and conversations</h2></div><CalendarDays className="hidden h-7 w-7 text-paper/50 sm:block" aria-hidden /></div><p className="mt-5 max-w-2xl text-base leading-relaxed text-paper/65">Talks and webinars for people who want to ask better questions together.</p></Reveal><div className="mt-10 grid gap-6 md:grid-cols-3">{webinars.map((w, i) => <Reveal key={w.id} delay={i * 90}><WebinarCard webinar={w} dark /></Reveal>)}</div></div></section> : null}

      <section id="newsletter" className="scroll-mt-20 border-t border-line"><div className="mx-auto grid max-w-6xl gap-10 px-5 py-20 sm:px-8 sm:py-24 lg:grid-cols-[0.8fr_1.2fr] lg:items-center"><Reveal><Mail className="h-7 w-7 text-ink-4" aria-hidden /><p className="mt-6 text-xs uppercase tracking-[0.25em] text-ink-4">Follow the work</p><h2 className="mt-5 font-serif text-4xl tracking-tight text-ink sm:text-5xl">A letter from Dr Fraction.</h2></Reveal><Reveal delay={100}><p className="max-w-xl text-base leading-relaxed text-ink-3">Occasional, considered notes about medicines, evidence, research, teaching, books, and the questions connecting them. Unsubscribe anytime.</p><div className="mt-8 max-w-xl"><NewsletterForm /></div></Reveal></div></section>
    </>
  );
}
