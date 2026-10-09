import { normalizeDoi } from "@/lib/utils";

export type CrossrefMetadata = {
  title: string | null;
  abstract: string | null;
  authors: string[];
  venue: string | null;
  year: number | null;
  doi: string;
  url: string;
};

type CrossrefAuthor = {
  given?: unknown;
  family?: unknown;
  name?: unknown;
};

type CrossrefWork = {
  DOI?: unknown;
  URL?: unknown;
  title?: unknown;
  abstract?: unknown;
  author?: unknown;
  "container-title"?: unknown;
  published?: { "date-parts"?: unknown };
  "published-print"?: { "date-parts"?: unknown };
  "published-online"?: { "date-parts"?: unknown };
  issued?: { "date-parts"?: unknown };
};

function firstString(value: unknown): string | null {
  if (typeof value === "string" && value.trim()) return value.trim();
  if (Array.isArray(value) && typeof value[0] === "string" && value[0].trim()) {
    return value[0].trim();
  }
  return null;
}

function cleanAbstract(value: unknown): string | null {
  if (typeof value !== "string" || !value.trim()) return null;
  return value
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/\s+/g, " ")
    .trim();
}

function publicationYear(work: CrossrefWork): number | null {
  const dates = [work.published, work["published-print"], work["published-online"], work.issued];
  for (const date of dates) {
    const parts = date?.["date-parts"];
    const year = Array.isArray(parts) && Array.isArray(parts[0]) ? parts[0][0] : null;
    if (typeof year === "number" && Number.isInteger(year) && year > 0) return year;
  }
  return null;
}

export function crossrefMetadata(work: CrossrefWork, doi: string): CrossrefMetadata {
  const authors = Array.isArray(work.author)
    ? (work.author as CrossrefAuthor[])
        .map((author) => {
          const literal = typeof author.name === "string" ? author.name.trim() : "";
          const name = [author.given, author.family]
            .filter((part): part is string => typeof part === "string" && Boolean(part.trim()))
            .join(" ")
            .trim();
          return literal || name;
        })
        .filter(Boolean)
    : [];
  const normalizedDoi = normalizeDoi(doi) ?? doi;

  return {
    title: firstString(work.title),
    abstract: cleanAbstract(work.abstract),
    authors,
    venue: firstString(work["container-title"]),
    year: publicationYear(work),
    doi: normalizedDoi,
    url: typeof work.URL === "string" && work.URL.trim() ? work.URL.trim() : `https://doi.org/${normalizedDoi}`,
  };
}

export function isCrossrefWork(value: unknown): value is { message: CrossrefWork } {
  if (!value || typeof value !== "object") return false;
  const message = (value as { message?: unknown }).message;
  return Boolean(message && typeof message === "object");
}
