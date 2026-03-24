import type { EditorSuggestionField } from "@/types/llm";

type PostPromptInput = {
  title: string;
  excerpt?: string | null;
  metaTitle?: string | null;
  metaDescription?: string | null;
  slug?: string | null;
  tags: string[];
  contentText: string;
};

export const SYSTEM_PROMPTS = {
  editorSuggestions:
    "You are a professional blog editor. Return concise, high quality, non-generic writing suggestions in valid JSON only.",
  rewriteSelection:
    "You are a professional editor. Rewrite text based on the instruction, preserving facts and intent. Return valid JSON only.",
  postSummary:
    "You summarize blog posts for readers. Keep factual fidelity and return valid JSON only.",
  publishChecks:
    "You are a publication quality reviewer focused on readability, SEO, and structure. Return valid JSON only.",
} as const;

export function buildFieldSuggestionPrompt(args: {
  field: EditorSuggestionField;
  post: PostPromptInput;
}): string {
  const baseContext = [
    `Current title: ${args.post.title || "(empty)"}`,
    `Current slug: ${args.post.slug || "(empty)"}`,
    `Current excerpt: ${args.post.excerpt || "(empty)"}`,
    `Current meta title: ${args.post.metaTitle || "(empty)"}`,
    `Current meta description: ${args.post.metaDescription || "(empty)"}`,
    `Current tags: ${args.post.tags.join(", ") || "(none)"}`,
    `Post content:\n${args.post.contentText}`,
  ];

  const fieldInstructions: Record<EditorSuggestionField, string[]> = {
    title: [
      "Generate 4 compelling blog title suggestions.",
      'Return JSON with only: {"suggestions": ["..."]}.',
      "Keep titles specific, readable, and non-clickbait.",
    ],
    slug: [
      "Generate 4 slug suggestions for this blog post.",
      'Return JSON with only: {"suggestions": ["..."]}.',
      "Each suggestion must be lowercase, hyphen-separated, URL-safe, and must not include a domain or slash.",
    ],
    excerpt: [
      "Generate 4 excerpt suggestions for this blog post.",
      'Return JSON with only: {"suggestions": ["..."]}.',
      "Each excerpt should be 1-2 sentences and useful for preview cards.",
    ],
    tags: [
      "Generate up to 8 tag suggestions for this blog post.",
      'Return JSON with only: {"suggestions": ["..."]}.',
      "Return plain topic tags only. No hashtags, no punctuation-heavy tags, no duplicates.",
    ],
    metaTitle: [
      "Generate 4 SEO meta title suggestions.",
      'Return JSON with only: {"suggestions": ["..."]}.',
      "Keep them under roughly 60 characters and optimized for search clarity.",
    ],
    metaDescription: [
      "Generate 4 SEO meta description suggestions.",
      'Return JSON with only: {"suggestions": ["..."]}.',
      "Keep them under roughly 160 characters and make them search-friendly.",
    ],
  };

  return [...fieldInstructions[args.field], ...baseContext].join("\n");
}

export function buildRewritePrompt(args: {
  selectedText: string;
  instruction: string;
  postContext?: string;
}): string {
  return [
    "Rewrite the selected text using the given instruction.",
    "Return JSON with key: rewrittenText.",
    `Instruction: ${args.instruction}`,
    `Selected text:\n${args.selectedText}`,
    args.postContext ? `Post context:\n${args.postContext}` : "",
  ]
    .filter(Boolean)
    .join("\n");
}

export function buildPostSummaryPrompt(input: PostPromptInput): string {
  return [
    "Create a reader-friendly summary for this post.",
    "Return JSON with keys: short, long, bullets.",
    "short: 1-2 lines. long: 1 paragraph. bullets: 3-6 key takeaways.",
    `Title: ${input.title || "(empty)"}`,
    `Excerpt: ${input.excerpt || "(empty)"}`,
    `Content:\n${input.contentText}`,
  ].join("\n");
}

export function buildPublishChecksPrompt(input: PostPromptInput): string {
  return [
    "Evaluate this post for publish readiness.",
    "Return JSON with keys: score (0-100), issues[].",
    "Each issue must include: severity, title, why, suggestedFix, optional field, optional suggestedValue.",
    "Focus on readability, structure, metadata quality, and clarity.",
    `Title: ${input.title || "(empty)"}`,
    `Excerpt: ${input.excerpt || "(empty)"}`,
    `Meta title: ${input.metaTitle || "(empty)"}`,
    `Meta description: ${input.metaDescription || "(empty)"}`,
    `Tags: ${input.tags.join(", ") || "(none)"}`,
    `Content:\n${input.contentText}`,
  ].join("\n");
}
