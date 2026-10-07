import { NextResponse } from "next/server";
import { getSupabaseAdminIfAvailable, hasResendConfig } from "@/lib/email/resend";
import { sendWebinarEmails } from "@/lib/email/webinars";
import type { Webinar } from "@/lib/types";

export const dynamic = "force-dynamic";

/** Vercel cron: hourly reminder pass for webinars starting within 24 hours.
 *  Authenticated with `Authorization: Bearer ${CRON_SECRET}` (Vercel adds this
 *  header automatically for cron invocations when CRON_SECRET is set).
 *  Idempotency: recipients already recorded in email_sends for
 *  (purpose = webinar_reminder, webinar_id) are skipped, plus Resend's
 *  Idempotency-Key dedupe as a fallback when the service role key is absent. */
const REMINDER_WINDOW_HOURS = 24;

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i += 1) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return NextResponse.json(
      { error: "CRON_SECRET is not configured — reminders skipped." },
      { status: 503 },
    );
  }
  const auth = request.headers.get("authorization") ?? "";
  const token = auth.startsWith("Bearer ") ? auth.slice("Bearer ".length) : "";
  if (!token || !timingSafeEqual(token, secret)) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  if (!hasResendConfig()) {
    return NextResponse.json(
      { error: "RESEND_API_KEY is not configured — reminders skipped." },
      { status: 503 },
    );
  }

  const db = getSupabaseAdminIfAvailable();
  if (!db) {
    return NextResponse.json(
      {
        error:
          "SUPABASE_SERVICE_ROLE_KEY is not configured — cannot list subscribers safely, reminders skipped.",
      },
      { status: 503 },
    );
  }

  const now = new Date();
  const windowEnd = new Date(now.getTime() + REMINDER_WINDOW_HOURS * 3600_000);
  const { data: webinars, error: webinarError } = await db
    .from("webinars")
    .select("*")
    .eq("status", "upcoming")
    .gt("starts_at", now.toISOString())
    .lte("starts_at", windowEnd.toISOString())
    .order("starts_at", { ascending: true })
    .limit(20);
  if (webinarError) {
    return NextResponse.json(
      { error: `Could not load webinars: ${webinarError.message}` },
      { status: 500 },
    );
  }

  const { data: subscribers, error: subscriberError } = await db
    .from("subscribers")
    .select("email")
    .limit(5000);
  if (subscriberError) {
    return NextResponse.json(
      { error: `Could not load subscribers: ${subscriberError.message}` },
      { status: 500 },
    );
  }
  const recipients = Array.from(
    new Set((subscribers ?? []).map((row) => String(row.email).toLowerCase())),
  );

  const results: Array<Record<string, unknown>> = [];
  for (const webinar of (webinars ?? []) as Webinar[]) {
    const result = await sendWebinarEmails({
      webinar,
      purpose: "webinar_reminder",
      recipients,
      db,
      delayMs: 550,
    });
    results.push({ webinarId: webinar.id, title: webinar.title, ...result });
  }

  return NextResponse.json({
    ok: true,
    window: `${REMINDER_WINDOW_HOURS}h`,
    checkedAt: now.toISOString(),
    recipients: recipients.length,
    webinars: results,
  });
}
