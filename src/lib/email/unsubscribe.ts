import crypto from "crypto";
import { absoluteUrl } from "@/lib/site";

/** Key used to sign unsubscribe links. Prefers an explicit secret, then the
 *  cron secret, then the Resend API key so links work on deployments that
 *  have not added CRON_SECRET yet. */
function signingKey(): Buffer {
  const secret =
    process.env.UNSUBSCRIBE_SECRET ??
    process.env.CRON_SECRET ??
    process.env.RESEND_API_KEY ??
    "dr-fraction-unsigned-unsubscribe";
  return crypto.createHash("sha256").update(secret).digest();
}

const TOKEN_LENGTH = 32;

export function unsubscribeToken(email: string): string {
  return crypto
    .createHmac("sha256", signingKey())
    .update(email.trim().toLowerCase())
    .digest("hex")
    .slice(0, TOKEN_LENGTH);
}

export function verifyUnsubscribeToken(email: string, token: string): boolean {
  const normalizedEmail = email.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) return false;
  if (!/^[0-9a-f]+$/i.test(token) || token.length !== TOKEN_LENGTH) return false;
  const expected = Buffer.from(unsubscribeToken(normalizedEmail), "hex");
  const actual = Buffer.from(token.toLowerCase(), "hex");
  return (
    expected.length === actual.length && crypto.timingSafeEqual(expected, actual)
  );
}

export function unsubscribeUrl(email: string): string {
  const params = new URLSearchParams({
    email: email.trim().toLowerCase(),
    token: unsubscribeToken(email),
  });
  return absoluteUrl(`/unsubscribe?${params.toString()}`);
}

export function oneClickUnsubscribeUrl(email: string): string {
  const params = new URLSearchParams({
    email: email.trim().toLowerCase(),
    token: unsubscribeToken(email),
  });
  return absoluteUrl(`/api/unsubscribe?${params.toString()}`);
}
