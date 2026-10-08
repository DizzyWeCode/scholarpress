"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { getSupabaseBrowser } from "@/lib/supabase/client";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { useToast } from "@/components/toast";
import type { Subscriber } from "@/lib/types";
import { Download, Trash2 } from "lucide-react";

export default function AdminSubscribersPage() {
  const [subscribers, setSubscribers] = useState<Subscriber[] | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Subscriber | null>(null);
  const { push } = useToast();

  async function load() {
    const { data } = await getSupabaseBrowser()
      .from("subscribers")
      .select("*")
      .order("created_at", { ascending: false });
    setSubscribers((data ?? []) as Subscriber[]);
  }
  useEffect(() => {
    load();
  }, []);

  async function remove(id: string) {
    const { error } = await getSupabaseBrowser().from("subscribers").delete().eq("id", id);
    setPendingDelete(null);
    if (error) push({ kind: "error", title: "Could not remove subscriber", body: error.message });
    else push({ kind: "success", title: "Subscriber removed." });
    load();
  }

  function exportCsv() {
    if (!subscribers) return;
    const rows = [
      ["email", "source", "subscribed_at"],
      ...subscribers.map((s) => [s.email, s.source ?? "", s.created_at]),
    ];
    const csv = rows.map((r) => r.map((c) => `"${c.replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `subscribers-${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  return (
    <div>
      <div className="flex items-baseline justify-between">
        <h1 className="font-serif text-3xl tracking-tight text-ink">
          Subscribers{subscribers ? ` (${subscribers.length})` : ""}
        </h1>
        <button
          onClick={exportCsv}
          className="inline-flex items-center gap-1.5 rounded-full border border-ink px-5 py-2 text-sm text-ink transition-colors hover:bg-ink hover:text-paper"
        >
          <Download className="h-4 w-4" /> Export CSV
        </button>
      </div>
      <div className="mt-8">
        {subscribers === null ? (
          <p className="text-sm text-ink-3">Loading…</p>
        ) : subscribers.length === 0 ? (
          <p className="border-t border-line py-12 text-sm text-ink-3">
            No subscribers yet.
          </p>
        ) : (
          subscribers.map((s) => (
            <div
              key={s.id}
              className="grid gap-1 border-t border-line py-4 sm:grid-cols-[1fr_120px_140px_auto] sm:items-baseline sm:gap-6"
            >
              <span className="text-sm text-ink">{s.email}</span>
              <span className="text-xs uppercase tracking-widest text-ink-4">
                {s.source ?? "—"}
              </span>
              <span className="text-xs text-ink-4">
                {format(new Date(s.created_at), "dd MMM yyyy")}
              </span>
              <button
                onClick={() => setPendingDelete(s)}
                className="justify-self-start p-1 text-ink-4 transition-colors hover:text-red-700 sm:justify-self-end"
                aria-label={`Remove ${s.email}`}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))
        )}
      </div>
      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title="Remove this subscriber?"
        body={`${pendingDelete?.email ?? ""} will stop receiving newsletters. This cannot be undone.`}
        confirmLabel="Remove subscriber"
        danger
        onCancel={() => setPendingDelete(null)}
        onConfirm={() => pendingDelete && void remove(pendingDelete.id)}
      />
    </div>
  );
}
