"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, Menu, X } from "lucide-react";
import { useState } from "react";
import { SubscribeButton } from "@/components/subscribe-button";

const groups = [
  {
    label: "Writing",
    href: "/blog",
    description: "Essays, notes, reviews, and conversations.",
    items: [
      { href: "/blog", label: "All writing", description: "Browse the complete writing archive." },
      { href: "/#start-here", label: "Start here", description: "A curated way into the work." },
    ],
  },
  {
    label: "Research",
    href: "/papers",
    description: "Papers, findings, methods, and themes.",
    items: [
      { href: "/papers", label: "Publications", description: "Peer-reviewed papers and outputs." },
      { href: "/about#research", label: "Research interests", description: "The questions connecting the work." },
    ],
  },
  {
    label: "Events",
    href: "/webinars",
    description: "Talks, webinars, launches, and recordings.",
    items: [
      { href: "/webinars", label: "Upcoming and past", description: "Register, attend, or watch again." },
      { href: "/webinars#past", label: "Recordings", description: "Past conversations and sessions." },
    ],
  },
  {
    label: "About",
    href: "/about",
    description: "The person, the work, and ways to connect.",
    items: [
      { href: "/about", label: "About Dr Fraction", description: "Biography, work, and current interests." },
      { href: "/about#work-with-me", label: "Work with me", description: "Speaking, teaching, and collaborations." },
    ],
  },
];

function isActive(pathname: string, href: string) {
  const base = href.split("?")[0].split("#")[0];
  return base === "/" ? pathname === "/" : pathname.startsWith(base);
}

export function SiteNavigation() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <nav className="hidden items-center gap-1 md:flex" aria-label="Primary">
        <Link
          href="/"
          className={`px-3 py-2 text-sm transition-colors ${pathname === "/" ? "text-ink" : "text-ink-3 hover:text-ink"}`}
        >
          Home
        </Link>
        {groups.map((group) => (
          <details key={group.label} className="group relative">
            <summary
              className={`flex cursor-pointer list-none items-center gap-1 rounded px-3 py-2 text-sm transition-colors [&::-webkit-details-marker]:hidden ${isActive(pathname, group.href) ? "text-ink" : "text-ink-3 hover:text-ink"}`}
            >
              {group.label}
              <ChevronDown className="h-3.5 w-3.5 transition-transform group-open:rotate-180" aria-hidden />
            </summary>
            <div className="absolute right-0 top-full z-50 mt-2 w-80 rounded-md border border-line bg-paper p-2 shadow-xl shadow-ink/5">
              <Link href={group.href} className="block rounded px-3 py-3 hover:bg-paper-2">
                <span className="block text-sm font-medium text-ink">{group.label}</span>
                <span className="mt-1 block text-xs leading-relaxed text-ink-3">{group.description}</span>
              </Link>
              <div className="my-1 border-t border-line" />
              {group.items.slice(1).map((item) => (
                <Link key={item.href} href={item.href} className="block rounded px-3 py-2.5 hover:bg-paper-2">
                  <span className="block text-sm text-ink">{item.label}</span>
                  <span className="mt-0.5 block text-xs leading-relaxed text-ink-4">{item.description}</span>
                </Link>
              ))}
            </div>
          </details>
        ))}
        <Link href="/#newsletter" className="ml-1 px-3 py-2 text-sm text-ink-3 transition-colors hover:text-ink">
          Newsletter
        </Link>
      </nav>

      <div className="flex items-center gap-2 md:hidden">
        <SubscribeButton />
        <button
          type="button"
          aria-expanded={mobileOpen}
          aria-controls="mobile-site-navigation"
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          onClick={() => setMobileOpen((open) => !open)}
          className="flex h-10 w-10 items-center justify-center rounded text-ink transition-colors hover:bg-paper-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
        >
          {mobileOpen ? <X className="h-5 w-5" aria-hidden /> : <Menu className="h-5 w-5" aria-hidden />}
        </button>
      </div>

      {mobileOpen ? (
        <nav id="mobile-site-navigation" className="absolute inset-x-0 top-full border-b border-line bg-paper shadow-lg shadow-ink/5 md:hidden" aria-label="Mobile">
          <div className="mx-auto max-w-6xl px-5 py-3 sm:px-8">
            <Link href="/" onClick={() => setMobileOpen(false)} className="block border-b border-line py-3.5 text-base text-ink">
              Home
            </Link>
            {groups.map((group) => (
              <details key={group.label} className="border-b border-line">
                <summary className="flex cursor-pointer list-none items-center justify-between py-3.5 text-base text-ink [&::-webkit-details-marker]:hidden">
                  {group.label}
                  <ChevronDown className="h-4 w-4 text-ink-4" aria-hidden />
                </summary>
                <div className="pb-3 pl-3">
                  {group.items.map((item) => (
                    <Link key={item.href} href={item.href} onClick={() => setMobileOpen(false)} className="block py-2.5 text-sm text-ink-3 hover:text-ink">
                      {item.label}
                    </Link>
                  ))}
                </div>
              </details>
            ))}
            <Link href="/login" onClick={() => setMobileOpen(false)} className="block py-3.5 text-base text-ink-3">
              Newsletter & sign in
            </Link>
          </div>
        </nav>
      ) : null}
    </>
  );
}
