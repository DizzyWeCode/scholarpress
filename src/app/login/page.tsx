"use client";

import { useEffect, useState } from "react";
import { getSupabaseBrowser } from "@/lib/supabase/client";

function getSafeNext() {
  const value = new URLSearchParams(window.location.search).get("next");
  return value?.startsWith("/") && !value.startsWith("//") ? value : "/account";
}

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("error") === "auth") {
      setError(
        "That sign-in link was cancelled, expired, or already used. Request a new link or try Google again.",
      );
    }
  }, []);

  async function signInWithGoogle() {
    setBusy(true);
    setError(null);
    try {
      const supabase = getSupabaseBrowser();
      const next = getSafeNext();
      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
        },
      });
      if (oauthError) setError(oauthError.message);
    } catch {
      setError("Could not start Google sign-in. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  async function sendEmailLink(event: React.FormEvent) {
    event.preventDefault();
    if (!email.includes("@")) return;
    setBusy(true);
    setError(null);
    try {
      const supabase = getSupabaseBrowser();
      const next = getSafeNext();
      const { error: otpError } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
        },
      });
      if (otpError) setError(otpError.message);
      else setSent(true);
    } catch {
      setError("Could not send the secure email link. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="mx-auto max-w-md px-5 py-24 sm:px-8">
      <p className="text-xs uppercase tracking-[0.25em] text-ink-4">Follow the work</p>
      <h1 className="mt-4 font-serif text-4xl tracking-tight text-ink">
        Sign in or create your account
      </h1>
      <p className="mt-4 text-sm leading-relaxed text-ink-3">
        Read the public work, then create an account to save articles, join
        conversations, manage your reading list, and follow the work. New here?
        Your account is created automatically the first time you continue. No
        password is required.
      </p>

      {error ? (
        <p role="alert" className="mt-6 border border-ink/30 bg-paper-2 px-4 py-3 text-sm text-ink" style={{ borderRadius: 7 }}>
          {error}
        </p>
      ) : null}

      <section className="mt-10" aria-labelledby="google-heading">
        <h2 id="google-heading" className="text-xs uppercase tracking-[0.2em] text-ink-4">Use Google</h2>
        <button
          type="button"
          onClick={signInWithGoogle}
          disabled={busy}
          className="mt-3 flex w-full items-center justify-center gap-3 rounded-full border border-ink px-6 py-3 text-sm text-ink transition-colors hover:bg-ink hover:text-paper disabled:opacity-40"
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden>
            <path fill="currentColor" d="M21.35 11.1h-9.17v2.73h6.51c-.33 3.81-3.5 5.44-6.5 5.44C8.36 19.27 5 16.25 5 12c0-4.1 3.2-7.27 7.2-7.27 3.09 0 4.9 1.97 4.9 1.97L19 4.72S16.56 2 12.1 2C6.42 2 2.03 6.8 2.03 12c0 5.05 4.13 10 10.22 10 5.35 0 9.25-3.67 9.25-9.09 0-1.15-.15-1.81-.15-1.81Z" />
          </svg>
          Continue with Google
        </button>
        <p className="mt-2 text-xs text-ink-3">Works for both existing members and new accounts.</p>
      </section>

      <div className="my-8 flex items-center gap-4 text-xs text-ink-4" aria-hidden="true">
        <span className="h-px flex-1 bg-line" />or continue with email<span className="h-px flex-1 bg-line" />
      </div>

      {sent ? (
        <section className="border border-line bg-paper-2 p-5" style={{ borderRadius: 7 }} aria-live="polite">
          <h2 className="font-serif text-xl text-ink">Check your inbox</h2>
          <p className="mt-2 text-sm leading-relaxed text-ink-2">
            We sent a secure one-time link to <strong>{email}</strong>. Open it on
            this device to continue; the link expires shortly.
          </p>
          <div className="mt-4 flex flex-wrap gap-4 text-xs text-ink-3">
            <button type="button" onClick={() => void sendEmailLink({ preventDefault() {} } as React.FormEvent)} disabled={busy} className="underline underline-offset-2 disabled:opacity-40">{busy ? "Sending…" : "Resend link"}</button>
            <button type="button" onClick={() => { setSent(false); setError(null); }} className="underline underline-offset-2">Use a different email</button>
          </div>
        </section>
      ) : (
        <form onSubmit={sendEmailLink} className="flex flex-col gap-4">
          <label htmlFor="login-email" className="text-sm text-ink">Email address</label>
          <input
            id="login-email"
            name="email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@university.edu"
            className="w-full border border-line bg-transparent px-3 py-3 text-sm text-ink outline-none transition-colors placeholder:text-ink-4 focus:border-ink"
            style={{ borderRadius: 7 }}
          />
          <p className="text-xs text-ink-3">We’ll email you a secure one-time link—no password required.</p>
          <button type="submit" disabled={busy} className="rounded-full bg-ink px-6 py-3 text-sm text-paper transition-opacity hover:opacity-80 disabled:opacity-40">
            {busy ? "Sending secure link…" : "Continue with email"}
          </button>
        </form>
      )}

      <p className="mt-8 text-xs leading-relaxed text-ink-4">
        By continuing, you agree to our <a href="/legal/terms" className="underline underline-offset-2">Terms of Service</a> and <a href="/legal/privacy" className="underline underline-offset-2">Privacy Policy</a>.
      </p>
    </main>
  );
}
