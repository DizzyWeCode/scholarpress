import { NextResponse } from "next/server";
import { getSupabaseAdmin, getSupabaseServer } from "@/lib/supabase/server";

export async function POST() {
  const supabase = getSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  let admin: ReturnType<typeof getSupabaseAdmin>;
  try {
    admin = getSupabaseAdmin();
  } catch {
    return NextResponse.json(
      { error: "Account deletion is not configured on this deployment." },
      { status: 503 },
    );
  }
  const { error: subscriberError } = await admin
    .from("subscribers")
    .delete()
    .eq("user_id", user.id);
  if (subscriberError) return NextResponse.json({ error: subscriberError.message }, { status: 500 });

  const { error: commentError } = await admin
    .from("comments")
    .update({ user_id: null, author_name: "Deleted user", body: "Comment removed.", status: "deleted" })
    .eq("user_id", user.id);
  if (commentError) return NextResponse.json({ error: commentError.message }, { status: 500 });

  const { error } = await admin.auth.admin.deleteUser(user.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
