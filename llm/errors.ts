import type { LlmErrorCode } from "@/types/llm";

export class LlmError extends Error {
  code: LlmErrorCode;
  provider?: string;

  constructor(code: LlmErrorCode, message: string, provider?: string) {
    super(message);
    this.name = "LlmError";
    this.code = code;
    this.provider = provider;
  }
}

export function toLlmError(
  error: unknown,
  provider: string,
  fallbackCode: LlmErrorCode = "SERVICE_ERROR",
): LlmError {
  if (error instanceof LlmError) return error;

  const e = error as { message?: string; status?: number; code?: string };
  const message = e?.message || "Unknown provider error";

  if (message === "LLM_TIMEOUT" || e?.code === "ETIMEDOUT") {
    return new LlmError("TIMEOUT", "The AI request timed out.", provider);
  }
  if (e?.status === 429) {
    return new LlmError("RATE_LIMIT", "Rate limit exceeded.", provider);
  }
  if (e?.status === 401 || message.toLowerCase().includes("api key")) {
    return new LlmError("AUTH", "Provider authentication failed.", provider);
  }
  if (message.toLowerCase().includes("json")) {
    return new LlmError("BAD_RESPONSE", "Provider returned invalid JSON.", provider);
  }

  return new LlmError(fallbackCode, message, provider);
}
