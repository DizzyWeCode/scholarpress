"use client";

import { useEffect, useMemo, useState } from "react";
import { getSupabaseBrowser } from "@/lib/supabase/client";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { AdminButton, AdminCard, AdminCardHeader, AdminInput, AdminPageHeader, AdminSpinner, StatusBadge } from "@/components/admin-ui";
import { useToast } from "@/components/toast";
import { Pencil, Plus, Save, Trash2 } from "lucide-react";
import type { Paper, Post, Webinar } from "@/lib/types";
import type { Topic } from "@/lib/topics";

const slugify = (value: string) => value.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 120);

type ContentChoice = { id: string; title: string; type: "blog_post" | "research_output" | "event"; meta: string };

export default function AdminTopicsPage() {
  const [topics, setTopics] = useState<Topic[] | null>(null);
  const [editing, setEditing] = useState<Topic | null>(null);
  const [creating, setCreating] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<Topic | null>(null);
  const [choices, setChoices] = useState<ContentChoice[]>([]);
  const { push } = useToast();

  async function load() {
    const { data, error } = await getSupabaseBrowser().from("topics").select("*").order("sort_order").order("name");
    if (error) push({ kind: "error", title: "Could not load topics", body: error.message });
    setTopics((data ?? []) as Topic[]);
  }

  async function loadChoices() {
    const supabase = getSupabaseBrowser();
    const [posts, papers, events] = await Promise.all([
      supabase.from("posts").select("id,slug,title,tags").in("status", ["published", "scheduled"]).order("published_at", { ascending: false }).limit(100),
      supabase.from("papers").select("id,title,venue,year").eq("status", "published").order("year", { ascending: false }).limit(100),
      supabase.from("webinars").select("id,title,event_type,starts_at,status").neq("status", "draft").order("starts_at", { ascending: false }).limit(100),
    ]);
    setChoices([
      ...((posts.data ?? []) as Pick<Post, "id" | "slug" | "title" | "tags">[]).map((post) => ({ id: post.id, title: post.title, type: "blog_post" as const, meta: post.tags?.slice(0, 2).join(" · ") || "Blog post" })),
      ...((papers.data ?? []) as Pick<Paper, "id" | "title" | "venue" | "year">[]).map((paper) => ({ id: paper.id, title: paper.title, type: "research_output" as const, meta: [paper.year, paper.venue].filter(Boolean).join(" · ") || "Research output" })),
      ...((events.data ?? []) as Pick<Webinar, "id" | "title" | "event_type" | "starts_at" | "status">[]).map((event) => ({ id: event.id, title: event.title, type: "event" as const, meta: `${event.event_type || "event"} · ${event.status}` })),
    ]);
  }

  useEffect(() => { void load(); void loadChoices(); // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function remove(topic: Topic) {
    const { error } = await getSupabaseBrowser().from("topics").delete().eq("id", topic.id);
    setPendingDelete(null);
    if (error) push({ kind: "error", title: "Could not delete topic", body: error.message });
    else { push({ kind: "success", title: "Topic deleted" }); void load(); }
  }

  const children = useMemo(() => (topics ?? []).filter((topic) => topic.parent_id), [topics]);

  return (
    <div>
      <AdminPageHeader eyebrow="Library" title="Topics" description="Create the subject collections that connect Blog posts, Research outputs, and Events." actions={<AdminButton onClick={() => { setEditing(null); setCreating(true); }}><Plus className="mr-1.5 h-4 w-4" /> New topic</AdminButton>} />
      <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_1.2fr]">
        <AdminCard>
          <AdminCardHeader title={`${topics?.length ?? 0} topics`} description="Public topics become browseable landing pages. Internal topics stay available for editorial organization." />
          <div className="divide-y divide-slate-100">
            {topics === null ? <div className="px-5 py-8"><AdminSpinner label="Loading topics" /></div> : topics.length === 0 ? <p className="px-5 py-12 text-sm text-slate-500">No topics yet. Start with a durable subject rather than a one-off campaign label.</p> : topics.map((topic) => (
              <div key={topic.id} className="flex items-start justify-between gap-4 px-5 py-4">
                <button type="button" onClick={() => { setEditing(topic); setCreating(false); }} className="min-w-0 text-left">
                  <span className="block font-medium text-slate-900">{topic.name}</span>
                  <span className="mt-1 block text-xs text-slate-500">/{topic.slug} · {topic.is_public ? "Public" : "Internal"}{topic.parent_id ? " · nested" : ""}</span>
                </button>
                <div className="flex shrink-0 items-center gap-2"><StatusBadge status={topic.is_public ? "published" : "draft"} /><button type="button" onClick={() => setEditing(topic)} aria-label={`Edit ${topic.name}`} className="rounded p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-900"><Pencil className="h-4 w-4" /></button><button type="button" onClick={() => setPendingDelete(topic)} aria-label={`Delete ${topic.name}`} className="rounded p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-700"><Trash2 className="h-4 w-4" /></button></div>
              </div>
            ))}
          </div>
        </AdminCard>
        {(creating || editing) ? <TopicEditor topic={editing ?? undefined} topics={topics ?? []} choices={choices} onClose={() => { setCreating(false); setEditing(null); }} onSaved={() => { setCreating(false); setEditing(null); void load(); }} /> : <AdminCard><AdminCardHeader title="How topics work" description="Keep the public taxonomy small, recognizable, and useful." /><div className="space-y-4 px-5 py-6 text-sm leading-6 text-slate-600"><p>A topic is a durable subject page, not a campaign or a synonym list. Give it a clear name, a short visitor-facing description, and publish it only when it has useful work attached.</p><p>Use the relationship panel to choose which published Blog posts, Research outputs, and Events belong in the collection. The order can be refined later without changing the underlying content.</p><p>{children.length} nested topics currently have a parent. Use nesting sparingly so visitors can still understand the top-level subject quickly.</p></div></AdminCard>}
      </div>
      <ConfirmDialog open={Boolean(pendingDelete)} title="Delete this topic?" body={`“${pendingDelete?.name ?? ""}” and its content links will be removed. Published content itself will not be deleted.`} confirmLabel="Delete topic" danger onCancel={() => setPendingDelete(null)} onConfirm={() => pendingDelete && void remove(pendingDelete)} />
    </div>
  );
}

function TopicEditor({ topic, topics, choices, onClose, onSaved }: { topic?: Topic; topics: Topic[]; choices: ContentChoice[]; onClose: () => void; onSaved: () => void }) {
  const [name, setName] = useState(topic?.name ?? "");
  const [slug, setSlug] = useState(topic?.slug ?? "");
  const [description, setDescription] = useState(topic?.description ?? "");
  const [parentId, setParentId] = useState(topic?.parent_id ?? "");
  const [isPublic, setIsPublic] = useState(topic?.is_public ?? false);
  const [sortOrder, setSortOrder] = useState(topic?.sort_order ?? 0);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!topic) return;
    void getSupabaseBrowser().from("content_topics").select("content_type,content_id").eq("topic_id", topic.id).then(({ data }) => setSelected(new Set((data ?? []).map((row) => `${row.content_type}:${row.content_id}`))));
  }, [topic]);

  const toggle = (choice: ContentChoice) => setSelected((current) => { const next = new Set(current); const key = `${choice.type}:${choice.id}`; if (next.has(key)) next.delete(key); else next.add(key); return next; });

  async function save() {
    if (!name.trim()) { setError("Topic name is required."); return; }
    const finalSlug = slugify(slug || name);
    if (!finalSlug) { setError("Add a valid slug."); return; }
    setBusy(true); setError(null);
    const supabase = getSupabaseBrowser();
    const payload = { name: name.trim(), slug: finalSlug, description: description.trim() || null, parent_id: parentId || null, is_public: isPublic, sort_order: sortOrder };
    const result = topic ? await supabase.from("topics").update(payload).eq("id", topic.id).select("id").single() : await supabase.from("topics").insert(payload).select("id").single();
    if (result.error || !result.data) { setError(result.error?.message ?? "Could not save topic."); setBusy(false); return; }
    const topicId = result.data.id;
    await supabase.from("content_topics").delete().eq("topic_id", topicId);
    if (selected.size) {
      const links = [...selected].map((key, index) => { const [content_type, content_id] = key.split(":"); return { topic_id: topicId, content_type, content_id, sort_order: index }; });
      const { error: linkError } = await supabase.from("content_topics").insert(links);
      if (linkError) { setError(`Topic saved, but relationships could not be saved: ${linkError.message}`); setBusy(false); return; }
    }
    setBusy(false); onSaved();
  }

  const groups: { type: ContentChoice["type"]; label: string }[] = [{ type: "blog_post", label: "Blog" }, { type: "research_output", label: "Research" }, { type: "event", label: "Events" }];
  return <AdminCard><AdminCardHeader title={topic ? "Edit topic" : "New topic"} description="Set the public identity first, then connect the work that belongs here." /><div className="space-y-6 px-5 py-6"><div className="grid gap-4 sm:grid-cols-2"><label className="block"><span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Name</span><AdminInput className="mt-2" value={name} onChange={(e) => { setName(e.target.value); if (!topic) setSlug(slugify(e.target.value)); }} placeholder="Malaria treatment" /></label><label className="block"><span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Slug</span><AdminInput className="mt-2" value={slug} onChange={(e) => setSlug(slugify(e.target.value))} placeholder="malaria-treatment" /></label></div><label className="block"><span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Visitor description</span><textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="mt-2 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none focus:border-indigo-500" placeholder="A short explanation of what someone will find here." /></label><div className="grid gap-4 sm:grid-cols-2"><label className="block"><span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Parent topic</span><select value={parentId} onChange={(e) => setParentId(e.target.value)} className="mt-2 min-h-9 w-full rounded-md border border-slate-300 bg-white px-3 text-sm"><option value="">Top-level topic</option>{topics.filter((item) => item.id !== topic?.id).map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label><label className="block"><span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Display order</span><AdminInput className="mt-2" type="number" value={sortOrder} onChange={(e) => setSortOrder(Number(e.target.value) || 0)} /></label></div><label className="flex items-start gap-3 rounded-md border border-slate-200 bg-slate-50 p-3 text-sm"><input type="checkbox" checked={isPublic} onChange={(e) => setIsPublic(e.target.checked)} className="mt-1" /><span><strong className="font-medium text-slate-900">Publish this topic</strong><span className="mt-1 block text-xs leading-5 text-slate-500">Public topics appear in the Topics library and can be indexed. Keep it off until the collection has useful content.</span></span></label><div><div className="flex items-baseline justify-between gap-4"><div><h3 className="text-sm font-semibold text-slate-900">Connect published work</h3><p className="mt-1 text-xs text-slate-500">Choose the items visitors should see on this topic page.</p></div><span className="text-xs text-slate-500">{selected.size} selected</span></div><div className="mt-4 space-y-5">{groups.map((group) => { const items = choices.filter((choice) => choice.type === group.type); if (!items.length) return null; return <div key={group.type}><p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">{group.label}</p><div className="max-h-52 overflow-y-auto rounded-md border border-slate-200">{items.map((choice) => <label key={`${choice.type}:${choice.id}`} className="flex cursor-pointer items-start gap-3 border-b border-slate-100 px-3 py-2.5 last:border-0 hover:bg-slate-50"><input type="checkbox" checked={selected.has(`${choice.type}:${choice.id}`)} onChange={() => toggle(choice)} className="mt-1" /><span className="min-w-0"><span className="block text-sm text-slate-900">{choice.title}</span><span className="mt-0.5 block text-xs text-slate-500">{choice.meta}</span></span></label>)}</div></div>; })}</div></div>{error ? <p role="alert" className="text-sm text-red-700">{error}</p> : null}<div className="flex gap-2"><AdminButton onClick={() => void save()} disabled={busy}><Save className="mr-1.5 h-4 w-4" />{busy ? "Saving…" : "Save topic"}</AdminButton><AdminButton variant="secondary" onClick={onClose}>Cancel</AdminButton></div></div></AdminCard>;
}
