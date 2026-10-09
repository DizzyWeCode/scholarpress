/**
 * Central site configuration — rebrand the whole site from this one file.
 */
export const SITE = {
  name: "Dr Fraction Dzinjalamala",
  tagline: "Clinical pharmacology for better malaria treatment",
  platformPromise: "Ideas, research, books, and conversations from Dr Fraction Dzinjalamala.",
  platformDescription:
    "A living record of the work, questions, and projects that shape how I think, teach, research, and make things.",
  siteTitle: "Fraction Dzinjalamala — Ideas, Research, Books & Events",
  description:
    "The public home of Dr Fraction Dzinjalamala: ideas, research, books, events, teaching, and the questions connecting the work.",
  affiliation: "Department of Clinical Sciences, MUST",
  email: "fdzinjalamala@must.ac.mw",
  // Optional scholarly profiles — leave empty to hide
  orcid: "",
  googleScholar: "",
  researchgate: "https://www.researchgate.net/profile/Fraction-Dzinjalamala",
  twitter: "",
  linkedin: "",
  // Studio credit shown in the footer — leave url empty to render as plain text
  builtBy: { name: "Akodi Ltd", url: "" },
  // Footer attribution note for imagery used across the site
  imageAttributionNote:
    "Images and illustrations on this site are original unless credited alongside the image.",
  // Visual system — replace these files in /public/covers to rebrand imagery.
  // Keep the academic tone: real people, real research context, Malawi/MUST,
  // malaria microscopy, lab/clinical settings. All have descriptive alt text.
  images: {
    hero: { src: "/covers/field-notes.png", alt: "Field research notes on antimalarial treatment in Malawi" },
    aboutPortrait: { src: "/covers/field-notes.png", alt: "Portrait placeholder — Dr Fraction Dzinjalamala" },
  },
} as const;

export function getSiteUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/$/, "");
  if (raw) return raw;
  // Production must never share localhost links. Fail loudly in the console
  // and fall back to the canonical production domain so sitemap, OG tags,
  // canonical URLs, and emails stay shareable even if the env var is missing.
  if (process.env.NODE_ENV === "production") {
    console.warn(
      "[site] NEXT_PUBLIC_SITE_URL is missing in production — falling back to https://dr-fraction.me. Set NEXT_PUBLIC_SITE_URL to your canonical domain.",
    );
    return "https://dr-fraction.me";
  }
  return "http://localhost:3000";
}

export function absoluteUrl(path = ""): string {
  return `${getSiteUrl()}${path}`;
}

export function isSiteUrlConfigured(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_SITE_URL?.trim());
}

export const DEFAULT_OG_IMAGE = "/covers/default-og.png";
export const DEFAULT_OG_IMAGE_ALT =
  "Dr Fraction Dzinjalamala — clinical pharmacology for better malaria treatment";

export function absoluteOgImage(url?: string | null): string {
  if (!url) return absoluteUrl(DEFAULT_OG_IMAGE);
  if (/^https?:\/\//.test(url)) return url;
  return absoluteUrl(url.startsWith("/") ? url : `/${url}`);
}
