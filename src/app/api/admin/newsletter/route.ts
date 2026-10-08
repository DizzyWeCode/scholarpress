import { NextResponse } from "next/server";
import { sendNewsletter } from "@/lib/email/newsletter";
import { hasResendConfig } from "@/lib/email/resend";
import { absoluteUrl } from "@/lib/site";
import { getOwnerSession, getSupabaseServer } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const MAX_RECIPIENTS = 5000;

function isValidHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export async function POST(request: Request) {
  const { user, isOwner } = await getOwnerSession();
  if (!user || !isOwner) {
    return NextResponse.json(
      { error: "Owner access required." },
      { status: 403 },
    );
  }

  if (!hasResendConfig()) {
    return NextResponse.json(
      { error: "Email sending is not configured (RESEND_API_KEY missing)." },
      { status: 503 },
    );
  }

  let body: {
    mode?: unknown;
    testEmail?: unknown;
    subject?: unknown;
    title?: unknown;
    summary?: unknown;
    articleUrl?: unknown;
    postId?: unknown;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const mode = body.mode === "test" ? "test" : body.mode === "all" ? "all" : null;
  if (!mode) {
    return NextResponse.json(
      { error: 'mode must be "test" or "all".' },
      { status: 400 },
    );
  }

  const subject = typeof body.subject === "string" ? body.subject.trim() : "";
  const title = typeof body.title === "string" ? body.title.trim() : "";
  const summary =
    typeof body.summary === "string" ? body.summary.trim() : "";
  const articleUrl =
    typeof body.articleUrl === "string" ? body.articleUrl.trim() : "";
  const postId = typeof body.postId === "string" ? body.postId : null;

  if (!subject || !title || !summary) {
    return NextResponse.json(
      { error: "Subject, title and summary are required." },
      { status: 400 },
    );
  }
  if (articleUrl && !isValidHttpUrl(articleUrl)) {
    return NextResponse.json(
      { error: "Article URL must be a valid http(s) URL." },
      { status: 400 },
    );
  }
  const finalArticleUrl = articleUrl || absoluteUrl("/blog");

  let recipients: string[] = [];
  if (mode === "test") {
    const testEmail =
      typeof body.testEmail === "string" ? body.testEmail.trim() : "";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(testEmail)) {
      return NextResponse.json(
        { error: "A valid test email address is required." },
        { status: 400 },
      );
    }
    recipients = [testEmail];
  } else {
    const supabase = getSupabaseServer();
    const { data, error } = await supabase
      .from("subscribers")
      .select("email")
      .limit(MAX_RECIPIENTS);
    if (error) {
      return NextResponse.json(
        { error: `Could not load subscribers: ${error.message}` },
        { status: 500 },
      );
    }
    recipients = Array.from(
      new Set((data ?? []).map((row) => String(row.email).toLowerCase())),
    );
    if (recipients.length === 0) {
      return NextResponse.json(
        { error: "No subscribers to send to." },
        { status: 400 },
      );
    }
  }

  const result = await sendNewsletter({
    recipients,
    fields: { subject, title, summary, articleUrl: finalArticleUrl, postId },
    db: getSupabaseServer(),
  });

  return NextResponse.json({ ok: true, mode, ...result });
}
