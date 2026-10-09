import type { Webinar } from "@/lib/types";
import { isWebinarPast } from "@/lib/utils";
import { CalendarDays, Clock, Download, MonitorPlay } from "lucide-react";

const dateFormatter = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Africa/Blantyre",
  day: "2-digit",
  month: "short",
  year: "numeric",
});
const timeFormatter = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Africa/Blantyre",
  weekday: "long",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

export function WebinarCard({ webinar, dark = false }: { webinar: Webinar; dark?: boolean }) {
  const starts = new Date(webinar.starts_at);
  const isPast = webinar.status === "past" || (webinar.status === "upcoming" && isWebinarPast(webinar));
  const isUpcoming = webinar.status === "upcoming" && !isPast;
  return (
    <article
      className={`flex flex-col gap-4 border p-7 ${
        dark ? "border-paper/20 bg-ink text-paper" : "border-line bg-paper text-ink"
      }`}
      style={{ borderRadius: 7 }}
    >
      <div className="flex items-center justify-between">
        <span
          className={`rounded-full border px-3 py-1 text-xs uppercase tracking-widest ${
            dark ? "border-paper/30 text-paper/70" : "border-line text-ink-3"
          }`}
        >
          {isUpcoming ? "Upcoming" : isPast ? "Recording" : "Draft"}
        </span>
        <span className={`text-xs ${dark ? "text-paper/50" : "text-ink-4"}`}>
          {dateFormatter.format(starts)}
        </span>
      </div>
      <h3 className="font-serif text-2xl leading-snug tracking-tight">{webinar.title}</h3>
      {webinar.description ? (
        <p className={`text-sm leading-relaxed ${dark ? "text-paper/60" : "text-ink-3"}`}>
          {webinar.description}
        </p>
      ) : null}
      <div className={`mt-auto flex flex-wrap gap-x-5 gap-y-2 text-xs ${dark ? "text-paper/50" : "text-ink-3"}`}>
        <span className="inline-flex items-center gap-1.5">
          <CalendarDays className="h-3.5 w-3.5" />
          {timeFormatter.format(starts)} CAT
        </span>
        {webinar.duration_minutes ? (
          <span className="inline-flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" />
            {webinar.duration_minutes} min
          </span>
        ) : null}
        {webinar.platform ? (
          <span className="inline-flex items-center gap-1.5">
            <MonitorPlay className="h-3.5 w-3.5" />
            {webinar.platform}
          </span>
        ) : null}
      </div>
      {isUpcoming && webinar.registration_url ? (
        <a
          href={webinar.registration_url}
          target="_blank"
          rel="noopener noreferrer"
          className={`mt-2 inline-flex w-fit items-center rounded-full px-5 py-2 text-sm transition-opacity hover:opacity-80 ${
            dark ? "bg-paper text-ink" : "bg-ink text-paper"
          }`}
        >
          Register free
        </a>
      ) : null}
      {isUpcoming ? (
        <a
          href={`/api/webinars/${webinar.id}/ics`}
          className={`inline-flex w-fit items-center gap-2 text-xs underline underline-offset-2 ${dark ? "text-paper/70" : "text-ink-3"}`}
        >
          <Download className="h-3.5 w-3.5" /> Add to calendar
        </a>
      ) : null}
      {isPast && webinar.recording_url ? (
        <a
          href={webinar.recording_url}
          target="_blank"
          rel="noopener noreferrer"
          className={`mt-2 inline-flex w-fit items-center rounded-full border px-5 py-2 text-sm transition-colors ${
            dark ? "border-paper/40 text-paper hover:bg-paper hover:text-ink" : "border-ink text-ink hover:bg-ink hover:text-paper"
          }`}
        >
          Watch recording
        </a>
      ) : null}
    </article>
  );
}
