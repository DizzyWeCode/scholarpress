import type { SupabaseClient } from "@supabase/supabase-js";
import { SITE } from "@/lib/site";
import { absoluteUrl } from "@/lib/site";
import { sendTemplate, type TemplateAlias } from "./resend";
import { oneClickUnsubscribeUrl, unsubscribeUrl } from "./unsubscribe";

export type WebinarPurpose = "webinar_announcement" | "webinar_reminder";

export interface WebinarEmailTarget {
  id: string;
  title: string;
  description?: string | null;
  starts_at: string;
  platform?: string | null;
  registration_url?: string | null;
}

export interface WebinarBatchResult {
  total: number;
  sent: number;
  failed: number;
  skipped: number;
  errors: string[];
}

const TEMPLATE: Record<WebinarPurpose, TemplateAlias> = {
  webinar_announcement: "dr-fraction-webinar-announcement",
  webinar_reminder: "dr-fraction-webinar-reminder",
};

export function formatWebinarDate(iso: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Africa/Blantyre",
    timeZoneName: "short",
  }).format(new Date(iso));
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function alreadySent(
  db: SupabaseClient | null | undefined,
  purpose: WebinarPurpose,
  webinarId: string,
): Promise<Set<string>> {
  if (!db) return new Set();
  try {
    const { data, error } = await db
      .from("email_sends")
      .select("recipient_email")
      .eq("purpose", purpose)
      .eq("webinar_id", webinarId);
    if (error) {
      console.warn(`email_sends lookup failed (${error.code}): ${error.message}`);
      return new Set();
    }
    return new Set(
      (data ?? []).map((row) => String(row.recipient_email).toLowerCase()),
    );
  } catch (cause) {
    console.warn(`email_sends lookup failed: ${String(cause)}`);
    return new Set();
  }
}

/** Send a webinar announcement or reminder to each recipient sequentially.
 *  Recipients already recorded in email_sends for this webinar + purpose are
 *  skipped (idempotent across retries and cron runs). */
export async function sendWebinarEmails(options: {
  webinar: WebinarEmailTarget;
  purpose: WebinarPurpose;
  recipients: string[];
  db?: SupabaseClient | null;
  delayMs?: number;
  /** Skip the already-sent filter (used for test sends to the owner). */
  ignoreHistory?: boolean;
}): Promise<WebinarBatchResult> {
  const { webinar, purpose, recipients, db = null } = options;
  const delayMs = options.delayMs ?? 550;

  const result: WebinarBatchResult = {
    total: recipients.length,
    sent: 0,
    failed: 0,
    skipped: 0,
    errors: [],
  };

  const sent = options.ignoreHistory
    ? new Set<string>()
    : await alreadySent(db, purpose, webinar.id);

  const webinarDate = formatWebinarDate(webinar.starts_at);
  const webinarUrl =
    webinar.registration_url?.trim() || absoluteUrl("/webinars");

  for (let i = 0; i < recipients.length; i += 1) {
    const email = recipients[i];
    if (sent.has(email.toLowerCase())) {
      result.skipped += 1;
      continue;
    }

    const unsubscribe = unsubscribeUrl(email);
    const variables: Record<string, string> =
      purpose === "webinar_announcement"
        ? {
            WEBINAR_TITLE: webinar.title,
            WEBINAR_DATE: webinarDate,
            DESCRIPTION: webinar.description?.trim() || webinar.title,
            PLATFORM: webinar.platform?.trim() || "Online",
            REGISTRATION_URL: webinarUrl,
            UNSUBSCRIBE_URL: unsubscribe,
          }
        : {
            WEBINAR_TITLE: webinar.title,
            WEBINAR_DATE: webinarDate,
            WEBINAR_URL: webinarUrl,
            SUPPORT_EMAIL: SITE.email,
          };

    const outcome = await sendTemplate({
      to: email,
      subject:
        purpose === "webinar_announcement"
          ? `Upcoming webinar: ${webinar.title}`
          : `Reminder: ${webinar.title}`,
      template: TEMPLATE[purpose],
      purpose,
      webinarId: webinar.id,
      variables,
      db,
      unsubscribeUrl: oneClickUnsubscribeUrl(email),
      idempotencyKey: `webinar:${purpose}:${webinar.id}:${email.toLowerCase()}`,
    });

    if (outcome.ok) {
      result.sent += 1;
    } else {
      result.failed += 1;
      if (result.errors.length < 5) {
        result.errors.push(`${email}: ${outcome.error ?? "unknown error"}`);
      }
      if (outcome.error?.includes("429")) {
        result.errors.push("Stopped early: Resend rate limit (429).");
        break;
      }
    }

    if (i < recipients.length - 1 && delayMs > 0) await sleep(delayMs);
  }

  return result;
}
