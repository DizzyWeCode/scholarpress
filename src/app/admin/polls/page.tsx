"use client";

import { useEffect, useState } from "react";
import { getSupabaseBrowser } from "@/lib/supabase/client";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { useToast } from "@/components/toast";
import type { Poll, Post } from "@/lib/types";
import { Plus, Trash2 } from "lucide-react";

type PollRow = Poll & {
  posts: { title: string; status: string } | null;
};

type DraftOption = { id?: string; label: string; vote_count: number };

type Draft = {
  question: string;
  status: Poll["status"];
  allow_results_before_vote: boolean;
  options: DraftOption[];
};

const STATUS_STYLE: Record<Poll["status"], string> = {
  draft: "border border-line text-ink-3",
  open: "border border-ink/40 text-ink",
  closed: "border border-red-700/40 text-red-700",
};

function cleanLabels(options: DraftOption[]) {
  return options.map((option) => option.label.trim()).filter(Boolean);
}

export default function AdminPollsPage() {
  const [posts, setPosts] = useState<Pick<Post, "id" | "title" | "status">[]>([]);
  const [polls, setPolls] = useState<PollRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<PollRow | null>(null);
  const { push } = useToast();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Draft | null>(null);

  const [newPostId, setNewPostId] = useState("");
  const [newQuestion, setNewQuestion] = useState("");
  const [newOptions, setNewOptions] = useState<string[]>(["", ""]);
  const [newStatus, setNewStatus] = useState<Poll["status"]>("open");
  const [newAllowResults, setNewAllowResults] = useState(false);

  async function load() {
    setError(null);
    const supabase = getSupabaseBrowser();
    const [postsRes, pollsRes] = await Promise.all([
      supabase.from("posts").select("id, title, status").order("updated_at", { ascending: false }),
      supabase
        .from("polls")
        .select("*, poll_options(*), posts(title, status)")
        .order("created_at", { ascending: false }),
    ]);
    if (postsRes.error || pollsRes.error) {
      console.error("load polls failed", postsRes.error ?? pollsRes.error);
      setError("Polls could not be loaded. Refresh to try again.");
      setPolls([]);
      return;
    }
    setPosts((postsRes.data ?? []) as Pick<Post, "id" | "title" | "status">[]);
    setPolls((pollsRes.data ?? []) as PollRow[]);
  }

  useEffect(() => {
    void load();
  }, []);

  function validateOptions(labels: string[]) {
    const cleaned = labels.map((label) => label.trim()).filter(Boolean);
    if (cleaned.length < 2) return "A poll needs at least two options.";
    if (new Set(cleaned.map((label) => label.toLowerCase())).size !== cleaned.length)
      return "Poll options must be unique.";
    return null;
  }

  async function createPoll() {
    const question = newQuestion.trim();
    if (!question) return setError("Add a question for the poll.");
    if (!newPostId) return setError("Choose the post this poll belongs to.");
    const invalid = validateOptions(newOptions);
    if (invalid) return setError(invalid);
    setError(null);
    setBusy(true);
    const supabase = getSupabaseBrowser();
    try {
      const { data: poll, error: pollError } = await supabase
        .from("polls")
        .insert({
          post_id: newPostId,
          question,
          status: newStatus,
          allow_results_before_vote: newAllowResults,
        })
        .select("id")
        .single();
      if (pollError) throw pollError;
      const rows = newOptions
        .map((label) => label.trim())
        .filter(Boolean)
        .map((label, index) => ({ poll_id: poll.id, label, sort_order: index }));
      const { error: optionsError } = await supabase.from("poll_options").insert(rows);
      if (optionsError) {
        await supabase.from("polls").delete().eq("id", poll.id);
        throw optionsError;
      }
      setNewQuestion("");
      setNewOptions(["", ""]);
      setNewAllowResults(false);
      await load();
    } catch (err) {
      console.error("create poll failed", err);
      setError("The poll could not be created. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  function startEdit(poll: PollRow) {
    setError(null);
    setEditingId(poll.id);
    setDraft({
      question: poll.question,
      status: poll.status,
      allow_results_before_vote: poll.allow_results_before_vote,
      options: [...poll.poll_options]
        .sort((a, b) => a.sort_order - b.sort_order)
        .map((option) => ({
          id: option.id,
          label: option.label,
          vote_count: option.vote_count,
        })),
    });
  }

  async function saveEdit(poll: PollRow) {
    if (!draft) return;
    const question = draft.question.trim();
    if (!question) return setError("The question cannot be empty.");
    const invalid = validateOptions(draft.options.map((option) => option.label));
    if (invalid) return setError(invalid);
    const keptIds = new Set(draft.options.map((option) => option.id).filter(Boolean) as string[]);
    const lostVotes = poll.poll_options
      .filter((option) => !keptIds.has(option.id) && option.vote_count > 0)
      .reduce((sum, option) => sum + option.vote_count, 0);
    if (lostVotes > 0)
      return setError(
        "An option with votes was removed. Restore it — results are kept for every option people voted on.",
      );

    setError(null);
    setBusy(true);
    const supabase = getSupabaseBrowser();
    try {
      const { error: pollError } = await supabase
        .from("polls")
        .update({
          question,
          status: draft.status,
          allow_results_before_vote: draft.allow_results_before_vote,
        })
        .eq("id", poll.id);
      if (pollError) throw pollError;

      const existingIds = poll.poll_options.map((option) => option.id);
      const removedIds = existingIds.filter((id) => !keptIds.has(id));
      if (removedIds.length) {
        const { error: removeError } = await supabase
          .from("poll_options")
          .delete()
          .in("id", removedIds);
        if (removeError) throw removeError;
      }

      for (const [index, option] of draft.options.entries()) {
        if (option.id) {
          const { error: updateError } = await supabase
            .from("poll_options")
            .update({ label: option.label.trim(), sort_order: index })
            .eq("id", option.id);
          if (updateError) throw updateError;
        } else {
          const { error: insertError } = await supabase
            .from("poll_options")
            .insert({ poll_id: poll.id, label: option.label.trim(), sort_order: index });
          if (insertError) throw insertError;
        }
      }
      setEditingId(null);
      setDraft(null);
      await load();
    } catch (err) {
      console.error("save poll failed", err);
      setError("The poll could not be saved. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  async function setStatus(poll: PollRow, status: Poll["status"]) {
    setError(null);
    setBusy(true);
    const { error: statusError } = await getSupabaseBrowser()
      .from("polls")
      .update({ status })
      .eq("id", poll.id);
    if (statusError) {
      console.error("update poll status failed", statusError);
      setError("The poll status could not be changed. Please try again.");
    }
    if (editingId === poll.id && draft) setDraft({ ...draft, status });
    await load();
    setBusy(false);
  }

  async function removePoll(poll: PollRow) {
    setError(null);
    setBusy(true);
    const { error: deleteError } = await getSupabaseBrowser()
      .from("polls")
      .delete()
      .eq("id", poll.id);
    if (deleteError) {
      console.error("delete poll failed", deleteError);
      setError("The poll could not be deleted. Please try again.");
      push({ kind: "error", title: "Could not delete poll" });
    } else {
      push({ kind: "success", title: "Poll deleted." });
    }
    setPendingDelete(null);
    if (editingId === poll.id) {
      setEditingId(null);
      setDraft(null);
    }
    await load();
    setBusy(false);
  }

  return (
    <div>
      <h1 className="font-serif text-3xl tracking-tight text-ink">
        Polls{polls ? ` (${polls.length})` : ""}
      </h1>

      {error ? (
        <p
          role="alert"
          className="mt-6 border border-ink/30 bg-paper-2 px-4 py-3 text-sm text-ink"
          style={{ borderRadius: 7 }}
        >
          {error}
        </p>
      ) : null}

      <section className="mt-8 border border-line p-6" style={{ borderRadius: 7 }}>
        <h2 className="font-serif text-xl text-ink">New poll</h2>
        <div className="mt-4 space-y-4">
          <label className="block">
            <span className="text-xs uppercase tracking-widest text-ink-4">Post</span>
            <select
              value={newPostId}
              onChange={(event) => setNewPostId(event.target.value)}
              className="mt-1 w-full border border-line bg-paper px-3 py-2 text-sm text-ink outline-none focus:border-ink"
            >
              <option value="">Choose a post…</option>
              {posts.map((post) => (
                <option key={post.id} value={post.id}>
                  {post.title} ({post.status})
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="text-xs uppercase tracking-widest text-ink-4">Question</span>
            <input
              value={newQuestion}
              onChange={(event) => setNewQuestion(event.target.value)}
              maxLength={240}
              placeholder="Should artemisinin-based therapies remain first-line?"
              className="mt-1 w-full border border-line bg-paper px-3 py-2 text-sm text-ink outline-none focus:border-ink"
            />
          </label>
          <div>
            <span className="text-xs uppercase tracking-widest text-ink-4">Options</span>
            <div className="mt-2 space-y-2">
              {newOptions.map((label, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    value={label}
                    onChange={(event) =>
                      setNewOptions(
                        newOptions.map((value, i) => (i === index ? event.target.value : value)),
                      )
                    }
                    maxLength={160}
                    placeholder={`Option ${index + 1}`}
                    className="flex-1 border border-line bg-paper px-3 py-2 text-sm text-ink outline-none focus:border-ink"
                  />
                  <button
                    type="button"
                    onClick={() => setNewOptions(newOptions.filter((_, i) => i !== index))}
                    disabled={newOptions.length <= 2 || busy}
                    className="p-2 text-ink-4 transition-colors hover:text-red-700 disabled:opacity-40"
                    aria-label={`Remove option ${index + 1}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setNewOptions([...newOptions, ""])}
              disabled={busy}
              className="mt-2 inline-flex items-center gap-1.5 text-xs text-ink-3 underline underline-offset-2 hover:text-ink disabled:opacity-50"
            >
              <Plus className="h-3.5 w-3.5" /> Add option
            </button>
          </div>
          <div className="flex flex-wrap items-center gap-6">
            <label className="flex items-center gap-2 text-sm text-ink-3">
              <input
                type="radio"
                checked={newStatus === "open"}
                onChange={() => setNewStatus("open")}
              />
              Open (accept votes)
            </label>
            <label className="flex items-center gap-2 text-sm text-ink-3">
              <input
                type="radio"
                checked={newStatus === "draft"}
                onChange={() => setNewStatus("draft")}
              />
              Draft (hidden)
            </label>
            <label className="flex items-center gap-2 text-sm text-ink-3">
              <input
                type="checkbox"
                checked={newAllowResults}
                onChange={(event) => setNewAllowResults(event.target.checked)}
              />
              Show results before voting
            </label>
          </div>
          <button
            onClick={() => void createPoll()}
            disabled={busy}
            className="bg-ink px-4 py-2 text-sm text-paper disabled:opacity-50"
          >
            Create poll
          </button>
        </div>
      </section>

      <div className="mt-10">
        {polls === null ? (
          <p className="text-sm text-ink-3">Loading…</p>
        ) : polls.length === 0 ? (
          <p className="border-t border-line py-12 text-sm text-ink-3">No polls yet.</p>
        ) : (
          polls.map((poll) => {
            const options = [...poll.poll_options].sort((a, b) => a.sort_order - b.sort_order);
            const totalVotes = options.reduce((sum, option) => sum + option.vote_count, 0);
            const editing = editingId === poll.id && draft;
            return (
              <div key={poll.id} className="border-t border-line py-6">
                <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[10px] uppercase tracking-widest ${STATUS_STYLE[poll.status]}`}
                  >
                    {poll.status}
                  </span>
                  <span className="font-serif text-lg text-ink">
                    {editing ? "" : poll.question}
                  </span>
                  {poll.posts ? (
                    <span className="text-xs text-ink-4">on “{poll.posts.title}”</span>
                  ) : null}
                  <span className="text-xs text-ink-4">{totalVotes} votes</span>
                </div>

                {!editing ? (
                  <>
                    <div className="mt-3 space-y-1">
                      {options.map((option) => (
                        <div key={option.id} className="flex gap-3 text-sm text-ink-3">
                          <span className="flex-1">{option.label}</span>
                          <span>{option.vote_count}</span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 flex flex-wrap gap-4 text-xs">
                      <button
                        onClick={() => startEdit(poll)}
                        disabled={busy}
                        className="text-ink-3 underline underline-offset-2 hover:text-ink disabled:opacity-50"
                      >
                        Edit
                      </button>
                      {poll.status !== "open" ? (
                        <button
                          onClick={() => void setStatus(poll, "open")}
                          disabled={busy}
                          className="text-ink-3 underline underline-offset-2 hover:text-ink disabled:opacity-50"
                        >
                          Open voting
                        </button>
                      ) : (
                        <button
                          onClick={() => void setStatus(poll, "closed")}
                          disabled={busy}
                          className="text-ink-3 underline underline-offset-2 hover:text-ink disabled:opacity-50"
                        >
                          Close voting
                        </button>
                      )}
                      <button
                        onClick={() => setPendingDelete(poll)}
                        disabled={busy}
                        className="text-ink-3 underline underline-offset-2 hover:text-red-700 disabled:opacity-50"
                      >
                        Delete
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="mt-4 space-y-4">
                    <input
                      value={draft.question}
                      onChange={(event) => setDraft({ ...draft, question: event.target.value })}
                      maxLength={240}
                      className="w-full border border-line bg-paper px-3 py-2 text-sm text-ink outline-none focus:border-ink"
                    />
                    <div className="space-y-2">
                      {draft.options.map((option, index) => (
                        <div key={option.id ?? `new-${index}`} className="flex gap-2">
                          <input
                            value={option.label}
                            onChange={(event) =>
                              setDraft({
                                ...draft,
                                options: draft.options.map((value, i) =>
                                  i === index ? { ...value, label: event.target.value } : value,
                                ),
                              })
                            }
                            maxLength={160}
                            className="flex-1 border border-line bg-paper px-3 py-2 text-sm text-ink outline-none focus:border-ink"
                          />
                          <span className="w-12 self-center text-right text-xs text-ink-4">
                            {option.vote_count > 0 ? `${option.vote_count} ✓` : ""}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              setDraft({
                                ...draft,
                                options: draft.options.filter((_, i) => i !== index),
                              })
                            }
                            disabled={
                              busy ||
                              draft.options.length <= 2 ||
                              (option.vote_count > 0)
                            }
                            title={
                              option.vote_count > 0
                                ? "This option has votes and cannot be removed"
                                : undefined
                            }
                            className="p-2 text-ink-4 transition-colors hover:text-red-700 disabled:opacity-40"
                            aria-label={`Remove option ${index + 1}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        setDraft({ ...draft, options: [...draft.options, { label: "", vote_count: 0 }] })
                      }
                      disabled={busy}
                      className="inline-flex items-center gap-1.5 text-xs text-ink-3 underline underline-offset-2 hover:text-ink disabled:opacity-50"
                    >
                      <Plus className="h-3.5 w-3.5" /> Add option
                    </button>
                    <div className="flex flex-wrap items-center gap-6">
                      <label className="flex items-center gap-2 text-sm text-ink-3">
                        <input
                          type="radio"
                          checked={draft.status === "open"}
                          onChange={() => setDraft({ ...draft, status: "open" })}
                        />
                        Open
                      </label>
                      <label className="flex items-center gap-2 text-sm text-ink-3">
                        <input
                          type="radio"
                          checked={draft.status === "closed"}
                          onChange={() => setDraft({ ...draft, status: "closed" })}
                        />
                        Closed
                      </label>
                      <label className="flex items-center gap-2 text-sm text-ink-3">
                        <input
                          type="radio"
                          checked={draft.status === "draft"}
                          onChange={() => setDraft({ ...draft, status: "draft" })}
                        />
                        Draft
                      </label>
                      <label className="flex items-center gap-2 text-sm text-ink-3">
                        <input
                          type="checkbox"
                          checked={draft.allow_results_before_vote}
                          onChange={(event) =>
                            setDraft({ ...draft, allow_results_before_vote: event.target.checked })
                          }
                        />
                        Show results before voting
                      </label>
                    </div>
                    <div className="flex gap-4 text-xs">
                      <button
                        onClick={() => void saveEdit(poll)}
                        disabled={busy}
                        className="bg-ink px-4 py-2 text-sm text-paper disabled:opacity-50"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => {
                          setEditingId(null);
                          setDraft(null);
                          setError(null);
                        }}
                        disabled={busy}
                        className="text-ink-3 underline underline-offset-2 hover:text-ink disabled:opacity-50"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title="Delete this poll?"
        body="This poll and all of its votes will be permanently removed. This cannot be undone."
        confirmLabel="Delete poll"
        danger
        onCancel={() => setPendingDelete(null)}
        onConfirm={() => pendingDelete && void removePoll(pendingDelete)}
      />
    </div>
  );
}
