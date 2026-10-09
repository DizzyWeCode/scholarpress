"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, FileText, BookOpen, MonitorPlay, MessageSquare,
  Users, Vote, Mail, Send, BarChart3, Settings,
} from "lucide-react";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/posts", label: "Posts", icon: FileText },
  { href: "/admin/papers", label: "Papers", icon: BookOpen },
  { href: "/admin/webinars", label: "Webinars", icon: MonitorPlay },
  { href: "/admin/comments", label: "Comments", icon: MessageSquare },
  { href: "/admin/polls", label: "Polls", icon: Vote },
  { href: "/admin/subscribers", label: "Subscribers", icon: Users },
  { href: "/admin/newsletter", label: "Newsletter", icon: Send },
  { href: "/admin/email", label: "Email log", icon: Mail },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export function AdminNavLinks() {
  const pathname = usePathname();
  return (
    <nav className="mt-5 flex flex-col gap-1" aria-label="Admin navigation">
      {NAV.map((item) => {
        const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={`flex items-center gap-2.5 rounded px-3 py-2 text-sm transition-colors ${active ? "bg-paper-2 text-ink" : "text-ink-3 hover:bg-paper-2 hover:text-ink"}`}
          >
            <item.icon className="h-4 w-4" aria-hidden="true" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
