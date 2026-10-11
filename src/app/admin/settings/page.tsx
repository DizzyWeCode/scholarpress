import { existsSync } from "node:fs";
import { join } from "node:path";
import Link from "next/link";
import { AdminCard, AdminCardHeader, AdminPageHeader, StatusBadge } from "@/components/admin-ui";
import { getOwnerSession, getSupabaseServer, isSupabaseConfigured } from "@/lib/supabase/server";
import { SITE, isSiteUrlConfigured } from "@/lib/site";

export const dynamic = "force-dynamic";

type State = "configured" | "incomplete" | "warning" | "failing" | "not applicable";

type Check = {
  label: string;
  state: State;
  detail: string;
  next?: string;
  href?: string;
};

const STATE_STYLES: Record<State, string> = {
  configured: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  incomplete: "bg-amber-50 text-amber-800 ring-amber-600/20",
  warning: "bg-amber-50 text-amber-800 ring-amber-600/20",
  failing: "bg-rose-50 text-rose-700 ring-rose-600/20",
  "not applicable": "bg-slate-100 text-slate-600 ring-slate-500/20",
};

function CheckRow({ check }: { check: Check }) {
  const content = (
    <div className="flex flex-col gap-3 border-t border-slate-200 px-5 py-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2"><p className="text-sm font-medium text-slate-900">{check.label}</p><span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold capitalize ring-1 ring-inset ${STATE_STYLES[check.state]}`}>{check.state}</span></div>
        <p className="mt-1 text-sm leading-6 text-slate-500">{check.detail}</p>
        {check.next ? <p className="mt-2 text-xs font-medium text-slate-700">Next: {check.next}</p> : null}
      </div>
      {check.href ? <span className="shrink-0 text-xs font-semibold text-indigo-700">Open →</span> : null}
    </div>
  );
  return check.href ? <Link href={check.href} className="block transition hover:bg-slate-50">{content}</Link> : content;
}

function CheckSection({ title, description, checks }: { title: string; description: string; checks: Check[] }) {
  return <AdminCard><AdminCardHeader title={title} description={description} /><div>{checks.map((check) => <CheckRow key={check.label} check={check} />)}</div></AdminCard>;
}

export default async function AdminSettingsPage() {
  const configured = isSupabaseConfigured();
  const session = configured ? await getOwnerSession() : { user: null, isOwner: false };
  let profileName: string | null = null;
  let emailLogState: State = "not applicable";
  let emailLogDetail = "Connect Supabase to verify delivery records.";
  let upcomingCount: number | null = null;

  if (configured && session.user) {
    const supabase = getSupabaseServer();
    const [profileResult, emailResult, webinarResult] = await Promise.all([
      supabase.from("profiles").select("full_name").eq("id", session.user.id).maybeSingle(),
      supabase.from("email_sends").select("id", { count: "exact", head: true }),
      supabase.from("webinars").select("id", { count: "exact", head: true }).eq("status", "upcoming"),
    ]);
    profileName = profileResult.data?.full_name ?? null;
    if (emailResult.error) {
      emailLogState = "warning";
      emailLogDetail = "The email delivery log is unavailable, usually because the email tracking migration has not been deployed.";
    } else {
      emailLogState = "configured";
      emailLogDetail = `${emailResult.count ?? 0} delivery records are available for inspection.`;
    }
    upcomingCount = webinarResult.count ?? 0;
  }

  const mediaChecks: Check[] = [
    { label: "Hero image", state: existsSync(join(process.cwd(), "public", SITE.images.hero.src)) ? "warning" : "failing", detail: `${SITE.images.hero.src} is currently marked as temporary preview imagery.`, next: "Replace with an approved original image and credit it in the site configuration." },
    { label: "About portrait", state: existsSync(join(process.cwd(), "public", SITE.images.aboutPortrait.src)) ? "warning" : "failing", detail: `${SITE.images.aboutPortrait.src} is currently marked as a temporary placeholder.`, next: "Replace it with an approved portrait or deliberate typographic treatment." },
    { label: "Default Open Graph image", state: existsSync(join(process.cwd(), "public", "covers/research-still-life.jpg")) ? "warning" : "failing", detail: "The default social image exists, but the current site configuration identifies it as temporary.", next: "Approve a permanent share image before broad launch." },
  ];

  const domainChecks: Check[] = [
    { label: "Canonical site URL", state: isSiteUrlConfigured() ? "configured" : "incomplete", detail: isSiteUrlConfigured() ? "NEXT_PUBLIC_SITE_URL is present and used for canonical links, sitemap, sharing, and email URLs." : "NEXT_PUBLIC_SITE_URL is missing; production falls back to https://dr-fraction.me.", next: isSiteUrlConfigured() ? "Verify the value matches the deployed custom domain." : "Set NEXT_PUBLIC_SITE_URL in the deployment environment, then redeploy." },
    { label: "Sitemap and robots routes", state: "configured", detail: "The application provides /sitemap.xml and /robots.txt routes.", next: "Check both URLs on the deployed domain before launch.", href: "/sitemap.xml" },
    { label: "Public identity configuration", state: "configured", detail: `${SITE.name} and the current public author information are compiled from src/lib/site.ts.`, next: "Update the source configuration and redeploy when identity copy changes." },
  ];

  const communicationChecks: Check[] = [
    { label: "Supabase connection", state: configured ? "configured" : "incomplete", detail: configured ? "The application has the public Supabase connection required for authenticated workspace access." : "Supabase environment variables are not present in this deployment.", next: configured ? "Keep the anon key public and never expose the service role key." : "Configure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY." },
    { label: "Email delivery provider", state: process.env.RESEND_API_KEY && process.env.RESEND_FROM ? "configured" : "incomplete", detail: process.env.RESEND_API_KEY && process.env.RESEND_FROM ? "Resend credentials and a sender identity are present without displaying secret values." : "Resend sender configuration is incomplete; newsletter and announcement sends may not work.", next: "Set RESEND_API_KEY and RESEND_FROM in the deployment environment." },
    { label: "Delivery log", state: emailLogState, detail: emailLogDetail, next: emailLogState === "warning" ? "Apply the email tracking migration in Supabase, then refresh this page." : "Use Email delivery to inspect failures and bounces.", href: "/admin/email" },
    { label: "Reminder cron", state: process.env.CRON_SECRET ? "configured" : "incomplete", detail: process.env.CRON_SECRET ? "A cron authentication secret is present." : "The webinar reminder endpoint has no configured cron secret.", next: "Configure CRON_SECRET and the scheduled job in the deployment provider." },
  ];

  const ownershipChecks: Check[] = [
    { label: "Current signed-in owner", state: session.isOwner ? "configured" : "failing", detail: session.user?.email ? `${profileName ? `${profileName} · ` : ""}${session.user.email}` : "No owner session was available.", next: session.isOwner ? "Ownership is managed through the profiles table and protected RLS policies." : "Confirm the signed-in profile has role = owner through the approved Supabase process." },
    { label: "Authentication boundary", state: configured ? "configured" : "incomplete", detail: "The admin shell requires an authenticated profile with owner role; private access and subscriber data are not exposed here.", next: "Test sign-in, redirect URLs, and owner access against production before launch." },
  ];

  const maintenanceChecks: Check[] = [
    { label: "Upcoming events", state: upcomingCount === null ? "not applicable" : "configured", detail: upcomingCount === null ? "Connect Supabase to inspect scheduled events." : `${upcomingCount} upcoming event${upcomingCount === 1 ? "" : "s"} currently visible to the owner.`, next: "Open Events to check value proposition, date, registration path, and image fallback.", href: "/admin/webinars" },
    { label: "Migration visibility", state: "warning", detail: "The application can document migrations, but it cannot safely infer every migration’s production application state from the browser.", next: "Run and record pending migrations in the Supabase SQL editor; do not paste service credentials here." },
    { label: "Maintenance guidance", state: "configured", detail: "No arbitrary SQL execution, secret editing, or destructive maintenance controls are exposed in Settings.", next: "Use the repository migrations and deployment provider for infrastructure changes." },
  ];

  return (
    <div className="space-y-6">
      <AdminPageHeader eyebrow="System" title="Settings" description="Verified platform state, safe next steps, and operational checks. Environment-managed values are shown as status only; secrets are never displayed." />

      {!isSiteUrlConfigured() ? <div id="domain-sharing" role="alert" className="flex items-start gap-3 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900"><span className="mt-0.5 font-semibold">Action required</span><p><code>NEXT_PUBLIC_SITE_URL</code> is missing. Set it in the deployment environment before sharing or launching the site.</p></div> : null}

      <div className="grid gap-6 xl:grid-cols-2">
        <CheckSection title="General identity" description="What visitors see and where the public identity is maintained." checks={[{ label: "Site identity", state: "configured", detail: `${SITE.name} · ${SITE.tagline}`, next: "Edit src/lib/site.ts, review the public pages, then redeploy." }, { label: "Affiliation and contact", state: "configured", detail: `${SITE.affiliation} · ${SITE.email}`, next: "Keep public contact details current and verified." }, { label: "Scholarly profiles", state: SITE.researchgate ? "configured" : "incomplete", detail: SITE.researchgate ? "ResearchGate is configured; optional profiles remain intentionally blank until confirmed." : "No scholarly profile URL is configured.", next: "Add only confirmed ORCID, Google Scholar, LinkedIn, or other profile URLs." }]} />
        <CheckSection title="Domain and sharing" description="Canonical URLs, public routes, and social-sharing readiness." checks={domainChecks} />
        <CheckSection title="Email and communication" description="Provider readiness and delivery observability." checks={communicationChecks} />
        <CheckSection title="Ownership and access" description="Who can enter the workspace and how access is protected." checks={ownershipChecks} />
        <CheckSection title="Media and imagery" description="Assets currently used in public surfaces and their approval status." checks={mediaChecks} />
        <CheckSection title="Data and maintenance" description="Safe operational checks without exposing arbitrary database controls." checks={maintenanceChecks} />
      </div>

      <AdminCard>
        <AdminCardHeader title="Safe deployment references" description="Exact places to complete work that cannot be edited from the browser." />
        <div className="grid gap-3 p-5 text-sm sm:grid-cols-3"><Reference href="https://vercel.com/" label="Deployment environment" detail="Set public URL and server-managed email values." /><Reference href="https://supabase.com/dashboard/" label="Supabase project" detail="Apply migrations, verify RLS, auth redirects, and cron setup." /><Link href="/admin/email" className="rounded-md border border-slate-200 p-4 transition hover:border-indigo-300 hover:bg-indigo-50"><p className="font-medium text-slate-900">Email delivery</p><p className="mt-1 text-xs leading-5 text-slate-500">Inspect sends, delivery, opens, bounces, and failures.</p></Link></div>
      </AdminCard>

      <p className="text-xs leading-5 text-slate-500">Settings intentionally does not edit environment variables, ownership roles, service credentials, or arbitrary database state. Those changes belong in the deployment provider or approved Supabase workflow.</p>
    </div>
  );
}

function Reference({ href, label, detail }: { href: string; label: string; detail: string }) {
  return <a href={href} target="_blank" rel="noreferrer" className="rounded-md border border-slate-200 p-4 transition hover:border-indigo-300 hover:bg-indigo-50"><p className="font-medium text-slate-900">{label}</p><p className="mt-1 text-xs leading-5 text-slate-500">{detail}</p></a>;
}
