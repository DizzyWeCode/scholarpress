import { existsSync } from "node:fs";
import { join } from "node:path";
import Link from "next/link";
import { AlertTriangle, ArrowUpRight, CheckCircle2, CircleHelp, ExternalLink, Info, ShieldCheck } from "lucide-react";
import { AdminCard, AdminCardHeader, AdminPageHeader } from "@/components/admin-ui";
import { getOwnerSession, getSupabaseServer, isSupabaseConfigured } from "@/lib/supabase/server";
import { SITE, isSiteUrlConfigured } from "@/lib/site";

export const dynamic = "force-dynamic";

type State = "configured" | "incomplete" | "warning" | "failing" | "not applicable";
type Check = { label: string; state: State; detail: string; next?: string; href?: string; external?: boolean };
type Section = { id: string; label: string; description: string; checks: Check[] };

const STATE_LABEL: Record<State, string> = {
  configured: "Configured",
  incomplete: "Incomplete",
  warning: "Review",
  failing: "Action required",
  "not applicable": "Not applicable",
};

const STATE_STYLES: Record<State, string> = {
  configured: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  incomplete: "bg-amber-50 text-amber-800 ring-amber-600/20",
  warning: "bg-amber-50 text-amber-800 ring-amber-600/20",
  failing: "bg-rose-50 text-rose-700 ring-rose-600/20",
  "not applicable": "bg-slate-100 text-slate-600 ring-slate-500/20",
};

const STATE_ICON: Record<State, typeof CheckCircle2> = {
  configured: CheckCircle2,
  incomplete: AlertTriangle,
  warning: Info,
  failing: AlertTriangle,
  "not applicable": CircleHelp,
};

function StatusPill({ state }: { state: State }) {
  return <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ring-inset ${STATE_STYLES[state]}`}>{STATE_LABEL[state]}</span>;
}

function CheckRow({ check }: { check: Check }) {
  const Icon = STATE_ICON[check.state];
  return (
    <div className="border-t border-slate-200 px-5 py-5">
      <div className="flex items-start gap-3">
        <Icon className={`mt-0.5 h-4 w-4 shrink-0 ${check.state === "configured" ? "text-emerald-700" : check.state === "not applicable" ? "text-slate-400" : "text-amber-700"}`} aria-hidden="true" />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2"><h3 className="text-sm font-medium text-slate-900">{check.label}</h3><StatusPill state={check.state} /></div>
          <p className="mt-1 text-sm leading-6 text-slate-500">{check.detail}</p>
          {check.next ? <p className="mt-3 text-xs leading-5 text-slate-700"><span className="font-semibold">Next:</span> {check.next}</p> : null}
          {check.href ? <Link href={check.href} target={check.external ? "_blank" : undefined} rel={check.external ? "noreferrer" : undefined} className="mt-3 inline-flex min-h-9 items-center gap-1.5 rounded-md border border-slate-300 bg-white px-3 text-xs font-semibold text-slate-700 shadow-sm transition hover:border-indigo-400 hover:bg-indigo-50 hover:text-indigo-700">{check.external ? "Open provider" : "Open area"}<ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" /></Link> : null}
        </div>
      </div>
    </div>
  );
}

function CheckSection({ section }: { section: Section }) {
  const attentionCount = section.checks.filter((check) => !["configured", "not applicable"].includes(check.state)).length;
  return <section id={section.id} className="scroll-mt-28"><AdminCard><AdminCardHeader title={section.label} description={section.description} action={attentionCount > 0 ? <span className="text-xs font-medium text-amber-800">{attentionCount} to review</span> : <span className="text-xs font-medium text-emerald-700">Ready</span>} /><div>{section.checks.map((check) => <CheckRow key={check.label} check={check} />)}</div></AdminCard></section>;
}

function SectionNav({ sections }: { sections: Section[] }) {
  return <nav aria-label="Settings sections" className="rounded-lg border border-slate-200 bg-white p-2 shadow-sm"><p className="px-3 pb-2 pt-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">On this page</p>{sections.map((section) => <a key={section.id} href={`#${section.id}`} className="block rounded-md px-3 py-2.5 text-sm text-slate-600 transition hover:bg-slate-50 hover:text-slate-950">{section.label}</a>)}</nav>;
}

function ReferenceCard({ href, label, detail }: { href: string; label: string; detail: string }) {
  return <a href={href} target="_blank" rel="noreferrer" className="group rounded-md border border-slate-200 p-4 transition hover:border-indigo-300 hover:bg-indigo-50"><div className="flex items-start justify-between gap-3"><p className="font-medium text-slate-900">{label}</p><ExternalLink className="h-4 w-4 text-slate-400 group-hover:text-indigo-700" aria-hidden="true" /></div><p className="mt-1 text-xs leading-5 text-slate-500">{detail}</p></a>;
}

export default async function AdminSettingsPage() {
  const supabaseConfigured = isSupabaseConfigured();
  const session = supabaseConfigured ? await getOwnerSession() : { user: null, isOwner: false };
  let profileName: string | null = null;
  let emailLogState: State = "not applicable";
  let emailLogDetail = "Connect Supabase to verify delivery records.";
  let upcomingCount: number | null = null;

  if (supabaseConfigured && session.user) {
    const supabase = getSupabaseServer();
    const [profileResult, emailResult, webinarResult] = await Promise.all([
      supabase.from("profiles").select("full_name").eq("id", session.user.id).maybeSingle(),
      supabase.from("email_sends").select("id", { count: "exact", head: true }),
      supabase.from("webinars").select("id", { count: "exact", head: true }).eq("status", "upcoming"),
    ]);
    profileName = profileResult.data?.full_name ?? null;
    if (emailResult.error) {
      emailLogState = "warning";
      emailLogDetail = "The delivery log is unavailable. This usually means the email tracking migration has not been deployed.";
    } else {
      emailLogState = "configured";
      emailLogDetail = `${emailResult.count ?? 0} delivery records are available for inspection.`;
    }
    upcomingCount = webinarResult.count ?? 0;
  }

  const sections: Section[] = [
    {
      id: "general-identity",
      label: "General identity",
      description: "The public name, author details, and scholarly links visitors see.",
      checks: [
        { label: "Site identity", state: "configured", detail: `${SITE.name} · ${SITE.tagline}`, next: "Edit src/lib/site.ts, review the public pages, then redeploy." },
        { label: "Affiliation and contact", state: "configured", detail: `${SITE.affiliation} · ${SITE.email}`, next: "Keep public contact details current and verified." },
        { label: "Scholarly profiles", state: SITE.researchgate ? "configured" : "incomplete", detail: SITE.researchgate ? "ResearchGate is configured. Other profiles remain blank until their exact URLs are confirmed." : "No scholarly profile URL is configured.", next: "Add only confirmed ORCID, Google Scholar, LinkedIn, or other profile URLs." },
      ],
    },
    {
      id: "domain-sharing",
      label: "Domain and sharing",
      description: "Canonical URLs, public routes, and social-sharing readiness.",
      checks: [
        { label: "Canonical site URL", state: isSiteUrlConfigured() ? "configured" : "incomplete", detail: isSiteUrlConfigured() ? "NEXT_PUBLIC_SITE_URL is present and used for canonical links, sitemap, sharing, and email URLs." : "NEXT_PUBLIC_SITE_URL is missing; production currently falls back to https://dr-fraction.me.", next: isSiteUrlConfigured() ? "Verify the value matches the deployed custom domain." : "Set NEXT_PUBLIC_SITE_URL in the deployment environment, then redeploy. See docs/deployment-public-url-guide.md in the repository." },
        { label: "Sitemap and robots routes", state: "configured", detail: "The application provides /sitemap.xml and /robots.txt routes.", next: "Check both URLs on the deployed domain before launch.", href: "/sitemap.xml" },
        { label: "Public identity configuration", state: "configured", detail: `${SITE.name} and the current public author information are compiled from src/lib/site.ts.`, next: "Update the source configuration and redeploy when identity copy changes." },
      ],
    },
    {
      id: "email-communication",
      label: "Email and communication",
      description: "Provider readiness, delivery observability, and scheduled reminders.",
      checks: [
        { label: "Supabase connection", state: supabaseConfigured ? "configured" : "incomplete", detail: supabaseConfigured ? "The application has the public Supabase connection required for authenticated workspace access." : "Supabase environment variables are not present in this deployment.", next: supabaseConfigured ? "Keep the anon key public and never expose the service role key." : "Configure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY." },
        { label: "Email delivery provider", state: process.env.RESEND_API_KEY && process.env.RESEND_FROM ? "configured" : "incomplete", detail: process.env.RESEND_API_KEY && process.env.RESEND_FROM ? "Resend credentials and a sender identity are present without displaying secret values." : "Resend sender configuration is incomplete; newsletter and announcement sends may not work.", next: "Set RESEND_API_KEY and RESEND_FROM in the deployment environment." },
        { label: "Delivery log", state: emailLogState, detail: emailLogDetail, next: emailLogState === "warning" ? "Apply the email tracking migration in Supabase, then refresh this page." : "Use Email delivery to inspect failures and bounces.", href: "/admin/email" },
        { label: "Reminder cron", state: process.env.CRON_SECRET ? "configured" : "incomplete", detail: process.env.CRON_SECRET ? "A cron authentication secret is present." : "The webinar reminder endpoint has no configured cron secret.", next: "Configure CRON_SECRET and the scheduled job in the deployment provider." },
      ],
    },
    {
      id: "events-webinars",
      label: "Events and webinars",
      description: "The current event inventory and the next operational check.",
      checks: [
        { label: "Upcoming events", state: upcomingCount === null ? "not applicable" : "configured", detail: upcomingCount === null ? "Connect Supabase to inspect scheduled events." : `${upcomingCount} upcoming event${upcomingCount === 1 ? "" : "s"} currently visible to the owner.`, next: "Open Events to check promise, date, registration path, and image fallback.", href: "/admin/webinars" },
        { label: "Event configuration", state: "warning", detail: "Default timezone, registration mode, reminder cadence, replay visibility, and image fallbacks are configured per webinar today.", next: "Review each event before publishing; a guided campaign editor is a later workflow milestone." },
      ],
    },
    {
      id: "audience-consent",
      label: "Audience and consent",
      description: "Where visitor signup, event consent, and privacy information are managed.",
      checks: [
        { label: "Newsletter signup", state: "configured", detail: "Public signup is handled through the newsletter form and stored in the subscribers table.", next: "Use Subscribers to export or review the audience." , href: "/admin/subscribers" },
        { label: "Privacy and cookie pages", state: "configured", detail: "Public privacy, cookie, and terms routes are available from the site footer.", next: "Review the wording whenever consent or retention behavior changes.", href: "/legal/privacy" },
        { label: "Course-interest signals", state: "warning", detail: "Webinar course-interest capture exists, but a dedicated owner review state is not yet available.", next: "Review signals through the webinar workflow until the course-interest list milestone is implemented.", href: "/admin/webinars" },
      ],
    },
    {
      id: "media-imagery",
      label: "Media and imagery",
      description: "Assets used in public surfaces and whether they are approved for launch.",
      checks: [
        { label: "Hero image", state: existsSync(join(process.cwd(), "public", SITE.images.hero.src)) ? "warning" : "failing", detail: `${SITE.images.hero.src} exists but is marked as temporary preview imagery.`, next: "Replace it with an approved original image and credit it in the site configuration." },
        { label: "About portrait", state: existsSync(join(process.cwd(), "public", SITE.images.aboutPortrait.src)) ? "warning" : "failing", detail: `${SITE.images.aboutPortrait.src} exists but is marked as a placeholder.`, next: "Replace it with an approved portrait or deliberate typographic treatment." },
        { label: "Default Open Graph image", state: existsSync(join(process.cwd(), "public", "covers/research-still-life.jpg")) ? "warning" : "failing", detail: "The default social image exists, but the site configuration identifies it as temporary.", next: "Approve a permanent share image before broad launch." },
      ],
    },
    {
      id: "ownership-access",
      label: "Ownership and access",
      description: "Who can enter the workspace and how private data remains protected.",
      checks: [
        { label: "Current signed-in owner", state: session.isOwner ? "configured" : "failing", detail: session.user?.email ? `${profileName ? `${profileName} · ` : ""}${session.user.email}` : "No owner session was available.", next: session.isOwner ? "Ownership is managed through the profiles table and protected RLS policies." : "Confirm the signed-in profile has role = owner through the approved Supabase process." },
        { label: "Authentication boundary", state: supabaseConfigured ? "configured" : "incomplete", detail: "The admin shell requires an authenticated profile with owner role; private access and subscriber data are not exposed here.", next: "Test sign-in, redirect URLs, and owner access against production before launch." },
      ],
    },
    {
      id: "data-maintenance",
      label: "Data and maintenance",
      description: "Migration, scheduled-job, and maintenance guidance without unsafe controls.",
      checks: [
        { label: "Migration visibility", state: "warning", detail: "The browser cannot safely infer every migration’s production application state.", next: "Run and record pending migrations in the Supabase SQL editor; do not paste service credentials here." },
        { label: "Maintenance guidance", state: "configured", detail: "Settings does not expose arbitrary SQL, service credentials, or destructive maintenance controls.", next: "Use repository migrations and the deployment provider for infrastructure changes." },
      ],
    },
  ];

  const allChecks = sections.flatMap((section) => section.checks);
  const attentionCount = allChecks.filter((check) => ["incomplete", "warning", "failing"].includes(check.state)).length;
  const configuredCount = allChecks.filter((check) => check.state === "configured").length;

  return (
    <div className="space-y-6">
      <AdminPageHeader eyebrow="System" title="Settings" description="Check the platform, understand what each status means, and follow the next action. Settings that live in deployment or Supabase stay read-only here." />

      <AdminCard className="overflow-hidden">
        <div className="flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div><div className="flex items-center gap-2"><ShieldCheck className="h-5 w-5 text-slate-700" aria-hidden="true" /><h2 className="text-base font-semibold text-slate-950">Platform readiness</h2></div><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">{attentionCount === 0 ? "Everything that can be checked from the application is configured." : `${attentionCount} check${attentionCount === 1 ? " needs" : "s need"} your review. Start with the attention list below.`}</p></div>
          <div className="flex shrink-0 gap-6 border-t border-slate-200 pt-4 sm:border-l sm:border-t-0 sm:pl-6 sm:pt-0"><div><p className="text-2xl font-semibold text-slate-950">{configuredCount}</p><p className="mt-1 text-xs text-slate-500">configured</p></div><div><p className="text-2xl font-semibold text-slate-950">{attentionCount}</p><p className="mt-1 text-xs text-slate-500">to review</p></div></div>
        </div>
        {attentionCount > 0 ? <div className="border-t border-amber-200 bg-amber-50 px-5 py-3 text-sm text-amber-900 sm:px-6"><span className="font-semibold">Start here:</span> review the amber and red rows in Domain and sharing, Email and communication, and Media and imagery.</div> : null}
      </AdminCard>

      <div className="lg:hidden"><div className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Settings sections</div><div className="flex gap-2 overflow-x-auto pb-1">{sections.map((section) => <a key={section.id} href={`#${section.id}`} className="shrink-0 rounded-full border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-700">{section.label}</a>)}</div></div>

      <div className="grid items-start gap-6 lg:grid-cols-[220px_minmax(0,1fr)]">
        <div className="hidden lg:block lg:sticky lg:top-24"><SectionNav sections={sections} /></div>
        <div className="min-w-0 space-y-6">{sections.map((section) => <CheckSection key={section.id} section={section} />)}<AdminCard><AdminCardHeader title="Safe deployment references" description="Complete infrastructure changes in the provider that owns them." /><div className="grid gap-3 p-5 sm:grid-cols-3"><ReferenceCard href="https://vercel.com/" label="Deployment environment" detail="Set the public URL and server-managed email values." /><ReferenceCard href="https://supabase.com/dashboard/" label="Supabase project" detail="Apply migrations, verify RLS, auth redirects, and cron setup." /><Link href="/admin/email" className="group rounded-md border border-slate-200 p-4 transition hover:border-indigo-300 hover:bg-indigo-50"><div className="flex items-start justify-between gap-3"><p className="font-medium text-slate-900">Email delivery</p><ArrowUpRight className="h-4 w-4 text-slate-400 group-hover:text-indigo-700" aria-hidden="true" /></div><p className="mt-1 text-xs leading-5 text-slate-500">Inspect sends, delivery, opens, bounces, and failures.</p></Link></div></AdminCard></div>
      </div>

      <p className="text-xs leading-5 text-slate-500">Settings intentionally does not edit environment variables, ownership roles, service credentials, or arbitrary database state. Those changes belong in the deployment provider or approved Supabase workflow.</p>
    </div>
  );
}
