// Simple in-memory sliding window rate limiter
// Note: For production/distributed environments, replace with Redis/upstash.

export type RateLimitOptions = {
  windowMs: number; // e.g., 60_000 for 1 minute
  limit: number; // e.g., 60 requests per window
};

const store = new Map<string, number[]>();

export function checkRateLimit(
  key: string,
  { windowMs, limit }: RateLimitOptions,
): { allowed: boolean; remaining: number; resetMs: number } {
  const now = Date.now();
  const windowStart = now - windowMs;

  const timestamps = store.get(key) ?? [];
  // Drop old entries
  const recent = timestamps.filter((ts) => ts > windowStart);

  if (recent.length >= limit) {
    const resetMs = Math.max(0, windowMs - (now - recent[0]!));
    store.set(key, recent); // persist cleaned array
    return { allowed: false, remaining: 0, resetMs };
  }

  recent.push(now);
  store.set(key, recent);

  return { allowed: true, remaining: Math.max(0, limit - recent.length), resetMs: windowMs };
}

export function buildRateLimitKey(parts: Array<string | undefined | null>): string {
  return parts.filter(Boolean).join(":");
}
