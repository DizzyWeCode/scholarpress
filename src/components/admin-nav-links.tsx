"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  BarChart3,
  BookOpen,
  FileText,
  LayoutDashboard,
  Mail,
  Menu,
  MessageSquare,
  MonitorPlay,
  Send,
  Settings,
  Users,
  Vote,
  X,
} from "lucide-react";

const GROUPS = [
  {
    label: "Work",
    items: [
      { href: "/admin", label: "Overview", icon: LayoutDashboard },
      { href: "/admin/posts", label: "Writing", icon: FileText },
      { href: "/admin/papers", label: "Research", icon: BookOpen },
      { href: "/admin/webinars", label: "Events", icon: MonitorPlay },
    ],
  },
  {
    label: "Audience",
    items: [
      { href: "/admin/comments", label: "Comments", icon: MessageSquare },
      { href: "/admin/subscribers", label: "Subscribers", icon: Users },
      { href: "/admin/polls", label: "Polls", icon: Vote },
    ],
  },
  {
    label: "Reach",
    items: [
      { href: "/admin/newsletter", label: "Newsletters", icon: Send },
      { href: "/admin/email", label: "Delivery log", icon: Mail },
      { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
    ],
  },
  { label: "System", items: [{ href: "/admin/settings", label: "Settings", icon: Settings }] },
];

function NavItems({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <div className="space-y-6">
      {GROUPS.map((group) => (
        <div key={group.label}>
          <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-ink-4">{group.label}</p>
          <div className="space-y-1">
            {group.items.map((item) => {
              const active = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(`${item.href}/`));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  onClick={onNavigate}
                  className={`flex items-center gap-3 rounded px-3 py-2.5 text-sm transition-colors ${
                    active ? "bg-ink text-paper" : "text-ink-3 hover:bg-paper-2 hover:text-ink"
                  }`}
                >
                  <item.icon className="h-4 w-4" aria-hidden="true" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

export function AdminNavLinks({ mobile = false }: { mobile?: boolean }) {
  const [open, setOpen] = useState(false);
  if (!mobile) return <nav aria-label="Admin navigation"><NavItems /></nav>;

  return (
    <div className="lg:hidden">
      <button
        type="button"
        aria-label="Open studio navigation"
        onClick={() => setOpen(true)}
        className="inline-flex h-9 w-9 items-center justify-center rounded border border-line bg-paper text-ink-2"
      >
        <Menu className="h-4 w-4" />
      </button>
      {open ? (
        <div className="fixed inset-0 z-50 bg-ink/40" role="presentation" onClick={() => setOpen(false)}>
          <aside
            className="h-full w-80 max-w-[88vw] overflow-y-auto bg-paper p-5 shadow-xl"
            role="dialog"
            aria-modal="true"
            aria-label="Studio navigation"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-8 flex items-center justify-between">
              <span className="font-serif text-xl text-ink">Dr Fraction Studio</span>
              <button type="button" aria-label="Close studio navigation" onClick={() => setOpen(false)} className="rounded p-2 text-ink-3 hover:bg-paper-2">
                <X className="h-4 w-4" />
              </button>
            </div>
            <NavItems onNavigate={() => setOpen(false)} />
          </aside>
        </div>
      ) : null}
    </div>
  );
}
