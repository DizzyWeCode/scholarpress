import Link from "next/link";
import { redirect } from "next/navigation";
import { getOwnerSession, isSupabaseConfigured } from "@/lib/supabase/server";
import { AdminNavLinks } from "@/components/admin-nav-links";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  if (!isSupabaseConfigured()) {
    return <div className="mx-auto max-w-xl px-5 py-28 text-center"><h1 className="font-serif text-3xl text-ink">Studio is not connected</h1><p className="mt-4 text-sm leading-relaxed text-ink-3">Add the Supabase environment variables, then reload the studio.</p></div>;
  }
  const { user, isOwner } = await getOwnerSession();
  if (!user) redirect("/login");
  if (!isOwner) return <div className="mx-auto max-w-xl px-5 py-28 text-center"><h1 className="font-serif text-3xl text-ink">Owner access only</h1><p className="mt-4 text-sm leading-relaxed text-ink-3">This workspace is restricted to the site owner.</p></div>;

  return (
    <div className="admin-theme min-h-screen bg-paper text-ink">
      <div className="flex min-h-screen">
        <aside className="hidden w-64 shrink-0 border-r border-line bg-paper-2 lg:block">
          <div className="flex h-20 items-center border-b border-line px-6">
            <Link href="/admin" className="font-serif text-xl tracking-tight text-ink">Dr Fraction Studio</Link>
          </div>
          <div className="px-4 py-7"><AdminNavLinks /></div>
          <div className="mt-auto border-t border-line px-4 py-4">
            <Link href="/" className="flex items-center gap-2 rounded px-3 py-2 text-sm text-ink-3 hover:bg-paper hover:text-ink">← View live site</Link>
          </div>
        </aside>
        <div className="min-w-0 flex-1">
          <header className="sticky top-0 z-30 flex min-h-20 items-center justify-between border-b border-line bg-paper/95 px-4 backdrop-blur sm:px-6 lg:px-10">
            <div className="flex items-center gap-3">
              <AdminNavLinks mobile />
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-ink-4">Publishing workspace</p>
                <p className="mt-1 font-serif text-xl text-ink lg:hidden">Dr Fraction Studio</p>
                <p className="mt-1 hidden text-sm text-ink-3 lg:block">Make, publish, and understand the work.</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/" className="hidden text-sm text-ink-3 hover:text-ink sm:inline">View live site</Link>
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-ink text-xs font-semibold text-paper" title={user.email ?? "Owner"}>{(user.email?.[0] ?? "O").toUpperCase()}</div>
            </div>
          </header>
          <div className="mx-auto max-w-[1440px] px-4 py-7 sm:px-6 lg:px-10 lg:py-10">{children}</div>
        </div>
      </div>
    </div>
  );
}
