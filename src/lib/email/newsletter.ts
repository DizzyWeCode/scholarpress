import type { SupabaseClient } from "@supabase/supabase-js";
import { sendTemplate } from "./resend";
import { oneClickUnsubscribeUrl, unsubscribeUrl } from "./unsubscribe";

export interface NewsletterFields {
  subject: string;
  title: string;
  summary: string;
  articleUrl: string;
  /** Optional posts.id association recorded on each send row. */
  postId?: string | null;
}

export interface NewsletterBatchResult {
  total: number;
  sent: number;
  failed: number;
  errors: string[];
}

function friendlyName(email: string): string {
  const prefix = email.split("@")[0] ?? "there";
  return prefix.replace(/[._-]+/g, " ").trim() || "there";
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Send the newsletter template to each recipient sequentially (Resend's free
 * tier allows ~2 requests/second, hence the default 550ms gap). Stops early
 * when Resend rate-limits so a large list is not burned in one burst.
 */
export async function sendNewsletter(options: {
  recipients: string[];
  fields: NewsletterFields;
  db?: SupabaseClient | null;
  delayMs?: number;
}): Promise<NewsletterBatchResult> {
  const { recipients, fields, db = null } = options;
  const delayMs = options.delayMs ?? 550;
  const result: NewsletterBatchResult = {
    total: recipients.length,
    sent: 0,
    failed: 0,
    errors: [],
  };

  for (let i = 0; i < recipients.length; i += 1) {
    const email = recipients[i];
    const unsubscribe = unsubscribeUrl(email);
    const outcome = await sendTemplate({
      to: email,
      subject: fields.subject,
      template: "dr-fraction-newsletter",
      purpose: "newsletter",
      postId: fields.postId ?? null,
      db,
      variables: {
        SUBJECT: fields.subject,
        TITLE: fields.title,
        USER_NAME: friendlyName(email),
        SUMMARY: fields.summary,
        ARTICLE_URL: fields.articleUrl,
        UNSUBSCRIBE_URL: unsubscribe,
      },
      unsubscribeUrl: oneClickUnsubscribeUrl(email),
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
