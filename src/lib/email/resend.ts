import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export type EmailPurpose =
  | "welcome"
  | "newsletter"
  | "webinar_announcement"
  | "webinar_reminder";

export type TemplateAlias =
  | "dr-fraction-welcome"
  | "dr-fraction-newsletter"
  | "dr-fraction-webinar-announcement"
  | "dr-fraction-webinar-reminder";

export interface SendTemplateOptions {
  to: string;
  /** Required: every template is published with an empty subject. */
  subject: string;
  template: TemplateAlias;
  /** Every variable used by the template HTML must be provided — Resend
   *  rejects the send when a variable has no value and no fallback. */
  variables: Record<string, string>;
  purpose: EmailPurpose;
  postId?: string | null;
  webinarId?: string | null;
  /** Supabase client used to record the send in email_sends. Pass the owner
   *  session server client from Server Actions, or the service-role client
   *  from the cron/webhook. When omitted the send still goes out, unrecorded. */
  db?: SupabaseClient | null;
  /** Optional dedupe key for retries (honoured by Resend for 24h). */
  idempotencyKey?: string;
  /** Optional one-click unsubscribe URL for marketing/list emails. */
  unsubscribeUrl?: string;
}

export interface SendResult {
  ok: boolean;
  resendEmailId?: string;
  error?: string;
  recorded: boolean;
}

const API_BASE = "https://api.resend.com";
const DEFAULT_FROM = "Dr Fraction <newsletter@dr-fraction.me>";
const SEND_TIMEOUT_MS = 20_000;

export function hasResendConfig(): boolean {
  return Boolean(process.env.RESEND_API_KEY);
}

function fromAddress(): string {
  return process.env.RESEND_FROM || DEFAULT_FROM;
}

async function recordSend(
  db: SupabaseClient | null | undefined,
  row: Record<string, unknown>,
): Promise<boolean> {
  if (!db) return false;
  try {
    const { error } = await db.from("email_sends").insert(row);
    if (error) {
      console.warn(`email_sends insert failed (${error.code}): ${error.message}`);
      return false;
    }
    return true;
  } catch (cause) {
    console.warn(`email_sends insert failed: ${String(cause)}`);
    return false;
  }
}

/** Send one transactional email through a published Resend template and
 *  record the outcome in email_sends (when a db client is provided). */
export async function sendTemplate(options: SendTemplateOptions): Promise<SendResult> {
  const { to, subject, template, variables, purpose, postId, webinarId, db } = options;
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return { ok: false, error: "RESEND_API_KEY is not configured.", recorded: false };
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) {
    return { ok: false, error: `Invalid recipient address: ${to}`, recorded: false };
  }

  let response: Response;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), SEND_TIMEOUT_MS);
  try {
    const headers: Record<string, string> = {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    };
    if (options.idempotencyKey) headers["Idempotency-Key"] = options.idempotencyKey;
    response = await fetch(`${API_BASE}/emails`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        from: fromAddress(),
        to: [to],
        subject,
        template: { id: template, variables },
        ...(options.unsubscribeUrl
          ? {
              headers: {
                "List-Unsubscribe": `<${options.unsubscribeUrl}>`,
                "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
              },
            }
          : {}),
      }),
      cache: "no-store",
      signal: controller.signal,
    });
  } catch (cause) {
    const error = `Resend request failed: ${String(cause)}`;
    const recorded = await recordSend(db, {
      purpose,
      recipient_email: to,
      subject,
      post_id: postId ?? null,
      webinar_id: webinarId ?? null,
      status: "failed",
      error_message: error.slice(0, 500),
    });
    return { ok: false, error, recorded };
  } finally {
    clearTimeout(timeout);
  }

  if (!response.ok) {
    let detail = `HTTP ${response.status}`;
    try {
      const body = (await response.json()) as { message?: string };
      if (body.message) detail = `${detail}: ${body.message}`;
    } catch {
      // non-JSON error body
    }
    const error = `Resend rejected the send (${detail})`;
    const recorded = await recordSend(db, {
      purpose,
      recipient_email: to,
      subject,
      post_id: postId ?? null,
      webinar_id: webinarId ?? null,
      status: "failed",
      error_message: error.slice(0, 500),
    });
    return { ok: false, error, recorded };
  }

  const body = (await response.json()) as { id?: string };
  const resendEmailId = body.id ?? null;
  const recorded = await recordSend(db, {
    purpose,
    recipient_email: to,
    subject,
    post_id: postId ?? null,
    webinar_id: webinarId ?? null,
    resend_email_id: resendEmailId,
    status: "sent",
    sent_at: new Date().toISOString(),
  });
  return resendEmailId
    ? { ok: true, resendEmailId, recorded }
    : { ok: true, recorded };
}

/** Service-role client for server contexts with no user session (cron,
 *  webhook). Returns null when SUPABASE_SERVICE_ROLE_KEY is not configured
 *  so callers can degrade gracefully instead of crashing. */
export function getSupabaseAdminIfAvailable(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
