"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowser } from "@/lib/supabase/client";
import { RichEditor } from "@/components/rich-editor";
import { readingTimeFromDoc, slugify } from "@/lib/utils";
import { uploadPublicImage } from "@/lib/uploads/media";
import type { Post, ReferenceItem, PostStatus } from "@/lib/types";
import { ImagePlus, Plus, Trash2 } from "lucide-react";

const inputCls =
  "w-full border-0 border-b border-line bg-transparent px-0 py-2 text-sm text-ink outline-none transition-colors placeholder:text-ink-4 focus:border-ink";
const labelCls = "block text-xs uppercase tracking-widest text-ink-4";

export function PostEditor({ post }: { post?: Post }) {
  const router = useRouter();
  const [title, setTitle] = useState(post?.title ?? "");
  const [slug, setSlug] = useState(post?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(Boolean(post));
  const [excerpt, setExcerpt] = useState(post?.excerpt ?? "");
  const [content, setContent] = useState<Record<string, unknown> | null>(
    post?.content ?? null,
  );
  const [tags, setTags] = useState((post?.tags ?? []).join(", "));
  const [coverUrl, setCoverUrl] = useState(post?.cover_image_url ?? "");
  const [coverCredit, setCoverCredit] = useState(post?.cover_image_credit ?? "");
  const [coverCreditUrl, setCoverCreditUrl] = useState(
    post?.cover_image_credit_url ?? "",
  );
  const [seoTitle, setSeoTitle] = useState(post?.seo_title ?? "");
  const [seoDescription, setSeoDescription] = useState(post?.seo_description ?? "");
  const [references, setReferences] = useState<ReferenceItem[]>(
    post?.references ?? [],
  );
  const [saving, setSaving] = useState<PostStatus | null>(null);
  const [coverUploading, setCoverUploading] = useState(false);
  const [message, setMessage] = useState("");
  const coverInputRef = useRef<HTMLInputElement>(null);

  async function uploadCover(file: File | undefined) {
    if (!file || coverUploading) return;
    setCoverUploading(true);
    setMessage("");
    try {
      const publicUrl = await uploadPublicImage({
        supabase: getSupabaseBrowser(),
        file,
        folder: "posts/covers",
      });
      setCoverUrl(publicUrl);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Cover upload failed.");
    } finally {
      setCoverUploading(false);
      if (coverInputRef.current) coverInputRef.current.value = "";
    }
  }

  async function save(status: PostStatus) {
    if (!title.trim()) {
      setMessage("A title is required.");
      return;
    }
    const finalSlug = slugTouched && slug ? slug : slugify(title);
    if (!finalSlug) {
      setMessage("Could not derive a slug — set one manually.");
      return;
    }
    setSaving(status);
    setMessage("");

    const supabase = getSupabaseBrowser();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const payload = {
      slug: finalSlug,
      title: title.trim(),
      excerpt: excerpt.trim() || null,
      content,
      cover_image_url: coverUrl.trim() || null,
      cover_image_credit: coverCredit.trim() || null,
      cover_image_credit_url: coverCreditUrl.trim() || null,
      tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
      status,
      published_at:
        status === "published"
          ? post?.published_at ?? new Date().toISOString()
          : status === "scheduled"
            ? post?.published_at
            : null,
      seo_title: seoTitle.trim() || null,
      seo_description: seoDescription.trim() || null,
      references: references.filter((r) => r.label.trim()),
      reading_time_minutes: readingTimeFromDoc(content),
      author_id: user?.id ?? null,
      updated_at: new Date().toISOString(),
    };

    const { error } = post
      ? await supabase.from("posts").update(payload).eq("id", post.id)
      : await supabase.from("posts").insert(payload);

    setSaving(null);
    if (error) {
      setMessage(
        error.code === "23505"
          ? "That slug is already taken — choose another."
          : `Save failed: ${error.message}`,
      );
      return;
    }
    router.push("/admin/posts");
    router.refresh();
  }

  async function remove() {
    if (!post || !window.confirm("Delete this post permanently?")) return;
    const supabase = getSupabaseBrowser();
    await supabase.from("posts").delete().eq("id", post.id);
    router.push("/admin/posts");
    router.refresh();
  }

  return (
    <div className="space-y-10">
      <div>
        <label className={labelCls} htmlFor="pe-title">Title</label>
        <input
          id="pe-title"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            if (!slugTouched) setSlug(slugify(e.target.value));
          }}
          placeholder="The title of your article"
          className={`${inputCls} mt-2 font-serif text-2xl tracking-tight`}
        />
      </div>

      <div className="grid gap-8 sm:grid-cols-2">
        <div>
          <label className={labelCls} htmlFor="pe-slug">Slug (URL)</label>
          <input
            id="pe-slug"
            value={slug}
            onChange={(e) => {
              setSlugTouched(true);
              setSlug(slugify(e.target.value));
            }}
            className={`${inputCls} mt-2`}
          />
        </div>
        <div>
          <label className={labelCls} htmlFor="pe-tags">Tags (comma separated)</label>
          <input
            id="pe-tags"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="digital society, methods"
            className={`${inputCls} mt-2`}
          />
        </div>
      </div>

      <div>
        <label className={labelCls} htmlFor="pe-excerpt">Excerpt</label>
        <textarea
          id="pe-excerpt"
          value={excerpt}
          onChange={(e) => setExcerpt(e.target.value)}
          rows={2}
          placeholder="One or two sentences shown in listings and link previews."
          className={`${inputCls} mt-2 resize-y`}
        />
      </div>

      <div>
        <span className={labelCls}>Body</span>
        <div className="mt-2">
          <RichEditor initialContent={post?.content ?? null} onChange={setContent} />
        </div>
      </div>

      <fieldset className="border border-line p-6" style={{ borderRadius: 7 }}>
        <legend className="px-2 text-xs uppercase tracking-widest text-ink-4">
          Cover image &amp; attribution
        </legend>
        <div className="grid gap-6">
          <div>
            <label className={labelCls} htmlFor="pe-cover">Image URL</label>
            <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-end">
              <input id="pe-cover" value={coverUrl} onChange={(e) => setCoverUrl(e.target.value)} placeholder="https://…" className={inputCls} />
              <button
                type="button"
                onClick={() => coverInputRef.current?.click()}
                disabled={coverUploading}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-line px-4 py-2 text-sm text-ink-3 transition-colors hover:border-ink hover:text-ink disabled:opacity-40"
              >
                <ImagePlus className="h-4 w-4" />
                {coverUploading ? "Uploading…" : "Upload"}
              </button>
              <input
                ref={coverInputRef}
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={(e) => uploadCover(e.target.files?.[0])}
              />
            </div>
          </div>
          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <label className={labelCls} htmlFor="pe-credit">Credit (e.g. “Photo by Jane Doe”)</label>
              <input id="pe-credit" value={coverCredit} onChange={(e) => setCoverCredit(e.target.value)} className={`${inputCls} mt-2`} />
            </div>
            <div>
              <label className={labelCls} htmlFor="pe-credit-url">Credit link</label>
              <input id="pe-credit-url" value={coverCreditUrl} onChange={(e) => setCoverCreditUrl(e.target.value)} placeholder="https://…" className={`${inputCls} mt-2`} />
            </div>
          </div>
        </div>
      </fieldset>

      <fieldset className="border border-line p-6" style={{ borderRadius: 7 }}>
        <legend className="px-2 text-xs uppercase tracking-widest text-ink-4">
          References
        </legend>
        <p className="text-xs leading-relaxed text-ink-3">
          Sources cited in this article. They render as a numbered
          &ldquo;References&rdquo; section at the end of the article.
        </p>
        <div className="mt-4 space-y-3">
          {references.map((ref, i) => (
            <div key={i} className="flex flex-wrap items-center gap-3">
              <span className="w-6 text-xs text-ink-4">{i + 1}.</span>
              <input
                value={ref.label}
                onChange={(e) => {
                  const next = [...references];
                  next[i] = { ...next[i], label: e.target.value };
                  setReferences(next);
                }}
                placeholder="Author (Year). Title. Journal."
                className="min-w-0 flex-1 border-0 border-b border-line bg-transparent px-0 py-1.5 text-sm text-ink outline-none focus:border-ink"
              />
              <input
                value={ref.url ?? ""}
                onChange={(e) => {
                  const next = [...references];
                  next[i] = { ...next[i], url: e.target.value };
                  setReferences(next);
                }}
                placeholder="https://doi.org/… (optional)"
                className="min-w-0 flex-1 border-0 border-b border-line bg-transparent px-0 py-1.5 text-sm text-ink outline-none focus:border-ink"
              />
              <button
                type="button"
                onClick={() => setReferences(references.filter((_, j) => j !== i))}
                className="p-1 text-ink-4 transition-colors hover:text-ink"
                aria-label="Remove reference"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => setReferences([...references, { label: "", url: "" }])}
            className="inline-flex items-center gap-1.5 text-sm text-ink-3 transition-colors hover:text-ink"
          >
            <Plus className="h-4 w-4" /> Add reference
          </button>
        </div>
      </fieldset>

      <fieldset className="border border-line p-6" style={{ borderRadius: 7 }}>
        <legend className="px-2 text-xs uppercase tracking-widest text-ink-4">
          SEO
        </legend>
        <div className="grid gap-6">
          <div>
            <label className={labelCls} htmlFor="pe-seo-title">Search title (optional)</label>
            <input id="pe-seo-title" value={seoTitle} onChange={(e) => setSeoTitle(e.target.value)} className={`${inputCls} mt-2`} />
          </div>
          <div>
            <label className={labelCls} htmlFor="pe-seo-desc">Search description (optional)</label>
            <textarea id="pe-seo-desc" value={seoDescription} onChange={(e) => setSeoDescription(e.target.value)} rows={2} className={`${inputCls} mt-2 resize-y`} />
          </div>
        </div>
      </fieldset>

      {message && <p className="text-sm text-red-700">{message}</p>}

      <div className="sticky bottom-0 flex flex-wrap items-center gap-3 border-t border-line bg-paper py-4">
        <button
          onClick={() => save("published")}
          disabled={saving !== null}
          className="rounded-full bg-ink px-6 py-2.5 text-sm text-paper transition-opacity hover:opacity-80 disabled:opacity-40"
        >
          {saving === "published" ? "Publishing…" : post?.status === "published" ? "Update" : "Publish"}
        </button>
        <button
          onClick={() => save("draft")}
          disabled={saving !== null}
          className="rounded-full border border-ink px-6 py-2.5 text-sm text-ink transition-colors hover:bg-ink hover:text-paper disabled:opacity-40"
        >
          {saving === "draft" ? "Saving…" : "Save draft"}
        </button>
        <button
          onClick={() => save("scheduled")}
          disabled={saving !== null}
          className="rounded-full border border-line px-6 py-2.5 text-sm text-ink-3 transition-colors hover:border-ink hover:text-ink disabled:opacity-40"
        >
          Mark scheduled
        </button>
        {post && (
          <button
            onClick={remove}
            className="ml-auto text-sm text-ink-4 underline underline-offset-2 transition-colors hover:text-red-700"
          >
            Delete
          </button>
        )}
      </div>
    </div>
  );
}
