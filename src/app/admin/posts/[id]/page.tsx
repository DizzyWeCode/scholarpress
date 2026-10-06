import { getSupabaseServer } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { PostEditor } from "@/components/post-editor";
import type { Post } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function EditPostPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = getSupabaseServer();
  const { data } = await supabase
    .from("posts")
    .select("*")
    .eq("id", params.id)
    .single();
  if (!data) notFound();

  return (
    <div>
      <h1 className="font-serif text-3xl tracking-tight text-ink">Edit post</h1>
      <div className="mt-8">
        <PostEditor post={data as Post} />
      </div>
    </div>
  );
}
