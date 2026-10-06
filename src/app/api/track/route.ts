import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

/**
 * Privacy-respecting page-view beacon.
 * Called by the client-side tracker only after the visitor accepts cookies.
 * Stores: path, referrer host, user agent. No fingerprints, no IPs.
 */
export async function POST(request: Request) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) return NextResponse.json({ ok: false }, { status: 503 });

  let path = "/";
  try {
    const body = await request.json();
    if (typeof body.path === "string" && body.path.startsWith("/")) {
      path = body.path.slice(0, 300);
    }
  } catch {
    // keep default
  }

  const referrerHeader = request.headers.get("referer");
  let referrer: string | null = null;
  try {
    if (referrerHeader) referrer = new URL(referrerHeader).host;
  } catch {
    referrer = null;
  }

  const supabase = createClient(url, anonKey, {
    auth: { persistSession: false },
  });
  await supabase.from("page_views").insert({
    path,
    referrer,
    user_agent: request.headers.get("user-agent")?.slice(0, 300) ?? null,
  });

  return NextResponse.json({ ok: true });
}
