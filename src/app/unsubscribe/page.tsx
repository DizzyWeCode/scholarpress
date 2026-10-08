import type { Metadata } from "next";
import Link from "next/link";
import { verifyUnsubscribeToken } from "@/lib/email/unsubscribe";
import UnsubscribeButton from "./unsubscribe-button";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Unsubscribe",
  robots: { index: false },
};

export default function UnsubscribePage({
  searchParams,
}: {
  searchParams: { email?: string; token?: string };
}) {
  const email = (searchParams.email ?? "").trim();
  const token = searchParams.token ?? "";
  const valid = Boolean(email) && verifyUnsubscribeToken(email, token);

  return (
    <div className="mx-auto max-w-2xl px-5 py-20 sm:px-8">
      <p className="text-xs uppercase tracking-[0.25em] text-ink-4">
        Newsletter
      </p>
      <h1 className="mt-5 font-serif text-4xl tracking-tight text-ink">
        Unsubscribe
      </h1>

      {valid ? (
        <div className="mt-6 space-y-6">
          <p className="text-sm leading-relaxed text-ink-2">
            This link will remove{" "}
            <span className="text-ink">{email}</span> from the Dr Fraction
            newsletter list. You can subscribe again at any time from the
            homepage.
          </p>
          <UnsubscribeButton email={email} token={token} />
        </div>
      ) : (
        <div className="mt-6 space-y-6">
          <p className="text-sm leading-relaxed text-ink-2">
            This unsubscribe link is missing or invalid — it may have been
            truncated by your email client. If you have an account on this
            site, you can manage your subscription from your account page.
          </p>
          <p className="text-sm">
            <Link
              href="/account"
              className="underline underline-offset-2 transition-colors hover:text-ink-3"
            >
              Go to your account page
            </Link>
          </p>
        </div>
      )}
    </div>
  );
}
