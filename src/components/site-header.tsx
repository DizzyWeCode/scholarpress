import Link from "next/link";
import { SITE } from "@/lib/site";
import { SubscribeButton } from "@/components/subscribe-button";
import { NavLinks, type NavLink } from "@/components/nav-links";

const NAV: NavLink[] = [
  { href: "/blog", label: "Writing" },
  { href: "/papers", label: "Research" },
  { href: "/webinars", label: "Webinars" },
  { href: "/about", label: "About" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-paper/90 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-8">
        <Link
          href="/"
          className="font-serif text-lg tracking-tight text-ink transition-opacity hover:opacity-60"
        >
          {SITE.name}
        </Link>
        <nav className="hidden items-center gap-8 md:flex" aria-label="Primary">
          <NavLinks
            links={NAV}
            className="text-sm text-ink-3 transition-colors hover:text-ink"
            activeClassName="text-sm text-ink transition-colors"
          />
        </nav>
        <div className="flex items-center gap-3">
          <SubscribeButton />
          <details className="relative md:hidden">
            <summary
              aria-label="Menu"
              className="flex h-10 w-10 cursor-pointer list-none items-center justify-center rounded text-ink transition-colors hover:bg-paper-2 [&::-webkit-details-marker]:hidden"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.75"
                className="h-5 w-5"
                aria-hidden
              >
                <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
              </svg>
            </summary>
            <nav
              className="fixed inset-x-0 top-16 border-b border-line bg-paper px-5 py-2 shadow-sm"
              aria-label="Mobile"
            >
              <div className="flex flex-col divide-y divide-line">
                <NavLinks
                  links={NAV}
                  className="py-3.5 text-base text-ink-3 transition-colors hover:text-ink"
                  activeClassName="py-3.5 text-base text-ink"
                />
              </div>
            </nav>
          </details>
        </div>
      </div>
    </header>
  );
}
