"use client";

import { useState } from "react";

export function WebinarInterestForm({ webinarId }: { webinarId: string }) {
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [experienceLevel, setExperienceLevel] = useState("");
  const [preferredFormat, setPreferredFormat] = useState("");
  const [state, setState] = useState<"idle" | "busy" | "done" | "error">("idle");
  const [message, setMessage] = useState("");

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState("busy");
    setMessage("");
    const params = new URLSearchParams(window.location.search);
    try {
      const response = await fetch(`/api/webinars/${webinarId}/interest`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          fullName: fullName.trim() || null,
          experienceLevel: experienceLevel || null,
          preferredFormat: preferredFormat || null,
          utmSource: params.get("utm_source"),
          utmMedium: params.get("utm_medium"),
          utmCampaign: params.get("utm_campaign"),
          utmContent: params.get("utm_content"),
        }),
      });
      const result = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(result.error ?? "Could not save your interest.");
      setState("done");
    } catch (error) {
      setState("error");
      setMessage(error instanceof Error ? error.message : "Could not save your interest.");
    }
  }

  if (state === "done") {
    return <p role="status" className="text-sm leading-relaxed text-indigo-950">Thanks — your interest is saved. We&rsquo;ll share the next learning opportunity when it is ready.</p>;
  }

  return (
    <form onSubmit={submit} className="mt-5 grid gap-3">
      <input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} className="border-0 border-b border-indigo-200 bg-transparent px-0 py-2 text-sm text-indigo-950 outline-none focus:border-indigo-700" placeholder="you@university.edu" aria-label="Email address" />
      <input value={fullName} onChange={(event) => setFullName(event.target.value)} className="border-0 border-b border-indigo-200 bg-transparent px-0 py-2 text-sm text-indigo-950 outline-none focus:border-indigo-700" placeholder="Your name (optional)" aria-label="Your name" />
      <div className="grid gap-3 sm:grid-cols-2">
        <select value={experienceLevel} onChange={(event) => setExperienceLevel(event.target.value)} className="border border-indigo-200 bg-transparent px-3 py-2 text-sm text-indigo-950 outline-none" aria-label="Experience level">
          <option value="">Experience level</option>
          <option value="early-career">Early-career</option>
          <option value="practitioner">Practitioner</option>
          <option value="researcher">Researcher</option>
          <option value="educator">Educator</option>
        </select>
        <select value={preferredFormat} onChange={(event) => setPreferredFormat(event.target.value)} className="border border-indigo-200 bg-transparent px-3 py-2 text-sm text-indigo-950 outline-none" aria-label="Preferred format">
          <option value="">Preferred format</option>
          <option value="live-cohort">Live cohort</option>
          <option value="self-paced">Self-paced</option>
          <option value="short-workshop">Short workshop</option>
        </select>
      </div>
      {message ? <p role="alert" className="text-xs text-red-700">{message}</p> : null}
      <button type="submit" disabled={state === "busy"} className="mt-1 w-fit rounded-full bg-indigo-950 px-5 py-2.5 text-sm text-white transition-opacity hover:opacity-80 disabled:opacity-40">{state === "busy" ? "Saving…" : "Join the course interest list"}</button>
    </form>
  );
}
