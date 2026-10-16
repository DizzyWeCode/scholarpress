import type { Metadata } from "next";
import Link from "next/link";
import { Search } from "lucide-react";
import { getSupabaseAnon } from "@/lib/supabase/public";
import { getPublicTopics } from "@/lib/topics";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Search",
  description: "Search the Blog, Research, Events, and Topics across ScholarPress.",
};

type SearchParams = { q?: string };
type SearchResult = { type: string; title: string; description: string | null; href: string };

export default async function SearchPage({ searchParams }: { searchParams: SearchParams }) {
  const query = typeof searchParams.q === "string" ? searchParams.q.trim().slice(0, 100) : "";
  const results = query ? await findResults(query) : [];
  const topics = query ? [] : await getPublicTopics(getSupabaseAnon());

  return (
    <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8 sm:py-28">
      <p className="text-xs uppercase tracking-[0.25em] text-ink-4">Discovery</p>
      <h1 className="mt-4 font-serif text-4xl tracking-tight text-ink sm:text-6xl">Search the work</h1>
      <form action="/search" className="mt-10 flex max-w-3xl gap-3">
        <label htmlFor="site-search" className="sr-only">Search Blog, Research, Events, and Topics</label>
        <input id="site-search" name="q" defaultValue={query} placeholder="Try malaria treatment, resistance, or evidence" className="min-w-0 flex-1 rounded border border-line bg-paper px-4 py-3 text-sm text-ink outline-none transition-colors placeholder:text-ink-4 focus:border-ink" />
        <button type="submit" className="inline-flex items-center gap-2 rounded bg-ink px-5 py-3 text-sm text-paper transition-opacity hover:opacity-80"><Search className="h-4 w-4" aria-hidden /> Search</button>
      </form>

      {query ? (
        <div className="mt-14">
          <p className="text-sm text-ink-3">{results.length} result{results.length === 1 ? "" : "s"} for “{query}”</p>
          {results.length > 0 ? (
            <div className="mt-4 border-t border-line">
              {results.map((result) => (
                <Link key={`${result.type}-${result.href}`} href={result.href} className="block border-b border-line py-6 transition-colors hover:bg-paper-2 sm:px-4">
                  <span className="text-xs uppercase tracking-[0.2em] text-ink-4">{result.type}</span>
                  <span className="mt-2 block font-serif text-2xl tracking-tight text-ink">{result.title}</span>
                  {result.description ? <span className="mt-2 block max-w-2xl text-sm leading-relaxed text-ink-3">{result.description}</span> : null}
                </Link>
              ))}
            </div>
          ) : (
            <div className="mt-8 border-t border-line py-12 text-sm text-ink-3">No matching work yet. Try a broader phrase or browse Topics.</div>
          )}
        </div>
      ) : (
        <div className="mt-16">
          <p className="text-xs uppercase tracking-[0.25em] text-ink-4">Browse topics</p>
          {topics.length > 0 ? (
            <div className="mt-5 flex flex-wrap gap-2">{topics.map((topic) => <Link key={topic.id} href={`/topics/${topic.slug}`} className="rounded-full border border-line px-4 py-2 text-sm text-ink-3 transition-colors hover:border-ink hover:text-ink">{topic.name}</Link>)}</div>
          ) : <p className="mt-5 text-sm text-ink-3">Search across the published library to find a starting point.</p>}
        </div>
      )}
    </div>
  );
}

async function findResults(query: string): Promise<SearchResult[]> {
  const supabase = getSupabaseAnon();
  if (!supabase) return [];
  const pattern = `%${query.replace(/[%_]/g, "\\$&")}%`;
  const [posts, papers, webinars, topics] = await Promise.all([
    supabase.from("posts").select("id, slug, title, excerpt").eq("status", "published").or(`title.ilike.${pattern},excerpt.ilike.${pattern}`).limit(12),
    supabase.from("papers").select("id, title, abstract").eq("status", "published").or(`title.ilike.${pattern},abstract.ilike.${pattern}`).limit(12),
    supabase.from("webinars").select("id, slug, title, description").in("status", ["upcoming", "registration_open", "past", "replay_available"]).or(`title.ilike.${pattern},description.ilike.${pattern}`).limit(12),
    supabase.from("topics").select("id, slug, name, description").eq("is_public", true).or(`name.ilike.${pattern},description.ilike.${pattern}`).limit(12),
  ]);

  return [
    ...(posts.data ?? []).map((item) => ({ type: "Blog", title: item.title, description: item.excerpt, href: `/blog/${item.slug}` })),
    ...(papers.data ?? []).map((item) => ({ type: "Research", title: item.title, description: item.abstract, href: `/papers/${item.id}` })),
    ...(webinars.data ?? []).map((item) => ({ type: "Event", title: item.title, description: item.description, href: `/webinars/${item.slug || item.id}` })),
    ...(topics.data ?? []).map((item) => ({ type: "Topic", title: item.name, description: item.description, href: `/topics/${item.slug}` })),
  ];
}
