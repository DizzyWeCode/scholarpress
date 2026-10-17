"use client";

import { usePathname } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { CookieBanner } from "@/components/cookie-banner";
import { AnalyticsTracker } from "@/components/analytics-tracker";
import { AnnouncementStrip } from "@/components/announcement-strip";

export function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin");

  if (isAdmin) return <>{children}</>;

  return (
    <>
      <SiteHeader />
      <AnnouncementStrip message="Explore the connected Topics library" href="/topics" label="Browse topics" />
      {children}
      <SiteFooter />
      <CookieBanner />
      <AnalyticsTracker />
    </>
  );
}
