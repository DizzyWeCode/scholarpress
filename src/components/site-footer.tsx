import Link from "next/link";
import { SITE } from "@/lib/site";

export function SiteFooter() {
  return (
    <footer className="border-t border-ink bg-ink text-paper">
      <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8">
        <div className="grid gap-12 md:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <p className="font-serif text-2xl tracking-tight">{SITE.name}</p>
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-paper/60">
              {SITE.tagline}. {SITE.affiliation}.
            </p>
            <p className="mt-6 text-xs leading-relaxed text-paper/40">
              {SITE.imageAttributionNote}
            </p>
          </div>
          <nav aria-label="Explore">
            <p className="text-xs uppercase tracking-widest text-paper/40">
              Explore
            </p>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li><Link className="text-paper/70 transition-colors hover:text-paper" href="/blog">Writing</Link></li>
              <li><Link className="text-paper/70 transition-colors hover:text-paper" href="/papers">Research papers</Link></li>
              <li><Link className="text-paper/70 transition-colors hover:text-paper" href="/webinars">Webinars</Link></li>
              <li><Link className="text-paper/70 transition-colors hover:text-paper" href="/about">About</Link></li>
            </ul>
          </nav>
          <nav aria-label="Legal">
            <p className="text-xs uppercase tracking-widest text-paper/40">
              Legal
            </p>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li><Link className="text-paper/70 transition-colors hover:text-paper" href="/legal/terms">Terms of Service</Link></li>
              <li><Link className="text-paper/70 transition-colors hover:text-paper" href="/legal/privacy">Privacy Policy</Link></li>
              <li><Link className="text-paper/70 transition-colors hover:text-paper" href="/legal/cookies">Cookie Policy</Link></li>
            </ul>
          </nav>
        </div>
        <div className="mt-14 flex flex-col gap-2 border-t border-paper/15 pt-6 text-xs text-paper/40 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} {SITE.name}. All rights reserved.</p>
          <p>Built with Next.js &amp; Supabase — open-source, free to host.</p>
        </div>
      </div>
    </footer>
  );
}
