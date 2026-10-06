import { redirect } from "next/navigation";
import { getSupabaseServer, isSupabaseConfigured } from "@/lib/supabase/server";

function safeNext(path: string) {
  return path.startsWith("/") && !path.startsWith("//") ? path : "/account";
}

export async function requireSignedIn(next: string) {
  if (!isSupabaseConfigured()) {
    redirect(`/login?next=${encodeURIComponent(safeNext(next))}`);
  }

  const supabase = getSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect(`/login?next=${encodeURIComponent(safeNext(next))}`);
  return { supabase, user };
}
