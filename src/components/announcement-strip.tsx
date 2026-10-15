"use client";

import Link from "next/link";
import { ArrowRight, X } from "lucide-react";
import { useEffect, useState } from "react";

export function AnnouncementStrip({
  message,
  href,
  label,
}: {
  message: string;
  href: string;
  label: string;
}) {
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    setDismissed(window.localStorage.getItem("scholarpress-announcement-dismissed") === message);
  }, [message]);

  if (dismissed) return null;

  return (
    <div className="border-b border-line bg-paper-2" role="status">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-2.5 text-xs sm:px-8">
        <Link href={href} className="group inline-flex min-w-0 items-center gap-2 text-ink-2 hover:text-ink">
          <span className="truncate">{message}</span>
          <span className="hidden shrink-0 items-center gap-1 sm:inline-flex">{label} <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" aria-hidden /></span>
        </Link>
        <button
          type="button"
          aria-label="Dismiss announcement"
          onClick={() => {
            window.localStorage.setItem("scholarpress-announcement-dismissed", message);
            setDismissed(true);
          }}
          className="shrink-0 rounded p-1 text-ink-4 transition-colors hover:bg-paper hover:text-ink"
        >
          <X className="h-3.5 w-3.5" aria-hidden />
        </button>
      </div>
    </div>
  );
}
