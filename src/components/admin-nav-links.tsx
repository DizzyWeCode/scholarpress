"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { BarChart3, BookOpen, FileText, LayoutDashboard, Mail, Menu, MessageSquare, MonitorPlay, Send, Settings, Users, Vote, X } from "lucide-react";

const GROUPS = [
  { label: "Content", items: [{ href: "/admin", label: "Dashboard", icon: LayoutDashboard }, { href: "/admin/posts", label: "Posts", icon: FileText }, { href: "/admin/papers", label: "Papers", icon: BookOpen }, { href: "/admin/webinars", label: "Webinars", icon: MonitorPlay }] },
  { label: "Community", items: [{ href: "/admin/comments", label: "Comments", icon: MessageSquare }, { href: "/admin/polls", label: "Polls", icon: Vote }, { href: "/admin/subscribers", label: "Subscribers", icon: Users }] },
  { label: "Communication", items: [{ href: "/admin/newsletter", label: "Newsletter", icon: Send }, { href: "/admin/email", label: "Email log", icon: Mail }] },
  { label: "Insights", items: [{ href: "/admin/analytics", label: "Analytics", icon: BarChart3 }] },
  { label: "System", items: [{ href: "/admin/settings", label: "Settings", icon: Settings }] },
];

function NavItems({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  return <div className="space-y-5">{GROUPS.map((group) => <div key={group.label}><p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">{group.label}</p><div className="space-y-0.5">{group.items.map((item) => { const active = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(`${item.href}/`)); return <Link key={item.href} href={item.href} aria-current={active ? "page" : undefined} onClick={onNavigate} className={`relative flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${active ? "bg-indigo-50 text-indigo-700" : "text-slate-600 hover:bg-slate-50 hover:text-slate-950"}`}><item.icon className="h-4 w-4" aria-hidden="true" />{item.label}</Link>; })}</div></div>)}</div>;
}

export function AdminNavLinks({ mobile = false }: { mobile?: boolean }) {
  const [open, setOpen] = useState(false);
  if (!mobile) return <nav aria-label="Admin navigation"><NavItems /></nav>;
  return <div className="lg:hidden"><button type="button" aria-label="Open admin navigation" onClick={() => setOpen(true)} className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-slate-300 bg-white text-slate-700 shadow-sm"><Menu className="h-4 w-4" /></button>{open ? <div className="fixed inset-0 z-50 bg-slate-950/40" role="presentation" onClick={() => setOpen(false)}><aside className="h-full w-80 max-w-[88vw] overflow-y-auto bg-white p-5 shadow-xl" role="dialog" aria-modal="true" aria-label="Admin navigation" onClick={(event) => event.stopPropagation()}><div className="mb-8 flex items-center justify-between"><span className="text-sm font-bold text-slate-950">Content Studio</span><button type="button" aria-label="Close admin navigation" onClick={() => setOpen(false)} className="rounded-md p-2 text-slate-500 hover:bg-slate-100"><X className="h-4 w-4" /></button></div><NavItems onNavigate={() => setOpen(false)} /></aside></div> : null}</div>;
}
