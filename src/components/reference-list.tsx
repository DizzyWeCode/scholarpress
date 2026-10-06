import type { ReferenceItem } from "@/lib/types";

/** Numbered reference list appended to articles that cite sources. */
export function ReferenceList({ items }: { items: ReferenceItem[] }) {
  if (!items?.length) return null;
  return (
    <section className="mt-16 border-t border-ink pt-8" aria-label="References">
      <h2 className="font-serif text-xl tracking-tight text-ink">References</h2>
      <ol className="mt-5 list-decimal space-y-2.5 pl-5 text-sm leading-relaxed text-ink-2">
        {items.map((ref, i) => (
          <li key={i}>
            {ref.url ? (
              <a
                href={ref.url}
                target="_blank"
                rel="noopener noreferrer"
                className="underline decoration-ink-4 underline-offset-2 transition-colors hover:decoration-ink"
              >
                {ref.label}
              </a>
            ) : (
              ref.label
            )}
          </li>
        ))}
      </ol>
    </section>
  );
}
