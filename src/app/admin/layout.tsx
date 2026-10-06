import Link from "next/link";
import { redirect } from "next/navigation";
import { getOwnerSession, isSupabaseConfigured } from "@/lib/supabase/server";
import {
  LayoutDashboard,
  FileText,
  BookOpen,
  MonitorPlay,
  Users,
  BarChart3,
  Settings,
} from "lucide-react";

export const dynamic = "force-dynamic";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/posts", label: "Posts", icon: FileText },
  { href: "/admin/papers", label: "Papers", icon: BookOpen },
  { href: "/admin/webinars", label: "Webinars", icon: MonitorPlay },
  { href: "/admin/subscribers", label: "Subscribers", icon: Users },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (!isSupabaseConfigured()) {
    return (
      <div className="mx-auto max-w-xl px-5 py-28 text-center">
        <h1 className="font-serif text-3xl text-ink">Supabase not configured</h1>
        <p className="mt-4 text-sm leading-relaxed text-ink-3">
          Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to your
          environment (see .env.example and README.md), then reload.
        </p>
      </div>
    );
  }

  const { user, isOwner } = await getOwnerSession();
  if (!user) redirect("/login");
  if (!isOwner) {
    return (
      <div className="mx-auto max-w-xl px-5 py-28 text-center">
        <h1 className="font-serif text-3xl text-ink">Owner access only</h1>
        <p className="mt-4 text-sm leading-relaxed text-ink-3">
          You are signed in as {user.email}, but this account is not marked as
          the site owner. Run the owner SQL in supabase/schema.sql against this
          email address, then reload.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-6xl gap-10 px-5 py-10 sm:px-8">
      <aside className="hidden w-44 shrink-0 md:block">
        <p className="text-xs uppercase tracking-[0.25em] text-ink-4">Studio</p>
        <nav className="mt-5 flex flex-col gap-1">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-2.5 rounded px-3 py-2 text-sm text-ink-3 transition-colors hover:bg-paper-2 hover:text-ink"
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
        </nav>
        <Link
          href="/"
          className="mt-8 block px-3 text-xs text-ink-4 transition-colors hover:text-ink"
        >
          ← View site
        </Link>
      </aside>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
