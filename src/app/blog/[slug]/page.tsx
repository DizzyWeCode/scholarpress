import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { getSupabaseAnon } from "@/lib/supabase/public";
import { requireSignedIn } from "@/lib/auth";
import { ArticleBody } from "@/components/article-body";
import { ReferenceList } from "@/components/reference-list";
import { ShareButtons } from "@/components/share-buttons";
import { Reveal } from "@/components/reveal";
import { NewsletterForm } from "@/components/newsletter-form";
import { ArticleEngagement } from "@/components/article-engagement";
import { SITE, absoluteUrl } from "@/lib/site";
import { excerptFromDoc } from "@/lib/utils";
import type { Post } from "@/lib/types";

export const dynamic = "force-dynamic";

async function getPost(slug: string): Promise<Post | null> {
  const supabase = getSupabaseAnon();
  if (!supabase) return null;
  const { data } = await supabase
    .from("posts")
    .select("*")
    .eq("slug", slug)
    .eq("status", "published")
    .single();
  return (data as Post) ?? null;
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const post = await getPost(params.slug);
  if (!post) return { title: "Article not found" };
  const description =
    post.seo_description ?? post.excerpt ?? excerptFromDoc(post.content);
  const title = post.seo_title ?? post.title;
  const url = absoluteUrl(`/blog/${post.slug}`);
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      title,
      description,
      url,
      publishedTime: post.published_at ?? undefined,
      authors: [SITE.name],
      tags: post.tags,
      images: post.cover_image_url ? [post.cover_image_url] : undefined,
    },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function ArticlePage({
  params,
}: {
  params: { slug: string };
}) {
  await requireSignedIn(`/blog/${params.slug}`);
  const post = await getPost(params.slug);
  if (!post) notFound();

  const url = absoluteUrl(`/blog/${post.slug}`);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt ?? excerptFromDoc(post.content),
    datePublished: post.published_at,
    author: { "@type": "Person", name: SITE.name },
    image: post.cover_image_url ?? undefined,
    mainEntityOfPage: url,
  };

  return (
    <article className="mx-auto max-w-3xl px-5 py-16 sm:px-8 sm:py-24">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Reveal>
        <Link
          href="/blog"
          className="text-xs uppercase tracking-widest text-ink-4 transition-colors hover:text-ink"
        >
          ← All writing
        </Link>
        <h1 className="mt-6 font-serif text-4xl leading-[1.12] tracking-[-0.015em] text-ink sm:text-5xl">
          {post.title}
        </h1>
        <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-ink-3">
          <span>{SITE.name}</span>
          <span aria-hidden>·</span>
          {post.published_at ? (
            <time dateTime={post.published_at}>
              {format(new Date(post.published_at), "dd MMMM yyyy")}
            </time>
          ) : null}
          <span aria-hidden>·</span>
          <span>{post.reading_time_minutes ?? 1} min read</span>
        </div>
        {post.tags.length > 0 && (
          <div className="mt-5 flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-line px-3 py-1 text-xs text-ink-3"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </Reveal>

      {post.cover_image_url ? (
        <Reveal delay={120}>
          <figure className="mt-12">
            <Image
              src={post.cover_image_url}
              alt={post.title}
              width={1200}
              height={675}
              className="rounded"
              priority
            />
            {post.cover_image_credit ? (
              <figcaption className="mt-2 text-xs text-ink-4">
                {post.cover_image_credit_url ? (
                  <a
                    href={post.cover_image_credit_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline underline-offset-2"
                  >
                    {post.cover_image_credit}
                  </a>
                ) : (
                  post.cover_image_credit
                )}
              </figcaption>
            ) : null}
          </figure>
        </Reveal>
      ) : null}

      <div className="mt-12">
        <ArticleBody doc={post.content} />
      </div>

      <ReferenceList items={post.references ?? []} />

      <div className="mt-12 flex flex-col gap-6 border-t border-line pt-8 sm:flex-row sm:items-center sm:justify-between">
        <ShareButtons url={url} title={post.title} />
      </div>

      <ArticleEngagement postId={post.id} initialLikes={post.like_count ?? 0} />

      <div className="mt-14 rounded border border-line bg-paper-2 p-8" style={{ borderRadius: 7 }}>
        <p className="font-serif text-xl tracking-tight text-ink">
          Enjoyed this piece?
        </p>
        <p className="mt-2 text-sm text-ink-3">
          Subscribe for new essays and webinar announcements.
        </p>
        <div className="mt-5">
          <NewsletterForm />
        </div>
      </div>
    </article>
  );
}
