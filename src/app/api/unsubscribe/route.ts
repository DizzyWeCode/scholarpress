import { NextResponse } from "next/server";
import { getSupabaseAdminIfAvailable } from "@/lib/email/resend";
import { verifyUnsubscribeToken } from "@/lib/email/unsubscribe";

export const dynamic = "force-dynamic";

async function unsubscribePayload(request: Request): Promise<{
  email: string;
  token: string;
}> {
  const url = new URL(request.url);
  let email = url.searchParams.get("email") ?? "";
  let token = url.searchParams.get("token") ?? "";

  if (email && token) {
    return { email: email.trim(), token };
  }

  const contentType = request.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    const body = (await request.json()) as { email?: unknown; token?: unknown };
    email = typeof body.email === "string" ? body.email : "";
    token = typeof body.token === "string" ? body.token : "";
  } else if (contentType.includes("application/x-www-form-urlencoded")) {
    const form = new URLSearchParams(await request.text());
    email = form.get("email") ?? "";
    token = form.get("token") ?? "";
  }

  return { email: email.trim(), token };
}

export async function POST(request: Request) {
  let payload: { email: string; token: string };
  try {
    payload = await unsubscribePayload(request);
  } catch {
    return NextResponse.json({ error: "Invalid unsubscribe request." }, { status: 400 });
  }

  const { email, token } = payload;
  if (!email || !token || !verifyUnsubscribeToken(email, token)) {
    return NextResponse.json(
      { error: "Invalid unsubscribe link." },
      { status: 400 },
    );
  }

  const admin = getSupabaseAdminIfAvailable();
  if (!admin) {
    return NextResponse.json(
      {
        error:
          "Unsubscribing is not available on this deployment yet. Please sign in and unsubscribe from your account page instead.",
      },
      { status: 503 },
    );
  }

  const { data, error } = await admin
    .from("subscribers")
    .delete()
    .eq("email", email.toLowerCase())
    .select("id");

  if (error) {
    return NextResponse.json(
      { error: "Could not update your subscription. Please try again." },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true, removed: (data ?? []).length > 0 });
}
