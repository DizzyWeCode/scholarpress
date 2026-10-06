import type { ReactNode } from "react";

/**
 * Renders a TipTap JSON document to React nodes server-side.
 * Only whitelisted node/mark types are emitted — no raw HTML injection.
 */

interface TipTapNode {
  type?: string;
  text?: string;
  attrs?: Record<string, unknown>;
  marks?: { type: string; attrs?: Record<string, unknown> }[];
  content?: TipTapNode[];
}

function renderMarks(text: string, marks: TipTapNode["marks"], key: number): ReactNode {
  return (marks ?? []).reduce<ReactNode>((node, mark, i) => {
    const k = `${key}-${i}`;
    switch (mark.type) {
      case "bold":
        return <strong key={k}>{node}</strong>;
      case "italic":
        return <em key={k}>{node}</em>;
      case "underline":
        return <u key={k}>{node}</u>;
      case "strike":
        return <s key={k}>{node}</s>;
      case "code":
        return <code key={k}>{node}</code>;
      case "link": {
        const href = typeof mark.attrs?.href === "string" ? mark.attrs.href : "#";
        const safe = /^https?:\/\//i.test(href) || href.startsWith("/") ? href : "#";
        return (
          <a key={k} href={safe} target="_blank" rel="noopener noreferrer">
            {node}
          </a>
        );
      }
      default:
        return node;
    }
  }, text);
}

function renderNode(node: TipTapNode, key: number): ReactNode {
  const children = (node.content ?? []).map((c, i) => renderNode(c, i));

  switch (node.type) {
    case "text":
      return renderMarks(node.text ?? "", node.marks, key);
    case "paragraph":
      return children.length ? <p key={key}>{children}</p> : null;
    case "heading": {
      const level = node.attrs?.level === 3 ? 3 : 2;
      return level === 3 ? <h3 key={key}>{children}</h3> : <h2 key={key}>{children}</h2>;
    }
    case "blockquote":
      return <blockquote key={key}>{children}</blockquote>;
    case "bulletList":
      return <ul key={key}>{children}</ul>;
    case "orderedList":
      return <ol key={key}>{children}</ol>;
    case "listItem":
      return <li key={key}>{children}</li>;
    case "codeBlock":
      return (
        <pre key={key}>
          <code>{children}</code>
        </pre>
      );
    case "horizontalRule":
      return <hr key={key} />;
    case "hardBreak":
      return <br key={key} />;
    case "image": {
      const src = typeof node.attrs?.src === "string" ? node.attrs.src : "";
      if (!/^https?:\/\//i.test(src)) return null;
      const alt = typeof node.attrs?.alt === "string" ? node.attrs.alt : "";
      const credit = typeof node.attrs?.title === "string" ? node.attrs.title : "";
      return (
        <figure key={key}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={src} alt={alt} loading="lazy" />
          {credit ? (
            <figcaption className="mt-2 text-center font-sans text-xs text-ink-4">
              {credit}
            </figcaption>
          ) : null}
        </figure>
      );
    }
    default:
      return children.length ? <span key={key}>{children}</span> : null;
  }
}

export function ArticleBody({
  doc,
}: {
  doc: Record<string, unknown> | null;
}) {
  if (!doc) return null;
  const root = doc as TipTapNode;
  return (
    <div className="article-body">
      {(root.content ?? []).map((n, i) => renderNode(n, i))}
    </div>
  );
}
