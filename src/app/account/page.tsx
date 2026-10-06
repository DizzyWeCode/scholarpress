"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getSupabaseBrowser } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

export default function AccountPage() {
  const [user, setUser] = useState<User | null>(null);
  const [name, setName] = useState("");
  const [subscribed, setSubscribed] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const router = useRouter();

  useEffect(() => {
    const supabase = getSupabaseBrowser();
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) { router.replace("/login"); return; }
      setUser(data.user);
      const [{ data: profile }, { data: sub }] = await Promise.all([
        supabase.from("profiles").select("full_name").eq("id", data.user.id).maybeSingle(),
        supabase.from("subscribers").select("id").eq("email", data.user.email ?? "").maybeSingle(),
      ]);
      setName(profile?.full_name ?? data.user.user_metadata?.full_name ?? "");
      setSubscribed(Boolean(sub));
      setLoading(false);
    });
  }, [router]);

  async function saveProfile(event: React.FormEvent) {
    event.preventDefault(); if (!user) return;
    setSaving(true); setMessage("");
    const { error } = await getSupabaseBrowser().from("profiles").update({ full_name: name.trim() || null }).eq("id", user.id);
    setMessage(error ? error.message : "Profile saved."); setSaving(false);
  }

  async function toggleSubscription() {
    if (!user?.email) return;
    const supabase = getSupabaseBrowser();
    if (subscribed) await supabase.from("subscribers").delete().eq("email", user.email);
    else await supabase.from("subscribers").insert({ email: user.email, user_id: user.id, source: "account" });
    setSubscribed(!subscribed);
  }

  async function signOut() { await getSupabaseBrowser().auth.signOut(); router.replace("/"); router.refresh(); }

  async function deleteAccount() {
    if (!user?.email || !window.confirm(`Delete the account for ${user.email}? This cannot be undone.`)) return;
    setSaving(true); setMessage("");
    const response = await fetch("/api/account/delete", { method: "POST" });
    const result = await response.json();
    if (!response.ok) { setMessage(result.error ?? "Could not delete account."); setSaving(false); return; }
    await getSupabaseBrowser().auth.signOut(); router.replace("/"); router.refresh();
  }

  if (loading) return <div className="mx-auto max-w-md px-5 py-28 text-sm text-ink-3 sm:px-8">Loading your account…</div>;

  return (
    <div className="mx-auto max-w-md px-5 py-20 sm:px-8">
      <p className="text-xs uppercase tracking-[0.25em] text-ink-4">Account</p>
      <h1 className="mt-4 font-serif text-4xl tracking-tight text-ink">Your reading profile</h1>
      <p className="mt-3 text-sm text-ink-3">{user?.email}</p>
      <form onSubmit={saveProfile} className="mt-10 border border-line p-6" style={{ borderRadius: 7 }}>
        <label className="text-sm font-medium text-ink" htmlFor="name">Display name</label>
        <input id="name" value={name} onChange={(event) => setName(event.target.value)} className="mt-2 w-full border border-line bg-paper px-3 py-2 text-sm text-ink outline-none focus:border-ink" maxLength={80} />
        <button disabled={saving} className="mt-4 bg-ink px-4 py-2 text-sm text-paper disabled:opacity-50">{saving ? "Saving…" : "Save profile"}</button>
        {message ? <p className="mt-3 text-xs text-ink-3">{message}</p> : null}
      </form>
      <div className="mt-6 border border-line p-6" style={{ borderRadius: 7 }}>
        <p className="text-sm font-medium text-ink">Newsletter</p>
        <p className="mt-1 text-xs text-ink-3">New essays, papers, and webinar announcements.</p>
        <button onClick={toggleSubscription} className="mt-4 border border-line px-4 py-2 text-sm text-ink hover:border-ink">{subscribed ? "Unsubscribe" : "Subscribe"}</button>
      </div>
      <div className="mt-8 border-t border-line pt-6"><p className="text-xs uppercase tracking-[0.2em] text-red-700">Danger zone</p><button onClick={deleteAccount} disabled={saving} className="mt-3 text-sm text-red-700 underline underline-offset-2 disabled:opacity-50">Delete account</button></div>
      <div className="mt-8 flex items-center justify-between text-sm"><Link href="/" className="text-ink-3 hover:text-ink">← Back to the site</Link><button onClick={signOut} className="text-ink-3 underline underline-offset-2 hover:text-ink">Sign out</button></div>
    </div>
  );
}
