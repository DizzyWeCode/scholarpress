"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { LoaderCircle, Plus, Trash2 } from "lucide-react";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { useToast } from "@/components/toast";
import { AdminButton, AdminPageHeader, StatusBadge } from "@/components/admin-ui";
import type { Paper } from "@/lib/types";
import { getSupabaseBrowser } from "@/lib/supabase/client";

export default function AdminPapersPage() {
  const [papers, setPapers] = useState<Paper[] | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Paper | null>(null);
  const { push } = useToast();

  async function load() {
    const { data } = await getSupabaseBrowser().from("papers").select("*").order("year", { ascending: false });
    setPapers((data ?? []) as Paper[]);
  }

  useEffect(() => { void load(); }, []);

  async function remove(id: string) {
    const { error } = await getSupabaseBrowser().from("papers").delete().eq("id", id);
    setPendingDelete(null);
    if (error) push({ kind: "error", title: "Could not delete research output", body: error.message });
    else push({ kind: "success", title: "Research output deleted." });
    void load();
  }

  return (
    <div>
      <AdminPageHeader
        eyebrow="Library"
        title="Research outputs"
        description={`${papers?.length ?? 0} scholarly outputs in your workspace. Use the full-page editor to capture the right metadata for each output type.`}
        actions={<Link href="/admin/papers/new"><AdminButton><Plus className="mr-1.5 h-4 w-4" aria-hidden />Add research output</AdminButton></Link>}
      />
      <div className="mt-6 overflow-hidden rounded-lg border border-slate-200 bg-white px-5 shadow-sm">
        {papers === null ? (
          <p className="flex items-center gap-2 py-5 text-sm text-ink-3" role="status"><LoaderCircle className="h-4 w-4 animate-spin" aria-hidden />Loading research outputs</p>
        ) : papers.length === 0 ? (
          <div className="border-t border-line py-12"><p className="text-sm text-ink-3">No research outputs yet.</p><Link href="/admin/papers/new" className="mt-4 inline-flex text-sm font-medium text-indigo-700 hover:underline">Create the first output</Link></div>
        ) : (
          papers.map((paper) => (
            <div key={paper.id} className="grid gap-2 border-t border-line py-5 sm:grid-cols-[1fr_auto_auto] sm:items-center sm:gap-6">
              <Link href={`/admin/papers/${paper.id}`} className="min-w-0 text-left hover:opacity-70">
                <span className="block font-serif text-lg tracking-tight text-ink">{paper.title}</span>
                <span className="mt-2 flex flex-wrap items-center gap-2 text-xs text-ink-4"><StatusBadge status={paper.status} />{paper.output_type?.replace(/_/g, " ") ?? "Research output"}{paper.year ? ` · ${paper.year}` : ""}</span>
              </Link>
              <span className="text-xs text-ink-4">{paper.journal_title || paper.venue || paper.publisher || "Metadata not yet added"}</span>
              <button type="button" onClick={() => setPendingDelete(paper)} className="justify-self-start p-1 text-ink-4 transition-colors hover:text-red-700 sm:justify-self-end" aria-label={`Delete ${paper.title}`}><Trash2 className="h-4 w-4" aria-hidden /></button>
            </div>
          ))
        )}
      </div>
      <ConfirmDialog open={Boolean(pendingDelete)} title="Delete this research output?" body={`“${pendingDelete?.title ?? ""}” will be permanently removed. This cannot be undone.`} confirmLabel="Delete research output" danger onCancel={() => setPendingDelete(null)} onConfirm={() => pendingDelete && void remove(pendingDelete.id)} />
    </div>
  );
}
