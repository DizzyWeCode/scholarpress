/**
 * Central site configuration — rebrand the whole site from this one file.
 */
export const SITE = {
  name: "Dr Fraction Dzinjalamala",
  tagline: "Clinical pharmacology for better malaria treatment",
  siteTitle: "Fraction Dzinjalamala — Research, Articles & Webinars",
  description:
    "The academic home of Dr Fraction Dzinjalamala: research, articles, and public conversation about antimalarial medicines, drug resistance, and clinical pharmacology from Malawi.",
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
} as const;

export function absoluteUrl(path = ""): string {
  const base =
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ??
    "http://localhost:3000";
  return `${base}${path}`;
}
