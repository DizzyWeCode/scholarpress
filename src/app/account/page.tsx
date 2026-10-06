"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getSupabaseBrowser } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

export default function AccountPage() {
  const [user, setUser] = useState<User | null>(null);
  const [subscribed, setSubscribed] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const supabase = getSupabaseBrowser();
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) {
        router.replace("/login");
        return;
      }
      setUser(data.user);
      const { data: sub } = await supabase
        .from("subscribers")
        .select("id")
        .eq("email", data.user.email ?? "")
        .maybeSingle();
      setSubscribed(Boolean(sub));
      setLoading(false);
    });
  }, [router]);

  async function toggleSubscription() {
    if (!user?.email) return;
    const supabase = getSupabaseBrowser();
    if (subscribed) {
      await supabase.from("subscribers").delete().eq("email", user.email);
      setSubscribed(false);
    } else {
      await supabase.from("subscribers").insert({
        email: user.email,
        user_id: user.id,
        source: "account",
      });
      setSubscribed(true);
    }
  }

  async function signOut() {
    await getSupabaseBrowser().auth.signOut();
    router.replace("/");
    router.refresh();
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-md px-5 py-28 text-sm text-ink-3 sm:px-8">
        Loading your account…
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md px-5 py-28 sm:px-8">
      <p className="text-xs uppercase tracking-[0.25em] text-ink-4">Account</p>
      <h1 className="mt-4 font-serif text-4xl tracking-tight text-ink">
        Hello{user?.user_metadata?.full_name ? `, ${user.user_metadata.full_name.split(" ")[0]}` : ""}
      </h1>
      <p className="mt-3 text-sm text-ink-3">{user?.email}</p>

      <div className="mt-10 border border-line p-6" style={{ borderRadius: 7 }}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-ink">Newsletter</p>
            <p className="mt-1 text-xs text-ink-3">
              New essays, papers, and webinar announcements.
            </p>
          </div>
          <button
            onClick={toggleSubscription}
            className={`rounded-full px-4 py-1.5 text-sm transition-colors ${
              subscribed
                ? "border border-line text-ink-3 hover:border-ink hover:text-ink"
                : "bg-ink text-paper hover:opacity-80"
            }`}
          >
            {subscribed ? "Unsubscribe" : "Subscribe"}
          </button>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between text-sm">
        <Link href="/" className="text-ink-3 transition-colors hover:text-ink">
          ← Back to the site
        </Link>
        <button
          onClick={signOut}
          className="text-ink-3 underline underline-offset-2 transition-colors hover:text-ink"
        >
          Sign out
        </button>
      </div>
    </div>
  );
}
