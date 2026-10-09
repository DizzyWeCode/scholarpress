"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { getSupabaseBrowser } from "@/lib/supabase/client";

type DashboardStats = {
  drafts: number;
  scheduled: number;
  webinarAnnouncements: number;
  hiddenComments: number;
  newComments: number;
  views30d: number;
};

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    const supabase = getSupabaseBrowser();
    const since = new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString();
    const recentCommentsSince = new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString();
    const [drafts, scheduled, hidden, recent, views, webinars, announcements] = await Promise.all([
      supabase.from("posts").select("id", { count: "exact", head: true }).eq("status", "draft"),
      supabase.from("posts").select("id", { count: "exact", head: true }).eq("status", "scheduled"),
      supabase.from("comments").select("id", { count: "exact", head: true }).eq("status", "hidden"),
      supabase.from("comments").select("id", { count: "exact", head: true }).gte("created_at", recentCommentsSince),
      supabase.from("page_views").select("id", { count: "exact", head: true }).gte("created_at", since),
      supabase.from("webinars").select("id").eq("status", "upcoming"),
      supabase.from("email_sends").select("webinar_id").eq("purpose", "webinar_announcement"),
    ]);
    const responses = [drafts, scheduled, hidden, recent, views, webinars, announcements];
    const failed = responses.find((response) => response.error);
    if (failed?.error) {
      setError(`Could not load dashboard: ${failed.error.message}`);
      setLoading(false);
      return;
    }
    const announced = new Set((announcements.data ?? []).map((row) => row.webinar_id).filter(Boolean));
    const webinarAnnouncements = (webinars.data ?? []).filter((row) => !announced.has(row.id)).length;
    setStats({
      drafts: drafts.count ?? 0,
      scheduled: scheduled.count ?? 0,
      webinarAnnouncements,
      hiddenComments: hidden.count ?? 0,
      newComments: recent.count ?? 0,
      views30d: views.count ?? 0,
    });
    setLoading(false);
  }, []);

  useEffect(() => { void load(); }, [load]);

  const cards = [
    { label: "Drafts", value: stats?.drafts, href: "/admin/posts?status=draft", tone: "ink" },
    { label: "Scheduled posts", value: stats?.scheduled, href: "/admin/posts?status=scheduled", tone: "ink" },
    { label: "Webinars without announcement", value: stats?.webinarAnnouncements, href: "/admin/webinars", tone: "ink" },
    { label: "Hidden comments", value: stats?.hiddenComments, href: "/admin/comments?status=hidden", tone: "ink" },
    { label: "New comments (7 days)", value: stats?.newComments, href: "/admin/comments", tone: "ink" },
    { label: "Views (30 days)", value: stats?.views30d, href: "/admin/analytics", tone: "ink" },
  ];

  return (
    <div>
      <div className="flex flex-wrap items-baseline justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-ink-4">Studio overview</p>
          <h1 className="mt-2 font-serif text-3xl tracking-tight text-ink">Dashboard</h1>
        </div>
        <button type="button" onClick={() => void load()} disabled={loading} className="text-xs text-ink-3 underline underline-offset-2 disabled:opacity-40">Refresh</button>
      </div>
      {error ? <div role="alert" className="mt-6 flex flex-wrap items-center justify-between gap-3 border border-red-700/40 bg-paper-2 px-4 py-3 text-sm text-red-700"><span>{error}</span><button type="button" onClick={() => void load()} className="underline underline-offset-2">Try again</button></div> : null}
      <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => (
          <Link key={card.label} href={card.href} className="border border-line p-5 transition-colors hover:bg-paper-2" style={{ borderRadius: 7 }}>
            {loading ? <div className="h-9 w-16 animate-pulse rounded bg-paper-2" aria-label="Loading" /> : <p className="font-serif text-3xl tracking-tight text-ink">{card.value ?? 0}</p>}
            <p className="mt-2 text-xs uppercase tracking-widest text-ink-4">{card.label}</p>
          </Link>
        ))}
      </div>
      <p className="mt-8 max-w-lg text-sm leading-relaxed text-ink-3">Start with the cards above: clear drafts, review scheduled posts, announce upcoming webinars, and moderate recent comments. Analytics counts only include visitors who accepted analytics cookies.</p>
    </div>
  );
}
