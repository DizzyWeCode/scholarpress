import { PostEditor } from "@/components/post-editor";

export const dynamic = "force-dynamic";

export default function NewPostPage() {
  return (
    <div>
      <h1 className="font-serif text-3xl tracking-tight text-ink">New post</h1>
      <div className="mt-8">
        <PostEditor />
      </div>
    </div>
  );
}
