import Image from "next/image";
import { notFound } from "next/navigation";
import { CalendarDays, Clock, Download, ExternalLink } from "lucide-react";
import { WebinarRegistrationForm } from "@/components/webinar-registration-form";
import { getSupabaseAnon } from "@/lib/supabase/public";
import type { Webinar } from "@/lib/types";

const dateFormatter = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Africa/Blantyre",
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
});
const timeFormatter = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Africa/Blantyre",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
  timeZoneName: "short",
});

async function getWebinar(slug: string): Promise<Webinar | null> {
  const supabase = getSupabaseAnon();
  if (!supabase) return null;
  const publicStatuses = ["upcoming", "scheduled", "registration_open", "live", "past", "replay_available"];
  const bySlug = await supabase.from("webinars").select("*").eq("slug", slug).in("status", publicStatuses).maybeSingle();
  if (!bySlug.error && bySlug.data) return bySlug.data as Webinar;
  const byId = await supabase.from("webinars").select("*").eq("id", slug).in("status", publicStatuses).maybeSingle();
  return (byId.data as Webinar | null) ?? null;
}

export default async function WebinarDetailPage({ params }: { params: { slug: string } }) {
  const webinar = await getWebinar(params.slug);
  if (!webinar) notFound();

  const starts = new Date(webinar.starts_at);
  const isPast = ["past", "replay_available", "archived"].includes(webinar.status);
  const canRegister = !isPast && !["cancelled", "live"].includes(webinar.status) && webinar.registration_mode !== "external";
  const hero = webinar.hero_image_url || "/covers/microscope-lab.jpg";
  const heroAlt = webinar.hero_image_alt || "Researcher working with a microscope in a laboratory";
  const takeaways = Array.isArray(webinar.takeaways) ? webinar.takeaways : [];
  const agenda = Array.isArray(webinar.agenda) ? webinar.agenda : [];
  const resources = Array.isArray(webinar.resources) ? webinar.resources : [];

  return (
    <div className="mx-auto max-w-6xl px-5 py-12 sm:px-8 sm:py-20">
      <div className="grid gap-12 lg:grid-cols-[1.15fr_0.85fr] lg:items-start">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-ink-4">{isPast ? "Replay" : "Live webinar"}</p>
          <h1 className="mt-5 max-w-3xl font-serif text-4xl leading-tight tracking-tight text-ink sm:text-6xl">{webinar.title}</h1>
          {webinar.promise || webinar.description ? <p className="mt-6 max-w-2xl text-lg leading-relaxed text-ink-2">{webinar.promise || webinar.description}</p> : null}
          <div className="mt-7 flex flex-wrap gap-x-6 gap-y-3 text-sm text-ink-3">
            <span className="inline-flex items-center gap-2"><CalendarDays className="h-4 w-4" />{dateFormatter.format(starts)}</span>
            <span className="inline-flex items-center gap-2"><Clock className="h-4 w-4" />{timeFormatter.format(starts)}{webinar.duration_minutes ? ` · ${webinar.duration_minutes} min` : ""}</span>
          </div>
          <div className="relative mt-10 aspect-[16/9] overflow-hidden rounded-lg bg-ink" style={{ borderRadius: 7 }}>
            <Image src={hero} alt={heroAlt} fill sizes="(max-width: 1024px) 100vw, 720px" className="object-cover" priority />
          </div>
          {webinar.image_credit ? <p className="mt-2 text-xs text-ink-4">Image: {webinar.image_credit}</p> : null}
        </div>

        <div className="lg:sticky lg:top-24">
          {canRegister ? (
            <WebinarRegistrationForm webinarId={webinar.id} calendarUrl={`/api/webinars/${webinar.id}/ics`} />
          ) : webinar.recording_url ? (
            <div className="border border-line bg-paper p-6" style={{ borderRadius: 7 }}>
              <p className="text-xs uppercase tracking-[0.2em] text-ink-4">Watch the replay</p>
              <p className="mt-3 text-sm leading-relaxed text-ink-3">The live session has finished. Watch the recording and continue with the resources below.</p>
              <a href={webinar.recording_url} target="_blank" rel="noopener noreferrer" className="mt-5 inline-flex items-center gap-2 rounded-full bg-ink px-5 py-2.5 text-sm text-paper transition-opacity hover:opacity-80">Watch recording <ExternalLink className="h-3.5 w-3.5" /></a>
            </div>
          ) : (
            <div className="border border-line p-6" style={{ borderRadius: 7 }}>
              <p className="text-sm leading-relaxed text-ink-3">Registration is closed for this session. Join the newsletter for the next announcement.</p>
            </div>
          )}
          <a href={`/api/webinars/${webinar.id}/ics`} className="mt-4 inline-flex items-center gap-2 text-xs text-ink-3 underline underline-offset-2"><Download className="h-3.5 w-3.5" /> Add to calendar</a>
        </div>
      </div>

      <div className="mt-20 grid gap-14 border-t border-line pt-12 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          {takeaways.length > 0 ? <section><p className="text-xs uppercase tracking-[0.25em] text-ink-4">What you&rsquo;ll leave with</p><ul className="mt-5 grid gap-4">{takeaways.map((item, index) => <li key={`${item}-${index}`} className="border-b border-line pb-4 text-base leading-relaxed text-ink-2">{item}</li>)}</ul></section> : null}
          {agenda.length > 0 ? <section className="mt-12"><p className="text-xs uppercase tracking-[0.25em] text-ink-4">Agenda</p><ol className="mt-5 grid gap-3">{agenda.map((item, index) => <li key={`${item}-${index}`} className="flex gap-4 text-sm text-ink-2"><span className="text-ink-4">0{index + 1}</span><span>{item}</span></li>)}</ol></section> : null}
        </div>
        <aside className="space-y-8">
          {webinar.speaker_name ? <section className="border-l-2 border-indigo-500 pl-5"><p className="text-xs uppercase tracking-[0.25em] text-ink-4">Speaker</p><h2 className="mt-3 font-serif text-2xl text-ink">{webinar.speaker_name}</h2>{webinar.speaker_role ? <p className="mt-1 text-sm text-ink-3">{webinar.speaker_role}</p> : null}{webinar.speaker_bio ? <p className="mt-3 text-sm leading-relaxed text-ink-3">{webinar.speaker_bio}</p> : null}</section> : null}
          {resources.length > 0 ? <section><p className="text-xs uppercase tracking-[0.25em] text-ink-4">Resources</p><ul className="mt-4 grid gap-3">{resources.map((resource, index) => <li key={`${resource.label}-${index}`}><a href={resource.url || "#"} className="text-sm text-ink-2 underline underline-offset-2">{resource.label}</a></li>)}</ul></section> : null}
          {webinar.course_cta_label && webinar.course_cta_url ? <section className="border border-line bg-indigo-50 p-6" style={{ borderRadius: 7 }}><p className="text-xs uppercase tracking-[0.2em] text-indigo-700">Continue learning</p><a href={webinar.course_cta_url} className="mt-3 inline-flex text-base font-medium text-indigo-950 underline underline-offset-4">{webinar.course_cta_label}</a></section> : null}
        </aside>
      </div>
    </div>
  );
}
