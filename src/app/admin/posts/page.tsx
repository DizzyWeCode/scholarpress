"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { getSupabaseBrowser } from "@/lib/supabase/client";
import type { Post } from "@/lib/types";

export default function AdminPostsPage() {
  const [posts, setPosts] = useState<Post[] | null>(null);

  useEffect(() => {
    getSupabaseBrowser()
      .from("posts")
      .select("*")
      .order("updated_at", { ascending: false })
      .then(({ data }) => setPosts((data ?? []) as Post[]));
  }, []);

  return (
    <div>
      <div className="flex items-baseline justify-between">
        <h1 className="font-serif text-3xl tracking-tight text-ink">Posts</h1>
        <Link
          href="/admin/posts/new"
          className="rounded-full bg-ink px-5 py-2 text-sm text-paper transition-opacity hover:opacity-80"
        >
          New post
        </Link>
      </div>

      <div className="mt-8">
        {posts === null ? (
          <p className="text-sm text-ink-3">Loading…</p>
        ) : posts.length === 0 ? (
          <p className="border-t border-line py-12 text-sm text-ink-3">
            No posts yet. Write your first one.
          </p>
        ) : (
          posts.map((post) => (
            <Link
              key={post.id}
              href={`/admin/posts/${post.id}`}
              className="group grid gap-1 border-t border-line py-5 transition-colors sm:grid-cols-[1fr_110px_130px] sm:items-baseline sm:gap-6"
            >
              <span className="font-serif text-lg tracking-tight text-ink transition-opacity group-hover:opacity-60">
                {post.title}
              </span>
              <span
                className={`text-xs uppercase tracking-widest ${
                  post.status === "published" ? "text-ink" : "text-ink-4"
                }`}
              >
                {post.status}
              </span>
              <span className="text-xs text-ink-4">
                {format(new Date(post.updated_at), "dd MMM yyyy")}
              </span>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
