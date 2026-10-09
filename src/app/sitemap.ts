import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/site";

/** Members-only content is intentionally omitted from public discovery. */
export default function sitemap(): MetadataRoute.Sitemap {
  const publicRoutes = ["", "/about", "/legal/terms", "/legal/privacy", "/legal/cookies"];
  return publicRoutes.map((path) => ({
    url: absoluteUrl(path),
    lastModified: new Date(),
  }));
}
