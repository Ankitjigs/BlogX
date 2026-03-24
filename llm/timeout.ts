const DEFAULT_TIMEOUT_MS = Number(process.env.AI_TIMEOUT_MS || 12000);

export const isServerless =
  process.env.VERCEL === "1" || process.env.AWS_LAMBDA_FUNCTION_NAME != null;

export async function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs?: number,
): Promise<T> {
  const effectiveTimeout = timeoutMs ?? DEFAULT_TIMEOUT_MS;
  let timer: NodeJS.Timeout | null = null;

  const timeoutPromise = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error("LLM_TIMEOUT")), effectiveTimeout);
  });

  try {
    return await Promise.race([promise, timeoutPromise]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}
