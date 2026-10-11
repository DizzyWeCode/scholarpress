"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { format } from "date-fns";
import {
  AlertTriangle,
  ArrowRight,
  CalendarClock,
  CheckCircle2,
  CircleAlert,
  FileText,
  Mail,
  MessageSquare,
  RefreshCw,
  Users,
} from "lucide-react";
import { getSupabaseBrowser } from "@/lib/supabase/client";
import {
  AdminButton,
  AdminCard,
  AdminCardHeader,
  AdminPageHeader,
  AdminSpinner,
  StatusBadge,
} from "@/components/admin-ui";

type DashboardData = {
  drafts: number;
  scheduled: number;
  webinarAnnouncements: number;
  hiddenComments: number;
  failedEmails: number;
  replaysToPublish: number;
  views30d: number;
  published: number;
  papers: number;
  subscribers: number;
  posts: { id: string; title: string; status: string; updated_at: string }[];
  comments: { id: string; author_name: string; body: string; created_at: string }[];
  webinars: { id: string; title: string; starts_at: string }[];
  nextWebinar: { id: string; title: string; starts_at: string } | null;
  failedAreas: string[];
};

type AttentionItem = {
  label: string;
  detail: string;
  value: number;
  href: string;
  icon: typeof FileText;
  tone: "coral" | "gold" | "teal" | "slate";
};

const TONE_STYLES: Record<AttentionItem["tone"], string> = {
  coral: "border-l-4 border-l-rose-500 bg-rose-50/50",
  gold: "border-l-4 border-l-amber-500 bg-amber-50/50",
  teal: "border-l-4 border-l-teal-600 bg-teal-50/50",
  slate: "border-l-4 border-l-slate-400 bg-slate-50",
};

function countFrom(result: { count: number | null }): number {
  return result.count ?? 0;
}

export default function AdminDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    const supabase = getSupabaseBrowser();
    const since = new Date(Date.now() - 30 * 86400000).toISOString();
    const recent = new Date(Date.now() - 7 * 86400000).toISOString();

    const [drafts, scheduled, hidden, recentComments, views, webinars, announcements, published, papers, subscribers, posts, comments, upcoming, failedEmails, replaysToPublish] = await Promise.all([
      supabase.from("posts").select("id", { count: "exact", head: true }).eq("status", "draft"),
      supabase.from("posts").select("id", { count: "exact", head: true }).eq("status", "scheduled"),
      supabase.from("comments").select("id", { count: "exact", head: true }).eq("status", "hidden"),
      supabase.from("comments").select("id", { count: "exact", head: true }).gte("created_at", recent),
      supabase.from("page_views").select("id", { count: "exact", head: true }).gte("created_at", since),
      supabase.from("webinars").select("id").eq("status", "upcoming"),
      supabase.from("email_sends").select("webinar_id").eq("purpose", "webinar_announcement"),
      supabase.from("posts").select("id", { count: "exact", head: true }).eq("status", "published"),
      supabase.from("papers").select("id", { count: "exact", head: true }),
      supabase.from("subscribers").select("id", { count: "exact", head: true }),
      supabase.from("posts").select("id,title,status,updated_at").order("updated_at", { ascending: false }).limit(5),
      supabase.from("comments").select("id,author_name,body,created_at").order("created_at", { ascending: false }).limit(5),
      supabase.from("webinars").select("id,title,starts_at").eq("status", "upcoming").order("starts_at", { ascending: true }).limit(5),
      supabase.from("email_sends").select("id", { count: "exact", head: true }).in("status", ["failed", "bounced"]),
      supabase.from("webinars").select("id", { count: "exact", head: true }).eq("status", "past").is("recording_url", null),
    ]);

    const results = { drafts, scheduled, hidden, recentComments, views, webinars, announcements, published, papers, subscribers, posts, comments, upcoming, failedEmails, replaysToPublish };
    const failedAreas = Object.entries(results)
      .filter(([, result]) => result.error)
      .map(([area]) => area);
    const announced = new Set((announcements.data ?? []).map((row) => row.webinar_id).filter(Boolean));
    const upcomingWebinars = (upcoming.data ?? []) as DashboardData["webinars"];
    const nextWebinar = upcomingWebinars[0] ?? null;
    const upcomingRows = (webinars.data ?? []) as { id: string }[];

    setData({
      drafts: countFrom(drafts),
      scheduled: countFrom(scheduled),
      webinarAnnouncements: upcomingRows.filter((row) => !announced.has(row.id)).length,
      hiddenComments: countFrom(hidden),
      failedEmails: countFrom(failedEmails),
      replaysToPublish: countFrom(replaysToPublish),
      views30d: countFrom(views),
      published: countFrom(published),
      papers: countFrom(papers),
      subscribers: countFrom(subscribers),
      posts: (posts.data ?? []) as DashboardData["posts"],
      comments: (comments.data ?? []) as DashboardData["comments"],
      webinars: upcomingWebinars,
      nextWebinar,
      failedAreas,
    });
    if (failedAreas.length > 0) {
      setError("Some dashboard areas could not be updated. The available panels are still shown below.");
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const attention: AttentionItem[] = data
    ? [
        { label: "Drafts awaiting a decision", detail: "Review, schedule, or move back to notes.", value: data.drafts, href: "/admin/posts?status=draft", icon: FileText, tone: "slate" },
        { label: "Webinars awaiting promotion", detail: "Send an announcement for an upcoming session.", value: data.webinarAnnouncements, href: "/admin/webinars?status=upcoming", icon: CalendarClock, tone: "gold" },
        { label: "Comments to review", detail: "Hidden comments are waiting for moderation.", value: data.hiddenComments, href: "/admin/comments?status=hidden", icon: MessageSquare, tone: "coral" },
        { label: "Failed or bounced emails", detail: "Check delivery errors before sending again.", value: data.failedEmails, href: "/admin/email?status=failed", icon: Mail, tone: "coral" },
        { label: "Replays to publish", detail: "Past sessions without a recording link.", value: data.replaysToPublish, href: "/admin/webinars?status=past", icon: CalendarClock, tone: "teal" },
        ...(!process.env.NEXT_PUBLIC_SITE_URL
          ? [{ label: "Canonical domain is incomplete", detail: "Set NEXT_PUBLIC_SITE_URL before launch and sharing.", value: 1, href: "/admin/settings#domain-sharing", icon: AlertTriangle, tone: "coral" as const }]
          : []),
      ]
    : [];

  const metrics = data
    ? [
        { label: "Published writing", value: data.published },
        { label: "Research papers", value: data.papers },
        { label: "Subscribers", value: data.subscribers },
        { label: "Views · 30 days", value: data.views30d },
      ]
    : [];

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Owner workspace"
        title="What needs your attention?"
        description="A practical view of publishing work, event follow-up, audience health, and the next decision to make."
        actions={
          <AdminButton onClick={() => void load()} disabled={loading} variant="secondary">
            <RefreshCw className={`mr-1.5 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </AdminButton>
        }
      />

      {error ? (
        <div role="alert" className="flex items-start gap-3 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          <CircleAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <div><p>{error}</p><p className="mt-1 text-xs text-amber-800">Try refresh after checking the affected area. Other panels remain usable.</p></div>
        </div>
      ) : null}

      <section aria-labelledby="attention-heading">
        <div className="mb-3 flex items-center justify-between gap-4">
          <div><h2 id="attention-heading" className="text-sm font-semibold text-slate-900">Needs attention</h2><p className="mt-1 text-xs text-slate-500">Each item opens the work that resolves it.</p></div>
          {data && data.failedAreas.length === 0 ? <span className="inline-flex items-center gap-1.5 text-xs text-emerald-700"><CheckCircle2 className="h-3.5 w-3.5" /> Data up to date</span> : null}
        </div>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {loading && !data
            ? Array.from({ length: 6 }).map((_, index) => <div key={index} className="h-32 animate-pulse rounded-lg border border-slate-200 bg-slate-100" />)
            : attention.map((item) => {
                const Icon = item.icon;
                return (
                  <Link key={item.label} href={item.href} className={`group rounded-lg border border-slate-200 p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-indigo-300 hover:shadow ${TONE_STYLES[item.tone]}`}>
                    <div className="flex items-start justify-between gap-3"><span className="flex h-9 w-9 items-center justify-center rounded-md bg-white/80 text-slate-700 ring-1 ring-slate-200"><Icon className="h-4 w-4" aria-hidden="true" /></span><span className="text-2xl font-semibold tracking-tight text-slate-950">{item.value}</span></div>
                    <p className="mt-4 text-sm font-semibold text-slate-900">{item.label}</p>
                    <p className="mt-1 text-xs leading-5 text-slate-600">{item.value > 0 ? item.detail : "Nothing waiting here right now."}</p>
                    <span className="mt-3 inline-flex items-center text-xs font-semibold text-indigo-700">{item.value > 0 ? "Open work" : "View area"}<ArrowRight className="ml-1 h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" /></span>
                  </Link>
                );
              })}
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[1fr_1.25fr]">
        <AdminCard>
          <AdminCardHeader title="Today / next" description="The next time-sensitive decision in your workspace." />
          <div className="p-5">
            {loading && !data ? <div className="flex items-center gap-2 text-sm text-slate-500"><AdminSpinner /> Checking upcoming work</div> : data?.nextWebinar ? <Link href={`/admin/webinars?focus=${data.nextWebinar.id}`} className="group block rounded-md border border-amber-200 bg-amber-50 p-4 hover:border-amber-400"><div className="flex items-start justify-between gap-4"><div><p className="text-xs font-semibold uppercase tracking-wider text-amber-800">Upcoming event</p><p className="mt-2 font-medium text-slate-900">{data.nextWebinar.title}</p><p className="mt-1 text-sm text-slate-600">{format(new Date(data.nextWebinar.starts_at), "EEE, dd MMM yyyy · HH:mm")}</p></div><CalendarClock className="h-5 w-5 text-amber-700" aria-hidden="true" /></div><span className="mt-4 inline-flex items-center text-xs font-semibold text-indigo-700">Open webinar <ArrowRight className="ml-1 h-3.5 w-3.5" /></span></Link> : <div className="rounded-md border border-slate-200 bg-slate-50 p-4"><p className="text-sm font-medium text-slate-900">No upcoming event is scheduled.</p><p className="mt-1 text-xs leading-5 text-slate-600">Create an event when there is a clear promise, date, and registration path.</p><Link href="/admin/webinars" className="mt-3 inline-flex items-center text-xs font-semibold text-indigo-700">View events <ArrowRight className="ml-1 h-3.5 w-3.5" /></Link></div>}
          </div>
        </AdminCard>
        <AdminCard>
          <AdminCardHeader title="Quick actions" description="Start a common workflow without hunting through the navigation." />
          <div className="grid grid-cols-2 gap-3 p-5 sm:grid-cols-3"><QuickAction href="/admin/posts/new" icon={FileText} label="New writing" /><QuickAction href="/admin/papers" icon={FileText} label="Add research" /><QuickAction href="/admin/webinars" icon={CalendarClock} label="New event" /><QuickAction href="/admin/comments" icon={MessageSquare} label="Review comments" /><QuickAction href="/admin/subscribers" icon={Users} label="View subscribers" /><QuickAction href="/admin/analytics" icon={ArrowRight} label="Open analytics" /></div>
        </AdminCard>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <AdminCard><AdminCardHeader title="Recent work" action={<Link href="/admin/posts" className="text-xs font-semibold text-indigo-600">View writing <ArrowRight className="ml-1 inline h-3.5 w-3.5" /></Link>} /><div className="divide-y divide-slate-100">{data?.posts.map((post) => <Link href={`/admin/posts/${post.id}`} key={post.id} className="flex items-center justify-between gap-3 px-5 py-3 hover:bg-slate-50"><span className="min-w-0 truncate text-sm font-medium text-slate-700">{post.title || "Untitled"}<span className="mt-1 block text-xs font-normal text-slate-400">Updated {format(new Date(post.updated_at), "dd MMM yyyy")}</span></span><StatusBadge status={post.status} /></Link>) ?? <p className="flex items-center gap-2 p-5 text-sm text-slate-500"><AdminSpinner /> Updating recent work</p>}</div></AdminCard>
        <AdminCard><AdminCardHeader title="Recent comments" action={<Link href="/admin/comments" className="text-xs font-semibold text-indigo-600">View all <ArrowRight className="ml-1 inline h-3.5 w-3.5" /></Link>} /><div className="divide-y divide-slate-100">{data?.comments.map((comment) => <Link href="/admin/comments" key={comment.id} className="block px-5 py-3 hover:bg-slate-50"><p className="truncate text-sm font-medium text-slate-700">{comment.author_name || "Reader"}</p><p className="mt-1 truncate text-xs text-slate-500">{comment.body}</p></Link>) ?? <p className="flex items-center gap-2 p-5 text-sm text-slate-500"><AdminSpinner /> Updating comments</p>}</div></AdminCard>
        <AdminCard><AdminCardHeader title="Outcome snapshot" description="A quick read on publishing and audience scale." /><div className="grid grid-cols-2 divide-x divide-y divide-slate-200">{metrics.map((metric) => <div key={metric.label} className="p-5"><p className="text-2xl font-semibold text-slate-950">{metric.value}</p><p className="mt-1 text-xs text-slate-500">{metric.label}</p></div>)}</div><Link href="/admin/analytics" className="block border-t border-slate-200 px-5 py-3 text-xs font-semibold text-indigo-700 hover:bg-slate-50">See audience and event analytics <ArrowRight className="ml-1 inline h-3.5 w-3.5" /></Link></AdminCard>
      </div>
    </div>
  );
}

function QuickAction({ href, icon: Icon, label }: { href: string; icon: typeof FileText; label: string }) {
  return <Link href={href} className="group flex min-h-20 flex-col justify-between rounded-md border border-slate-200 p-3 text-sm font-medium text-slate-700 transition hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700"><Icon className="h-4 w-4 text-slate-400 group-hover:text-indigo-600" aria-hidden="true" /><span>{label}</span></Link>;
}
