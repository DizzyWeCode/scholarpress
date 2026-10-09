import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { ArticleBody } from "@/components/article-body";
import { ReferenceList } from "@/components/reference-list";
import { getOwnerSession } from "@/lib/supabase/server";
import { getSupabaseServer } from "@/lib/supabase/server";
import type { Post } from "@/lib/types";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Post preview", robots: { index: false, follow: false } };

export default async function PostPreviewPage({ params }: { params: { id: string } }) {
  const { user, isOwner } = await getOwnerSession();
  if (!user) redirect("/login");
  if (!isOwner) notFound();
  const { data } = await getSupabaseServer().from("posts").select("*").eq("id", params.id).maybeSingle();
  const post = data as Post | null;
  if (!post) notFound();

  return (
    <article className="mx-auto max-w-3xl px-5 py-16 sm:px-8 sm:py-24">
      <p className="text-xs uppercase tracking-[0.25em] text-ink-4">Owner preview · {post.status}</p>
      <h1 className="mt-5 font-serif text-4xl leading-tight tracking-tight text-ink sm:text-5xl">{post.title || "Untitled"}</h1>
      <p className="mt-5 text-sm text-ink-3">Preview only — this route is not publicly accessible.</p>
      {post.cover_image_url ? (
        <figure className="mt-10">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={post.cover_image_url} alt={post.title} className="w-full rounded" />
        </figure>
      ) : null}
      <div className="mt-10"><ArticleBody doc={post.content} /></div>
      <ReferenceList items={post.references ?? []} />
    </article>
  );
}
