// Simple in-memory sliding window rate limiter for the Telegram bot
// Note: For production with multiple replicas, replace with a distributed store (e.g., Redis)

export type RateLimitOptions = {
  windowMs: number;
  limit: number;
};

const store = new Map<string, number[]>();

export function checkRateLimit(
  key: string,
  { windowMs, limit }: RateLimitOptions,
): { allowed: boolean; remaining: number; resetMs: number } {
  const now = Date.now();
  const windowStart = now - windowMs;

  const timestamps = store.get(key) ?? [];
  const recent = timestamps.filter((ts) => ts > windowStart);

  if (recent.length >= limit) {
    const resetMs = Math.max(0, windowMs - (now - recent[0]!));
    store.set(key, recent);
    return { allowed: false, remaining: 0, resetMs };
  }

  recent.push(now);
  store.set(key, recent);

  return {
    allowed: true,
    remaining: Math.max(0, limit - recent.length),
    resetMs: windowMs,
  };
}

export function buildRateLimitKey(parts: Array<string | number | undefined | null>): string {
  return parts
    .map((p) => (p == null ? "" : typeof p === "number" ? String(p) : p))
    .filter((s) => s && s.length > 0)
    .join(":");
}
