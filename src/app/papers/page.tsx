import type { Metadata } from "next";
import { PaperCard } from "@/components/paper-card";
import { Reveal } from "@/components/reveal";
import { SITE } from "@/lib/site";
import { requireSignedIn } from "@/lib/auth";
import type { Paper } from "@/lib/types";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Research",
  description: `Peer-reviewed publications by ${SITE.name}.`,
  robots: { index: false, follow: false },
};

export default async function PapersPage() {
  const { supabase } = await requireSignedIn("/papers");
  let papers: Paper[] = [];
  const { data } = await supabase
    .from("papers")
    .select("*")
    .eq("status", "published")
    .order("year", { ascending: false });
  papers = (data ?? []) as Paper[];

  const byYear = papers.reduce<Record<string, Paper[]>>((acc, p) => {
    const y = p.year ? String(p.year) : "Other";
    (acc[y] ??= []).push(p);
    return acc;
  }, {});
  const years = Object.keys(byYear).sort((a, b) => b.localeCompare(a));

  return (
    <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8">
      <Reveal>
        <p className="text-xs uppercase tracking-[0.25em] text-ink-4">Research</p>
        <h1 className="mt-4 font-serif text-4xl tracking-tight text-ink sm:text-6xl">
          Publications
        </h1>
        <p className="mt-5 max-w-xl text-base leading-relaxed text-ink-3">
          Peer-reviewed papers, preprints, and conference work. Where a
          publisher page exists, the DOI link takes you there.
        </p>
      </Reveal>

      {years.length > 0 ? (
        years.map((year) => (
          <section key={year} className="mt-14">
            <Reveal>
              <h2 className="text-xs uppercase tracking-[0.25em] text-ink-4">
                {year}
              </h2>
            </Reveal>
            <div>
              {byYear[year].map((paper, i) => (
                <Reveal key={paper.id} delay={i * 60}>
                  <PaperCard paper={paper} />
                </Reveal>
              ))}
            </div>
          </section>
        ))
      ) : (
        <p className="mt-12 border-t border-line py-16 text-sm text-ink-3">
          Publications will appear here as they are released.
        </p>
      )}
    </div>
  );
}
