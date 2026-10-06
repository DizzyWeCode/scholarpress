import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Rough reading time from a TipTap JSON document. */
export function readingTimeFromDoc(
  doc: Record<string, unknown> | null,
): number {
  if (!doc) return 1;
  const text = extractText(doc);
  const words = text.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

export function extractText(node: unknown): string {
  if (!node || typeof node !== "object") return "";
  const n = node as { text?: string; content?: unknown[] };
  let out = n.text ?? "";
  if (Array.isArray(n.content)) {
    out += " " + n.content.map(extractText).join(" ");
  }
  return out;
}

/** Plain-text excerpt from a TipTap doc, for meta descriptions. */
export function excerptFromDoc(
  doc: Record<string, unknown> | null,
  max = 160,
): string {
  const text = extractText(doc).replace(/\s+/g, " ").trim();
  if (text.length <= max) return text;
  return text.slice(0, max).replace(/\s+\S*$/, "") + "…";
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}
