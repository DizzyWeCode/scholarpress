"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { getSupabaseBrowser } from "@/lib/supabase/client";
import { ConfirmDialog } from "@/components/confirm-dialog";
import type { Post } from "@/lib/types";

type SortKey = "title" | "status" | "published_at" | "updated_at" | "like_count";
type BulkAction = "publish" | "draft" | "delete" | null;
const PAGE_SIZE = 25;

export default function AdminPostsPage() {
  const [posts, setPosts] = useState<Post[] | null>(null);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<"all" | Post["status"]>("all");
  const [sortKey, setSortKey] = useState<SortKey>("updated_at");
  const [ascending, setAscending] = useState(false);
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<string[]>([]);
  const [bulkAction, setBulkAction] = useState<BulkAction>(null);
  const [busy, setBusy] = useState(false);

  async function load() {
    setError("");
    const { data, error: loadError } = await getSupabaseBrowser().from("posts").select("*").order("updated_at", { ascending: false });
    if (loadError) setError(`Could not load posts: ${loadError.message}`);
    else setPosts((data ?? []) as Post[]);
  }

  useEffect(() => { void load(); }, []);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return [...(posts ?? [])]
      .filter((post) => status === "all" || post.status === status)
      .filter((post) => !needle || [post.title, post.slug, post.excerpt ?? "", ...post.tags].join(" ").toLowerCase().includes(needle))
      .sort((a, b) => {
        const left = String(a[sortKey] ?? "").toLowerCase();
        const right = String(b[sortKey] ?? "").toLowerCase();
        return left.localeCompare(right, undefined, { numeric: true }) * (ascending ? 1 : -1);
      });
  }, [posts, query, sortKey, status, ascending]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const visible = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const allVisibleSelected = visible.length > 0 && visible.every((post) => selected.includes(post.id));

  function changeSort(key: SortKey) {
    if (sortKey === key) setAscending((value) => !value);
    else { setSortKey(key); setAscending(key === "title"); }
  }

  async function runBulkAction() {
    if (!bulkAction || selected.length === 0) return;
    setBusy(true);
    const supabase = getSupabaseBrowser();
    const responses = await Promise.all(selected.map((id) => {
      if (bulkAction === "delete") return supabase.from("posts").delete().eq("id", id);
      return supabase.from("posts").update({ status: bulkAction === "publish" ? "published" : "draft", published_at: bulkAction === "publish" ? new Date().toISOString() : null, updated_at: new Date().toISOString() }).eq("id", id);
    }));
    const failed = responses.find((response) => response.error);
    if (failed?.error) setError(`Bulk action failed: ${failed.error.message}`);
    else { setSelected([]); await load(); }
    setBusy(false);
    setBulkAction(null);
  }

  return (
    <div>
      <div className="flex flex-wrap items-baseline justify-between gap-4">
        <div><p className="text-xs uppercase tracking-[0.25em] text-ink-4">Studio</p><h1 className="mt-2 font-serif text-3xl tracking-tight text-ink">Posts</h1></div>
        <Link href="/admin/posts/new" className="rounded-full bg-ink px-5 py-2 text-sm text-paper transition-opacity hover:opacity-80">New post</Link>
      </div>
      <div className="mt-8 grid gap-3 sm:grid-cols-[1fr_160px_auto]">
        <label className="sr-only" htmlFor="post-search">Search posts</label>
        <input id="post-search" value={query} onChange={(event) => { setQuery(event.target.value); setPage(1); }} placeholder="Search title, slug, excerpt, or tag" className="border border-line bg-transparent px-3 py-2 text-sm text-ink outline-none focus:border-ink" style={{ borderRadius: 7 }} />
        <label className="sr-only" htmlFor="post-status">Filter by status</label>
        <select id="post-status" value={status} onChange={(event) => { setStatus(event.target.value as typeof status); setPage(1); }} className="border border-line bg-paper px-3 py-2 text-sm text-ink outline-none focus:border-ink" style={{ borderRadius: 7 }}><option value="all">All statuses</option><option value="draft">Draft</option><option value="scheduled">Scheduled</option><option value="published">Published</option></select>
        <button type="button" onClick={() => void load()} className="border border-line px-4 py-2 text-sm text-ink-3 hover:border-ink hover:text-ink">Refresh</button>
      </div>
      {selected.length > 0 ? <div className="mt-4 flex flex-wrap items-center gap-2 border border-line bg-paper-2 p-3" style={{ borderRadius: 7 }}><span className="mr-2 text-sm text-ink">{selected.length} selected</span><button type="button" onClick={() => setBulkAction("publish")} className="border border-line px-3 py-1.5 text-xs text-ink">Publish</button><button type="button" onClick={() => setBulkAction("draft")} className="border border-line px-3 py-1.5 text-xs text-ink">Move to draft</button><button type="button" onClick={() => setBulkAction("delete")} className="border border-red-700 px-3 py-1.5 text-xs text-red-700">Delete</button></div> : null}
      {error ? <p role="alert" className="mt-4 text-sm text-red-700">{error}</p> : null}
      <div className="mt-8 overflow-x-auto">
        {posts === null ? <p className="text-sm text-ink-3">Loading posts…</p> : filtered.length === 0 ? <p className="border-t border-line py-12 text-sm text-ink-3">No posts match this view.</p> : <>
          <div className="min-w-[720px]">
            <div className="grid grid-cols-[36px_1fr_120px_130px_100px] gap-4 border-b border-line pb-3 text-xs uppercase tracking-widest text-ink-4"><span><input type="checkbox" aria-label="Select visible posts" checked={allVisibleSelected} onChange={(event) => setSelected(event.target.checked ? [...new Set([...selected, ...visible.map((post) => post.id)])] : selected.filter((id) => !visible.some((post) => post.id === id)))} /></span><button type="button" onClick={() => changeSort("title")} className="text-left">Title</button><button type="button" onClick={() => changeSort("status")} className="text-left">Status</button><button type="button" onClick={() => changeSort("published_at")} className="text-left">Published</button><button type="button" onClick={() => changeSort("like_count")} className="text-left">Likes</button></div>
            {visible.map((post) => <div key={post.id} className="grid grid-cols-[36px_1fr_120px_130px_100px] items-center gap-4 border-b border-line py-4 text-sm"><input type="checkbox" aria-label={`Select ${post.title}`} checked={selected.includes(post.id)} onChange={(event) => setSelected((current) => event.target.checked ? [...current, post.id] : current.filter((id) => id !== post.id))} /><Link href={`/admin/posts/${post.id}`} className="min-w-0 truncate font-serif text-lg text-ink hover:opacity-60">{post.title || "Untitled"}</Link><span className={`text-xs uppercase tracking-widest ${post.status === "published" ? "text-ink" : "text-ink-4"}`}>{post.status}</span><span className="text-xs text-ink-4">{post.published_at ? format(new Date(post.published_at), "dd MMM yyyy") : "—"}</span><span className="text-xs text-ink-3">{post.like_count ?? 0}</span></div>)}
          </div>
          <div className="mt-5 flex items-center justify-between text-xs text-ink-3"><span>{filtered.length} post{filtered.length === 1 ? "" : "s"} · page {page} of {pageCount}</span><div className="flex gap-2"><button type="button" disabled={page <= 1} onClick={() => setPage((value) => value - 1)} className="border border-line px-3 py-1.5 disabled:opacity-40">Previous</button><button type="button" disabled={page >= pageCount} onClick={() => setPage((value) => value + 1)} className="border border-line px-3 py-1.5 disabled:opacity-40">Next</button></div></div>
        </>}
      </div>
      <ConfirmDialog open={bulkAction !== null} title={`${bulkAction === "delete" ? "Delete" : bulkAction === "publish" ? "Publish" : "Move to draft"} selected posts?`} body={bulkAction === "delete" ? "This permanently removes the selected posts and their related content." : `This will update ${selected.length} selected post${selected.length === 1 ? "" : "s"}.`} confirmLabel={bulkAction === "delete" ? "Delete posts" : "Continue"} danger={bulkAction === "delete"} busy={busy} onCancel={() => setBulkAction(null)} onConfirm={() => void runBulkAction()} />
    </div>
  );
}
