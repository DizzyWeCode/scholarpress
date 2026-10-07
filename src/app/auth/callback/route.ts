import { NextResponse } from "next/server";
import { ensureWelcomeEmail } from "@/lib/email/welcome";
import { getSupabaseServer } from "@/lib/supabase/server";

/** OAuth / magic-link callback: exchanges the auth code for a session. */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const rawNext = searchParams.get("next") ?? "/account";
  // Only allow same-origin relative redirects (block //evil.com and friends).
  const next =
    rawNext.startsWith("/") && !rawNext.startsWith("//") && !rawNext.startsWith("/\\")
      ? rawNext
      : "/account";

  if (code) {
    const supabase = getSupabaseServer();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const email = data.user?.email ?? null;
      if (email) {
        try {
          await ensureWelcomeEmail({
            userId: data.user?.id ?? "",
            email,
            fullName:
              (data.user?.user_metadata?.full_name as string | undefined) ?? null,
          });
        } catch (cause) {
          // Never block sign-in on the welcome email.
          console.warn(`welcome email failed: ${String(cause)}`);
        }
      }
      return NextResponse.redirect(`${origin}${next}`);
    }
  }
  return NextResponse.redirect(`${origin}/login?error=auth`);
}
