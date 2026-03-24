import Groq from "groq-sdk";
import { z } from "zod";
import { LlmError, toLlmError } from "./errors";
import { isServerless, withTimeout } from "./timeout";
import type { GenerateJsonInput, GenerateJsonOutput, LlmProvider } from "@/types/llm";

const DEFAULT_MODEL = "openai/gpt-oss-120b";

export class GroqProvider implements LlmProvider {
  readonly provider = "groq" as const;
  private client: Groq | null = null;

  private getClient(): Groq {
    if (!process.env.GROQ_API_KEY) {
      throw new LlmError("AUTH", "GROQ_API_KEY is missing.", this.provider);
    }

    if (!isServerless) {
      if (!this.client) {
        this.client = new Groq({ apiKey: process.env.GROQ_API_KEY });
      }
      return this.client;
    }

    return new Groq({ apiKey: process.env.GROQ_API_KEY });
  }

  async generateJson<T>(
    input: GenerateJsonInput<T>,
  ): Promise<GenerateJsonOutput<T>> {
    try {
      const completion = await withTimeout(
        this.getClient().chat.completions.create({
          model: input.model || DEFAULT_MODEL,
          messages: [
            { role: "system", content: input.system },
            { role: "user", content: input.prompt },
          ],
          temperature: input.temperature ?? 0.4,
          max_completion_tokens: input.maxTokens ?? 1200,
          response_format: { type: "json_object" },
        }),
      );

      const content = completion.choices?.[0]?.message?.content;
      if (typeof content !== "string" || !content.trim()) {
        throw new LlmError(
          "BAD_RESPONSE",
          "Empty response from Groq provider.",
          this.provider,
        );
      }

      const parsed = JSON.parse(content);
      const data = input.schema.parse(parsed) as T;

      return {
        data,
        provider: this.provider,
        model: input.model || DEFAULT_MODEL,
        usage: {
          inputTokens: completion.usage?.prompt_tokens ?? undefined,
          outputTokens: completion.usage?.completion_tokens ?? undefined,
        },
      };
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new LlmError(
          "VALIDATION_ERROR",
          `Groq response validation failed: ${error.message}`,
          this.provider,
        );
      }
      throw toLlmError(error, this.provider);
    }
  }

  async testConnection(): Promise<boolean> {
    try {
      const completion = await withTimeout(
        this.getClient().chat.completions.create({
          model: DEFAULT_MODEL,
          messages: [{ role: "user", content: "Return {\"ok\":true}" }],
          max_completion_tokens: 20,
          response_format: { type: "json_object" },
        }),
        10000,
      );

      return Boolean(completion.choices?.[0]?.message?.content);
    } catch (error) {
      console.error("Groq connection test failed:", error);
      return false;
    }
  }
}

const groqProvider = new GroqProvider();
export default groqProvider;
