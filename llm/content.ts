import { createHash } from "crypto";

type JsonNode = {
  type?: string;
  text?: string;
  content?: JsonNode[];
};

export function extractTextFromTiptapContent(content: unknown): string {
  const walk = (node: JsonNode | null | undefined): string => {
    if (!node) return "";
    if (node.type === "text" && typeof node.text === "string") return node.text;
    if (!Array.isArray(node.content)) return "";
    return node.content.map(walk).join(" ");
  };

  return walk(content as JsonNode).replace(/\s+/g, " ").trim();
}

export function createPostContentHash(input: {
  title: string;
  excerpt?: string | null;
  content: unknown;
}): string {
  const normalized = JSON.stringify({
    title: input.title?.trim() || "",
    excerpt: input.excerpt?.trim() || "",
    contentText: extractTextFromTiptapContent(input.content),
  });

  return createHash("sha256").update(normalized).digest("hex");
}
