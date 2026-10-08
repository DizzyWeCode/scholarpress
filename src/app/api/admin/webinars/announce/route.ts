import { NextResponse } from "next/server";
import { hasResendConfig } from "@/lib/email/resend";
import { sendWebinarEmails } from "@/lib/email/webinars";
import { getOwnerSession, getSupabaseServer } from "@/lib/supabase/server";
import type { Webinar } from "@/lib/types";

export const dynamic = "force-dynamic";

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export async function POST(request: Request) {
  const { user, isOwner } = await getOwnerSession();
  if (!user || !isOwner) {
    return NextResponse.json({ error: "Owner access required." }, { status: 403 });
  }
  if (!hasResendConfig()) {
    return NextResponse.json(
      { error: "Email sending is not configured (RESEND_API_KEY missing)." },
      { status: 503 },
    );
  }

  let body: { webinarId?: unknown; mode?: unknown; testEmail?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const webinarId = typeof body.webinarId === "string" ? body.webinarId : "";
  const mode =
    body.mode === "test" ? "test" : body.mode === "all" ? "all" : null;
  if (!webinarId || !mode) {
    return NextResponse.json(
      { error: 'webinarId and mode ("test" or "all") are required.' },
      { status: 400 },
    );
  }

  const supabase = getSupabaseServer();
  const { data: webinar, error: webinarError } = await supabase
    .from("webinars")
    .select("*")
    .eq("id", webinarId)
    .maybeSingle();
  if (webinarError) {
    return NextResponse.json(
      { error: `Could not load webinar: ${webinarError.message}` },
      { status: 500 },
    );
  }
  if (!webinar) {
    return NextResponse.json({ error: "Webinar not found." }, { status: 404 });
  }

  let recipients: string[] = [];
  if (mode === "test") {
    const testEmail =
      typeof body.testEmail === "string" ? body.testEmail.trim() : "";
    if (!isValidEmail(testEmail)) {
      return NextResponse.json(
        { error: "A valid test email address is required." },
        { status: 400 },
      );
    }
    recipients = [testEmail];
  } else {
    const { data, error } = await supabase
      .from("subscribers")
      .select("email")
      .limit(5000);
    if (error) {
      return NextResponse.json(
        { error: `Could not load subscribers: ${error.message}` },
        { status: 500 },
      );
    }
    recipients = Array.from(
      new Set((data ?? []).map((row) => String(row.email).toLowerCase())),
    );
    if (recipients.length === 0) {
      return NextResponse.json(
        { error: "No subscribers to send to." },
        { status: 400 },
      );
    }
  }

  const result = await sendWebinarEmails({
    webinar: webinar as Webinar,
    purpose: "webinar_announcement",
    recipients,
    db: supabase,
    ignoreHistory: mode === "test",
  });

  return NextResponse.json({ ok: true, mode, webinarId, ...result });
}
