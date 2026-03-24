import geminiProvider from "./gemini-provider";
import groqProvider from "./groq-provider";
import { LlmError, toLlmError } from "./errors";
import type { GenerateJsonInput, GenerateJsonOutput, LlmProvider, LlmTaskType } from "@/types/llm";

const RETRYABLE_CODES = new Set([
  "TIMEOUT",
  "RATE_LIMIT",
  "SERVICE_ERROR",
  "BAD_RESPONSE",
]);

const TASK_PRIMARY_PROVIDER: Record<LlmTaskType, "groq" | "gemini"> = {
  editor_suggestions: "groq",
  rewrite_selection: "groq",
  post_summary: "gemini",
  publish_checks: "gemini",
};

const TASK_MODEL: Record<LlmTaskType, { groq: string; gemini: string }> = {
  editor_suggestions: {
    groq: "openai/gpt-oss-120b",
    gemini: "gemini-2.5-flash-lite",
  },
  rewrite_selection: {
    groq: "openai/gpt-oss-120b",
    gemini: "gemini-2.5-flash-lite",
  },
  post_summary: {
    groq: "openai/gpt-oss-120b",
    gemini: "gemini-2.5-flash",
  },
  publish_checks: {
    groq: "openai/gpt-oss-120b",
    gemini: "gemini-2.5-flash",
  },
};

export class ProviderManager {
  private providers: Record<"groq" | "gemini", LlmProvider> = {
    groq: groqProvider,
    gemini: geminiProvider,
  };

  async generateJson<T>(
    input: GenerateJsonInput<T>,
  ): Promise<GenerateJsonOutput<T>> {
    const primaryName = TASK_PRIMARY_PROVIDER[input.task];
    const fallbackName = primaryName === "groq" ? "gemini" : "groq";
    const primary = this.providers[primaryName];
    const fallback = this.providers[fallbackName];

    const primaryInput: GenerateJsonInput<T> = {
      ...input,
      model: input.model || TASK_MODEL[input.task][primaryName],
    };

    try {
      return await primary.generateJson(primaryInput);
    } catch (error) {
      const normalized = toLlmError(error, primary.provider);
      if (!RETRYABLE_CODES.has(normalized.code)) {
        throw normalized;
      }

      const fallbackInput: GenerateJsonInput<T> = {
        ...input,
        model: TASK_MODEL[input.task][fallbackName],
      };

      try {
        return await fallback.generateJson(fallbackInput);
      } catch (fallbackError) {
        const fallbackNormalized = toLlmError(fallbackError, fallback.provider);
        throw new LlmError(
          fallbackNormalized.code,
          `Primary provider failed (${normalized.message}) and fallback failed (${fallbackNormalized.message}).`,
        );
      }
    }
  }

  async testConnections(): Promise<{ groq: boolean; gemini: boolean }> {
    const [groq, gemini] = await Promise.all([
      this.providers.groq.testConnection(),
      this.providers.gemini.testConnection(),
    ]);
    return { groq, gemini };
  }
}

const providerManager = new ProviderManager();
export default providerManager;
