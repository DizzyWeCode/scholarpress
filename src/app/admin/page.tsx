"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getSupabaseBrowser } from "@/lib/supabase/client";

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<{
    posts: number;
    papers: number;
    webinars: number;
    subscribers: number;
    views30d: number;
  } | null>(null);

  useEffect(() => {
    const supabase = getSupabaseBrowser();
    const since = new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString();
    Promise.all([
      supabase.from("posts").select("id", { count: "exact", head: true }),
      supabase.from("papers").select("id", { count: "exact", head: true }),
      supabase.from("webinars").select("id", { count: "exact", head: true }).eq("status", "upcoming"),
      supabase.from("subscribers").select("id", { count: "exact", head: true }),
      supabase.from("page_views").select("id", { count: "exact", head: true }).gte("created_at", since),
    ]).then(([posts, papers, webinars, subscribers, views]) => {
      setStats({
        posts: posts.count ?? 0,
        papers: papers.count ?? 0,
        webinars: webinars.count ?? 0,
        subscribers: subscribers.count ?? 0,
        views30d: views.count ?? 0,
      });
    });
  }, []);

  const cards = [
    { label: "Posts", value: stats?.posts, href: "/admin/posts" },
    { label: "Papers", value: stats?.papers, href: "/admin/papers" },
    { label: "Upcoming webinars", value: stats?.webinars, href: "/admin/webinars" },
    { label: "Subscribers", value: stats?.subscribers, href: "/admin/subscribers" },
    { label: "Views (30 days)", value: stats?.views30d, href: "/admin/analytics" },
  ];

  return (
    <div>
      <h1 className="font-serif text-3xl tracking-tight text-ink">Dashboard</h1>
      <div className="mt-8 grid grid-cols-2 border border-line md:grid-cols-5" style={{ borderRadius: 7 }}>
        {cards.map((card, i) => (
          <Link
            key={card.label}
            href={card.href}
            className={`group p-5 transition-colors hover:bg-paper-2 ${
              i > 0 ? "border-l border-line" : ""
            } ${i >= 2 ? "max-md:border-t max-md:border-line" : ""} ${
              i === 2 ? "max-md:border-l-0" : ""
            }`}
          >
            <p className="font-serif text-3xl tracking-tight text-ink transition-opacity group-hover:opacity-60">
              {card.value ?? "—"}
            </p>
            <p className="mt-1 text-xs uppercase tracking-widest text-ink-4">
              {card.label}
            </p>
          </Link>
        ))}
      </div>
      <p className="mt-8 max-w-lg text-sm leading-relaxed text-ink-3">
        Welcome to the studio. Draft and format articles under{" "}
        <strong className="text-ink">Posts</strong>, curate your publication
        record under <strong className="text-ink">Papers</strong>, announce
        sessions under <strong className="text-ink">Webinars</strong>, and
        follow readership under <strong className="text-ink">Analytics</strong>.
      </p>
    </div>
  );
}
