/**
 * Central site configuration — rebrand the whole site from this one file.
 */
export const SITE = {
  name: "Dr Fraction Dzinjalamala",
  tagline: "Clinical pharmacologist working to outsmart drug-resistant malaria",
  siteTitle: "Fraction Dzinjalamala — Research, Writing & Webinars",
  description:
    "The academic home of Dr Fraction Dzinjalamala: malaria chemotherapy, antimicrobial drug resistance, and clinical pharmacology — research, writing, and public webinars from Malawi.",
  affiliation: "Department of Clinical Sciences, MUST",
  email: "fdzinjalamala@must.ac.mw",
  // Optional scholarly profiles — leave empty to hide
  orcid: "",
  googleScholar: "",
  researchgate: "https://www.researchgate.net/profile/Fraction-Dzinjalamala",
  twitter: "",
  linkedin: "",
  // Footer attribution note for third-party imagery used across the site
  imageAttributionNote:
    "Unless otherwise credited alongside an image, photography on this site is from Unsplash and used under the Unsplash License.",
} as const;

export function absoluteUrl(path = ""): string {
  const base =
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ??
    "http://localhost:3000";
  return `${base}${path}`;
}
