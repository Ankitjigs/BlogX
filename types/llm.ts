import { z } from "zod";

export type LlmTaskType =
  | "editor_suggestions"
  | "rewrite_selection"
  | "post_summary"
  | "publish_checks"
  | "ai_chat";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
}

export type EditorSuggestionField =
  | "title"
  | "slug"
  | "excerpt"
  | "tags"
  | "metaTitle"
  | "metaDescription";

export type LlmProviderName = "groq" | "gemini";

export type LlmErrorCode =
  | "TIMEOUT"
  | "RATE_LIMIT"
  | "AUTH"
  | "BAD_RESPONSE"
  | "SERVICE_ERROR"
  | "VALIDATION_ERROR";

export interface LlmUsage {
  inputTokens?: number;
  outputTokens?: number;
}

export interface GenerateJsonInput<T> {
  task: LlmTaskType;
  system: string;
  prompt: string;
  schema: z.ZodSchema<T>;
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

export interface GenerateJsonOutput<T> {
  data: T;
  provider: LlmProviderName;
  model: string;
  usage?: LlmUsage;
}

export interface LlmProvider {
  readonly provider: LlmProviderName;
  generateJson<T>(input: GenerateJsonInput<T>): Promise<GenerateJsonOutput<T>>;
  testConnection(): Promise<boolean>;
}

export const EditorSuggestionsSchema = z.object({
  titleVariants: z.array(z.string().min(1)).max(5).default([]),
  excerptVariants: z.array(z.string().min(1)).max(5).default([]),
  metaTitleVariants: z.array(z.string().min(1)).max(5).default([]),
  metaDescriptionVariants: z.array(z.string().min(1)).max(5).default([]),
  tagSuggestions: z.array(z.string().min(1)).max(10).default([]),
});

export type EditorSuggestions = z.infer<typeof EditorSuggestionsSchema>;

export const EditorFieldSuggestionsSchema = z.object({
  suggestions: z.array(z.string().min(1)).max(8).default([]),
});

export type EditorFieldSuggestions = z.infer<
  typeof EditorFieldSuggestionsSchema
>;

export const RewriteSelectionSchema = z.object({
  rewrittenText: z.string().min(1),
});

export type RewriteSelection = z.infer<typeof RewriteSelectionSchema>;

export const PostSummarySchema = z.object({
  short: z.string().min(1),
  long: z.string().min(1),
  bullets: z.array(z.string().min(1)).max(6).default([]),
});

export type PostSummary = z.infer<typeof PostSummarySchema>;

const VALID_ISSUE_FIELDS = [
  "title",
  "excerpt",
  "metaTitle",
  "metaDescription",
  "tags",
  "content",
] as const;

export const PublishCheckIssueSchema = z.object({
  severity: z.enum(["low", "medium", "high"]),
  title: z.string().min(1),
  why: z.string().min(1),
  suggestedFix: z.string().min(1),
  field: z
    .preprocess(
      (v) =>
        typeof v === "string" &&
        (VALID_ISSUE_FIELDS as readonly string[]).includes(v)
          ? v
          : undefined,
      z.enum(VALID_ISSUE_FIELDS).optional(),
    )
    .optional(),
  suggestedValue: z
    .preprocess(
      (v) =>
        Array.isArray(v)
          ? v.filter((i) => typeof i === "string").join(", ") || undefined
          : typeof v === "string"
            ? v
            : undefined,
      z.string().optional(),
    )
    .optional(),
});

export const PublishChecksSchema = z.object({
  score: z.number().min(0).max(100),
  issues: z.array(PublishCheckIssueSchema).default([]),
});

export type PublishChecks = z.infer<typeof PublishChecksSchema>;
