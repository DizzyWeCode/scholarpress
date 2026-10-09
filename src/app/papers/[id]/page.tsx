import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ExternalLink, FileText } from "lucide-react";
import { CitationControl } from "@/components/citation-control";
import { Reveal } from "@/components/reveal";
import { requireSignedIn } from "@/lib/auth";
import { normalizeDoi } from "@/lib/utils";
import { absoluteUrl, SITE } from "@/lib/site";
import type { Paper } from "@/lib/types";

export const dynamic = "force-dynamic";

async function getPaper(id: string): Promise<Paper | null> {
  const { supabase } = await requireSignedIn(`/papers/${id}`);
  const { data } = await supabase
    .from("papers")
    .select("*")
    .eq("id", id)
    .eq("status", "published")
    .maybeSingle();
  return (data as Paper) ?? null;
}

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const paper = await getPaper(params.id);
  if (!paper) return { title: "Publication not found", robots: { index: false, follow: false } };
  const doi = normalizeDoi(paper.doi);
  return {
    title: paper.title,
    description: paper.abstract ?? `Publication by ${SITE.name}.`,
    robots: { index: false, follow: false },
    alternates: { canonical: absoluteUrl(`/papers/${paper.id}`) },
    other: {
      citation_title: paper.title,
      citation_author: paper.authors,
      ...(paper.year ? { citation_publication_date: String(paper.year) } : {}),
      ...(paper.venue ? { citation_journal_title: paper.venue } : {}),
      ...(doi ? { citation_doi: doi } : {}),
      ...(paper.pdf_url ? { citation_pdf_url: paper.pdf_url } : {}),
    },
  };
}

export default async function PaperDetailPage({ params }: { params: { id: string } }) {
  const paper = await getPaper(params.id);
  if (!paper) notFound();
  const doi = normalizeDoi(paper.doi);
  const url = absoluteUrl(`/papers/${paper.id}`);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ScholarlyArticle",
    headline: paper.title,
    abstract: paper.abstract ?? undefined,
    datePublished: paper.year ? String(paper.year) : undefined,
    author: paper.authors.map((name) => ({ "@type": "Person", name })),
    publisher: paper.venue ? { "@type": "Organization", name: paper.venue } : undefined,
    url,
    sameAs: doi ? `https://doi.org/${doi}` : paper.url ?? undefined,
  };
  const jsonLdString = JSON.stringify(jsonLd).replace(/</g, "\\u003c");

  return (
    <main className="mx-auto max-w-3xl px-5 py-16 sm:px-8 sm:py-24">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdString }} />
      <Reveal>
        <Link href="/papers" className="text-xs uppercase tracking-widest text-ink-4 underline underline-offset-2">← All publications</Link>
        <p className="mt-8 text-xs uppercase tracking-[0.25em] text-ink-4">Research detail</p>
        <h1 className="mt-4 font-serif text-4xl leading-tight tracking-tight text-ink sm:text-5xl">{paper.title}</h1>
        <p className="mt-5 text-base leading-relaxed text-ink-2">{paper.authors.join(", ")}</p>
        <p className="mt-2 text-sm text-ink-3">{paper.venue ?? "Publication"}{paper.year ? ` · ${paper.year}` : ""}</p>
      </Reveal>

      {paper.abstract ? (
        <section className="mt-12 border-t border-line pt-8">
          <h2 className="text-xs uppercase tracking-[0.25em] text-ink-4">Abstract</h2>
          <p className="mt-4 text-base leading-relaxed text-ink-2">{paper.abstract}</p>
        </section>
      ) : null}

      <div className="mt-10 flex flex-wrap gap-3">
        {doi ? <a href={`https://doi.org/${doi}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 border border-line px-4 py-2 text-sm text-ink-2 underline underline-offset-2">DOI <ExternalLink className="h-4 w-4" /></a> : null}
        {paper.url ? <a href={paper.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 border border-line px-4 py-2 text-sm text-ink-2 underline underline-offset-2">Publisher <ExternalLink className="h-4 w-4" /></a> : null}
        {paper.pdf_url ? <a href={paper.pdf_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 border border-line px-4 py-2 text-sm text-ink-2 underline underline-offset-2">PDF <FileText className="h-4 w-4" /></a> : null}
      </div>

      <div className="mt-12"><CitationControl title={paper.title} authors={paper.authors} year={paper.year} venue={paper.venue} doi={doi} url={paper.url} citationKey={`paper${paper.id.slice(0, 8)}`} /></div>
    </main>
  );
}
