import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { SITE, absoluteOgImage, absoluteUrl } from "@/lib/site";
import { SiteChrome } from "@/components/site-chrome";
import { ToastProvider } from "@/components/toast";

// Self-hosted variable subsets (latin) from Google Fonts — Inter & Newsreader,
// SIL Open Font License. Regenerate: see scripts/ in the repo root.
const inter = localFont({
  src: [{ path: "../fonts/inter-latin.woff2", weight: "400 600", style: "normal" }],
  display: "swap",
  variable: "--font-inter",
});

const newsreader = localFont({
  src: [
    { path: "../fonts/newsreader-latin.woff2", weight: "400 600", style: "normal" },
    { path: "../fonts/newsreader-latin-italic.woff2", weight: "400", style: "italic" },
  ],
  display: "swap",
  variable: "--font-newsreader",
});

export const metadata: Metadata = {
  metadataBase: new URL(absoluteUrl()),
  title: {
    default: SITE.siteTitle,
    template: `%s — ${SITE.name}`,
  },
  description: SITE.description,
  // "./" resolves to the current path → every route self-canonicalises
  // against metadataBase (avoids duplicate-content between hosts/paths).
  alternates: {
    canonical: "./",
  },
  openGraph: {
    type: "website",
    siteName: SITE.siteTitle,
    title: SITE.siteTitle,
    description: SITE.description,
    images: [{ url: absoluteOgImage() }],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE.siteTitle,
    description: SITE.description,
    images: [absoluteOgImage()],
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${inter.variable} ${newsreader.variable}`}>
      <body>
        <script
          dangerouslySetInnerHTML={{
            __html: "document.documentElement.classList.add('js')",
          }}
        />
        <ToastProvider>
          <SiteChrome>{children}</SiteChrome>
        </ToastProvider>
      </body>
    </html>
  );
}
