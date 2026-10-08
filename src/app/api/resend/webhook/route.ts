import { NextResponse } from "next/server";
import crypto from "crypto";
import { getSupabaseAdminIfAvailable } from "@/lib/email/resend";

/**
 * Resend webhook → email_sends status tracking.
 *
 * Events: email.sent | delivered | opened | clicked | bounced | failed | complained
 * Statuses only ever upgrade (sent → delivered → opened → clicked); terminal
 * states (bounced/failed) always win. Without SUPABASE_SERVICE_ROLE_KEY the
 * event is acknowledged with 200 but not recorded (see final report: key must
 * be added to Vercel for live tracking).
 */

type EventStatus =
  | "sent"
  | "delivered"
  | "opened"
  | "clicked"
  | "bounced"
  | "failed";

const EVENT_STATUS: Record<string, EventStatus> = {
  "email.sent": "sent",
  "email.delivered": "delivered",
  "email.opened": "opened",
  "email.clicked": "clicked",
  "email.bounced": "bounced",
  "email.failed": "failed",
  "email.complained": "bounced",
};

const RANK: Record<EventStatus, number> = {
  sent: 1,
  delivered: 2,
  opened: 3,
  clicked: 4,
  bounced: 5,
  failed: 5,
};

type TsField = "sent_at" | "delivered_at" | "opened_at" | "clicked_at" | "bounced_at";

const TIMESTAMP_FIELD: Record<EventStatus, TsField> = {
  sent: "sent_at",
  delivered: "delivered_at",
  opened: "opened_at",
  clicked: "clicked_at",
  bounced: "bounced_at",
  failed: "bounced_at",
};

function eventRecipients(data: Record<string, unknown> | undefined): string[] {
  const raw = data?.to;
  const values = Array.isArray(raw) ? raw : typeof raw === "string" ? [raw] : [];
  return values
    .map((value) => String(value).trim().toLowerCase())
    .filter((value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value));
}

async function removeMarketingRecipients(
  db: NonNullable<ReturnType<typeof getSupabaseAdminIfAvailable>>,
  emails: string[],
): Promise<number> {
  if (emails.length === 0) return 0;
  const { data, error } = await db
    .from("subscribers")
    .delete()
    .in("email", Array.from(new Set(emails)))
    .select("id");
  if (error) {
    console.warn(`[resend-webhook] subscriber cleanup failed: ${error.message}`);
    return 0;
  }
  return (data ?? []).length;
}

/** Standard Webhooks (svix) verification: HMAC-SHA256 over
 *  `${svix-id}.${svix-timestamp}.${rawBody}` with the whsec_ key bytes. */
function verifySignature(rawBody: string, headers: Headers, secret: string): boolean {
  const svixId = headers.get("svix-id");
  const svixTimestamp = headers.get("svix-timestamp");
  const signatureHeader = headers.get("svix-signature");
  if (!svixId || !svixTimestamp || !signatureHeader) return false;

  const timestamp = Number(svixTimestamp);
  if (!Number.isFinite(timestamp)) return false;
  if (Math.abs(Date.now() / 1000 - timestamp) > 300) return false;

  const key = secret.startsWith("whsec_")
    ? Buffer.from(secret.slice("whsec_".length), "base64")
    : Buffer.from(secret, "utf8");
  const expected = crypto
    .createHmac("sha256", key)
    .update(`${svixId}.${svixTimestamp}.${rawBody}`)
    .digest("base64");
  const expectedBuf = Buffer.from(expected, "base64");

  // Multiple space-delimited signatures may appear during secret rotation.
  return signatureHeader.split(/\s+/).some((entry) => {
    const value = entry.startsWith("v1,") ? entry.slice(3) : entry;
    const actualBuf = Buffer.from(value, "base64");
    return (
      actualBuf.length === expectedBuf.length &&
      crypto.timingSafeEqual(actualBuf, expectedBuf)
    );
  });
}

export async function POST(request: Request) {
  const rawBody = await request.text();

  const secret = process.env.RESEND_WEBHOOK_SECRET;
  if (secret) {
    if (!verifySignature(rawBody, request.headers, secret)) {
      return NextResponse.json({ error: "invalid signature" }, { status: 401 });
    }
  } else {
    console.warn(
      "[resend-webhook] RESEND_WEBHOOK_SECRET is not set — accepting events without signature verification",
    );
  }

  let event: { type?: string; data?: Record<string, unknown> };
  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "invalid JSON" }, { status: 400 });
  }

  const status = event.type ? EVENT_STATUS[event.type] : undefined;
  const emailId = (event.data?.email_id ?? event.data?.id) as string | undefined;
  if (!status || !emailId || typeof emailId !== "string") {
    return NextResponse.json({ ok: true, ignored: true });
  }

  const db = getSupabaseAdminIfAvailable();
  if (!db) {
    console.warn(
      "[resend-webhook] SUPABASE_SERVICE_ROLE_KEY not configured — event acknowledged but email_sends not updated",
    );
    return NextResponse.json({ ok: true, skipped: true });
  }

  const { data, error: readError } = await db
    .from("email_sends")
    .select("id, status, sent_at, delivered_at, opened_at, clicked_at, bounced_at")
    .eq("resend_email_id", emailId)
    .maybeSingle();
  const row = data as {
    id: string;
    status: string;
    sent_at: string | null;
    delivered_at: string | null;
    opened_at: string | null;
    clicked_at: string | null;
    bounced_at: string | null;
  } | null;
  if (readError) {
    console.warn(`[resend-webhook] read failed: ${readError.message}`);
    return NextResponse.json({ error: "database read failed" }, { status: 503 });
  }
  if (!row) {
    // Not a tracked send (e.g. the Phase 4 test sends ran before tracking).
    return NextResponse.json({ ok: true, untracked: true });
  }

  const current = row.status as EventStatus;
  const patch: Record<string, string> = {};

  const terminal = status === "bounced" || status === "failed";
  const currentTerminal = current === "bounced" || current === "failed";
  if (terminal || (!currentTerminal && RANK[status] > RANK[current])) {
    patch.status = status;
  }

  const tsField = TIMESTAMP_FIELD[status];
  if (tsField && !row[tsField]) patch[tsField] = new Date().toISOString();

  if (status === "failed") {
    const failure = (event.data?.failure_message ?? event.data?.reason) as
      | string
      | undefined;
    if (failure) patch.error_message = failure.slice(0, 500);
  }
  if (event.type === "email.complained") {
    patch.error_message = "Recipient marked the email as spam.";
  }

  let removedSubscribers = 0;
  if (event.type === "email.complained") {
    removedSubscribers = await removeMarketingRecipients(
      db,
      eventRecipients(event.data),
    );
  }
  if (event.type === "email.bounced") {
    const bounce = event.data?.bounce as Record<string, unknown> | undefined;
    if (String(bounce?.type ?? "").toLowerCase() === "permanent") {
      removedSubscribers = await removeMarketingRecipients(
        db,
        eventRecipients(event.data),
      );
    }
  }

  if (Object.keys(patch).length === 0) {
    return NextResponse.json({
      ok: true,
      unchanged: true,
      removedSubscribers,
    });
  }

  const { error: writeError } = await db
    .from("email_sends")
    .update(patch)
    .eq("id", row.id);
  if (writeError) {
    console.warn(`[resend-webhook] update failed: ${writeError.message}`);
    return NextResponse.json({ error: "database update failed" }, { status: 503 });
  }

  return NextResponse.json({
    ok: true,
    status: patch.status ?? current,
    removedSubscribers,
  });
}
