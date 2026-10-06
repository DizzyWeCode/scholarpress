"use client";

import { useEffect, useState } from "react";
import { getSupabaseBrowser } from "@/lib/supabase/client";
import type { Paper } from "@/lib/types";
import { Plus, Trash2, X } from "lucide-react";

const inputCls =
  "w-full border-0 border-b border-line bg-transparent px-0 py-2 text-sm text-ink outline-none transition-colors placeholder:text-ink-4 focus:border-ink";
const labelCls = "block text-xs uppercase tracking-widest text-ink-4";

const empty: Omit<Paper, "id" | "created_at"> = {
  title: "",
  abstract: "",
  authors: [],
  venue: "",
  year: new Date().getFullYear(),
  doi: "",
  url: "",
  pdf_url: "",
  tags: [],
  featured: false,
  status: "published",
};

export default function AdminPapersPage() {
  const [papers, setPapers] = useState<Paper[] | null>(null);
  const [editing, setEditing] = useState<Paper | null>(null);
  const [creating, setCreating] = useState(false);

  async function load() {
    const { data } = await getSupabaseBrowser()
      .from("papers")
      .select("*")
      .order("year", { ascending: false });
    setPapers((data ?? []) as Paper[]);
  }
  useEffect(() => {
    load();
  }, []);

  async function remove(id: string) {
    if (!window.confirm("Delete this paper?")) return;
    await getSupabaseBrowser().from("papers").delete().eq("id", id);
    load();
  }

  return (
    <div>
      <div className="flex items-baseline justify-between">
        <h1 className="font-serif text-3xl tracking-tight text-ink">Papers</h1>
        <button
          onClick={() => setCreating(true)}
          className="inline-flex items-center gap-1.5 rounded-full bg-ink px-5 py-2 text-sm text-paper transition-opacity hover:opacity-80"
        >
          <Plus className="h-4 w-4" /> Add paper
        </button>
      </div>

      <div className="mt-8">
        {papers === null ? (
          <p className="text-sm text-ink-3">Loading…</p>
        ) : papers.length === 0 ? (
          <p className="border-t border-line py-12 text-sm text-ink-3">
            No papers yet.
          </p>
        ) : (
          papers.map((paper) => (
            <div
              key={paper.id}
              className="grid gap-1 border-t border-line py-5 sm:grid-cols-[1fr_auto_auto] sm:items-baseline sm:gap-6"
            >
              <button
                onClick={() => setEditing(paper)}
                className="text-left font-serif text-lg tracking-tight text-ink transition-opacity hover:opacity-60"
              >
                {paper.title}
                <span className="ml-3 text-xs font-sans uppercase tracking-widest text-ink-4">
                  {paper.status} · {paper.year ?? "—"}
                </span>
              </button>
              <span className="text-xs text-ink-4">{paper.venue}</span>
              <button
                onClick={() => remove(paper.id)}
                className="justify-self-start p-1 text-ink-4 transition-colors hover:text-red-700 sm:justify-self-end"
                aria-label={`Delete ${paper.title}`}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))
        )}
      </div>

      {(creating || editing) && (
        <PaperForm
          paper={editing ?? undefined}
          onClose={() => {
            setCreating(false);
            setEditing(null);
          }}
          onSaved={() => {
            setCreating(false);
            setEditing(null);
            load();
          }}
        />
      )}
    </div>
  );
}

function PaperForm({
  paper,
  onClose,
  onSaved,
}: {
  paper?: Paper;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState({
    title: paper?.title ?? empty.title,
    abstract: paper?.abstract ?? "",
    authors: (paper?.authors ?? []).join(", "),
    venue: paper?.venue ?? "",
    year: paper?.year ?? empty.year,
    doi: paper?.doi ?? "",
    url: paper?.url ?? "",
    pdf_url: paper?.pdf_url ?? "",
    tags: (paper?.tags ?? []).join(", "),
    featured: paper?.featured ?? false,
    status: paper?.status ?? "published",
  });
  const [busy, setBusy] = useState(false);
  const set = (k: string, v: unknown) => setForm((f) => ({ ...f, [k]: v }));

  async function save() {
    if (!form.title.trim()) return;
    setBusy(true);
    const payload = {
      title: form.title.trim(),
      abstract: form.abstract.trim() || null,
      authors: form.authors.split(",").map((a) => a.trim()).filter(Boolean),
      venue: form.venue.trim() || null,
      year: form.year || null,
      doi: form.doi.trim() || null,
      url: form.url.trim() || null,
      pdf_url: form.pdf_url.trim() || null,
      tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
      featured: form.featured,
      status: form.status,
    };
    const supabase = getSupabaseBrowser();
    const { error } = paper
      ? await supabase.from("papers").update(payload).eq("id", paper.id)
      : await supabase.from("papers").insert(payload);
    setBusy(false);
    if (!error) onSaved();
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-ink/40 p-4" onClick={onClose}>
      <div
        className="mx-auto my-10 max-w-2xl bg-paper p-8"
        style={{ borderRadius: 7 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-2xl tracking-tight text-ink">
            {paper ? "Edit paper" : "New paper"}
          </h2>
          <button onClick={onClose} aria-label="Close" className="p-1 text-ink-4 hover:text-ink">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="mt-6 grid gap-6">
          <div>
            <label className={labelCls}>Title</label>
            <input value={form.title} onChange={(e) => set("title", e.target.value)} className={`${inputCls} mt-2`} />
          </div>
          <div>
            <label className={labelCls}>Authors (comma separated)</label>
            <input value={form.authors} onChange={(e) => set("authors", e.target.value)} placeholder="A. Moyo, J. Smith" className={`${inputCls} mt-2`} />
          </div>
          <div>
            <label className={labelCls}>Abstract</label>
            <textarea value={form.abstract} onChange={(e) => set("abstract", e.target.value)} rows={4} className={`${inputCls} mt-2 resize-y`} />
          </div>
          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <label className={labelCls}>Venue (journal / conference)</label>
              <input value={form.venue} onChange={(e) => set("venue", e.target.value)} className={`${inputCls} mt-2`} />
            </div>
            <div>
              <label className={labelCls}>Year</label>
              <input type="number" value={form.year ?? ""} onChange={(e) => set("year", e.target.value ? Number(e.target.value) : null)} className={`${inputCls} mt-2`} />
            </div>
          </div>
          <div className="grid gap-6 sm:grid-cols-3">
            <div>
              <label className={labelCls}>DOI</label>
              <input value={form.doi} onChange={(e) => set("doi", e.target.value)} placeholder="10.1000/xyz123" className={`${inputCls} mt-2`} />
            </div>
            <div>
              <label className={labelCls}>Publisher URL</label>
              <input value={form.url} onChange={(e) => set("url", e.target.value)} className={`${inputCls} mt-2`} />
            </div>
            <div>
              <label className={labelCls}>PDF URL</label>
              <input value={form.pdf_url} onChange={(e) => set("pdf_url", e.target.value)} className={`${inputCls} mt-2`} />
            </div>
          </div>
          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <label className={labelCls}>Tags (comma separated)</label>
              <input value={form.tags} onChange={(e) => set("tags", e.target.value)} className={`${inputCls} mt-2`} />
            </div>
            <div>
              <label className={labelCls}>Status</label>
              <select value={form.status} onChange={(e) => set("status", e.target.value)} className={`${inputCls} mt-2`}>
                <option value="published">Published</option>
                <option value="draft">Draft</option>
              </select>
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm text-ink-2">
            <input type="checkbox" checked={form.featured} onChange={(e) => set("featured", e.target.checked)} />
            Feature on homepage
          </label>
        </div>
        <div className="mt-8 flex gap-3">
          <button
            onClick={save}
            disabled={busy}
            className="rounded-full bg-ink px-6 py-2.5 text-sm text-paper transition-opacity hover:opacity-80 disabled:opacity-40"
          >
            {busy ? "Saving…" : "Save paper"}
          </button>
          <button onClick={onClose} className="rounded-full border border-line px-6 py-2.5 text-sm text-ink-3">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
