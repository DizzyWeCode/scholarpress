import type { Metadata } from "next";
import { getSupabaseAnon } from "@/lib/supabase/public";
import { WebinarCard } from "@/components/webinar-card";
import { Reveal } from "@/components/reveal";
import { NewsletterForm } from "@/components/newsletter-form";
import type { Webinar } from "@/lib/types";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Webinars",
  description: "Upcoming webinars and past recordings.",
};

export default async function WebinarsPage() {
  const supabase = getSupabaseAnon();
  let upcoming: Webinar[] = [];
  let past: Webinar[] = [];
  if (supabase) {
    const { data } = await supabase
      .from("webinars")
      .select("*")
      .in("status", ["upcoming", "past"])
      .order("starts_at", { ascending: false });
    const all = (data ?? []) as Webinar[];
    upcoming = all
      .filter((w) => w.status === "upcoming")
      .sort((a, b) => a.starts_at.localeCompare(b.starts_at));
    past = all.filter((w) => w.status === "past");
  }

  return (
    <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8">
      <Reveal>
        <p className="text-xs uppercase tracking-[0.25em] text-ink-4">Webinars</p>
        <h1 className="mt-4 font-serif text-4xl tracking-tight text-ink sm:text-6xl">
          Talks &amp; webinars
        </h1>
        <p className="mt-5 max-w-xl text-base leading-relaxed text-ink-3">
          Live sessions on current research, open to all. Register free —
          recordings appear here afterwards.
        </p>
      </Reveal>

      <section className="mt-14">
        <Reveal>
          <h2 className="text-xs uppercase tracking-[0.25em] text-ink-4">
            Upcoming
          </h2>
        </Reveal>
        {upcoming.length > 0 ? (
          <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {upcoming.map((w, i) => (
              <Reveal key={w.id} delay={i * 80}>
                <WebinarCard webinar={w} />
              </Reveal>
            ))}
          </div>
        ) : (
          <div className="mt-8 max-w-xl border-t border-line pt-10">
            <p className="text-sm leading-relaxed text-ink-3">
              No sessions scheduled right now. Leave your email and you&rsquo;ll
              be the first to know when the next one is announced.
            </p>
            <div className="mt-6">
              <NewsletterForm />
            </div>
          </div>
        )}
      </section>

      {past.length > 0 && (
        <section className="mt-20">
          <Reveal>
            <h2 className="text-xs uppercase tracking-[0.25em] text-ink-4">
              Past sessions &amp; recordings
            </h2>
          </Reveal>
          <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {past.map((w, i) => (
              <Reveal key={w.id} delay={i * 80}>
                <WebinarCard webinar={w} />
              </Reveal>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
