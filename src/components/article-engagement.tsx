"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { getSupabaseBrowser } from "@/lib/supabase/client";
import type { Comment, Poll } from "@/lib/types";

export function ArticleEngagement({ postId, initialLikes = 0 }: { postId: string; initialLikes?: number }) {
  const supabase = getSupabaseBrowser();
  const [userId, setUserId] = useState<string | null>(null);
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(initialLikes);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentLikes, setCommentLikes] = useState<Set<string>>(new Set());
  const [body, setBody] = useState("");
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [replyBody, setReplyBody] = useState("");
  const [polls, setPolls] = useState<Poll[]>([]);
  const [votes, setVotes] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    const { data: auth } = await supabase.auth.getUser();
    const id = auth.user?.id ?? null; setUserId(id);
    const [{ data: rows }, { data: postLike }, { data: pollRows }] = await Promise.all([
      supabase.from("comments").select("*").eq("post_id", postId).order("created_at", { ascending: true }),
      id ? supabase.from("post_likes").select("post_id").eq("post_id", postId).maybeSingle() : Promise.resolve({ data: null }),
      supabase.from("polls").select("*, poll_options(*)").eq("post_id", postId).in("status", ["open", "closed"]).order("created_at", { ascending: true }),
    ]);
    const nextComments = (rows ?? []) as Comment[]; setComments(nextComments); setLiked(Boolean(postLike)); setPolls((pollRows ?? []) as Poll[]);
    if (id && nextComments.length) {
      const { data } = await supabase.from("comment_likes").select("comment_id").in("comment_id", nextComments.map((comment) => comment.id));
      setCommentLikes(new Set((data ?? []).map((row: { comment_id: string }) => row.comment_id)));
    }
    if (id && pollRows?.length) {
      const { data } = await supabase.from("poll_votes").select("poll_id, option_id").eq("user_id", id).in("poll_id", pollRows.map((poll: Poll) => poll.id));
      setVotes(Object.fromEntries((data ?? []).map((row: { poll_id: string; option_id: string }) => [row.poll_id, row.option_id])));
    }
  }, [postId, supabase]);

  useEffect(() => { void load(); }, [load]);
  const topLevel = useMemo(() => comments.filter((comment) => !comment.parent_id), [comments]);
  const replies = (id: string) => comments.filter((comment) => comment.parent_id === id);

  async function togglePostLike() {
    if (!userId) return;
    setBusy(true);
    if (liked) { await supabase.from("post_likes").delete().eq("post_id", postId).eq("user_id", userId); setLiked(false); setLikes((count) => Math.max(0, count - 1)); }
    else { await supabase.from("post_likes").insert({ post_id: postId, user_id: userId }); setLiked(true); setLikes((count) => count + 1); }
    setBusy(false);
  }

  async function addComment(parentId: string | null) {
    const text = (parentId ? replyBody : body).trim(); if (!userId || !text) return;
    setBusy(true);
    const { error } = await supabase.from("comments").insert({ post_id: postId, parent_id: parentId, user_id: userId, body: text, status: "visible" });
    if (!error) { if (parentId) setReplyBody(""); else setBody(""); setReplyTo(null); await load(); }
    setBusy(false);
  }

  async function toggleCommentLike(comment: Comment) {
    if (!userId) return;
    const isLiked = commentLikes.has(comment.id);
    if (isLiked) await supabase.from("comment_likes").delete().eq("comment_id", comment.id).eq("user_id", userId);
    else await supabase.from("comment_likes").insert({ comment_id: comment.id, user_id: userId });
    await load();
  }

  async function vote(poll: Poll, optionId: string) {
    if (!userId) return;
    await supabase.from("poll_votes").upsert({ poll_id: poll.id, option_id: optionId, user_id: userId });
    await load();
  }

  return <>
    <section className="mt-12 border-y border-line py-7">
      <button onClick={togglePostLike} disabled={busy} className="text-sm text-ink-3 hover:text-ink disabled:opacity-50">{liked ? "♥" : "♡"} {likes} {likes === 1 ? "like" : "likes"}</button>
    </section>
    {polls.map((poll) => {
      const selected = votes[poll.id]; const showResults = Boolean(selected) || poll.status === "closed" || poll.allow_results_before_vote;
      const total = poll.poll_options.reduce((sum, option) => sum + option.vote_count, 0);
      return <section key={poll.id} className="mt-10 border border-line p-6" style={{ borderRadius: 7 }}><p className="font-serif text-xl text-ink">{poll.question}</p><div className="mt-5 space-y-3">{[...poll.poll_options].sort((a, b) => a.sort_order - b.sort_order).map((option) => <button key={option.id} onClick={() => vote(poll, option.id)} className={`block w-full border px-4 py-3 text-left text-sm ${selected === option.id ? "border-ink" : "border-line hover:border-ink"}`}><span className="flex justify-between gap-4"><span>{option.label}</span>{showResults ? <span className="text-ink-3">{total ? Math.round((option.vote_count / total) * 100) : 0}%</span> : null}</span></button>)}</div>{selected ? <p className="mt-4 text-xs text-ink-3">Your vote is recorded.</p> : null}</section>;
    })}
    <section className="mt-14"><h2 className="font-serif text-2xl text-ink">Discussion</h2><form onSubmit={(event) => { event.preventDefault(); void addComment(null); }} className="mt-5"><textarea value={body} onChange={(event) => setBody(event.target.value)} placeholder="Add to the conversation" maxLength={2000} className="min-h-28 w-full border border-line bg-paper px-4 py-3 text-sm text-ink outline-none focus:border-ink" /><button disabled={busy || !body.trim()} className="mt-3 bg-ink px-4 py-2 text-sm text-paper disabled:opacity-50">Post comment</button></form><div className="mt-8 space-y-7">{topLevel.map((comment) => <CommentItem key={comment.id} comment={comment} replies={replies(comment.id)} userId={userId} liked={commentLikes.has(comment.id)} replyTo={replyTo} setReplyTo={setReplyTo} replyBody={replyBody} setReplyBody={setReplyBody} onReply={() => void addComment(comment.id)} onLike={() => void toggleCommentLike(comment)} />)}</div></section>
  </>;
}

function CommentItem({ comment, replies, userId, liked, replyTo, setReplyTo, replyBody, setReplyBody, onReply, onLike }: { comment: Comment; replies: Comment[]; userId: string | null; liked: boolean; replyTo: string | null; setReplyTo: (id: string | null) => void; replyBody: string; setReplyBody: (body: string) => void; onReply: () => void; onLike: () => void }) {
  return <div className="border-l border-line pl-4"><p className="text-xs text-ink-4">{comment.author_name} · {new Date(comment.created_at).toLocaleDateString()}</p><p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-ink">{comment.body}</p><div className="mt-2 flex gap-4 text-xs text-ink-3"><button onClick={onLike} className="hover:text-ink">{liked ? "♥" : "♡"} {comment.like_count}</button><button onClick={() => setReplyTo(replyTo === comment.id ? null : comment.id)} className="hover:text-ink">Reply</button></div>{replyTo === comment.id ? <div className="mt-3"><textarea value={replyBody} onChange={(event) => setReplyBody(event.target.value)} className="min-h-20 w-full border border-line bg-paper px-3 py-2 text-sm outline-none" placeholder="Write a reply" /><button onClick={onReply} className="mt-2 border border-line px-3 py-1.5 text-xs hover:border-ink">Reply</button></div> : null}<div className="mt-5 space-y-5 pl-4">{replies.map((reply) => <div key={reply.id} className="border-l border-line pl-4"><p className="text-xs text-ink-4">{reply.author_name} · {new Date(reply.created_at).toLocaleDateString()}</p><p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-ink">{reply.body}</p><button onClick={onLike} className="mt-2 text-xs text-ink-3 hover:text-ink">{liked ? "♥" : "♡"} {reply.like_count}</button></div>)}</div></div>;
}
