import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/site";
import { getSupabaseAnon } from "@/lib/supabase/public";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes = ["", "/blog", "/papers", "/webinars", "/about", "/legal/terms", "/legal/privacy", "/legal/cookies"].map(
    (p) => ({ url: absoluteUrl(p), lastModified: new Date() }),
  );

  const supabase = getSupabaseAnon();
  if (!supabase) return staticRoutes;
  const { data } = await supabase
    .from("posts")
    .select("slug, updated_at")
    .eq("status", "published");
  const postRoutes = (data ?? []).map((p) => ({
    url: absoluteUrl(`/blog/${p.slug}`),
    lastModified: p.updated_at ? new Date(p.updated_at) : new Date(),
  }));
  return [...staticRoutes, ...postRoutes];
}
