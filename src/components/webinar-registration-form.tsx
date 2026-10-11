"use client";

import { useState } from "react";

export function WebinarRegistrationForm({ webinarId, calendarUrl }: { webinarId: string; calendarUrl: string }) {
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [consentMarketing, setConsentMarketing] = useState(false);
  const [state, setState] = useState<"idle" | "busy" | "done" | "error">("idle");
  const [message, setMessage] = useState("");

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState("busy");
    setMessage("");
    const params = new URLSearchParams(window.location.search);
    try {
      const response = await fetch(`/api/webinars/${webinarId}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          fullName: fullName.trim() || null,
          consentMarketing,
          utmSource: params.get("utm_source"),
          utmMedium: params.get("utm_medium"),
          utmCampaign: params.get("utm_campaign"),
          utmContent: params.get("utm_content"),
          referrer: document.referrer || null,
        }),
      });
      const result = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(result.error ?? "Registration failed.");
      setState("done");
    } catch (error) {
      setState("error");
      setMessage(error instanceof Error ? error.message : "Registration failed — please try again.");
    }
  }

  if (state === "done") {
    return (
      <div className="border border-line bg-paper p-6" style={{ borderRadius: 7 }}>
        <p className="text-xs uppercase tracking-[0.2em] text-ink-4">You&rsquo;re registered</p>
        <h2 className="mt-3 font-serif text-2xl tracking-tight text-ink">Your place is saved.</h2>
        <p className="mt-3 text-sm leading-relaxed text-ink-3">
          Keep the event time in your calendar. Join instructions and any replay or resource links will be shared through the event follow-up.
        </p>
        <a href={calendarUrl} className="mt-5 inline-flex rounded-full bg-ink px-5 py-2.5 text-sm text-paper transition-opacity hover:opacity-80">
          Add to calendar
        </a>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="border border-line bg-paper p-6" style={{ borderRadius: 7 }}>
      <p className="text-xs uppercase tracking-[0.2em] text-ink-4">Save your seat</p>
      <h2 className="mt-3 font-serif text-2xl tracking-tight text-ink">Register free</h2>
      <div className="mt-6 grid gap-4">
        <label className="grid gap-2 text-xs uppercase tracking-widest text-ink-4">
          Name <input value={fullName} onChange={(event) => setFullName(event.target.value)} className="border-0 border-b border-line bg-transparent px-0 py-2 text-sm normal-case tracking-normal text-ink outline-none focus:border-ink" placeholder="Your name" />
        </label>
        <label className="grid gap-2 text-xs uppercase tracking-widest text-ink-4">
          Email address <input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} className="border-0 border-b border-line bg-transparent px-0 py-2 text-sm normal-case tracking-normal text-ink outline-none focus:border-ink" placeholder="you@university.edu" />
        </label>
        <label className="flex gap-3 text-xs leading-relaxed text-ink-3">
          <input type="checkbox" checked={consentMarketing} onChange={(event) => setConsentMarketing(event.target.checked)} className="mt-0.5 accent-ink" />
          <span>Also send me occasional research notes and future event or course announcements.</span>
        </label>
      </div>
      {message ? <p role="alert" className="mt-4 text-sm text-red-700">{message}</p> : null}
      <button type="submit" disabled={state === "busy"} className="mt-6 rounded-full bg-ink px-5 py-2.5 text-sm text-paper transition-opacity hover:opacity-80 disabled:opacity-40">
        {state === "busy" ? "Saving…" : "Register free"}
      </button>
      <p className="mt-4 text-xs leading-relaxed text-ink-4">Event logistics are required to deliver this registration. Marketing updates are optional.</p>
    </form>
  );
}
