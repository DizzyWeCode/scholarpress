"use client";

import { useState } from "react";
import { getSupabaseBrowser } from "@/lib/supabase/client";

/** Email subscribe form — inserts into the subscribers table (RLS-guarded). */
export function NewsletterForm({ dark = false }: { dark?: boolean }) {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "busy" | "done" | "error">("idle");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.includes("@")) return;
    setState("busy");
    try {
      const supabase = getSupabaseBrowser();
      const { error } = await supabase
        .from("subscribers")
        .insert({ email: email.trim().toLowerCase(), source: "newsletter" });
      if (error && error.code !== "23505") throw error; // ignore duplicate emails
      setState("done");
    } catch {
      setState("error");
    }
  }

  if (state === "done") {
    return (
      <p className={dark ? "text-sm text-paper/70" : "text-sm text-ink-2"}>
        You&rsquo;re on the list — thank you. New writing and webinar
        announcements will reach your inbox.
      </p>
    );
  }

  return (
    <form onSubmit={submit} className="flex w-full max-w-md gap-2">
      <label htmlFor="newsletter-email" className="sr-only">
        Email address
      </label>
      <input
        id="newsletter-email"
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@university.edu"
        className={`w-full border-0 border-b bg-transparent px-0 py-2 text-sm outline-none transition-colors placeholder:text-current placeholder:opacity-40 ${
          dark
            ? "border-paper/40 text-paper focus:border-paper"
            : "border-ink/40 text-ink focus:border-ink"
        }`}
      />
      <button
        type="submit"
        disabled={state === "busy"}
        className={`shrink-0 rounded-full px-5 py-2 text-sm transition-opacity hover:opacity-80 disabled:opacity-40 ${
          dark ? "bg-paper text-ink" : "bg-ink text-paper"
        }`}
      >
        {state === "busy" ? "…" : "Subscribe"}
      </button>
      {state === "error" && (
        <p className="self-center text-xs text-red-700">Something went wrong.</p>
      )}
    </form>
  );
}
