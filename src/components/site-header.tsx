import Link from "next/link";
import { SITE } from "@/lib/site";
import { SiteNavigation } from "@/components/site-navigation";
import { SubscribeButton } from "@/components/subscribe-button";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-paper/95 backdrop-blur-sm">
      <div className="mx-auto flex min-h-16 max-w-6xl items-center justify-between gap-6 px-5 sm:px-8">
        <Link href="/" className="shrink-0 font-serif text-lg tracking-tight text-ink transition-opacity hover:opacity-60">
          {SITE.name}
        </Link>
        <div className="flex items-center gap-2">
          <SiteNavigation />
          <span className="hidden md:block"><SubscribeButton /></span>
        </div>
      </div>
    </header>
  );
}
