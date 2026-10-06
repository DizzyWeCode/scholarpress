import type { Paper } from "@/lib/types";
import { ExternalLink, FileText } from "lucide-react";

/** Publication entry: venue, year, authors, DOI / PDF links. */
export function PaperCard({ paper }: { paper: Paper }) {
  return (
    <article className="border-t border-line py-8">
      <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
        <h3 className="font-serif text-xl leading-snug tracking-tight text-ink">
          {paper.url ? (
            <a
              href={paper.url}
              target="_blank"
              rel="noopener noreferrer"
              className="transition-opacity hover:opacity-60"
            >
              {paper.title}
            </a>
          ) : (
            paper.title
          )}
        </h3>
        {paper.year ? <span className="text-xs text-ink-4">{paper.year}</span> : null}
      </div>
      <p className="mt-2 text-sm text-ink-3">
        {paper.authors.join(", ")}
        {paper.venue ? (
          <>
            {" "}· <em className="font-serif">{paper.venue}</em>
          </>
        ) : null}
      </p>
      {paper.abstract ? (
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-ink-2">
          {paper.abstract}
        </p>
      ) : null}
      <div className="mt-4 flex flex-wrap items-center gap-2">
        {paper.tags.map((tag) => (
          <span
            key={tag}
            className="rounded-full border border-line px-2.5 py-0.5 text-xs text-ink-3"
          >
            {tag}
          </span>
        ))}
        {paper.doi ? (
          <a
            href={`https://doi.org/${paper.doi}`}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-auto inline-flex items-center gap-1 text-xs text-ink-3 underline underline-offset-2 transition-colors hover:text-ink"
          >
            DOI <ExternalLink className="h-3 w-3" />
          </a>
        ) : null}
        {paper.pdf_url ? (
          <a
            href={paper.pdf_url}
            target="_blank"
            rel="noopener noreferrer"
            className={`inline-flex items-center gap-1 text-xs text-ink-3 underline underline-offset-2 transition-colors hover:text-ink ${paper.doi ? "" : "ml-auto"}`}
          >
            PDF <FileText className="h-3 w-3" />
          </a>
        ) : null}
      </div>
    </article>
  );
}
