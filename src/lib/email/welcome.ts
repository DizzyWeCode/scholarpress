import type { SupabaseClient } from "@supabase/supabase-js";
import { SITE, absoluteUrl } from "@/lib/site";
import { getSupabaseAdminIfAvailable, hasResendConfig, sendTemplate } from "./resend";

export interface WelcomeResult {
  sent: boolean;
  skipped?: boolean;
  reason?: string;
}

function prettify(value: string): string {
  return value
    .replace(/[._-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

/** Send the welcome email once per user. Idempotent: checks email_sends for a
 *  prior welcome row and also passes a Resend Idempotency-Key. Degrades to
 *  { sent: false } when the service-role key or RESEND_API_KEY is missing —
 *  without the service role there is no safe way to record/lookup, and a blind
 *  send would repeat on every visit. */
export async function ensureWelcomeEmail(options: {
  userId: string;
  email: string;
  fullName?: string | null;
}): Promise<WelcomeResult> {
  const { userId, email } = options;
  if (!email) return { sent: false, reason: "no email address" };
  if (!hasResendConfig()) return { sent: false, reason: "email not configured" };

  const db = getSupabaseAdminIfAvailable();
  if (!db) return { sent: false, reason: "idempotency not configured" };

  try {
    const { data: existing, error } = await db
      .from("email_sends")
      .select("id")
      .eq("purpose", "welcome")
      .eq("recipient_email", email.toLowerCase())
      .limit(1);
    if (error) {
      console.warn(`welcome lookup failed (${error.code}): ${error.message}`);
      return { sent: false, reason: "lookup failed" };
    }
    if (existing && existing.length > 0) return { sent: false, skipped: true };
  } catch (cause) {
    console.warn(`welcome lookup failed: ${String(cause)}`);
    return { sent: false, reason: "lookup failed" };
  }

  const userName =
    options.fullName?.trim() ||
    prettify(email.split("@")[0] ?? "there");

  const outcome = await sendTemplate({
    to: email,
    subject: "Welcome to Dr Fraction",
    template: "dr-fraction-welcome",
    purpose: "welcome",
    variables: {
      USER_NAME: userName,
      SIGN_IN_URL: absoluteUrl("/account"),
      SUPPORT_EMAIL: SITE.email,
    },
    db,
    idempotencyKey: `welcome:${userId}`,
  });

  if (!outcome.ok) {
    console.warn(`welcome email failed for ${email}: ${outcome.error}`);
    return { sent: false, reason: outcome.error ?? "send failed" };
  }
  return { sent: true };
}
