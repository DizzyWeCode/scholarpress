"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, Menu, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { SubscribeButton } from "@/components/subscribe-button";

type NavItem = { href: string; label: string; description: string };
type NavGroup = { label: string; href: string; description: string; items: NavItem[] };

const groups: NavGroup[] = [
  {
    label: "Research",
    href: "/papers",
    description: "Scholarly outputs and publication context.",
    items: [
      { href: "/papers", label: "Research library", description: "Browse papers and other outputs." },
      { href: "/papers", label: "Publications and papers", description: "Find published research and DOI links." },
      { href: "/about#research", label: "Research interests", description: "The questions connecting the work." },
    ],
  },
  {
    label: "Events",
    href: "/webinars",
    description: "Talks, webinars, launches, and recordings.",
    items: [
      { href: "/webinars", label: "Upcoming events", description: "Register for the next conversation." },
      { href: "/webinars#past", label: "Replays", description: "Watch past conversations and sessions." },
      { href: "/about#work-with-me", label: "Speaking and teaching", description: "Enquiries and collaborations." },
    ],
  },
  {
    label: "Topics",
    href: "/topics",
    description: "Browse the connected body of work by subject.",
    items: [
      { href: "/topics", label: "All topics", description: "See every published topic." },
      { href: "/topics", label: "Featured topics", description: "Start with the questions shaping the work." },
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
  const [openGroup, setOpenGroup] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileExpanded, setMobileExpanded] = useState<string | null>(null);
  const navRef = useRef<HTMLElement>(null);
  const mobileButtonRef = useRef<HTMLButtonElement>(null);
  const triggerRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const hoverTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearHoverTimer = useCallback(() => {
    if (hoverTimer.current) clearTimeout(hoverTimer.current);
    hoverTimer.current = null;
  }, []);

  const closeDesktop = useCallback((restoreFocus = false) => {
    clearHoverTimer();
    const previous = openGroup;
    setOpenGroup(null);
    if (restoreFocus && previous) triggerRefs.current[previous]?.focus();
  }, [clearHoverTimer, openGroup]);

  const openOnHover = useCallback((label: string) => {
    clearHoverTimer();
    hoverTimer.current = setTimeout(() => setOpenGroup(label), 160);
  }, [clearHoverTimer]);

  useEffect(() => {
    closeDesktop();
    setMobileOpen(false);
    setMobileExpanded(null);
  }, [closeDesktop, pathname]);

  useEffect(() => {
    const onPointerDown = (event: PointerEvent) => {
      if (navRef.current && !navRef.current.contains(event.target as Node)) closeDesktop();
    };
    const onFocusIn = (event: FocusEvent) => {
      if (navRef.current && !navRef.current.contains(event.target as Node)) closeDesktop();
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        if (mobileOpen) {
          setMobileOpen(false);
          setMobileExpanded(null);
          mobileButtonRef.current?.focus();
        } else {
          closeDesktop(true);
        }
      }
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("focusin", onFocusIn);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("focusin", onFocusIn);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [closeDesktop, mobileOpen, openGroup]);

  useEffect(() => {
    if (!mobileOpen) {
      document.body.style.overflow = "";
      return;
    }
    document.body.style.overflow = "hidden";
    const first = navRef.current?.querySelector<HTMLElement>("#mobile-site-navigation a, #mobile-site-navigation button");
    first?.focus();
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const toggleMobile = () => {
    setMobileOpen((current) => !current);
    setMobileExpanded(null);
  };

  return (
    <nav ref={navRef} className="relative" aria-label="Primary">
      <div className="hidden items-center gap-1 lg:flex">
        <Link href="/blog" className={`px-3 py-2 text-sm transition-colors ${isActive(pathname, "/blog") ? "text-ink" : "text-ink-3 hover:text-ink"}`}>
          Blog
        </Link>
        {groups.map((group) => {
          const isOpen = openGroup === group.label;
          return (
            <div key={group.label} className="relative" onMouseEnter={() => openOnHover(group.label)} onMouseLeave={() => { clearHoverTimer(); hoverTimer.current = setTimeout(() => closeDesktop(), 140); }}>
              <button
                ref={(element) => { triggerRefs.current[group.label] = element; }}
                type="button"
                aria-expanded={isOpen}
                aria-controls={`desktop-menu-${group.label.toLowerCase()}`}
                onClick={() => setOpenGroup(isOpen ? null : group.label)}
                onKeyDown={(event) => {
                  if (event.key === "ArrowDown") {
                    event.preventDefault();
                    setOpenGroup(group.label);
                    requestAnimationFrame(() => navRef.current?.querySelector<HTMLElement>(`#desktop-menu-${group.label.toLowerCase()} a`)?.focus());
                  }
                }}
                className={`flex items-center gap-1 rounded px-3 py-2 text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink ${isActive(pathname, group.href) || isOpen ? "text-ink" : "text-ink-3 hover:text-ink"}`}
              >
                {group.label}<ChevronDown className={`h-3.5 w-3.5 transition-transform ${isOpen ? "rotate-180" : ""}`} aria-hidden />
              </button>
              {isOpen ? (
                <div id={`desktop-menu-${group.label.toLowerCase()}`} role="region" aria-label={`${group.label} menu`} className="absolute right-0 top-full z-50 mt-2 w-80 rounded-md border border-line bg-paper p-2 shadow-xl shadow-ink/5" onMouseEnter={clearHoverTimer}>
                  <Link href={group.href} onClick={() => closeDesktop()} className="block rounded px-3 py-3 hover:bg-paper-2">
                    <span className="block text-sm font-medium text-ink">{group.label}</span>
                    <span className="mt-1 block text-xs leading-relaxed text-ink-3">{group.description}</span>
                  </Link>
                  <div className="my-1 border-t border-line" />
                  {group.items.map((item) => (
                    <Link key={`${group.label}-${item.href}-${item.label}`} href={item.href} onClick={() => closeDesktop()} className="block rounded px-3 py-2.5 hover:bg-paper-2">
                      <span className="block text-sm text-ink">{item.label}</span>
                      <span className="mt-0.5 block text-xs leading-relaxed text-ink-4">{item.description}</span>
                    </Link>
                  ))}
                </div>
              ) : null}
            </div>
          );
        })}
        <Link href="/#newsletter" className="ml-1 px-3 py-2 text-sm text-ink-3 transition-colors hover:text-ink">Follow</Link>
        <Link href="/search" className="px-3 py-2 text-sm text-ink-3 transition-colors hover:text-ink">Search</Link>
      </div>

      <div className="flex items-center gap-2 lg:hidden">
        <SubscribeButton />
        <button ref={mobileButtonRef} type="button" aria-expanded={mobileOpen} aria-controls="mobile-site-navigation" aria-label={mobileOpen ? "Close menu" : "Open menu"} onClick={toggleMobile} className="flex h-10 w-10 items-center justify-center rounded text-ink transition-colors hover:bg-paper-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink">
          {mobileOpen ? <X className="h-5 w-5" aria-hidden /> : <Menu className="h-5 w-5" aria-hidden />}
        </button>
      </div>

      {mobileOpen ? (
        <div id="mobile-site-navigation" className="absolute inset-x-0 top-full z-50 max-h-[calc(100vh-5rem)] overflow-y-auto border-b border-line bg-paper shadow-lg shadow-ink/5 lg:hidden">
          <div className="mx-auto max-w-6xl px-5 py-3 sm:px-8">
            <MobileLink href="/blog" label="Blog" onNavigate={toggleMobile} />
            {groups.map((group) => {
              const expanded = mobileExpanded === group.label;
              return (
                <div key={group.label} className="border-b border-line">
                  <button type="button" aria-expanded={expanded} aria-controls={`mobile-submenu-${group.label.toLowerCase()}`} onClick={() => setMobileExpanded(expanded ? null : group.label)} className="flex w-full items-center justify-between py-3.5 text-left text-base text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink">
                    {group.label}<ChevronDown className={`h-4 w-4 text-ink-4 transition-transform ${expanded ? "rotate-180" : ""}`} aria-hidden />
                  </button>
                  {expanded ? (
                    <div id={`mobile-submenu-${group.label.toLowerCase()}`} className="pb-3 pl-3">
                      <MobileLink href={group.href} label={`All ${group.label.toLowerCase()}`} onNavigate={toggleMobile} />
                      {group.items.map((item) => <MobileLink key={`${group.label}-${item.href}-${item.label}`} href={item.href} label={item.label} onNavigate={toggleMobile} />)}
                    </div>
                  ) : null}
                </div>
              );
            })}
            <MobileLink href="/#newsletter" label="Follow the work" onNavigate={toggleMobile} />
            <MobileLink href="/search" label="Search" onNavigate={toggleMobile} />
          </div>
        </div>
      ) : null}
    </nav>
  );
}

function MobileLink({ href, label, onNavigate }: { href: string; label: string; onNavigate: () => void }) {
  return <Link href={href} onClick={onNavigate} className="block border-b border-line py-3.5 text-base text-ink transition-colors hover:text-ink-3 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink">{label}</Link>;
}
