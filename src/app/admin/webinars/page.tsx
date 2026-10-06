"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { getSupabaseBrowser } from "@/lib/supabase/client";
import type { Webinar } from "@/lib/types";
import { Plus, Trash2, X } from "lucide-react";

const inputCls =
  "w-full border-0 border-b border-line bg-transparent px-0 py-2 text-sm text-ink outline-none transition-colors placeholder:text-ink-4 focus:border-ink";
const labelCls = "block text-xs uppercase tracking-widest text-ink-4";

export default function AdminWebinarsPage() {
  const [webinars, setWebinars] = useState<Webinar[] | null>(null);
  const [editing, setEditing] = useState<Webinar | null>(null);
  const [creating, setCreating] = useState(false);

  async function load() {
    const { data } = await getSupabaseBrowser()
      .from("webinars")
      .select("*")
      .order("starts_at", { ascending: false });
    setWebinars((data ?? []) as Webinar[]);
  }
  useEffect(() => {
    load();
  }, []);

  async function remove(id: string) {
    if (!window.confirm("Delete this webinar?")) return;
    await getSupabaseBrowser().from("webinars").delete().eq("id", id);
    load();
  }

  return (
    <div>
      <div className="flex items-baseline justify-between">
        <h1 className="font-serif text-3xl tracking-tight text-ink">Webinars</h1>
        <button
          onClick={() => setCreating(true)}
          className="inline-flex items-center gap-1.5 rounded-full bg-ink px-5 py-2 text-sm text-paper transition-opacity hover:opacity-80"
        >
          <Plus className="h-4 w-4" /> Announce webinar
        </button>
      </div>

      <div className="mt-8">
        {webinars === null ? (
          <p className="text-sm text-ink-3">Loading…</p>
        ) : webinars.length === 0 ? (
          <p className="border-t border-line py-12 text-sm text-ink-3">
            No webinars yet.
          </p>
        ) : (
          webinars.map((w) => (
            <div
              key={w.id}
              className="grid gap-1 border-t border-line py-5 sm:grid-cols-[1fr_auto_auto] sm:items-baseline sm:gap-6"
            >
              <button
                onClick={() => setEditing(w)}
                className="text-left font-serif text-lg tracking-tight text-ink transition-opacity hover:opacity-60"
              >
                {w.title}
                <span className="ml-3 font-sans text-xs uppercase tracking-widest text-ink-4">
                  {w.status}
                </span>
              </button>
              <span className="text-xs text-ink-4">
                {format(new Date(w.starts_at), "dd MMM yyyy, HH:mm")}
              </span>
              <button
                onClick={() => remove(w.id)}
                className="justify-self-start p-1 text-ink-4 transition-colors hover:text-red-700 sm:justify-self-end"
                aria-label={`Delete ${w.title}`}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))
        )}
      </div>

      {(creating || editing) && (
        <WebinarForm
          webinar={editing ?? undefined}
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

function WebinarForm({
  webinar,
  onClose,
  onSaved,
}: {
  webinar?: Webinar;
  onClose: () => void;
  onSaved: () => void;
}) {
  const toLocal = (iso?: string) =>
    iso ? format(new Date(iso), "yyyy-MM-dd'T'HH:mm") : "";
  const [form, setForm] = useState({
    title: webinar?.title ?? "",
    description: webinar?.description ?? "",
    starts_at: toLocal(webinar?.starts_at),
    duration_minutes: webinar?.duration_minutes ?? 60,
    platform: webinar?.platform ?? "Zoom",
    registration_url: webinar?.registration_url ?? "",
    recording_url: webinar?.recording_url ?? "",
    status: webinar?.status ?? "upcoming",
  });
  const [busy, setBusy] = useState(false);
  const set = (k: string, v: unknown) => setForm((f) => ({ ...f, [k]: v }));

  async function save() {
    if (!form.title.trim() || !form.starts_at) return;
    setBusy(true);
    const payload = {
      title: form.title.trim(),
      description: form.description.trim() || null,
      starts_at: new Date(form.starts_at).toISOString(),
      duration_minutes: form.duration_minutes || null,
      platform: form.platform.trim() || null,
      registration_url: form.registration_url.trim() || null,
      recording_url: form.recording_url.trim() || null,
      status: form.status,
    };
    const supabase = getSupabaseBrowser();
    const { error } = webinar
      ? await supabase.from("webinars").update(payload).eq("id", webinar.id)
      : await supabase.from("webinars").insert(payload);
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
            {webinar ? "Edit webinar" : "Announce webinar"}
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
            <label className={labelCls}>Description</label>
            <textarea value={form.description} onChange={(e) => set("description", e.target.value)} rows={3} className={`${inputCls} mt-2 resize-y`} />
          </div>
          <div className="grid gap-6 sm:grid-cols-3">
            <div>
              <label className={labelCls}>Date &amp; time</label>
              <input type="datetime-local" value={form.starts_at} onChange={(e) => set("starts_at", e.target.value)} className={`${inputCls} mt-2`} />
            </div>
            <div>
              <label className={labelCls}>Duration (min)</label>
              <input type="number" value={form.duration_minutes ?? ""} onChange={(e) => set("duration_minutes", e.target.value ? Number(e.target.value) : null)} className={`${inputCls} mt-2`} />
            </div>
            <div>
              <label className={labelCls}>Platform</label>
              <input value={form.platform} onChange={(e) => set("platform", e.target.value)} className={`${inputCls} mt-2`} />
            </div>
          </div>
          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <label className={labelCls}>Registration URL</label>
              <input value={form.registration_url} onChange={(e) => set("registration_url", e.target.value)} placeholder="https://zoom.us/webinar/register/…" className={`${inputCls} mt-2`} />
            </div>
            <div>
              <label className={labelCls}>Recording URL (for past sessions)</label>
              <input value={form.recording_url} onChange={(e) => set("recording_url", e.target.value)} className={`${inputCls} mt-2`} />
            </div>
          </div>
          <div>
            <label className={labelCls}>Status</label>
            <select value={form.status} onChange={(e) => set("status", e.target.value)} className={`${inputCls} mt-2`}>
              <option value="upcoming">Upcoming</option>
              <option value="past">Past (recording)</option>
              <option value="draft">Draft (hidden)</option>
            </select>
          </div>
        </div>
        <div className="mt-8 flex gap-3">
          <button
            onClick={save}
            disabled={busy}
            className="rounded-full bg-ink px-6 py-2.5 text-sm text-paper transition-opacity hover:opacity-80 disabled:opacity-40"
          >
            {busy ? "Saving…" : "Save webinar"}
          </button>
          <button onClick={onClose} className="rounded-full border border-line px-6 py-2.5 text-sm text-ink-3">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
