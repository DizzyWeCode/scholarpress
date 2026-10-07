"use client";

import { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import Link from "next/link";
import { getSupabaseBrowser } from "@/lib/supabase/client";
import type { Comment } from "@/lib/types";

type CommentWithPost = Comment & {
  posts: { title: string; slug: string } | null;
};

type StatusFilter = "all" | "visible" | "hidden" | "deleted";

const FILTERS: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "visible", label: "Visible" },
  { value: "hidden", label: "Hidden" },
  { value: "deleted", label: "Deleted" },
];

const STATUS_STYLE: Record<Comment["status"], string> = {
  visible: "border border-line text-ink-3",
  hidden: "border border-ink/40 text-ink",
  deleted: "border border-red-700/40 text-red-700",
};

export default function AdminCommentsPage() {
  const [comments, setComments] = useState<CommentWithPost[] | null>(null);
  const [filter, setFilter] = useState<StatusFilter>("all");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function load() {
    setError(null);
    const { data, error: loadError } = await getSupabaseBrowser()
      .from("comments")
      .select("*, posts(title, slug)")
      .order("created_at", { ascending: false })
      .limit(500);
    if (loadError) {
      console.error("load comments failed", loadError);
      setError("Comments could not be loaded. Refresh to try again.");
      setComments([]);
      return;
    }
    setComments((data ?? []) as CommentWithPost[]);
  }

  useEffect(() => {
    void load();
  }, []);

  const visible = useMemo(() => {
    if (!comments) return [];
    if (filter === "all") return comments;
    return comments.filter((comment) => comment.status === filter);
  }, [comments, filter]);

  async function setStatus(id: string, status: Comment["status"]) {
    setBusy(true);
    setError(null);
    const { error: updateError } = await getSupabaseBrowser()
      .from("comments")
      .update({ status })
      .eq("id", id);
    if (updateError) {
      console.error("update comment failed", updateError);
      setError("That comment could not be updated. Please try again.");
    }
    await load();
    setBusy(false);
  }

  async function remove(id: string) {
    if (!window.confirm("Permanently delete this comment and its replies? This cannot be undone."))
      return;
    setBusy(true);
    setError(null);
    const { error: deleteError } = await getSupabaseBrowser()
      .from("comments")
      .delete()
      .eq("id", id);
    if (deleteError) {
      console.error("delete comment failed", deleteError);
      setError("That comment could not be deleted. Please try again.");
    }
    await load();
    setBusy(false);
  }

  const counts = useMemo(() => {
    const base = { visible: 0, hidden: 0, deleted: 0 };
    for (const comment of comments ?? []) base[comment.status] += 1;
    return base;
  }, [comments]);

  return (
    <div>
      <div className="flex items-baseline justify-between">
        <h1 className="font-serif text-3xl tracking-tight text-ink">
          Comments{comments ? ` (${comments.length})` : ""}
        </h1>
        <span className="text-xs uppercase tracking-widest text-ink-4">
          {counts.visible} visible · {counts.hidden} hidden · {counts.deleted} deleted
        </span>
      </div>

      <div className="mt-6 flex gap-2">
        {FILTERS.map((option) => (
          <button
            key={option.value}
            onClick={() => setFilter(option.value)}
            className={`rounded-full border px-4 py-1.5 text-xs transition-colors ${
              filter === option.value
                ? "border-ink bg-ink text-paper"
                : "border-line text-ink-3 hover:border-ink hover:text-ink"
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>

      {error ? (
        <p
          role="alert"
          className="mt-6 border border-ink/30 bg-paper-2 px-4 py-3 text-sm text-ink"
          style={{ borderRadius: 7 }}
        >
          {error}
        </p>
      ) : null}

      <div className="mt-8">
        {comments === null ? (
          <p className="text-sm text-ink-3">Loading…</p>
        ) : visible.length === 0 ? (
          <p className="border-t border-line py-12 text-sm text-ink-3">
            No {filter === "all" ? "" : `${filter} `}comments yet.
          </p>
        ) : (
          visible.map((comment) => (
            <div key={comment.id} className="border-t border-line py-5">
              <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
                <span className="text-sm text-ink">{comment.author_name || "Anonymous"}</span>
                <span className="text-xs text-ink-4">
                  {format(new Date(comment.created_at), "dd MMM yyyy, HH:mm")}
                </span>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-[10px] uppercase tracking-widest ${STATUS_STYLE[comment.status]}`}
                >
                  {comment.status}
                </span>
                {comment.parent_id ? (
                  <span className="text-[10px] uppercase tracking-widest text-ink-4">reply</span>
                ) : null}
                {comment.posts ? (
                  <Link
                    href={`/blog/${comment.posts.slug}`}
                    className="text-xs text-ink-3 underline underline-offset-2 hover:text-ink"
                  >
                    {comment.posts.title}
                  </Link>
                ) : null}
              </div>
              <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-ink-2">
                {comment.body}
              </p>
              <div className="mt-3 flex gap-4 text-xs">
                {comment.status !== "visible" ? (
                  <button
                    onClick={() => void setStatus(comment.id, "visible")}
                    disabled={busy}
                    className="text-ink-3 underline underline-offset-2 hover:text-ink disabled:opacity-50"
                  >
                    Restore
                  </button>
                ) : (
                  <button
                    onClick={() => void setStatus(comment.id, "hidden")}
                    disabled={busy}
                    className="text-ink-3 underline underline-offset-2 hover:text-ink disabled:opacity-50"
                  >
                    Hide
                  </button>
                )}
                <button
                  onClick={() => void remove(comment.id)}
                  disabled={busy}
                  className="text-ink-3 underline underline-offset-2 hover:text-red-700 disabled:opacity-50"
                >
                  Delete permanently
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
