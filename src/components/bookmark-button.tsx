"use client";

import { useEffect, useState } from "react";
import { Bookmark, BookmarkCheck } from "lucide-react";
import { getSupabaseBrowser } from "@/lib/supabase/client";
import { useToast } from "@/components/toast";

export function BookmarkButton({ postId }: { postId: string }) {
  const [userId, setUserId] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);
  const { push } = useToast();

  useEffect(() => {
    const supabase = getSupabaseBrowser();
    supabase.auth.getUser().then(async ({ data }) => {
      const id = data.user?.id ?? null;
      setUserId(id);
      if (!id) return;
      const { data: row } = await supabase
        .from("bookmarks")
        .select("post_id")
        .eq("post_id", postId)
        .eq("user_id", id)
        .maybeSingle();
      setSaved(Boolean(row));
    });
  }, [postId]);

  if (!userId) return null;

  async function toggle() {
    if (busy) return;
    setBusy(true);
    const supabase = getSupabaseBrowser();
    try {
      if (saved) {
        const { error } = await supabase
          .from("bookmarks")
          .delete()
          .eq("post_id", postId)
          .eq("user_id", userId);
        if (error) throw error;
        setSaved(false);
        push({ kind: "info", title: "Removed from your reading list." });
      } else {
        const { error } = await supabase
          .from("bookmarks")
          .insert({ post_id: postId, user_id: userId });
        if (error) throw error;
        setSaved(true);
        push({ kind: "success", title: "Saved to your reading list." });
      }
    } catch (err) {
      console.error("bookmark toggle failed", err);
      push({ kind: "error", title: "Could not save this article", body: "Please try again." });
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      onClick={() => void toggle()}
      disabled={busy}
      aria-pressed={saved}
      className="inline-flex h-9 items-center gap-2 rounded-full border border-line px-4 text-sm text-ink-3 transition-colors hover:border-ink hover:text-ink disabled:opacity-50"
    >
      {saved ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
      {saved ? "Saved" : "Save"}
    </button>
  );
}
