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
  instagram: "",
  youtube: "",
  facebook: "https://www.facebook.com/fraction.b.dzinjalamala/",
  // Studio credit shown in the footer — leave url empty to render as plain text
  builtBy: { name: "Akodi Ltd", url: "" },
  // Footer attribution note for imagery used across the site
  imageAttributionNote:
    "Temporary preview imagery is sourced from Unsplash and will be replaced with original images before launch.",
  // Temporary preview imagery — replace these files with Dr Fraction's own photos before launch.
  images: {
    hero: { src: "/covers/microscope-lab.jpg", alt: "A researcher working with a microscope in a laboratory" },
    aboutPortrait: { src: "/covers/lab-researcher.jpg", alt: "Temporary laboratory researcher portrait placeholder" },
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

export const DEFAULT_OG_IMAGE = "/covers/research-still-life.jpg";
export const DEFAULT_OG_IMAGE_ALT =
  "Temporary research still-life placeholder for Dr Fraction Dzinjalamala";

export function absoluteOgImage(url?: string | null): string {
  if (!url) return absoluteUrl(DEFAULT_OG_IMAGE);
  if (/^https?:\/\//.test(url)) return url;
  return absoluteUrl(url.startsWith("/") ? url : `/${url}`);
}
