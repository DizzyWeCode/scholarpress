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

  const supabase = (() => {
    try {
      return getSupabaseAdmin();
    } catch {
      return null;
    }
  })();
  if (!supabase) return NextResponse.json({ error: "This interest list is temporarily unavailable." }, { status: 503 });

  const { data: webinar } = await supabase.from("webinars").select("id").eq("id", params.id).maybeSingle();
  if (!webinar) return NextResponse.json({ error: "Webinar not found." }, { status: 404 });

  const value = (key: string, max: number) => typeof body[key] === "string" ? body[key].trim().slice(0, max) || null : null;
  const { error } = await supabase.from("webinar_interest_signals").upsert(
    {
      webinar_id: params.id,
      email,
      full_name: value("fullName", 160),
      signal_type: "course_interest",
      experience_level: value("experienceLevel", 80),
      preferred_format: value("preferredFormat", 80),
      utm_source: value("utmSource", 160),
      utm_medium: value("utmMedium", 160),
      utm_campaign: value("utmCampaign", 160),
      utm_content: value("utmContent", 160),
      first_touch_at: new Date().toISOString(),
    },
    { onConflict: "webinar_id,email,signal_type" },
  );
  if (error) {
    console.error("webinar interest signal failed", error);
    return NextResponse.json({ error: "Could not save your interest." }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
