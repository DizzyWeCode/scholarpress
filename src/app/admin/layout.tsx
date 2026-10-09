import Link from "next/link";
import { redirect } from "next/navigation";
import { getOwnerSession, isSupabaseConfigured } from "@/lib/supabase/server";
import { AdminNavLinks } from "@/components/admin-nav-links";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  if (!isSupabaseConfigured()) return <div className="mx-auto max-w-xl px-5 py-28 text-center"><h1 className="text-2xl font-semibold text-slate-950">Supabase not configured</h1><p className="mt-4 text-sm leading-relaxed text-slate-500">Add the Supabase environment variables, then reload.</p></div>;
  const { user, isOwner } = await getOwnerSession();
  if (!user) redirect("/login");
  if (!isOwner) return <div className="mx-auto max-w-xl px-5 py-28 text-center"><h1 className="text-2xl font-semibold text-slate-950">Owner access only</h1><p className="mt-4 text-sm leading-relaxed text-slate-500">This area is restricted to the site owner.</p></div>;

  return <div className="min-h-screen bg-slate-50 text-slate-900">
    <div className="flex min-h-screen">
      <aside className="hidden w-64 shrink-0 border-r border-slate-200 bg-white lg:block">
        <div className="flex h-16 items-center border-b border-slate-200 px-6"><Link href="/admin" className="text-sm font-bold tracking-tight text-slate-950">Content Studio</Link></div>
        <div className="px-4 py-6"><AdminNavLinks /></div>
        <div className="mt-auto border-t border-slate-200 px-4 py-4"><Link href="/" className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-slate-500 hover:bg-slate-50 hover:text-slate-950">← View site</Link></div>
      </aside>
      <main className="min-w-0 flex-1">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur sm:px-6 lg:px-8">
          <div className="flex items-center gap-3"><AdminNavLinks mobile /><span className="text-sm font-semibold text-slate-950 lg:hidden">Content Studio</span><span className="hidden text-sm text-slate-400 lg:inline">Admin workspace</span></div>
          <div className="flex items-center gap-3"><Link href="/" className="hidden text-sm font-medium text-slate-600 hover:text-slate-950 sm:inline">View site</Link><div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-700" title={user.email ?? "Owner"}>{(user.email?.[0] ?? "O").toUpperCase()}</div></div>
        </header>
        <div className="mx-auto max-w-[1440px] p-4 sm:p-6 lg:p-8">{children}</div>
      </main>
    </div>
  </div>;
}
