import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Reveal } from "@/components/reveal";
import { getSupabaseAnon } from "@/lib/supabase/public";
import { getPublicTopics } from "@/lib/topics";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Topics",
  description: "Browse Dr Fraction Dzinjalamala’s work by topic across the Blog, Research, and Events.",
};

export default async function TopicsPage() {
  const topics = await getPublicTopics(getSupabaseAnon());

  return (
    <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8 sm:py-28">
      <Reveal>
        <p className="text-xs uppercase tracking-[0.25em] text-ink-4">Browse by subject</p>
        <h1 className="mt-4 max-w-3xl font-serif text-4xl tracking-tight text-ink sm:text-6xl">
          Questions that connect the work
        </h1>
        <p className="mt-5 max-w-2xl text-base leading-relaxed text-ink-3 sm:text-lg">
          Explore the ideas running through the Blog, Research library, and Events. Each topic is a starting point, not just a label.
        </p>
      </Reveal>

      {topics.length > 0 ? (
        <div className="mt-16 grid gap-px border-l border-t border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
          {topics.map((topic, index) => (
            <Reveal key={topic.id} delay={Math.min(index, 8) * 45}>
              <Link
                href={`/topics/${topic.slug}`}
                className="group flex min-h-56 flex-col justify-between bg-paper p-7 transition-colors hover:bg-paper-2 sm:p-8"
              >
                <span>
                  <span className="text-xs uppercase tracking-[0.2em] text-ink-4">Topic</span>
                  <span className="mt-4 block font-serif text-2xl leading-tight tracking-tight text-ink">
                    {topic.name}
                  </span>
                  {topic.description ? (
                    <span className="mt-3 block text-sm leading-relaxed text-ink-3">
                      {topic.description}
                    </span>
                  ) : null}
                </span>
                <span className="mt-8 inline-flex items-center gap-2 text-sm text-ink-3 transition-colors group-hover:text-ink">
                  Explore topic <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden />
                </span>
              </Link>
            </Reveal>
          ))}
        </div>
      ) : (
        <div className="mt-16 border-t border-line py-16">
          <p className="max-w-xl text-sm leading-relaxed text-ink-3">
            Topics are being shaped from the published work. In the meantime, explore the latest writing or browse the research library.
          </p>
          <div className="mt-6 flex flex-wrap gap-5 text-sm">
            <Link href="/blog" className="underline underline-offset-4">Browse the Blog</Link>
            <Link href="/papers" className="underline underline-offset-4">Browse Research</Link>
          </div>
        </div>
      )}
    </div>
  );
}
