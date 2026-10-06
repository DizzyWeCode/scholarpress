"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const CONSENT_KEY = "sp-cookie-consent";

export function getConsent(): "accepted" | "rejected" | null {
  if (typeof window === "undefined") return null;
  const v = window.localStorage.getItem(CONSENT_KEY);
  return v === "accepted" || v === "rejected" ? v : null;
}

/** Bottom-fixed consent banner, paper-white, Allow / Reject. */
export function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!getConsent()) setVisible(true);
  }, []);

  function choose(value: "accepted" | "rejected") {
    window.localStorage.setItem(CONSENT_KEY, value);
    window.dispatchEvent(new Event("sp-consent-changed"));
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-label="Cookie consent"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-line bg-paper"
    >
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <p className="max-w-2xl text-sm leading-relaxed text-ink-2">
          This site uses strictly necessary cookies for sign-in, and — only with
          your consent — privacy-respecting analytics cookies to understand
          readership. See our{" "}
          <Link href="/legal/cookies" className="underline underline-offset-2">
            Cookie Policy
          </Link>
          .
        </p>
        <div className="flex shrink-0 gap-3">
          <button
            onClick={() => choose("rejected")}
            className="rounded-full border border-line px-5 py-2 text-sm text-ink-2 transition-colors hover:border-ink"
          >
            Reject
          </button>
          <button
            onClick={() => choose("accepted")}
            className="rounded-full bg-ink px-5 py-2 text-sm text-paper transition-opacity hover:opacity-80"
          >
            Allow
          </button>
        </div>
      </div>
    </div>
  );
}
