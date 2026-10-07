"use client";

import { useEffect, useRef, useState } from "react";
import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Underline from "@tiptap/extension-underline";
import Placeholder from "@tiptap/extension-placeholder";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Code,
  SquareCode,
  Link as LinkIcon,
  Image as ImageIcon,
  Minus,
  Undo2,
  Redo2,
} from "lucide-react";
import { getSupabaseBrowser } from "@/lib/supabase/client";
import { uploadPublicImage } from "@/lib/uploads/media";

/**
 * Block-style rich text editor (TipTap).
 * Produces a JSON document — rendered safely by <ArticleBody />.
 */

function ToolbarButton({
  onClick,
  active,
  label,
  children,
}: {
  onClick: () => void;
  active?: boolean;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      aria-label={label}
      className={`rounded p-1.5 transition-colors ${
        active ? "bg-ink text-paper" : "text-ink-3 hover:bg-paper-2 hover:text-ink"
      }`}
    >
      {children}
    </button>
  );
}

function Toolbar({ editor }: { editor: Editor }) {
  const s = "h-4 w-4";
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  function setLink() {
    const previous = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("Link URL:", previous ?? "https://");
    if (url === null) return;
    if (url === "" || url === "https://") {
      editor.chain().focus().unsetLink().run();
      return;
    }
    editor.chain().focus().setLink({ href: url }).run();
  }

  function addImageUrl() {
    const url = window.prompt("Image URL (https://…):");
    if (!url) return;
    const credit = window.prompt(
      "Image credit / attribution (shown as caption, e.g. “Photo by Jane Doe”):",
    );
    editor
      .chain()
      .focus()
      .setImage({ src: url, alt: credit ?? "", title: credit ?? "" })
      .run();
  }

  async function addImageFile(file: File | undefined) {
    if (!file || uploading) return;
    setUploading(true);
    setUploadError("");
    try {
      const publicUrl = await uploadPublicImage({
        supabase: getSupabaseBrowser(),
        file,
        folder: "posts/body",
      });
      const credit = window.prompt(
        "Image credit / attribution (optional, shown as caption):",
      );
      editor
        .chain()
        .focus()
        .setImage({ src: publicUrl, alt: credit ?? "", title: credit ?? "" })
        .run();
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : "Upload failed.");
    } finally {
      setUploading(false);
      if (imageInputRef.current) imageInputRef.current.value = "";
    }
  }

  return (
    <div className="sticky top-16 z-10 flex flex-wrap items-center gap-0.5 border-b border-line bg-paper py-2">
      <ToolbarButton onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive("bold")} label="Bold">
        <Bold className={s} />
      </ToolbarButton>
      <ToolbarButton onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive("italic")} label="Italic">
        <Italic className={s} />
      </ToolbarButton>
      <ToolbarButton onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive("underline")} label="Underline">
        <UnderlineIcon className={s} />
      </ToolbarButton>
      <ToolbarButton onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive("strike")} label="Strikethrough">
        <Strikethrough className={s} />
      </ToolbarButton>
      <ToolbarButton onClick={() => editor.chain().focus().toggleCode().run()} active={editor.isActive("code")} label="Inline code">
        <Code className={s} />
      </ToolbarButton>
      <span className="mx-2 h-5 w-px bg-line" />
      <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive("heading", { level: 2 })} label="Heading">
        <Heading2 className={s} />
      </ToolbarButton>
      <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive("heading", { level: 3 })} label="Subheading">
        <Heading3 className={s} />
      </ToolbarButton>
      <span className="mx-2 h-5 w-px bg-line" />
      <ToolbarButton onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive("bulletList")} label="Bullet list">
        <List className={s} />
      </ToolbarButton>
      <ToolbarButton onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive("orderedList")} label="Numbered list">
        <ListOrdered className={s} />
      </ToolbarButton>
      <ToolbarButton onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive("blockquote")} label="Quote">
        <Quote className={s} />
      </ToolbarButton>
      <ToolbarButton onClick={() => editor.chain().focus().toggleCodeBlock().run()} active={editor.isActive("codeBlock")} label="Code block">
        <SquareCode className={s} />
      </ToolbarButton>
      <ToolbarButton onClick={() => editor.chain().focus().setHorizontalRule().run()} label="Divider">
        <Minus className={s} />
      </ToolbarButton>
      <span className="mx-2 h-5 w-px bg-line" />
      <ToolbarButton onClick={setLink} active={editor.isActive("link")} label="Link">
        <LinkIcon className={s} />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => imageInputRef.current?.click()}
        label={uploading ? "Uploading image" : "Upload image"}
      >
        <ImageIcon className={s} />
      </ToolbarButton>
      <button
        type="button"
        onClick={addImageUrl}
        className="rounded px-2 py-1.5 text-xs text-ink-3 transition-colors hover:bg-paper-2 hover:text-ink"
      >
        URL
      </button>
      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={(e) => addImageFile(e.target.files?.[0])}
      />
      {uploading ? <span className="px-2 text-xs text-ink-4">Uploading…</span> : null}
      {uploadError ? <span className="px-2 text-xs text-red-700">{uploadError}</span> : null}
      <span className="mx-2 h-5 w-px bg-line" />
      <ToolbarButton onClick={() => editor.chain().focus().undo().run()} label="Undo">
        <Undo2 className={s} />
      </ToolbarButton>
      <ToolbarButton onClick={() => editor.chain().focus().redo().run()} label="Redo">
        <Redo2 className={s} />
      </ToolbarButton>
    </div>
  );
}

export function RichEditor({
  initialContent,
  onChange,
}: {
  initialContent: Record<string, unknown> | null;
  onChange: (json: Record<string, unknown>) => void;
}) {
  const onChangeRef = useRef(onChange);
  const pendingJsonRef = useRef<Record<string, unknown> | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [2, 3] } }),
      Underline,
      Link.configure({ openOnClick: false }),
      Image,
      Placeholder.configure({
        placeholder: "Begin writing — the toolbar above formats, quotes, links, and embeds images…",
      }),
    ],
    content: initialContent ?? undefined,
    editorProps: {
      attributes: { class: "tiptap article-body py-6" },
      handleDOMEvents: {
        blur: (_view, event) => {
          const target = event.currentTarget as HTMLElement | null;
          const editorElement = target?.querySelector(".ProseMirror");
          if (editorElement && pendingJsonRef.current) {
            onChangeRef.current(pendingJsonRef.current);
            pendingJsonRef.current = null;
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
          }
          return false;
        },
      },
    },
    onUpdate: ({ editor }) => {
      pendingJsonRef.current = editor.getJSON() as Record<string, unknown>;
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        if (pendingJsonRef.current) onChangeRef.current(pendingJsonRef.current);
        pendingJsonRef.current = null;
        timeoutRef.current = null;
      }, 350);
    },
  });

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (pendingJsonRef.current) onChangeRef.current(pendingJsonRef.current);
    };
  }, []);

  if (!editor) return null;

  return (
    <div className="border border-line bg-paper" style={{ borderRadius: 7 }}>
      <div className="px-4">
        <Toolbar editor={editor} />
        <EditorContent editor={editor} className="px-1 pb-8" />
      </div>
    </div>
  );
}
