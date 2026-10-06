"use client";

import { useState } from "react";
import { getSupabaseBrowser } from "@/lib/supabase/client";
import { SITE } from "@/lib/site";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);

  async function signInWithGoogle() {
    setBusy(true);
    const supabase = getSupabaseBrowser();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=/account`,
      },
    });
  }

  async function signInWithEmail(e: React.FormEvent) {
    e.preventDefault();
    if (!email.includes("@")) return;
    setBusy(true);
    const supabase = getSupabaseBrowser();
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?next=/account`,
      },
    });
    setBusy(false);
    if (!error) setSent(true);
  }

  return (
    <div className="mx-auto max-w-md px-5 py-28 sm:px-8">
      <p className="text-xs uppercase tracking-[0.25em] text-ink-4">
        Subscribe &amp; sign in
      </p>
      <h1 className="mt-4 font-serif text-4xl tracking-tight text-ink">
        Join the readership
      </h1>
      <p className="mt-4 text-sm leading-relaxed text-ink-3">
        Sign in to subscribe to {SITE.name}&rsquo;s writing and webinar
        announcements. No passwords — use Google or a one-time email link.
      </p>

      <button
        onClick={signInWithGoogle}
        disabled={busy}
        className="mt-10 flex w-full items-center justify-center gap-3 rounded-full border border-ink px-6 py-3 text-sm text-ink transition-colors hover:bg-ink hover:text-paper disabled:opacity-40"
      >
        <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden>
          <path
            fill="currentColor"
            d="M21.35 11.1h-9.17v2.73h6.51c-.33 3.81-3.5 5.44-6.5 5.44C8.36 19.27 5 16.25 5 12c0-4.1 3.2-7.27 7.2-7.27 3.09 0 4.9 1.97 4.9 1.97L19 4.72S16.56 2 12.1 2C6.42 2 2.03 6.8 2.03 12c0 5.05 4.13 10 10.22 10 5.35 0 9.25-3.67 9.25-9.09 0-1.15-.15-1.81-.15-1.81Z"
          />
        </svg>
        Continue with Google
      </button>

      <div className="my-8 flex items-center gap-4 text-xs text-ink-4">
        <span className="h-px flex-1 bg-line" />
        or with email
        <span className="h-px flex-1 bg-line" />
      </div>

      {sent ? (
        <p className="border border-line bg-paper-2 p-5 text-sm text-ink-2" style={{ borderRadius: 7 }}>
          Check your inbox — we sent a one-time sign-in link to{" "}
          <strong>{email}</strong>.
        </p>
      ) : (
        <form onSubmit={signInWithEmail} className="flex flex-col gap-4">
          <label htmlFor="login-email" className="sr-only">
            Email address
          </label>
          <input
            id="login-email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@university.edu"
            className="w-full border-0 border-b border-ink/40 bg-transparent px-0 py-2 text-sm text-ink outline-none transition-colors placeholder:text-ink-4 focus:border-ink"
          />
          <button
            type="submit"
            disabled={busy}
            className="rounded-full bg-ink px-6 py-3 text-sm text-paper transition-opacity hover:opacity-80 disabled:opacity-40"
          >
            {busy ? "Sending…" : "Email me a sign-in link"}
          </button>
        </form>
      )}

      <p className="mt-8 text-xs leading-relaxed text-ink-4">
        By signing in you agree to our{" "}
        <a href="/legal/terms" className="underline underline-offset-2">
          Terms of Service
        </a>{" "}
        and{" "}
        <a href="/legal/privacy" className="underline underline-offset-2">
          Privacy Policy
        </a>
        .
      </p>
    </div>
  );
}
