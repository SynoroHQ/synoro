import type { Session } from "@synoro/auth";
import { auth } from "@synoro/auth";
import { db } from "@synoro/db/client";

/**
 * 1. CONTEXT
 *
 * This section defines the "contexts" that are available in the backend API.
 *
 * These allow you to access things when processing a request, like the database, the session, etc.
 *
 * This helper generates the "internals" for a tRPC context. The API handler and RSC clients each
 * wrap this and provides the required context.
 *
 * @see https://trpc.io/docs/server/context
 */
export const createTRPCContext = async (opts: {
  headers: Headers;
  session: Session | null;
}) => {
  const authToken = opts.headers.get("Authorization") ?? null;
  const source = opts.headers.get("x-trpc-source") ?? "unknown";
  // Try to extract client IP from common proxy headers
  const xff = opts.headers.get("x-forwarded-for");
  const realIp =
    opts.headers.get("x-real-ip") ||
    opts.headers.get("cf-connecting-ip") ||
    opts.headers.get("x-client-ip") ||
    undefined;
  const clientIp =
    (xff?.split(",")[0]?.trim() || realIp || undefined) ?? undefined;
  const origin = opts.headers.get("origin") ?? undefined;
  const referer = opts.headers.get("referer") ?? undefined;

  const session = await auth.api.getSession({
    headers: opts.headers,
    query: {
      disableRefresh: source === "rsc",
    },
  });

  return {
    session,
    db,
    token: authToken,
    clientIp,
    origin,
    referer,
  };
};

export type TRPCContext = Awaited<ReturnType<typeof createTRPCContext>> & {
  botUserId?: string;
  isBotRequest?: boolean;
  telegramUserId?: string;
  isTelegramAnonymous?: boolean;
  userId?: string; // For enhancedBotProcedure, userId is guaranteed to be non-null
  conversationId?: string;
};

/**
 * Hono adapter context creation
 * This is used by the Hono adapter to create context for each request
 */
export const createHonoContext = async (opts: { req: Request }) => {
  const headers = new Headers();

  // Copy headers from Hono request to Headers object
  opts.req.headers.forEach((value, key) => {
    headers.set(key, value);
  });

  return createTRPCContext({
    headers,
    session: null, // Will be populated by auth middleware
  });
};
