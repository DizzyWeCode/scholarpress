"use client";

import { useEffect, useState } from "react";
import { getSupabaseBrowser } from "@/lib/supabase/client";
import { Send } from "lucide-react";

type BatchResult = {
  total: number;
  sent: number;
  failed: number;
  errors: string[];
};

type SendResponse = BatchResult & { mode?: string };

export default function AdminNewsletterPage() {
  const [subscriberCount, setSubscriberCount] = useState<number | null>(null);
  const [subject, setSubject] = useState("");
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [articleUrl, setArticleUrl] = useState("");
  const [postId, setPostId] = useState<string | null>(null);
  const [testEmail, setTestEmail] = useState("");
  const [busy, setBusy] = useState<null | "test" | "all">(null);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<SendResponse | null>(null);

  useEffect(() => {
    const supabase = getSupabaseBrowser();
    (async () => {
      const { count } = await supabase
        .from("subscribers")
        .select("email", { count: "exact", head: true });
      setSubscriberCount(count ?? 0);

      const { data: post } = await supabase
        .from("posts")
        .select("id, slug, title, excerpt")
        .eq("status", "published")
        .order("published_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (post) {
        setPostId(post.id);
        setTitle((value) => value || post.title);
        setSummary((value) => value || post.excerpt || "");
        const base =
          process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ??
          window.location.origin;
        setArticleUrl((value) => value || `${base}/blog/${post.slug}`);
        setSubject((value) => value || `New on Dr Fraction: ${post.title}`);
      }
    })();
  }, []);

  async function send(mode: "test" | "all") {
    setError(null);
    setResult(null);

    if (mode === "test" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(testEmail.trim())) {
      setError("Enter a valid test email address first.");
      return;
    }
    if (mode === "all") {
      const confirmed = window.confirm(
        `Send this newsletter to ${subscriberCount} subscriber${
          subscriberCount === 1 ? "" : "s"
        }? This cannot be undone.`,
      );
      if (!confirmed) return;
    }

    setBusy(mode);
    try {
      const res = await fetch("/api/admin/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode,
          testEmail: testEmail.trim() || undefined,
          subject: subject.trim(),
          title: title.trim(),
          summary: summary.trim(),
          articleUrl: articleUrl.trim(),
          postId,
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(json.error ?? "Sending failed.");
        return;
      }
      setResult(json as SendResponse);
    } catch {
      setError("Network error — nothing was sent.");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div>
      <div className="flex items-baseline justify-between">
        <h1 className="font-serif text-3xl tracking-tight text-ink">
          Newsletter
        </h1>
        <span className="text-xs uppercase tracking-widest text-ink-4">
          {subscriberCount === null
            ? "… subscribers"
            : `${subscriberCount} subscriber${subscriberCount === 1 ? "" : "s"}`}
        </span>
      </div>

      <section
        className="mt-8 border border-line p-6"
        style={{ borderRadius: 7 }}
      >
        <h2 className="font-serif text-xl text-ink">Compose</h2>
        <div className="mt-4 space-y-4">
          <label className="block">
            <span className="text-xs uppercase tracking-widest text-ink-4">
              Subject line
            </span>
            <input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="New on Dr Fraction: …"
              className="mt-1 w-full border border-line bg-paper px-3 py-2 text-sm text-ink outline-none focus:border-ink"
            />
          </label>

          <label className="block">
            <span className="text-xs uppercase tracking-widest text-ink-4">
              Article title
            </span>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1 w-full border border-line bg-paper px-3 py-2 text-sm text-ink outline-none focus:border-ink"
            />
          </label>

          <label className="block">
            <span className="text-xs uppercase tracking-widest text-ink-4">
              Summary
            </span>
            <textarea
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              rows={4}
              className="mt-1 w-full border border-line bg-paper px-3 py-2 text-sm text-ink outline-none focus:border-ink"
            />
          </label>

          <label className="block">
            <span className="text-xs uppercase tracking-widest text-ink-4">
              Article URL
            </span>
            <input
              value={articleUrl}
              onChange={(e) => setArticleUrl(e.target.value)}
              placeholder="https://…/blog/my-post"
              className="mt-1 w-full border border-line bg-paper px-3 py-2 text-sm text-ink outline-none focus:border-ink"
            />
          </label>

          <div className="flex flex-wrap items-end gap-4">
            <label className="block flex-1">
              <span className="text-xs uppercase tracking-widest text-ink-4">
                Test recipient
              </span>
              <input
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                placeholder="you@example.com"
                className="mt-1 w-full border border-line bg-paper px-3 py-2 text-sm text-ink outline-none focus:border-ink"
              />
            </label>
            <button
              onClick={() => send("test")}
              disabled={busy !== null || !subject || !title || !summary}
              className="flex items-center gap-1.5 border border-ink px-4 py-2 text-sm text-ink transition-colors hover:bg-ink hover:text-paper disabled:opacity-50"
            >
              <Send className="h-3.5 w-3.5" /> Send test
            </button>
            <button
              onClick={() => send("all")}
              disabled={busy !== null || !subject || !title || !summary}
              className="bg-ink px-4 py-2 text-sm text-paper disabled:opacity-50"
            >
              {busy === "all"
                ? "Sending…"
                : `Send to all (${subscriberCount ?? "…"})`}
            </button>
          </div>

          {error ? <p className="text-sm text-red-700">{error}</p> : null}

          {result ? (
            <div className="border-t border-line pt-4 text-sm text-ink-2">
              {result.mode === "test" ? "Test" : "Broadcast"} complete:{" "}
              <span className="text-ink">
                {result.sent} sent, {result.failed} failed
              </span>{" "}
              of {result.total}.
              {result.errors.length > 0 ? (
                <ul className="mt-2 space-y-1 text-xs text-red-700">
                  {result.errors.map((message) => (
                    <li key={message}>{message}</li>
                  ))}
                </ul>
              ) : null}
            </div>
          ) : null}
        </div>
      </section>
    </div>
  );
}
