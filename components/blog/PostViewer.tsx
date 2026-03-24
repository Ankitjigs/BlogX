"use client";

import Image from "next/image";
import Link from "next/link";
import CodeBlock from "./CodeBlock";

interface JSONContent {
  type?: string;
  content?: JSONContent[];
  text?: string;
  attrs?: Record<string, unknown>;
  marks?: { type: string; attrs?: Record<string, unknown> }[];
}

interface PostViewerProps {
  content: JSONContent;
}

const RenderNode = ({ node }: { node: JSONContent }) => {
  if (!node) return null;

  // Handle text nodes
  if (node.type === "text" && node.text) {
    let content: React.ReactNode = node.text;

    // Apply marks
    if (node.marks) {
      node.marks.forEach((mark) => {
        if (mark.type === "bold") {
          content = <strong>{content}</strong>;
        } else if (mark.type === "italic") {
          content = <em>{content}</em>;
        } else if (mark.type === "strike") {
          content = <s>{content}</s>;
        } else if (mark.type === "underline") {
          content = <u>{content}</u>;
        } else if (mark.type === "code") {
          content = (
            <code className="rounded bg-muted px-1 py-0.5 font-mono text-sm">
              {content}
            </code>
          );
        } else if (mark.type === "link") {
          const href = (mark.attrs?.href as string) || "#";
          const isInternal =
            href.startsWith("/") ||
            (typeof window !== "undefined" &&
              href.startsWith(window.location.origin));

          if (isInternal) {
            content = (
              <Link
                href={href}
                className="text-primary hover:underline underline-offset-4"
              >
                {content}
              </Link>
            );
          } else {
            content = (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline underline-offset-4"
              >
                {content}
              </a>
            );
          }
        }
      });
    }
    return <>{content}</>;
  }

  // Render children
  const children = node.content?.map((child, index) => (
    <RenderNode key={index} node={child} />
  ));

  switch (node.type) {
    case "doc":
      return <>{children}</>;

    case "paragraph":
      return <p className="leading-7 not-first:mt-6">{children}</p>;

    case "heading":
      const level = (node.attrs?.level as number) || 1;
      const Tag = `h${level}` as React.ElementType; // Casting to React.ElementType
      const classes =
        {
          1: "scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl mb-8 mt-10",
          2: "scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0 mb-6 mt-10",
          3: "scroll-m-20 text-2xl font-semibold tracking-tight mb-4 mt-8",
          4: "scroll-m-20 text-xl font-semibold tracking-tight mb-4 mt-6",
        }[level as 1 | 2 | 3 | 4] || ""; // Ensure level is treated as a valid key
      return <Tag className={classes}>{children}</Tag>;

    case "bulletList":
      return <ul className="my-6 ml-6 list-disc [&>li]:mt-2">{children}</ul>;

    case "orderedList":
      return <ol className="my-6 ml-6 list-decimal [&>li]:mt-2">{children}</ol>;

    case "listItem":
      return <li>{children}</li>;

    case "blockquote":
      return (
        <blockquote className="mt-6 border-l-2 border-primary pl-6 italic text-muted-foreground">
          {children}
        </blockquote>
      );

    case "codeBlock":
      return <CodeBlock>{children}</CodeBlock>;

    case "horizontalRule":
      return <hr className="my-8 border-muted" />;

    case "hardBreak":
      return <br />;

    case "image":
      const src = node.attrs?.src as string;
      const alt = (node.attrs?.alt as string) || "Blog post image";

      if (!src) return null;

      return (
        <div className="relative my-8 aspect-video w-full overflow-hidden rounded-lg border bg-muted">
          <Image
            src={src}
            alt={alt}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>
      );

    default:
      return <>{children}</>;
  }
};

export default function PostViewer({ content }: PostViewerProps) {
  if (!content || !content.content) {
    return <p className="text-muted-foreground">No content available</p>;
  }

  return (
    <div className="relative w-full max-w-none text-foreground">
      <RenderNode node={content} />
    </div>
  );
}
