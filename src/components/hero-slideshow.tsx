"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, Pause, Play } from "lucide-react";

const slides = [
  {
    eyebrow: "Current focus",
    title: "Evidence that can travel beyond the laboratory.",
    description: "Clinical pharmacology, malaria research, teaching, and public conversation.",
    image: "/covers/hero-research.png",
    alt: "Researcher working in a laboratory",
    href: "/papers",
    action: "Explore the research",
  },
  {
    eyebrow: "Field notes",
    title: "Better questions make better decisions about health.",
    description: "Writing that makes complex evidence more useful, more human, and easier to share.",
    image: "/covers/hero-notes.png",
    alt: "Open field notes beside a cup of coffee",
    href: "/blog",
    action: "Read the writing",
  },
  {
    eyebrow: "In public",
    title: "The work continues in conversation.",
    description: "Talks, teaching, and gatherings for people who want to ask better questions together.",
    image: "/covers/hero-conversation.png",
    alt: "Research materials arranged on a desk",
    href: "/webinars",
    action: "See events",
  },
];

export function HeroSlideshow() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const slide = slides[active];

  useEffect(() => {
    if (paused) return;
    const timer = window.setInterval(() => setActive((current) => (current + 1) % slides.length), 6500);
    return () => window.clearInterval(timer);
  }, [paused]);

  return (
    <section className="relative min-h-[min(720px,calc(100svh-5rem))] overflow-hidden bg-ink text-paper" aria-roledescription="carousel" aria-label="Scholarpress highlights">
      {slides.map((item, index) => (
        <div key={item.title} className={`pointer-events-none absolute inset-0 transition-opacity duration-700 ${index === active ? "opacity-100" : "opacity-0"}`} aria-hidden={index !== active}>
          <Image src={item.image} alt={item.alt} fill sizes="100vw" className="object-cover object-center opacity-55" priority={index === 0} />
        </div>
      ))}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-ink via-ink/75 to-ink/20" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/85 via-transparent to-ink/20" />
      <div className="relative z-10 mx-auto flex min-h-[min(720px,calc(100svh-5rem))] max-w-6xl flex-col justify-end px-5 pb-10 pt-24 sm:px-8 sm:pb-14 lg:pb-20">
        <div className="max-w-3xl">
          <p className="text-xs uppercase tracking-[0.28em] text-paper/65">{slide.eyebrow}</p>
          <h1 className="mt-5 max-w-3xl font-serif text-[3.2rem] leading-[0.96] tracking-[-0.04em] sm:text-7xl lg:text-[6.5rem]">{slide.title}</h1>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-paper/72 sm:text-lg">{slide.description}</p>
          <Link href={slide.href} className="mt-8 inline-flex items-center gap-2 border-b border-paper/60 pb-2 text-sm text-paper transition-colors hover:border-paper hover:text-paper/75">{slide.action}<ArrowRight className="size-4" aria-hidden /></Link>
        </div>
        <div className="mt-12 flex items-center justify-between gap-6 border-t border-paper/25 pt-4 sm:mt-16">
          <div className="flex items-center gap-3" role="tablist" aria-label="Choose a highlight">
            {slides.map((item, index) => <button key={item.title} type="button" role="tab" aria-selected={index === active} aria-label={`Show slide ${index + 1}: ${item.eyebrow}`} onClick={() => setActive(index)} className={`h-1 transition-all ${index === active ? "w-12 bg-paper" : "w-6 bg-paper/40 hover:bg-paper/70"}`} />)}
          </div>
          <button type="button" onClick={() => setPaused((value) => !value)} className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-paper/65 hover:text-paper" aria-label={paused ? "Play slideshow" : "Pause slideshow"}>{paused ? <Play className="size-3.5" aria-hidden /> : <Pause className="size-3.5" aria-hidden />}{paused ? "Play" : "Pause"}</button>
        </div>
      </div>
    </section>
  );
}
