import Link from "next/link";
import { SITE } from "@/lib/site";
import { SubscribeButton } from "@/components/subscribe-button";

const NAV = [
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
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm text-ink-3 transition-colors hover:text-ink"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <SubscribeButton />
          <details className="relative md:hidden">
            <summary className="list-none text-sm text-ink-3">Menu</summary>
            <nav
              className="absolute right-0 top-8 flex w-44 flex-col gap-3 rounded border border-line bg-paper p-4 shadow-sm"
              aria-label="Mobile"
            >
              {NAV.map((item) => (
                <Link key={item.href} href={item.href} className="text-sm text-ink">
                  {item.label}
                </Link>
              ))}
            </nav>
          </details>
        </div>
      </div>
    </header>
  );
}
