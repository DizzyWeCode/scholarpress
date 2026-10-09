import Link from "next/link";
import { redirect } from "next/navigation";
import { getOwnerSession, isSupabaseConfigured } from "@/lib/supabase/server";
import { AdminNavLinks } from "@/components/admin-nav-links";

export const dynamic = "force-dynamic";

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
          This area is restricted to the site owner.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-6xl gap-10 px-5 py-10 sm:px-8">
      <aside className="hidden w-44 shrink-0 md:block">
        <p className="text-xs uppercase tracking-[0.25em] text-ink-4">Studio</p>
        <AdminNavLinks />
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
