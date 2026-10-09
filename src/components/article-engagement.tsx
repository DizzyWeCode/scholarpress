"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { getSupabaseBrowser } from "@/lib/supabase/client";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { useToast } from "@/components/toast";
import type { Comment, Poll } from "@/lib/types";

function signInHref(pathname: string) {
  return `/login?next=${encodeURIComponent(pathname)}`;
}

export function ArticleEngagement({
  postId,
  initialLikes = 0,
}: {
  postId: string;
  initialLikes?: number;
}) {
  const pathname = usePathname() ?? "/";
  const [userId, setUserId] = useState<string | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(initialLikes);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentLikes, setCommentLikes] = useState<Set<string>>(new Set());
  const [body, setBody] = useState("");
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [replyBody, setReplyBody] = useState("");
  const [polls, setPolls] = useState<Poll[]>([]);
  const [votes, setVotes] = useState<Record<string, string>>({});
  const [pendingDelete, setPendingDelete] = useState<Comment | null>(null);
  const { push } = useToast();

  const load = useCallback(async () => {
    const supabase = getSupabaseBrowser();
    const { data: auth } = await supabase.auth.getUser();
    const id = auth.user?.id ?? null;
    setUserId(id);

    const [{ data: rows, error: commentsError }, { data: postLike, error: likeError }, { data: pollRows, error: pollError }] =
      await Promise.all([
        supabase
          .from("comments")
          .select("*")
          .eq("post_id", postId)
          .order("created_at", { ascending: true }),
        id
          ? supabase
              .from("post_likes")
              .select("post_id")
              .eq("post_id", postId)
              .eq("user_id", id)
              .maybeSingle()
          : Promise.resolve({ data: null, error: null }),
        supabase
          .from("polls")
          .select("*, poll_options(*)")
          .eq("post_id", postId)
          .in("status", ["open", "closed"])
          .order("created_at", { ascending: true }),
      ]);

    if (commentsError || likeError || pollError) {
      console.error("article-engagement load failed", commentsError ?? likeError ?? pollError);
      setError("Some of this discussion could not be loaded. Refresh the page to try again.");
    }

    const all = (rows ?? []) as Comment[];
    // The author can still read their own soft-deleted comment and the owner
    // can read hidden ones; the public article should only ever render visible.
    setComments(all.filter((comment) => comment.status === "visible"));
    setLiked(Boolean(postLike));
    setPolls((pollRows ?? []) as Poll[]);

    if (id && all.length) {
      const { data } = await supabase
        .from("comment_likes")
        .select("comment_id")
        .in(
          "comment_id",
          all.map((comment) => comment.id),
        );
      setCommentLikes(new Set((data ?? []).map((row: { comment_id: string }) => row.comment_id)));
    } else {
      setCommentLikes(new Set());
    }

    if (id && pollRows?.length) {
      const { data } = await supabase
        .from("poll_votes")
        .select("poll_id, option_id")
        .eq("user_id", id)
        .in(
          "poll_id",
          pollRows.map((poll: Poll) => poll.id),
        );
      setVotes(
        Object.fromEntries(
          (data ?? []).map((row: { poll_id: string; option_id: string }) => [row.poll_id, row.option_id]),
        ),
      );
    } else {
      setVotes({});
    }

    setAuthReady(true);
    setLoading(false);
  }, [postId]);

  useEffect(() => {
    void load().catch((err) => {
      console.error("article-engagement load failed", err);
      setError("This discussion could not be loaded. Refresh the page to try again.");
      setAuthReady(true);
      setLoading(false);
    });
  }, [load]);

  const roots = useMemo(() => {
    const ids = new Set(comments.map((comment) => comment.id));
    // Promote replies whose parent was deleted so their content stays visible.
    return comments.filter((comment) => !comment.parent_id || !ids.has(comment.parent_id));
  }, [comments]);
  const replies = (id: string) => comments.filter((comment) => comment.parent_id === id);

  async function togglePostLike() {
    if (!userId || busy) return;
    const previousLiked = liked;
    setError(null);
    setBusy(true);
    setLiked(!previousLiked);
    setLikes((count) => Math.max(0, count + (previousLiked ? -1 : 1)));
    try {
      const supabase = getSupabaseBrowser();
      const { error: opError } = previousLiked
        ? await supabase
            .from("post_likes")
            .delete()
            .eq("post_id", postId)
            .eq("user_id", userId)
        : await supabase.from("post_likes").insert({ post_id: postId, user_id: userId });
      if (opError) throw opError;
    } catch (err) {
      console.error("togglePostLike failed", err);
      setLiked(previousLiked);
      setLikes((count) => Math.max(0, count + (previousLiked ? 1 : -1)));
      setError(`Your like could not be saved: ${err instanceof Error ? err.message : "Please try again."}`);
    } finally {
      setBusy(false);
    }
  }

  async function addComment(parentId: string | null) {
    const text = (parentId ? replyBody : body).trim();
    if (!userId || !text || busy) return;
    setError(null);
    setBusy(true);
    try {
      const supabase = getSupabaseBrowser();
      const { error: insertError } = await supabase.from("comments").insert({
        post_id: postId,
        parent_id: parentId,
        user_id: userId,
        body: text,
        status: "visible",
      });
      if (insertError) throw insertError;
      if (parentId) setReplyBody("");
      else setBody("");
      setReplyTo(null);
      push({ kind: "success", title: "Comment posted." });
      await load();
    } catch (err) {
      console.error("addComment failed", err);
      const message = err instanceof Error ? err.message : "Please try again.";
      setError(`Your comment could not be posted: ${message}`);
      push({ kind: "error", title: "Could not post comment", body: message });
    } finally {
      setBusy(false);
    }
  }

  async function toggleCommentLike(comment: Comment) {
    if (!userId || busy) return;
    setError(null);
    setBusy(true);
    try {
      const supabase = getSupabaseBrowser();
      const isLiked = commentLikes.has(comment.id);
      const { error: opError } = isLiked
        ? await supabase
            .from("comment_likes")
            .delete()
            .eq("comment_id", comment.id)
            .eq("user_id", userId)
        : await supabase
            .from("comment_likes")
            .insert({ comment_id: comment.id, user_id: userId });
      if (opError) throw opError;
      await load();
    } catch (err) {
      console.error("toggleCommentLike failed", err);
      setError(`Your reaction could not be saved: ${err instanceof Error ? err.message : "Please try again."}`);
    } finally {
      setBusy(false);
    }
  }

  async function deleteComment(comment: Comment) {
    if (!userId || comment.user_id !== userId || busy) return;
    setError(null);
    setBusy(true);
    try {
      const supabase = getSupabaseBrowser();
      const { error: deleteError } = await supabase
        .from("comments")
        .update({ status: "deleted" })
        .eq("id", comment.id)
        .eq("user_id", userId);
      if (deleteError) throw deleteError;
      setPendingDelete(null);
      push({ kind: "success", title: "Comment deleted." });
      await load();
    } catch (err) {
      console.error("deleteComment failed", err);
      setError("Your comment could not be deleted. Please try again.");
      push({ kind: "error", title: "Could not delete comment", body: "Please try again." });
    } finally {
      setBusy(false);
    }
  }

  async function vote(poll: Poll, optionId: string) {
    if (!userId || busy || poll.status !== "open") return;
    setError(null);
    setBusy(true);
    try {
      const supabase = getSupabaseBrowser();
      const existing = votes[poll.id];
      const { error: voteError } = existing
        ? await supabase
            .from("poll_votes")
            .update({ option_id: optionId })
            .eq("poll_id", poll.id)
            .eq("user_id", userId)
        : await supabase
            .from("poll_votes")
            .insert({ poll_id: poll.id, option_id: optionId, user_id: userId });
      if (voteError) throw voteError;
      await load();
    } catch (err) {
      console.error("vote failed", err);
      setError(`Your vote could not be recorded: ${err instanceof Error ? err.message : "Please try again."}`);
    } finally {
      setBusy(false);
    }
  }

  const signInPrompt = (
    <p className="text-sm text-ink-3">
      <Link href={signInHref(pathname)} className="underline underline-offset-2 hover:text-ink">
        Sign in
      </Link>{" "}
      to like, comment and vote.
    </p>
  );

  return (
    <>
      <section className="mt-12 border-y border-line py-7">
        <button
          onClick={() => void togglePostLike()}
          disabled={busy || !authReady || !userId}
          className="text-sm text-ink-3 hover:text-ink disabled:cursor-not-allowed disabled:opacity-50"
          title={authReady && !userId ? "Sign in to like this article" : undefined}
        >
          {liked ? "♥" : "♡"} {likes} {likes === 1 ? "like" : "likes"}
        </button>
        {authReady && !userId ? <div className="mt-3">{signInPrompt}</div> : null}
      </section>

      {error ? (
        <p
          role="status"
          aria-live="polite"
          className="mt-6 border border-ink/30 bg-paper-2 px-4 py-3 text-sm text-ink"
          style={{ borderRadius: 7 }}
        >
          {error}{" "}
          <button onClick={() => setError(null)} className="underline underline-offset-2">
            Dismiss
          </button>
        </p>
      ) : null}

      {polls.map((poll) => {
        const selected = votes[poll.id];
        const showResults = Boolean(selected) || poll.status === "closed" || poll.allow_results_before_vote;
        const total = poll.poll_options.reduce((sum, option) => sum + option.vote_count, 0);
        const canVote = Boolean(userId) && poll.status === "open";
        return (
          <section key={poll.id} className="mt-10 border border-line p-6" style={{ borderRadius: 7 }}>
            <p className="font-serif text-xl text-ink">{poll.question}</p>
            <div className="mt-5 space-y-3">
              {[...poll.poll_options]
                .sort((a, b) => a.sort_order - b.sort_order)
                .map((option) => (
                  <button
                    key={option.id}
                    onClick={() => void vote(poll, option.id)}
                    disabled={!canVote || busy}
                    className={`block w-full border px-4 py-3 text-left text-sm disabled:cursor-not-allowed disabled:opacity-70 ${
                      selected === option.id ? "border-ink" : "border-line hover:border-ink"
                    }`}
                  >
                    <span className="flex justify-between gap-4">
                      <span>{option.label}</span>
                      {showResults ? (
                        <span className="text-ink-3">
                          {total ? Math.round((option.vote_count / total) * 100) : 0}%
                        </span>
                      ) : null}
                    </span>
                  </button>
                ))}
            </div>
            {!authReady ? null : !userId ? (
              <div className="mt-4">{signInPrompt}</div>
            ) : poll.status === "closed" ? (
              <p className="mt-4 text-xs text-ink-3">This poll is closed — results below.</p>
            ) : selected ? (
              <p className="mt-4 text-xs text-ink-3">Your vote is recorded.</p>
            ) : (
              <p className="mt-4 text-xs text-ink-3">Cast your vote to see results.</p>
            )}
          </section>
        );
      })}

      <section className="mt-14">
        <h2 className="font-serif text-2xl text-ink">Discussion</h2>
        {!authReady || loading ? (
          <div role="status" aria-label="Loading discussion" className="mt-5 flex items-center gap-3 text-sm text-ink-3">
            <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-line border-t-ink" aria-hidden="true" />
            <span>Loading discussion</span>
          </div>
        ) : !userId ? (
          <div className="mt-5">{signInPrompt}</div>
        ) : (
          <form
            onSubmit={(event) => {
              event.preventDefault();
              void addComment(null);
            }}
            className="mt-5"
          >
            <textarea
              value={body}
              onChange={(event) => setBody(event.target.value)}
              placeholder="Add to the conversation"
              maxLength={2000}
              className="min-h-28 w-full border border-line bg-paper px-4 py-3 text-sm text-ink outline-none focus:border-ink"
            />
            <button
              type="submit"
              disabled={busy || !body.trim()}
              className="mt-3 bg-ink px-4 py-2 text-sm text-paper disabled:opacity-50"
            >
              Post comment
            </button>
          </form>
        )}

        <div className="mt-8 space-y-7">
          {roots.length === 0 && authReady && !loading ? (
            <p className="text-sm text-ink-3">No comments yet — start the conversation.</p>
          ) : null}
          {roots.map((comment) => (
            <CommentThread
              key={comment.id}
              comment={comment}
              replies={replies(comment.id)}
              userId={userId}
              likedIds={commentLikes}
              replyTo={replyTo}
              setReplyTo={(id) => {
                setReplyTo(id);
                setReplyBody("");
              }}
              replyBody={replyBody}
              setReplyBody={setReplyBody}
              busy={busy}
              onLike={(target) => void toggleCommentLike(target)}
              onDelete={(target) => setPendingDelete(target)}
              onSubmitReply={(parentId) => void addComment(parentId)}
            />
          ))}
        </div>
      </section>
      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title="Delete this comment?"
        body="This removes your comment for everyone. This cannot be undone."
        confirmLabel="Delete comment"
        danger
        busy={busy}
        onCancel={() => setPendingDelete(null)}
        onConfirm={() => pendingDelete && void deleteComment(pendingDelete)}
      />
    </>
  );
}

function CommentThread({
  comment,
  replies,
  userId,
  likedIds,
  replyTo,
  setReplyTo,
  replyBody,
  setReplyBody,
  busy,
  onLike,
  onDelete,
  onSubmitReply,
}: {
  comment: Comment;
  replies: Comment[];
  userId: string | null;
  likedIds: Set<string>;
  replyTo: string | null;
  setReplyTo: (id: string | null) => void;
  replyBody: string;
  setReplyBody: (body: string) => void;
  busy: boolean;
  onLike: (comment: Comment) => void;
  onDelete: (comment: Comment) => void;
  onSubmitReply: (parentId: string) => void;
}) {
  // Only true top-level comments can be replied to (the DB only allows one level).
  const canReply = !comment.parent_id && Boolean(userId);

  return (
    <div className="border-l border-line pl-4">
      <CommentBody
        comment={comment}
        userId={userId}
        liked={likedIds.has(comment.id)}
        busy={busy}
        canReply={canReply}
        replying={replyTo === comment.id}
        onLike={onLike}
        onDelete={onDelete}
        onToggleReply={() => setReplyTo(replyTo === comment.id ? null : comment.id)}
      />

      {replyTo === comment.id && userId ? (
        <div className="mt-3">
          <textarea
            value={replyBody}
            onChange={(event) => setReplyBody(event.target.value)}
            className="min-h-20 w-full border border-line bg-paper px-3 py-2 text-sm outline-none"
            placeholder="Write a reply"
            maxLength={2000}
          />
          <button
            onClick={() => onSubmitReply(comment.id)}
            disabled={busy || !replyBody.trim()}
            className="mt-2 border border-line px-3 py-1.5 text-xs hover:border-ink disabled:opacity-50"
          >
            Reply
          </button>
        </div>
      ) : null}

      <div className="mt-5 space-y-5 pl-4">
        {replies.map((reply) => (
          <CommentBody
            key={reply.id}
            comment={reply}
            userId={userId}
            liked={likedIds.has(reply.id)}
            busy={busy}
            canReply={false}
            replying={false}
            onLike={onLike}
            onDelete={onDelete}
            onToggleReply={() => undefined}
          />
        ))}
      </div>
    </div>
  );
}

function CommentBody({
  comment,
  userId,
  liked,
  busy,
  canReply,
  replying,
  onLike,
  onDelete,
  onToggleReply,
}: {
  comment: Comment;
  userId: string | null;
  liked: boolean;
  busy: boolean;
  canReply: boolean;
  replying: boolean;
  onLike: (comment: Comment) => void;
  onDelete: (comment: Comment) => void;
  onToggleReply: () => void;
}) {
  const mine = Boolean(userId && comment.user_id === userId);
  return (
    <div>
      <p className="text-xs text-ink-4">
        {comment.author_name} · {new Date(comment.created_at).toLocaleDateString()}
      </p>
      <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-ink">{comment.body}</p>
      <div className="mt-2 flex gap-4 text-xs text-ink-3">
        <button
          onClick={() => onLike(comment)}
          disabled={busy || !userId}
          className="hover:text-ink disabled:cursor-not-allowed disabled:opacity-50"
          title={userId ? undefined : "Sign in to react"}
        >
          {liked ? "♥" : "♡"} {comment.like_count}
        </button>
        {canReply ? (
          <button onClick={onToggleReply} className="hover:text-ink">
            {replying ? "Cancel" : "Reply"}
          </button>
        ) : null}
        {mine ? (
          <button
            onClick={() => onDelete(comment)}
            disabled={busy}
            className="hover:text-red-700 disabled:opacity-50"
          >
            Delete
          </button>
        ) : null}
      </div>
    </div>
  );
}
