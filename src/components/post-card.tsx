import Link from "next/link";
import Image from "next/image";
import { format } from "date-fns";
import type { Post } from "@/lib/types";

/** Hairline-divided editorial list row for articles. */
export function PostRow({ post }: { post: Post }) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group grid gap-4 border-t border-line py-7 transition-colors sm:grid-cols-[140px_1fr_auto] sm:items-center sm:gap-8"
    >
      {post.cover_image_url ? (
        <span className="relative block aspect-[16/10] w-full overflow-hidden rounded bg-paper-2 sm:w-[140px]">
          <Image
            src={post.cover_image_url}
            alt=""
            fill
            sizes="140px"
            className="object-cover"
            loading="lazy"
          />
        </span>
      ) : (
        <span className="text-xs uppercase tracking-widest text-ink-4">
          {post.published_at ? format(new Date(post.published_at), "dd MMM yyyy") : "Draft"}
        </span>
      )}
      <span>
        {post.cover_image_url && post.published_at ? (
          <span className="text-xs uppercase tracking-widest text-ink-4">
            {format(new Date(post.published_at), "dd MMM yyyy")}
          </span>
        ) : null}
        <span className="block font-serif text-xl leading-snug tracking-tight text-ink transition-opacity group-hover:opacity-60">
          {post.title}
        </span>
        {post.excerpt ? (
          <span className="mt-2 block max-w-2xl text-sm leading-relaxed text-ink-3">
            {post.excerpt}
          </span>
        ) : null}
      </span>
      <span className="text-xs text-ink-4">
        {post.reading_time_minutes ?? 1} min
      </span>
    </Link>
  );
}
