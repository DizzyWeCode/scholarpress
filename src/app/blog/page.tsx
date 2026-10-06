import type { Metadata } from "next";
import { getSupabaseAnon } from "@/lib/supabase/public";
import { PostRow } from "@/components/post-card";
import { Reveal } from "@/components/reveal";
import type { Post } from "@/lib/types";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Writing",
  description: "Essays and long-form articles.",
};

export default async function BlogPage() {
  const supabase = getSupabaseAnon();
  let posts: Post[] = [];
  if (supabase) {
    const { data } = await supabase
      .from("posts")
      .select("*")
      .eq("status", "published")
      .order("published_at", { ascending: false });
    posts = (data ?? []) as Post[];
  }

  const tags = [...new Set(posts.flatMap((p) => p.tags))].slice(0, 12);

  return (
    <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8">
      <Reveal>
        <p className="text-xs uppercase tracking-[0.25em] text-ink-4">Writing</p>
        <h1 className="mt-4 font-serif text-4xl tracking-tight text-ink sm:text-6xl">
          Essays &amp; articles
        </h1>
        <p className="mt-5 max-w-xl text-base leading-relaxed text-ink-3">
          Long-form writing on research, methods, and the ideas in between.
          Every piece carries its sources at the end.
        </p>
      </Reveal>

      {tags.length > 0 && (
        <Reveal delay={80}>
          <div className="mt-10 flex flex-wrap gap-2">
            {tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-ink px-3 py-1 text-xs text-ink"
              >
                {tag}
              </span>
            ))}
          </div>
        </Reveal>
      )}

      <div className="mt-12">
        {posts.length > 0 ? (
          posts.map((post, i) => (
            <Reveal key={post.id} delay={Math.min(i, 5) * 60}>
              <PostRow post={post} />
            </Reveal>
          ))
        ) : (
          <p className="border-t border-line py-16 text-sm text-ink-3">
            Nothing published yet — check back soon.
          </p>
        )}
      </div>
    </div>
  );
}
