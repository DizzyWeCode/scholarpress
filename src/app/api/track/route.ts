import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const RATE_WINDOW_MS = 60_000;
const MAX_VIEWS_PER_PATH_PER_WINDOW = 60;
const pathRate = new Map<string, { windowStart: number; count: number }>();

function isValidPath(value: unknown): value is string {
  return (
    typeof value === "string" &&
    value.length > 0 &&
    value.length <= 300 &&
    value.startsWith("/") &&
    !/[\u0000-\u001f\u007f]/.test(value)
  );
}

function isKnownBot(userAgent: string | null): boolean {
  return /bot|crawler|spider|headless|preview/i.test(userAgent ?? "");
}

function allowPathView(path: string, now = Date.now()): boolean {
  const current = pathRate.get(path);
  if (!current || now - current.windowStart >= RATE_WINDOW_MS) {
    pathRate.set(path, { windowStart: now, count: 1 });
    if (pathRate.size > 1_000) {
      for (const [key, value] of pathRate) {
        if (now - value.windowStart >= RATE_WINDOW_MS) pathRate.delete(key);
      }
    }
    return true;
  }
  if (current.count >= MAX_VIEWS_PER_PATH_PER_WINDOW) return false;
  current.count += 1;
  return true;
}

/**
 * Privacy-respecting page-view beacon.
 * Called by the client-side tracker only after the visitor accepts cookies.
 * Stores: path, referrer host, user agent. No fingerprints, no IPs.
 */
export async function POST(request: Request) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) return NextResponse.json({ ok: false }, { status: 503 });

  let body: { path?: unknown } = {};
  try {
    body = (await request.json()) as { path?: unknown };
  } catch {
    // A missing body falls back to the root path; malformed JSON is harmless.
  }

  const path = body.path === undefined ? "/" : body.path;
  if (!isValidPath(path)) {
    return NextResponse.json({ ok: false, error: "Invalid path" }, { status: 400 });
  }

  const userAgent = request.headers.get("user-agent")?.slice(0, 300) ?? null;
  if (isKnownBot(userAgent) || !allowPathView(path)) {
    return NextResponse.json({ ok: true, skipped: true });
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
    user_agent: userAgent,
  });

  return NextResponse.json({ ok: true });
}
