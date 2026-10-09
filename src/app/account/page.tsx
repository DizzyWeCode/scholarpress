"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getSupabaseBrowser } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { useToast } from "@/components/toast";

type Tab = "profile" | "saved" | "liked" | "comments" | "newsletter" | "security";

interface SavedRow {
  post_id: string;
  created_at: string;
  posts: { id: string; slug: string; title: string; excerpt: string | null; published_at: string | null } | null;
}
interface LikedRow {
  post_id: string;
  created_at: string;
  posts: { id: string; slug: string; title: string } | null;
}
interface CommentRow {
  id: string;
  post_id: string;
  body: string;
  created_at: string;
  posts: { slug: string; title: string } | null;
}

const TABS: { id: Tab; label: string }[] = [
  { id: "profile", label: "Profile" },
  { id: "saved", label: "Saved" },
  { id: "liked", label: "Liked" },
  { id: "comments", label: "Comments" },
  { id: "newsletter", label: "Newsletter" },
  { id: "security", label: "Security" },
];

export default function AccountPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>("profile");
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const { push } = useToast();
  const router = useRouter();

  // Profile fields
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [institution, setInstitution] = useState("");
  const [title, setTitle] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [uploading, setUploading] = useState(false);

  // Newsletter
  const [subscribed, setSubscribed] = useState<boolean | null>(null);
  const [format, setFormat] = useState("all");
  const [subscriptionBusy, setSubscriptionBusy] = useState(false);
  const [subscriptionError, setSubscriptionError] = useState<string | null>(null);

  // Activity
  const [saved, setSaved] = useState<SavedRow[]>([]);
  const [liked, setLiked] = useState<LikedRow[]>([]);
  const [comments, setComments] = useState<CommentRow[]>([]);

  useEffect(() => {
    const supabase = getSupabaseBrowser();
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) { router.replace("/login"); return; }
      setUser(data.user);
      const userId = data.user.id;
      const [{ data: profile }, { data: sub }] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", userId).maybeSingle(),
        supabase.from("subscribers").select("id").eq("email", data.user.email ?? "").maybeSingle(),
      ]);
      setName(profile?.full_name ?? data.user.user_metadata?.full_name ?? "");
      setBio(profile?.bio ?? "");
      setInstitution(profile?.institution ?? "");
      setTitle(profile?.title ?? "");
      setAvatarUrl(profile?.avatar_url ?? data.user.user_metadata?.avatar_url ?? "");
      setFormat(profile?.newsletter_format ?? "all");
      setSubscribed(Boolean(sub));

      const [{ data: savedRows }, { data: likedRows }, { data: commentRows }] = await Promise.all([
        supabase.from("bookmarks").select("post_id, created_at, posts(id, slug, title, excerpt, published_at)").eq("user_id", userId).order("created_at", { ascending: false }).limit(50),
        supabase.from("post_likes").select("post_id, created_at, posts(id, slug, title)").eq("user_id", userId).order("created_at", { ascending: false }).limit(50),
        supabase.from("comments").select("id, post_id, body, created_at, posts(slug, title)").eq("user_id", userId).order("created_at", { ascending: false }).limit(50),
      ]);
      setSaved(((savedRows ?? []) as unknown) as SavedRow[]);
      setLiked(((likedRows ?? []) as unknown) as LikedRow[]);
      setComments(((commentRows ?? []) as unknown) as CommentRow[]);
      setLoading(false);
      fetch("/api/account/welcome", { method: "POST" }).catch(() => undefined);
    });
  }, [router]);

  async function saveProfile(event: React.FormEvent) {
    event.preventDefault();
    if (!user) return;
    setSaving(true);
    const { error } = await getSupabaseBrowser().from("profiles").update({
      full_name: name.trim() || null,
      bio: bio.trim() || null,
      institution: institution.trim() || null,
      title: title.trim() || null,
      avatar_url: avatarUrl.trim() || null,
      newsletter_format: format,
    }).eq("id", user.id);
    setSaving(false);
    if (error) push({ kind: "error", title: "Could not save profile", body: error.message });
    else push({ kind: "success", title: "Profile saved." });
  }

  async function uploadAvatar(file: File) {
    if (!user) return;
    setUploading(true);
    try {
      const supabase = getSupabaseBrowser();
      const ext = file.name.split(".").pop()?.toLowerCase() ?? "png";
      const path = `${user.id}/avatar.${ext}`;
      const { error: uploadError } = await supabase.storage.from("avatars").upload(path, file, { upsert: true, contentType: file.type });
      if (uploadError) throw uploadError;
      const { data } = supabase.storage.from("avatars").getPublicUrl(path);
      setAvatarUrl(data.publicUrl);
      const { error: saveError } = await supabase.from("profiles").update({ avatar_url: data.publicUrl }).eq("id", user.id);
      if (saveError) throw saveError;
      push({ kind: "success", title: "Profile photo updated." });
    } catch (err) {
      console.error("avatar upload failed", err);
      push({ kind: "error", title: "Could not upload photo", body: "Use a JPG, PNG, or WebP under 2 MB." });
    } finally {
      setUploading(false);
    }
  }

  async function toggleSubscription() {
    if (!user?.email || subscriptionBusy) return;
    const supabase = getSupabaseBrowser();
    setSubscriptionBusy(true);
    setSubscriptionError(null);
    try {
      if (subscribed) {
        const { error } = await supabase.from("subscribers").delete().eq("email", user.email);
        if (error) throw error;
        push({ kind: "info", title: "Unsubscribed from the newsletter." });
      } else {
        const { error } = await supabase.from("subscribers").insert({ email: user.email, user_id: user.id, source: "account" });
        if (error) throw error;
        push({ kind: "success", title: "Subscribed. Welcome aboard." });
      }
      setSubscribed(!subscribed);
    } catch (err) {
      console.error("subscription toggle failed", err);
      const message = err instanceof Error ? err.message : "Please try again.";
      setSubscriptionError(`Could not update subscription: ${message}`);
      push({ kind: "error", title: "Could not update subscription", body: message });
    } finally {
      setSubscriptionBusy(false);
    }
  }

  async function unsave(postId: string) {
    if (!user) return;
    const { error } = await getSupabaseBrowser().from("bookmarks").delete().eq("user_id", user.id).eq("post_id", postId);
    if (error) push({ kind: "error", title: "Could not remove bookmark" });
    else {
      setSaved((prev) => prev.filter((row) => row.post_id !== postId));
      push({ kind: "info", title: "Removed from your reading list." });
    }
  }

  async function signOut() {
    await getSupabaseBrowser().auth.signOut();
    router.replace("/");
    router.refresh();
  }

  async function deleteAccount() {
    if (!user) return;
    setSaving(true);
    try {
      const response = await fetch("/api/account/delete", { method: "POST" });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error ?? "Could not delete account.");
      push({ kind: "success", title: "Account deleted." });
      await getSupabaseBrowser().auth.signOut();
      router.replace("/");
      router.refresh();
    } catch (err) {
      push({ kind: "error", title: "Could not delete account", body: err instanceof Error ? err.message : undefined });
      setSaving(false);
      setConfirmDelete(false);
    }
  }

  if (loading) return <div className="mx-auto max-w-3xl px-5 py-28 text-sm text-ink-3 sm:px-8">Loading your account…</div>;
  const initial = (name || user?.email || "?").trim().charAt(0).toUpperCase();

  return (
    <div className="mx-auto max-w-3xl px-5 py-20 sm:px-8">
      <p className="text-xs uppercase tracking-[0.25em] text-ink-4">Account</p>
      <div className="mt-4 flex items-center gap-4">
        {avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={avatarUrl} alt={name || "Profile photo"} className="h-16 w-16 rounded-full border border-line object-cover" />
        ) : (
          <div aria-hidden className="flex h-16 w-16 items-center justify-center rounded-full border border-ink font-serif text-2xl text-ink">{initial}</div>
        )}
        <div>
          <h1 className="font-serif text-4xl tracking-tight text-ink">{name || "Your reading profile"}</h1>
          <p className="mt-1 text-sm text-ink-3">{user?.email}</p>
        </div>
      </div>

      <nav aria-label="Account sections" className="mt-8 flex flex-wrap gap-2 border-b border-line pb-4">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            aria-pressed={tab === t.id}
            className={`rounded-full border px-4 py-1.5 text-sm transition-colors ${tab === t.id ? "border-ink bg-ink text-paper" : "border-line text-ink-3 hover:border-ink hover:text-ink"}`}
          >
            {t.label}
          </button>
        ))}
      </nav>

      {tab === "profile" && (
        <form onSubmit={saveProfile} className="mt-8 border border-line p-6" style={{ borderRadius: 7 }}>
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="text-sm font-medium text-ink" htmlFor="avatar">Profile photo URL</label>
              <input id="avatar" value={avatarUrl} onChange={(e) => setAvatarUrl(e.target.value)} placeholder="https://…" className="mt-2 w-full border border-line bg-paper px-3 py-2 text-sm outline-none focus:border-ink" />
              <label className="mt-3 inline-flex cursor-pointer items-center gap-2 text-sm text-ink-3 hover:text-ink">
                <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) void uploadAvatar(f); }} />
                <span className="underline underline-offset-2">{uploading ? "Uploading…" : "Or upload a photo (2 MB max)"}</span>
              </label>
            </div>
            <div>
              <label className="text-sm font-medium text-ink" htmlFor="name">Display name</label>
              <input id="name" value={name} onChange={(e) => setName(e.target.value)} maxLength={80} className="mt-2 w-full border border-line bg-paper px-3 py-2 text-sm outline-none focus:border-ink" />
            </div>
            <div>
              <label className="text-sm font-medium text-ink" htmlFor="title">Role / title</label>
              <input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Pharmacist, Blantyre" maxLength={80} className="mt-2 w-full border border-line bg-paper px-3 py-2 text-sm outline-none focus:border-ink" />
            </div>
            <div className="sm:col-span-2">
              <label className="text-sm font-medium text-ink" htmlFor="institution">Institution</label>
              <input id="institution" value={institution} onChange={(e) => setInstitution(e.target.value)} placeholder="e.g. MUST, KuHeS" maxLength={120} className="mt-2 w-full border border-line bg-paper px-3 py-2 text-sm outline-none focus:border-ink" />
            </div>
            <div className="sm:col-span-2">
              <label className="text-sm font-medium text-ink" htmlFor="bio">Bio</label>
              <textarea id="bio" value={bio} onChange={(e) => setBio(e.target.value)} maxLength={500} rows={3} placeholder="A sentence or two about your work or interests." className="mt-2 w-full border border-line bg-paper px-3 py-2 text-sm outline-none focus:border-ink" />
            </div>
          </div>
          <button disabled={saving} className="mt-5 bg-ink px-4 py-2 text-sm text-paper disabled:opacity-50">{saving ? "Saving…" : "Save profile"}</button>
        </form>
      )}

      {tab === "saved" && (
        <div className="mt-8">
          {saved.length === 0 ? <p className="border-t border-line py-10 text-sm text-ink-3">Nothing saved yet. Tap <strong>Save</strong> on any article to build your reading list.</p> : saved.map((row) => (
            <div key={row.post_id} className="flex items-start justify-between gap-4 border-t border-line py-5">
              <div>
                <Link href={row.posts ? `/blog/${row.posts.slug}` : "#"} className="font-serif text-lg text-ink hover:opacity-60">{row.posts?.title ?? "Untitled"}</Link>
                {row.posts?.excerpt ? <p className="mt-1 text-sm text-ink-3">{row.posts.excerpt}</p> : null}
              </div>
              <button onClick={() => void unsave(row.post_id)} className="shrink-0 text-xs text-ink-3 underline underline-offset-2 hover:text-red-700">Remove</button>
            </div>
          ))}
        </div>
      )}

      {tab === "liked" && (
        <div className="mt-8">
          {liked.length === 0 ? <p className="border-t border-line py-10 text-sm text-ink-3">No liked articles yet.</p> : liked.map((row) => (
            <Link key={row.post_id} href={row.posts ? `/blog/${row.posts.slug}` : "#"} className="block border-t border-line py-5 font-serif text-lg text-ink hover:opacity-60">
              {row.posts?.title ?? "Untitled"}
            </Link>
          ))}
        </div>
      )}

      {tab === "comments" && (
        <div className="mt-8">
          {comments.length === 0 ? <p className="border-t border-line py-10 text-sm text-ink-3">No comments yet — join the discussion on any article.</p> : comments.map((c) => (
            <div key={c.id} className="border-t border-line py-5">
              <Link href={c.posts ? `/blog/${c.posts.slug}` : "#"} className="text-xs uppercase tracking-widest text-ink-4 hover:text-ink">{c.posts?.title ?? "Article"}</Link>
              <p className="mt-2 whitespace-pre-wrap text-sm text-ink">{c.body}</p>
              <p className="mt-1 text-xs text-ink-4">{new Date(c.created_at).toLocaleDateString()}</p>
            </div>
          ))}
        </div>
      )}

      {tab === "newsletter" && (
        <div className="mt-8 border border-line p-6" style={{ borderRadius: 7 }}>
          <p className="text-sm font-medium text-ink">Newsletter preferences</p>
          <p className="mt-1 text-xs text-ink-3">New essays, papers, and webinar announcements. No noise.</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {(["all", "essays", "announcements", "none"] as const).map((f) => (
              <button key={f} onClick={() => setFormat(f)} aria-pressed={format === f} className={`rounded-full border px-4 py-1.5 text-sm capitalize ${format === f ? "border-ink bg-ink text-paper" : "border-line text-ink-3 hover:border-ink hover:text-ink"}`}>{f}</button>
            ))}
          </div>
          <p className="mt-3 text-xs text-ink-4">Preference is stored on your profile; choosing “none” is the same as unsubscribing.</p>
          {subscriptionError ? <p role="status" aria-live="polite" className="mt-3 text-sm text-red-700">{subscriptionError}</p> : null}
          <div className="mt-4 flex gap-3">
            <button onClick={() => void saveProfile(new Event("submit") as unknown as React.FormEvent)} disabled={saving} className="bg-ink px-4 py-2 text-sm text-paper disabled:opacity-50">Save preferences</button>
            <button onClick={() => void toggleSubscription()} disabled={subscriptionBusy} className="border border-line px-4 py-2 text-sm text-ink hover:border-ink disabled:opacity-50">{subscriptionBusy ? "Saving…" : subscribed ? "Unsubscribe" : "Subscribe"}</button>
          </div>
        </div>
      )}

      {tab === "security" && (
        <div className="mt-8 space-y-6">
          <div className="border border-line p-6" style={{ borderRadius: 7 }}>
            <p className="text-sm font-medium text-ink">Sign out everywhere</p>
            <p className="mt-1 text-xs text-ink-3">Ends this session on this device.</p>
            <button onClick={() => void signOut()} className="mt-4 border border-line px-4 py-2 text-sm hover:border-ink">Sign out</button>
          </div>
          <div className="border border-red-700/40 p-6" style={{ borderRadius: 7 }}>
            <p className="text-xs uppercase tracking-[0.2em] text-red-700">Danger zone</p>
            <p className="mt-2 text-sm text-ink-3">Deleting your account removes your profile, bookmarks, likes, and subscription. This cannot be undone.</p>
            <button onClick={() => setConfirmDelete(true)} disabled={saving} className="mt-4 text-sm text-red-700 underline underline-offset-2 disabled:opacity-50">Delete account…</button>
          </div>
        </div>
      )}

      <div className="mt-10 flex items-center justify-between text-sm">
        <Link href="/" className="text-ink-3 hover:text-ink">← Back to the site</Link>
        {tab !== "security" && <button onClick={() => void signOut()} className="text-ink-3 underline underline-offset-2 hover:text-ink">Sign out</button>}
      </div>

      <ConfirmDialog
        open={confirmDelete}
        title="Delete your account?"
        body={`This permanently deletes the account for ${user?.email ?? "you"}, including profile, saved posts, likes, and comments linkage. Type DELETE to confirm — this cannot be undone.`}
        confirmLabel="Delete my account"
        danger
        requireTypedConfirm
        busy={saving}
        onCancel={() => setConfirmDelete(false)}
        onConfirm={() => void deleteAccount()}
      />
    </div>
  );
}
