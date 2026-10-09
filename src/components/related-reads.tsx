import Link from "next/link";
import { ArrowRight } from "lucide-react";

type RelatedPost = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  tags: string[];
  reading_time_minutes: number | null;
};

export function RelatedReads({ posts, currentTags }: { posts: RelatedPost[]; currentTags: string[] }) {
  if (posts.length === 0) return null;

  return (
    <section className="mt-16 border-t border-line pt-10" aria-labelledby="related-reads-heading">
      <div className="flex items-end justify-between gap-6">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-ink-4">Continue reading</p>
          <h2 id="related-reads-heading" className="mt-3 font-serif text-3xl tracking-tight text-ink">Related reads</h2>
        </div>
        <ArrowRight className="hidden h-5 w-5 text-ink-4 sm:block" aria-hidden />
      </div>
      <div className="mt-6 divide-y divide-line border-y border-line">
        {posts.map((post) => {
          const sharedTag = post.tags.find((tag) => currentTags.includes(tag));
          return (
            <Link key={post.id} href={`/blog/${post.slug}`} className="group block py-5 transition-opacity hover:opacity-65">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs uppercase tracking-widest text-ink-4">
                <span>{sharedTag ? `Also about ${sharedTag}` : "From the writing archive"}</span>
                <span aria-hidden>·</span>
                <span>{post.reading_time_minutes ?? 1} min read</span>
              </div>
              <h3 className="mt-2 font-serif text-2xl leading-tight tracking-tight text-ink">{post.title}</h3>
              {post.excerpt ? <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-3">{post.excerpt}</p> : null}
            </Link>
          );
        })}
      </div>
    </section>
  );
}
