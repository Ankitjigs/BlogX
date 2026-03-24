import { GoogleGenAI } from "@google/genai";
import { z } from "zod";
import { LlmError, toLlmError } from "./errors";
import { isServerless, withTimeout } from "./timeout";
import type { GenerateJsonInput, GenerateJsonOutput, LlmProvider } from "@/types/llm";

const DEFAULT_MODEL = "gemini-2.5-flash-lite";

export class GeminiProvider implements LlmProvider {
  readonly provider = "gemini" as const;
  private client: GoogleGenAI | null = null;

  private getClient(): GoogleGenAI {
    if (!process.env.GEMINI_API_KEY) {
      throw new LlmError("AUTH", "GEMINI_API_KEY is missing.", this.provider);
    }

    if (!isServerless) {
      if (!this.client) {
        this.client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      }
      return this.client;
    }

    return new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }

  async generateJson<T>(
    input: GenerateJsonInput<T>,
  ): Promise<GenerateJsonOutput<T>> {
    try {
      const response = await withTimeout(
        this.getClient().models.generateContent({
          model: input.model || DEFAULT_MODEL,
          contents: input.prompt,
          config: {
            systemInstruction: input.system,
            temperature: input.temperature ?? 0.4,
            maxOutputTokens: input.maxTokens ?? 1400,
            responseMimeType: "application/json",
          },
        }),
      );

      const text = response.text;
      if (!text?.trim()) {
        throw new LlmError(
          "BAD_RESPONSE",
          "Empty response from Gemini provider.",
          this.provider,
        );
      }

      const parsed = JSON.parse(text);
      const data = input.schema.parse(parsed) as T;

      return {
        data,
        provider: this.provider,
        model: input.model || DEFAULT_MODEL,
        usage: {
          inputTokens: response.usageMetadata?.promptTokenCount ?? undefined,
          outputTokens: response.usageMetadata?.candidatesTokenCount ?? undefined,
        },
      };
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new LlmError(
          "VALIDATION_ERROR",
          `Gemini response validation failed: ${error.message}`,
          this.provider,
        );
      }
      throw toLlmError(error, this.provider);
    }
  }

  async testConnection(): Promise<boolean> {
    try {
      const response = await withTimeout(
        this.getClient().models.generateContent({
          model: DEFAULT_MODEL,
          contents: "Return {\"ok\":true}",
          config: { responseMimeType: "application/json" },
        }),
        10000,
      );

      return Boolean(response.text?.trim());
    } catch (error) {
      console.error("Gemini connection test failed:", error);
      return false;
    }
  }
}

const geminiProvider = new GeminiProvider();
export default geminiProvider;
