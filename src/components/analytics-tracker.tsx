"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { getConsent } from "@/components/cookie-banner";

/**
 * Sends one page-view beacon per navigation, only when the visitor
 * has explicitly accepted analytics cookies (GDPR-style opt-in).
 */
export function AnalyticsTracker() {
  const pathname = usePathname();

  useEffect(() => {
    function send() {
      if (getConsent() !== "accepted") return;
      fetch("/api/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path: pathname }),
        keepalive: true,
      }).catch(() => {});
    }
    send();
    window.addEventListener("sp-consent-changed", send);
    return () => window.removeEventListener("sp-consent-changed", send);
  }, [pathname]);

  return null;
}
