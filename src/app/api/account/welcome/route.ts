import { NextResponse } from "next/server";
import { ensureWelcomeEmail } from "@/lib/email/welcome";
import { getSupabaseServer } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

/** Fire-once welcome email for the signed-in user. Called by the account page;
 *  idempotent (email_sends + Resend Idempotency-Key), so extra calls are no-ops.
 *  Always returns 200 when the user is signed in so the client can ignore it. */
export async function POST() {
  const supabase = getSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || !user.email) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  let fullName: string | null = null;
  try {
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("id", user.id)
      .maybeSingle();
    fullName = profile?.full_name ?? null;
  } catch {
    // profile may be unreadable — fall back to the email prefix
  }

  const result = await ensureWelcomeEmail({
    userId: user.id,
    email: user.email,
    fullName: fullName ?? (user.user_metadata?.full_name as string | undefined) ?? null,
  });
  return NextResponse.json(result);
}
