import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";
import { PaperCard } from "@/components/paper-card";
import { PostRow } from "@/components/post-card";
import { WebinarCard } from "@/components/webinar-card";
import { Reveal } from "@/components/reveal";
import { getSupabaseAnon } from "@/lib/supabase/public";
import { getPublicTopicBySlug, getPublicTopicContent, type Topic } from "@/lib/topics";

export const dynamic = "force-dynamic";

type TopicParams = { params: { slug: string } };

async function loadTopic(slug: string): Promise<{ topic: Topic; content: Awaited<ReturnType<typeof getPublicTopicContent>> } | null> {
  const supabase = getSupabaseAnon();
  const topic = await getPublicTopicBySlug(supabase, slug);
  if (!topic) return null;
  return { topic, content: await getPublicTopicContent(supabase, topic.id) };
}

export async function generateMetadata({ params }: TopicParams): Promise<Metadata> {
  const result = await loadTopic(params.slug);
  if (!result) return { title: "Topic not found" };
  return {
    title: result.topic.seo_title || result.topic.name,
    description: result.topic.seo_description || result.topic.description || `Explore ${result.topic.name} across the Blog, Research, and Events.`,
  };
}

export default async function TopicDetailPage({ params }: TopicParams) {
  const result = await loadTopic(params.slug);
  if (!result) notFound();

  const { topic, content } = result;
  const hasContent = content.posts.length + content.papers.length + content.webinars.length > 0;

  return (
    <div className="mx-auto max-w-6xl px-5 py-12 sm:px-8 sm:py-20">
      <Reveal>
        <Link href="/topics" className="inline-flex items-center gap-2 text-sm text-ink-3 transition-colors hover:text-ink">
          <ArrowLeft className="h-4 w-4" aria-hidden /> All topics
        </Link>
        <p className="mt-12 text-xs uppercase tracking-[0.25em] text-ink-4">Topic</p>
        <h1 className="mt-4 max-w-4xl font-serif text-4xl tracking-tight text-ink sm:text-6xl">{topic.name}</h1>
        {topic.description ? (
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-ink-3">{topic.description}</p>
        ) : null}
      </Reveal>

      {!hasContent ? (
        <div className="mt-16 border-t border-line py-16">
          <p className="max-w-xl text-sm leading-relaxed text-ink-3">
            There is not enough published material here yet. Return to all topics or browse the latest work while this collection grows.
          </p>
          <Link href="/topics" className="mt-6 inline-flex text-sm underline underline-offset-4">Browse all topics</Link>
        </div>
      ) : (
        <div className="mt-16 space-y-20">
          {content.posts.length > 0 ? (
            <section aria-labelledby="topic-blog-heading">
              <SectionHeading id="topic-blog-heading" eyebrow="Blog" title="Ideas and explanations" />
              <div className="mt-4">
                {content.posts.map((post, index) => (
                  <Reveal key={post.id} delay={Math.min(index, 5) * 45}>
                    <PostRow post={post} />
                  </Reveal>
                ))}
              </div>
            </section>
          ) : null}

          {content.papers.length > 0 ? (
            <section aria-labelledby="topic-research-heading">
              <SectionHeading id="topic-research-heading" eyebrow="Research" title="Evidence and outputs" />
              <div className="mt-4">
                {content.papers.map((paper, index) => (
                  <Reveal key={paper.id} delay={Math.min(index, 5) * 45}>
                    <PaperCard paper={paper} />
                  </Reveal>
                ))}
              </div>
            </section>
          ) : null}

          {content.webinars.length > 0 ? (
            <section aria-labelledby="topic-events-heading">
              <SectionHeading id="topic-events-heading" eyebrow="Events" title="Conversations and sessions" />
              <div className="mt-4 grid gap-5 md:grid-cols-2">
                {content.webinars.map((webinar, index) => (
                  <Reveal key={webinar.id} delay={Math.min(index, 5) * 45}>
                    <WebinarCard webinar={webinar} />
                  </Reveal>
                ))}
              </div>
            </section>
          ) : null}
        </div>
      )}
    </div>
  );
}

function SectionHeading({ id, eyebrow, title }: { id: string; eyebrow: string; title: string }) {
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-4 border-b border-line pb-4">
      <div>
        <p className="text-xs uppercase tracking-[0.25em] text-ink-4">{eyebrow}</p>
        <h2 id={id} className="mt-2 font-serif text-3xl tracking-tight text-ink">{title}</h2>
      </div>
    </div>
  );
}
