import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/server";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request, { params }: { params: { id: string } }) {
  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  if (!EMAIL_RE.test(email) || email.length > 320) {
    return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  }

  const fullName = typeof body.fullName === "string" ? body.fullName.trim().slice(0, 160) : null;
  const consentMarketing = body.consentMarketing === true;
  const supabase = (() => {
    try {
      return getSupabaseAdmin();
    } catch {
      return null;
    }
  })();
  if (!supabase) {
    return NextResponse.json({ error: "Registration is temporarily unavailable." }, { status: 503 });
  }

  const { data: webinar, error: webinarError } = await supabase
    .from("webinars")
    .select("id, status, registration_mode, registration_open_at, registration_close_at")
    .eq("id", params.id)
    .maybeSingle();
  if (webinarError || !webinar) {
    return NextResponse.json({ error: "Webinar not found." }, { status: 404 });
  }

  const openStatuses = new Set(["upcoming", "scheduled", "registration_open"]);
  if (!openStatuses.has(webinar.status) || webinar.registration_mode === "external") {
    return NextResponse.json({ error: "Registration is closed for this webinar." }, { status: 409 });
  }
  const now = Date.now();
  if (webinar.registration_open_at && now < new Date(webinar.registration_open_at).getTime()) {
    return NextResponse.json({ error: "Registration is not open yet." }, { status: 409 });
  }
  if (webinar.registration_close_at && now > new Date(webinar.registration_close_at).getTime()) {
    return NextResponse.json({ error: "Registration is closed for this webinar." }, { status: 409 });
  }

  const { error } = await supabase.from("webinar_registrations").upsert(
    {
      webinar_id: params.id,
      email,
      full_name: fullName,
      consent_events: true,
      consent_marketing: consentMarketing,
      status: "registered",
      utm_source: typeof body.utmSource === "string" ? body.utmSource.slice(0, 160) : null,
      utm_medium: typeof body.utmMedium === "string" ? body.utmMedium.slice(0, 160) : null,
      utm_campaign: typeof body.utmCampaign === "string" ? body.utmCampaign.slice(0, 160) : null,
      utm_content: typeof body.utmContent === "string" ? body.utmContent.slice(0, 160) : null,
      referrer: typeof body.referrer === "string" ? body.referrer.slice(0, 500) : null,
      first_touch_at: new Date().toISOString(),
    },
    { onConflict: "webinar_id,email" },
  );

  if (error) {
    console.error("webinar registration failed", error);
    return NextResponse.json({ error: "Registration could not be saved." }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
