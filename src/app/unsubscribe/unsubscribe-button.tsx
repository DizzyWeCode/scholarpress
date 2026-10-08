"use client";

import { useState } from "react";

export default function UnsubscribeButton({
  email,
  token,
}: {
  email: string;
  token: string;
}) {
  const [status, setStatus] = useState<"idle" | "busy" | "done">("idle");
  const [error, setError] = useState<string | null>(null);

  async function unsubscribe() {
    setStatus("busy");
    setError(null);
    try {
      const res = await fetch("/api/unsubscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, token }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(json.error ?? "Something went wrong. Please try again.");
        setStatus("idle");
        return;
      }
      setStatus("done");
    } catch {
      setError("Network error. Please try again.");
      setStatus("idle");
    }
  }

  if (status === "done") {
    return (
      <p className="border-t border-line pt-6 text-sm text-ink-2">
        You have been unsubscribed. You will not receive further newsletters at{" "}
        <span className="text-ink">{email}</span>.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <button
        onClick={unsubscribe}
        disabled={status === "busy"}
        className="rounded-full border border-ink px-6 py-2.5 text-sm text-ink transition-colors hover:bg-ink hover:text-paper disabled:opacity-50"
      >
        {status === "busy" ? "Unsubscribing…" : "Unsubscribe from all emails"}
      </button>
      {error ? <p className="text-sm text-red-700">{error}</p> : null}
    </div>
  );
}
