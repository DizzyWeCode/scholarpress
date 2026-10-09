import { NextResponse } from "next/server";
import { getSupabaseAnon } from "@/lib/supabase/public";

function escapeIcs(value: string): string {
  return value.replace(/[\\,;\n]/g, (match) => ({ "\\": "\\\\", ",": "\\,", ";": "\\;", "\n": "\\n" })[match] ?? match);
}

function formatUtc(date: Date): string {
  return date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
}

export async function GET(
  _request: Request,
  { params }: { params: { id: string } },
) {
  const supabase = getSupabaseAnon();
  if (!supabase) return NextResponse.json({ error: "Not configured" }, { status: 503 });
  const { data: webinar, error } = await supabase
    .from("webinars")
    .select("id, title, description, starts_at, duration_minutes, platform, registration_url, status")
    .eq("id", params.id)
    .in("status", ["upcoming", "past"])
    .maybeSingle();
  if (error || !webinar) return NextResponse.json({ error: "Webinar not found" }, { status: 404 });

  const start = new Date(webinar.starts_at);
  const end = new Date(start.getTime() + Math.max(30, webinar.duration_minutes ?? 60) * 60_000);
  const description = [webinar.description, webinar.platform ? `Platform: ${webinar.platform}` : null, webinar.registration_url ? `Register: ${webinar.registration_url}` : null]
    .filter(Boolean)
    .join("\n");
  const body = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//ScholarPress//Webinars//EN",
    "CALSCALE:GREGORIAN",
    "BEGIN:VEVENT",
    `UID:webinar-${escapeIcs(webinar.id)}@scholarpress`,
    `DTSTAMP:${formatUtc(new Date())}`,
    `DTSTART:${formatUtc(start)}`,
    `DTEND:${formatUtc(end)}`,
    `SUMMARY:${escapeIcs(webinar.title)}`,
    description ? `DESCRIPTION:${escapeIcs(description)}` : "",
    "END:VEVENT",
    "END:VCALENDAR",
  ].filter(Boolean).join("\r\n") + "\r\n";

  return new NextResponse(body, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="webinar-${params.id}.ics"`,
      "Cache-Control": "public, max-age=60",
    },
  });
}
