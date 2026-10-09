import type { Metadata } from "next";
import Link from "next/link";
import { PostRow } from "@/components/post-card";
import { Reveal } from "@/components/reveal";
import { requireSignedIn } from "@/lib/auth";
import type { Post } from "@/lib/types";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Articles",
  description: "Members-only essays and long-form articles.",
  robots: { index: false, follow: false },
};

export default async function BlogPage({
  searchParams,
}: {
  searchParams: { tag?: string };
}) {
  const { supabase } = await requireSignedIn("/blog");
  let posts: Post[] = [];
  const { data } = await supabase
    .from("posts")
    .select(
      "id, slug, title, excerpt, tags, status, published_at, reading_time_minutes, updated_at",
    )
    .or(`status.eq.published,and(status.eq.scheduled,published_at.lte.${new Date().toISOString()})`)
    .order("published_at", { ascending: false });
  posts = (data ?? []) as Post[];

  const tags = [...new Set(posts.flatMap((p) => p.tags))].slice(0, 12);
  const activeTag =
    typeof searchParams.tag === "string" && tags.includes(searchParams.tag)
      ? searchParams.tag
      : "";
  const visible = activeTag
    ? posts.filter((p) => p.tags.includes(activeTag))
    : posts;

  return (
    <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8">
      <Reveal>
        <p className="text-xs uppercase tracking-[0.25em] text-ink-4">Articles</p>
        <h1 className="mt-4 font-serif text-4xl tracking-tight text-ink sm:text-6xl">
          Essays &amp; articles
        </h1>
        <p className="mt-5 max-w-xl text-base leading-relaxed text-ink-3">
          Long-form articles on research, methods, and the ideas in between.
          Every piece carries its sources at the end.
        </p>
      </Reveal>

      {tags.length > 0 && (
        <Reveal delay={80}>
          <nav className="mt-10 flex flex-wrap gap-2" aria-label="Filter by topic">
            {tags.map((tag) =>
              tag === activeTag ? (
                <Link
                  key={tag}
                  href="/blog"
                  aria-current="true"
                  className="rounded-full border border-ink bg-ink px-3 py-1 text-xs text-paper"
                >
                  {tag}
                </Link>
              ) : (
                <Link
                  key={tag}
                  href={`/blog?tag=${encodeURIComponent(tag)}`}
                  className="rounded-full border border-line px-3 py-1 text-xs text-ink-3 transition-colors hover:border-ink hover:text-ink"
                >
                  {tag}
                </Link>
              ),
            )}
          </nav>
        </Reveal>
      )}

      <div className="mt-12">
        {visible.length > 0 ? (
          visible.map((post, i) => (
            <Reveal key={post.id} delay={Math.min(i, 5) * 60}>
              <PostRow post={post} />
            </Reveal>
          ))
        ) : (
          <p className="border-t border-line py-16 text-sm text-ink-3">
            {activeTag
              ? `Nothing published under “${activeTag}” yet — `
              : "Nothing published yet — "}
            {activeTag && (
              <Link href="/blog" className="underline underline-offset-2">
                clear the filter
              </Link>
            )}
            {!activeTag && "check back soon."}
          </p>
        )}
      </div>
    </div>
  );
}
