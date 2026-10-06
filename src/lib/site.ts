/**
 * Central site configuration — rebrand the whole site from this one file.
 * Replace the placeholder persona below with the owner's real details.
 */
export const SITE = {
  name: "Dr. Alex Moyo",
  tagline: "Researcher in Information Systems & Digital Society",
  siteTitle: "Alex Moyo — Research, Writing & Webinars",
  description:
    "The academic home of Dr. Alex Moyo: peer-reviewed research, long-form writing, and public webinars on information systems and digital society.",
  affiliation: "Department of Information Systems",
  email: "hello@example.com",
  // Optional scholarly profiles — leave empty to hide
  orcid: "",
  googleScholar: "",
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
