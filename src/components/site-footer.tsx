import Link from "next/link";
import { ArrowUpRight, Mail } from "lucide-react";
import { NewsletterForm } from "@/components/newsletter-form";
import { SITE } from "@/lib/site";

type BrandName = "facebook" | "instagram" | "linkedin" | "youtube" | "researchgate" | "x";

function BrandMark({ name }: { name: BrandName }) {
  const common = { viewBox: "0 0 24 24", fill: "none", xmlns: "http://www.w3.org/2000/svg", className: "h-4 w-4", "aria-hidden": true } as const;
  if (name === "facebook") return <svg {...common} viewBox="0 0 24 24" fill="currentColor"><path d="M14 8h3V4h-3c-3.31 0-5 1.69-5 5v3H6v4h3v6h4v-6h3.5l.5-4H13V9c0-.67.33-1 1-1Z" /></svg>;
  if (name === "instagram") return <svg {...common}><rect x="3.25" y="3.25" width="17.5" height="17.5" rx="5" stroke="currentColor" strokeWidth="1.8" /><circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.8" /><circle cx="17.6" cy="6.6" r="1.1" fill="currentColor" /></svg>;
  if (name === "linkedin") return <svg {...common} fill="currentColor"><path d="M5.1 8.4H1.8V22h3.3V8.4ZM3.45 2A2 2 0 1 0 3.45 6a2 2 0 0 0 0-4ZM22.2 14.2c0-4.1-2.2-6-5.1-6-2.35 0-3.4 1.3-4 2.2V8.4H9.8V22h3.3v-6.74c0-1.78.34-3.5 2.54-3.5 2.17 0 2.2 2.03 2.2 3.63V22h3.36v-7.8Z" /></svg>;
  if (name === "youtube") return <svg {...common} viewBox="0 0 24 24"><path d="M21.6 7.2a2.75 2.75 0 0 0-1.94-1.95C17.95 4.8 12 4.8 12 4.8s-5.95 0-7.66.45A2.75 2.75 0 0 0 2.4 7.2C1.95 8.92 1.95 12 1.95 12s0 3.08.45 4.8a2.75 2.75 0 0 0 1.94 1.95c1.71.45 7.66.45 7.66.45s5.95 0 7.66-.45a2.75 2.75 0 0 0 1.94-1.95c.45-1.72.45-4.8.45-4.8s0-3.08-.45-4.8Z" fill="currentColor" /><path d="m10 15.5 5-3.5-5-3.5v7Z" fill="#111" /></svg>;
  if (name === "researchgate") return <span className="font-serif text-[15px] font-semibold leading-none">R<sup className="text-[9px]">g</sup></span>;
  if (name === "x") return <span className="text-[15px] font-semibold leading-none">𝕏</span>;
  return null;
}

const socialLinks: { label: string; href: string; brand: BrandName; className: string }[] = [
  ...(SITE.facebook ? [{ label: "Facebook", href: SITE.facebook, brand: "facebook" as const, className: "bg-[#1877F2] text-white" }] : []),
  ...(SITE.instagram ? [{ label: "Instagram", href: SITE.instagram, brand: "instagram" as const, className: "bg-gradient-to-br from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] text-white" }] : []),
  ...(SITE.linkedin ? [{ label: "LinkedIn", href: SITE.linkedin, brand: "linkedin" as const, className: "bg-[#0A66C2] text-white" }] : []),
  ...(SITE.youtube ? [{ label: "YouTube", href: SITE.youtube, brand: "youtube" as const, className: "bg-[#FF0000] text-white" }] : []),
  ...(SITE.twitter ? [{ label: "X / Twitter", href: SITE.twitter, brand: "x" as const, className: "bg-[#202124] text-white" }] : []),
  ...(SITE.researchgate ? [{ label: "ResearchGate", href: SITE.researchgate, brand: "researchgate" as const, className: "bg-[#00CCBB] text-[#063c39]" }] : []),
];

export function SiteFooter() {
  return (
    <footer className="relative overflow-hidden border-t border-white/10 bg-[#111111] text-[#f8f6ef]">
      <div className="pointer-events-none absolute -right-24 -top-32 h-80 w-80 rounded-full bg-[#f0b429]/10 blur-3xl" aria-hidden />
      <div className="pointer-events-none absolute -bottom-44 left-1/3 h-96 w-96 rounded-full bg-[#2aa7a1]/10 blur-3xl" aria-hidden />
      <div className="relative mx-auto max-w-6xl px-5 py-14 sm:px-8 sm:py-20">
        <div className="grid gap-12 lg:grid-cols-[1.35fr_0.8fr_0.9fr_0.85fr] lg:gap-10">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#f0b429]"><span className="h-2 w-2 rounded-full bg-[#f0b429]" aria-hidden />Keep in touch</div>
            <p className="mt-5 max-w-sm font-serif text-3xl leading-tight tracking-tight text-[#fffdf7]">Follow the questions behind the work.</p>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/60">Occasional notes on clinical pharmacology, malaria research, books, events, and the ideas connecting them.</p>
            <div className="mt-7 max-w-md rounded-2xl border border-white/15 bg-white/[0.06] p-4 shadow-2xl shadow-black/20"><p className="mb-3 text-xs font-medium text-white/70">Get the next letter in your inbox</p><NewsletterForm dark /></div>
            <p className="mt-3 text-xs text-white/40">No noise. Unsubscribe whenever you like.</p>
          </div>
          <nav aria-label="Explore"><p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/40">Explore</p><ul className="mt-5 space-y-3 text-sm"><li><Link className="text-white/70 transition-colors hover:text-white" href="/blog">Articles</Link></li><li><Link className="text-white/70 transition-colors hover:text-white" href="/papers">Research papers</Link></li><li><Link className="text-white/70 transition-colors hover:text-white" href="/webinars">Webinars & events</Link></li><li><Link className="text-white/70 transition-colors hover:text-white" href="/about">About Dr Fraction</Link></li></ul></nav>
          <nav aria-label="Connect"><p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/40">Connect</p><ul className="mt-5 space-y-3 text-sm"><li><a className="group flex items-center gap-2.5 text-white/70 transition-colors hover:text-white" href={`mailto:${SITE.email}`}><span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#2aa7a1] text-[#062d2b]"><Mail className="h-3.5 w-3.5" aria-hidden /></span><span>Email Dr Fraction</span></a></li>{socialLinks.map((link) => <li key={link.label}><a className="group flex items-center gap-2.5 text-white/70 transition-colors hover:text-white" href={link.href} target="_blank" rel="noreferrer"><span className={`flex h-7 w-7 items-center justify-center rounded-full ${link.className}`}><BrandMark name={link.brand} /></span><span>{link.label}</span><ArrowUpRight className="ml-auto h-3.5 w-3.5 text-white/30 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden /></a></li>)}<li><Link className="group flex items-center gap-2.5 text-white/70 transition-colors hover:text-white" href="/login"><span className="flex h-7 w-7 items-center justify-center rounded-full border border-white/25 text-[11px]">→</span><span>Member account</span></Link></li></ul></nav>
          <nav aria-label="Legal"><p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/40">Legal</p><ul className="mt-5 space-y-3 text-sm"><li><Link className="text-white/70 transition-colors hover:text-white" href="/legal/terms">Terms of Service</Link></li><li><Link className="text-white/70 transition-colors hover:text-white" href="/legal/privacy">Privacy Policy</Link></li><li><Link className="text-white/70 transition-colors hover:text-white" href="/legal/cookies">Cookie Policy</Link></li></ul></nav>
        </div>
        <div className="mt-14 flex flex-col gap-3 border-t border-white/15 pt-6 text-xs text-white/45 sm:flex-row sm:items-center sm:justify-between"><p>© {new Date().getFullYear()} {SITE.name}. All rights reserved.</p><p>Site by {SITE.builtBy.url ? <a href={SITE.builtBy.url} className="text-white/70 underline underline-offset-2 transition-colors hover:text-white" rel="noopener noreferrer" target="_blank">{SITE.builtBy.name}</a> : SITE.builtBy.name}</p></div>
      </div>
    </footer>
  );
}
