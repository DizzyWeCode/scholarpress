import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/site";

/** Public discovery routes for the person-led publishing platform. */
export default function sitemap(): MetadataRoute.Sitemap {
  const publicRoutes = [
    "",
    "/blog",
    "/papers",
    "/webinars",
    "/about",
    "/legal/terms",
    "/legal/privacy",
    "/legal/cookies",
  ];
  return publicRoutes.map((path) => ({
    url: absoluteUrl(path),
    lastModified: new Date(),
  }));
}
