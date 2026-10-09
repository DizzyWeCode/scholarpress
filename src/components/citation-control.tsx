"use client";

import { useState } from "react";

function bibEscape(value: string) {
  return value.replace(/[{}]/g, "");
}

export function CitationControl({
  title,
  authors,
  year,
  venue,
  doi,
  url,
  citationKey,
}: {
  title: string;
  authors: string[];
  year?: number | null;
  venue?: string | null;
  doi?: string | null;
  url?: string | null;
  citationKey?: string;
}) {
  const [format, setFormat] = useState<"plain" | "bibtex">("plain");
  const [status, setStatus] = useState("");
  const authorText = authors.join(", ");
  const plain = `${authorText || "Unknown author"}. (${year ?? "n.d."}). ${title}.${venue ? ` ${venue}.` : ""}${doi ? ` https://doi.org/${doi}` : url ? ` ${url}` : ""}`;
  const key = citationKey ?? `${(authors[0] ?? "citation").split(/\s+/).pop()?.toLowerCase() ?? "citation"}${year ?? "nd"}`.replace(/[^a-z0-9]+/gi, "");
  const bibtex = `@article{${key},\n  title = {${bibEscape(title)}},\n  author = {${authors.map(bibEscape).join(" and ")}},${year ? `\n  year = {${year}},` : ""}${venue ? `\n  journal = {${bibEscape(venue)}},` : ""}${doi ? `\n  doi = {${bibEscape(doi)}},` : ""}${url && !doi ? `\n  url = {${bibEscape(url)}},` : ""}\n}`;
  const value = format === "plain" ? plain : bibtex;

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setStatus(`${format === "plain" ? "Citation" : "BibTeX"} copied.`);
    } catch {
      setStatus("Copy unavailable — select the citation text manually.");
    }
  }

  return (
    <details className="border-t border-line pt-5">
      <summary className="cursor-pointer text-sm text-ink underline underline-offset-2">Cite this</summary>
      <div className="mt-4">
        <div className="flex flex-wrap gap-2" role="group" aria-label="Citation format">
          <button type="button" aria-pressed={format === "plain"} onClick={() => setFormat("plain")} className="border border-line px-3 py-1.5 text-xs text-ink-3 aria-pressed:bg-ink aria-pressed:text-paper">Plain text</button>
          <button type="button" aria-pressed={format === "bibtex"} onClick={() => setFormat("bibtex")} className="border border-line px-3 py-1.5 text-xs text-ink-3 aria-pressed:bg-ink aria-pressed:text-paper">BibTeX</button>
          <button type="button" onClick={() => void copy()} className="bg-ink px-3 py-1.5 text-xs text-paper">Copy</button>
        </div>
        <pre className="mt-3 overflow-x-auto whitespace-pre-wrap border border-line bg-paper-2 p-3 text-xs leading-relaxed text-ink-2" tabIndex={0}>{value}</pre>
        <p className="mt-2 min-h-5 text-xs text-ink-3" role="status" aria-live="polite">{status}</p>
      </div>
    </details>
  );
}
