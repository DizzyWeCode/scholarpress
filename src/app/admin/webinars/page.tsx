"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { getSupabaseBrowser } from "@/lib/supabase/client";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { Dialog } from "@/components/ui/dialog";
import { useToast } from "@/components/toast";
import type { Webinar } from "@/lib/types";
import { Mail, Plus, Trash2, X } from "lucide-react";

const inputCls =
  "w-full border-0 border-b border-line bg-transparent px-0 py-2 text-sm text-ink outline-none transition-colors placeholder:text-ink-4 focus:border-ink";
const labelCls = "block text-xs uppercase tracking-widest text-ink-4";

export default function AdminWebinarsPage() {
  const [webinars, setWebinars] = useState<Webinar[] | null>(null);
  const [editing, setEditing] = useState<Webinar | null>(null);
  const [creating, setCreating] = useState(false);
  const [announcing, setAnnouncing] = useState<Webinar | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Webinar | null>(null);
  const { push } = useToast();

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
    const { error } = await getSupabaseBrowser().from("webinars").delete().eq("id", id);
    setPendingDelete(null);
    if (error) push({ kind: "error", title: "Could not delete webinar", body: error.message });
    else push({ kind: "success", title: "Webinar deleted." });
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
          <Plus className="h-4 w-4" /> New webinar
        </button>
      </div>

      {notice && (
        <p className="mt-4 border-t border-line pt-4 text-sm text-ink-3">{notice}</p>
      )}

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
              <div className="flex items-center gap-2 justify-self-start sm:justify-self-end">
                <button
                  onClick={() => {
                    setNotice(null);
                    setAnnouncing(w);
                  }}
                  className="justify-self-start p-1 text-ink-4 transition-colors hover:text-ink sm:justify-self-end"
                  aria-label={`Email announcement for ${w.title}`}
                  title="Email announcement"
                >
                  <Mail className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setPendingDelete(w)}
                  className="justify-self-start p-1 text-ink-4 transition-colors hover:text-red-700 sm:justify-self-end"
                  aria-label={`Delete ${w.title}`}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {announcing && (
        <AnnounceDialog
          webinar={announcing}
          onClose={() => setAnnouncing(null)}
          onDone={(message) => {
            setAnnouncing(null);
            setNotice(message);
          }}
        />
      )}

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
      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title="Delete this webinar?"
        body={`“${pendingDelete?.title ?? ""}” will be permanently removed. This cannot be undone.`}
        confirmLabel="Delete webinar"
        danger
        onCancel={() => setPendingDelete(null)}
        onConfirm={() => pendingDelete && void remove(pendingDelete.id)}
      />
    </div>
  );
}

function AnnounceDialog({
  webinar,
  onClose,
  onDone,
}: {
  webinar: Webinar;
  onClose: () => void;
  onDone: (message: string) => void;
}) {
  const [testEmail, setTestEmail] = useState("");
  const [busy, setBusy] = useState<"test" | "all" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [confirmAll, setConfirmAll] = useState(false);

  async function send(mode: "test" | "all", confirmed = false) {
    if (mode === "all" && !confirmed) {
      setConfirmAll(true);
      return;
    }
    if (mode === "test" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(testEmail.trim())) {
      setError("Enter a valid test email address.");
      return;
    }
    setBusy(mode);
    setError(null);
    try {
      const response = await fetch("/api/admin/webinars/announce", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          webinarId: webinar.id,
          mode,
          testEmail: testEmail.trim(),
        }),
      });
      const result = (await response.json()) as {
        error?: string;
        sent?: number;
        failed?: number;
        skipped?: number;
        errors?: string[];
      };
      if (!response.ok) {
        setError(result.error ?? `Request failed (${response.status}).`);
        return;
      }
      const parts = [`sent ${result.sent ?? 0}`];
      if (result.failed) parts.push(`${result.failed} failed`);
      if (result.skipped) parts.push(`${result.skipped} skipped (already sent)`);
      const detail = result.errors?.length ? ` — ${result.errors[0]}` : "";
      onDone(`Announcement (${mode}): ${parts.join(", ")}${detail}`);
    } catch {
      setError("Request failed — is the server running?");
    } finally {
      setBusy(null);
    }
  }

  return (
    <Dialog open title="Email announcement" onClose={onClose}>
      <div>
        <div className="flex justify-end">
          <button onClick={onClose} aria-label="Close" className="p-1 text-ink-4 hover:text-ink">
            <X className="h-5 w-5" />
          </button>
        </div>
        <p className="mt-3 text-sm text-ink-3">
          {webinar.title} — {format(new Date(webinar.starts_at), "dd MMM yyyy, HH:mm")}
        </p>
        {error && <p className="mt-4 text-sm text-red-700">{error}</p>}
        <div className="mt-6 grid gap-4">
          <div>
            <label className={labelCls} htmlFor="announcement-test-email">Send a test to</label>
            <input
              id="announcement-test-email"
              type="email"
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
              placeholder="you@example.com"
              className={`${inputCls} mt-2`}
            />
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => send("test")}
              disabled={busy !== null}
              className="rounded-full border border-line px-5 py-2.5 text-sm text-ink-3 transition-colors hover:text-ink disabled:opacity-40"
            >
              {busy === "test" ? "Sending…" : "Send test"}
            </button>
            <button
              onClick={() => send("all")}
              disabled={busy !== null}
              className="rounded-full bg-ink px-5 py-2.5 text-sm text-paper transition-opacity hover:opacity-80 disabled:opacity-40"
            >
              {busy === "all" ? "Sending…" : "Send to all subscribers"}
            </button>
          </div>
          <p className="text-xs text-ink-4">
            Recipients who already received this announcement are skipped.
            Reminders go out automatically in a daily pass, roughly 24–48 hours
            before the start.
          </p>
        </div>
      </div>
      <ConfirmDialog
        open={confirmAll}
        title="Email all subscribers?"
        body={`Send the “${webinar.title}” announcement to every subscriber now? This cannot be undone. Send a test first if you have not already.`}
        confirmLabel="Send to everyone"
        danger
        busy={busy === "all"}
        onCancel={() => setConfirmAll(false)}
        onConfirm={() => {
          setConfirmAll(false);
          void send("all", true);
        }}
      />
    </Dialog>
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
  const [error, setError] = useState<string | null>(null);
  const set = (k: string, v: unknown) => setForm((f) => ({ ...f, [k]: v }));

  async function save() {
    if (!form.title.trim()) {
      setError("Title is required.");
      return;
    }
    if (!form.starts_at) {
      setError("Date and time are required.");
      return;
    }
    setError(null);
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
    else setError(error.message);
  }

  return (
    <Dialog open title={webinar ? "Edit webinar" : "Announce webinar"} onClose={onClose}>
      <div>
        <div className="flex justify-end">
          <button onClick={onClose} aria-label="Close" className="p-1 text-ink-4 hover:text-ink">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="mt-6 grid gap-6">
          <div>
            <label className={labelCls} htmlFor="webinar-title">Title</label>
            <input id="webinar-title" value={form.title} onChange={(e) => set("title", e.target.value)} className={`${inputCls} mt-2`} />
          </div>
          <div>
            <label className={labelCls} htmlFor="webinar-description">Description</label>
            <textarea id="webinar-description" value={form.description} onChange={(e) => set("description", e.target.value)} rows={3} className={`${inputCls} mt-2 resize-y`} />
          </div>
          <div className="grid gap-6 sm:grid-cols-3">
            <div>
              <label className={labelCls} htmlFor="webinar-starts-at">Date &amp; time</label>
              <input id="webinar-starts-at" type="datetime-local" value={form.starts_at} onChange={(e) => set("starts_at", e.target.value)} className={`${inputCls} mt-2`} />
            </div>
            <div>
              <label className={labelCls} htmlFor="webinar-duration">Duration (min)</label>
              <input id="webinar-duration" type="number" value={form.duration_minutes ?? ""} onChange={(e) => set("duration_minutes", e.target.value ? Number(e.target.value) : null)} className={`${inputCls} mt-2`} />
            </div>
            <div>
              <label className={labelCls} htmlFor="webinar-platform">Platform</label>
              <input id="webinar-platform" value={form.platform} onChange={(e) => set("platform", e.target.value)} className={`${inputCls} mt-2`} />
            </div>
          </div>
          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <label className={labelCls} htmlFor="webinar-registration-url">Registration URL</label>
              <input id="webinar-registration-url" value={form.registration_url} onChange={(e) => set("registration_url", e.target.value)} placeholder="https://zoom.us/webinar/register/…" className={`${inputCls} mt-2`} />
            </div>
            <div>
              <label className={labelCls} htmlFor="webinar-recording-url">Recording URL (for past sessions)</label>
              <input id="webinar-recording-url" value={form.recording_url} onChange={(e) => set("recording_url", e.target.value)} className={`${inputCls} mt-2`} />
            </div>
          </div>
          <div>
            <label className={labelCls} htmlFor="webinar-status">Status</label>
            <select id="webinar-status" value={form.status} onChange={(e) => set("status", e.target.value)} className={`${inputCls} mt-2`}>
              <option value="upcoming">Upcoming</option>
              <option value="past">Past (recording)</option>
              <option value="draft">Draft (hidden)</option>
            </select>
          </div>
        </div>
        {error ? <p role="alert" className="mt-5 text-sm text-red-700">{error}</p> : null}
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
    </Dialog>
  );
}
