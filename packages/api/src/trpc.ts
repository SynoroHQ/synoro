/**
 * YOU PROBABLY DON'T NEED TO EDIT THIS FILE, UNLESS:
 * 1. You want to modify request context (see Part 1)
 * 2. You want to create a new middleware or type of procedure (see Part 3)
 *
 * tl;dr - this is where all the tRPC server stuff is created and plugged in.
 * The pieces you will need to use are documented accordingly near the end
 */
import crypto from "crypto";
import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import { ZodError } from "zod";

import type { Session } from "@synoro/auth";
import { auth } from "@synoro/auth";
import { db } from "@synoro/db/client";

import { env } from "../env";
import { buildRateLimitKey, checkRateLimit } from "./lib/rate-limit";

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
  telegramChatId?: string;
  isTelegramAnonymous?: boolean;
};

/**
 * Express adapter context creation
 * This is used by the Express adapter to create context for each request
 */
export const createExpressContext = async (
  opts: CreateExpressContextOptions,
) => {
  const headers = new Headers();

  // Copy headers from Express request to Headers object
  Object.entries(opts.req.headers).forEach(([key, value]) => {
    if (typeof value === "string") {
      headers.set(key, value);
    } else if (Array.isArray(value)) {
      headers.set(key, value.join(", "));
    }
  });

  return createTRPCContext({
    headers,
    session: null, // Will be populated by auth middleware
  });
};

/**
 * 2. INITIALIZATION
 *
 * This is where the trpc api is initialized, connecting the context and
 * transformer
 */
const t = initTRPC.context<typeof createTRPCContext>().create({
  transformer: superjson,
  errorFormatter: ({ shape, error }) => ({
    ...shape,
    data: {
      ...shape.data,
      zodError: error.cause instanceof ZodError ? error.cause.flatten() : null,
    },
  }),
});

/**
 * Create a server-side caller
 * @see https://trpc.io/docs/server/server-side-calls
 */
export const createCallerFactory = t.createCallerFactory;

/**
 * 3. ROUTER & PROCEDURE (THE IMPORTANT BIT)
 *
 * These are the pieces you use to build your tRPC API. You should import these
 * a lot in the /src/server/api/routers folder
 */

/**
 * This is how you create new routers and subrouters in your tRPC API
 * @see https://trpc.io/docs/router
 */
export const createTRPCRouter = t.router;

/**
 * Middleware for timing procedure execution and adding an articifial delay in development.
 *
 * You can remove this if you don't like it, but it can help catch unwanted waterfalls by simulating
 * network latency that would occur in production but not in local development.
 */
const timingMiddleware = t.middleware(async ({ next, path }) => {
  const start = Date.now();

  if (t._config.isDev) {
    // artificial delay in dev 100-500ms
    const waitMs = Math.floor(Math.random() * 400) + 100;
    await new Promise((resolve) => setTimeout(resolve, waitMs));
  }

  const result = await next();

  const end = Date.now();

  return result;
});

// Basic rate limiting middleware (per user or per IP)
const rateLimitMiddleware = t.middleware(async ({ ctx, type, path, next }) => {
  // Disable in test
  if (process.env.NODE_ENV === "test") {
    return next();
  }
  const windowMs = 60_000; // 1 minute
  const limit = ctx.session?.user ? 120 : 60; // more generous for authed
  const identity = ctx.session?.user?.id || ctx.clientIp || "anon";
  const key = buildRateLimitKey(["trpc", path, identity]);
  const res = checkRateLimit(key, { windowMs, limit });
  if (!res.allowed) {
    throw new TRPCError({
      code: "TOO_MANY_REQUESTS",
      message: `Rate limit exceeded. Try again in ${Math.ceil(res.resetMs / 1000)}s`,
    });
  }
  return next();
});

// CSRF protection for state-changing operations (mutations)
const csrfMiddleware = t.middleware(async ({ ctx, type, next }) => {
  if (type !== "mutation") return next();
  // Allow server-to-server calls without Origin/Referer
  const { origin, referer } = ctx;
  const allowed = [env.APP_URL, env.WEB_APP_URL].filter(Boolean) as string[];
  const allowedOrigins = allowed
    .map((u) => {
      try {
        return new URL(u).origin;
      } catch {
        return undefined;
      }
    })
    .filter(Boolean) as string[];

  let refOrigin: string | undefined;
  if (referer) {
    try {
      refOrigin = new URL(referer).origin;
    } catch {
      refOrigin = undefined;
    }
  }
  const headerOrigin = origin || refOrigin;
  if (headerOrigin && !allowedOrigins.includes(headerOrigin)) {
    throw new TRPCError({ code: "FORBIDDEN", message: "Invalid origin" });
  }
  return next();
});

// Bot authentication middleware
const botAuthMiddleware = t.middleware(async ({ ctx, next }) => {
  const authHeader = ctx.token;

  if (!authHeader?.startsWith("Bearer ")) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Missing or invalid Authorization header",
    });
  }

  const token = authHeader.substring(7); // Remove "Bearer " prefix

  // Validate the bot token
  if (token !== env.TELEGRAM_BOT_TOKEN) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Invalid bot token",
    });
  }

  // Extract Telegram user ID from the request context
  // For bot requests, we'll set a special botUserId context
  return next({
    ctx: {
      ...ctx,
      botUserId: ctx.session?.user?.id || "bot_user", // Fallback if no session user
      isBotRequest: true,
    },
  });
});

// Telegram anonymous authentication middleware
const telegramAnonymousAuthMiddleware = t.middleware(
  async ({ ctx, input, next }) => {
    // Check if this is a Telegram anonymous request
    if (!input || typeof input !== "object" || !("telegramInitData" in input)) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Telegram initData is required for anonymous access",
      });
    }

    const { telegramInitData } = input as { telegramInitData: string };

    if (!telegramInitData) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "Telegram initData is required",
      });
    }

    try {
      // Parse and validate Telegram WebApp initData
      const urlParams = new URLSearchParams(telegramInitData);
      const hash = urlParams.get("hash");

      if (!hash) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Invalid Telegram initData format - missing hash",
        });
      }

      // Validate the hash using HMAC-SHA256
      const secretKey = crypto
        .createHmac("sha256", "WebAppData")
        .update(env.TELEGRAM_BOT_TOKEN)
        .digest();

      // Create data check string by sorting all parameters except hash
      const params = new URLSearchParams(telegramInitData);
      params.delete("hash");
      const dataCheckString = Array.from(params.entries())
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([key, value]) => `${key}=${value}`)
        .join("&");

      const calculatedHash = crypto
        .createHmac("sha256", secretKey)
        .update(dataCheckString)
        .digest("hex");

      if (calculatedHash !== hash) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Invalid Telegram initData signature",
        });
      }

      // Extract user information from validated data
      const userData = Object.fromEntries(
        Array.from(params.entries()).map(([key, value]) => [
          key,
          decodeURIComponent(value || ""),
        ]),
      );

      // Parse user data - Telegram WebApp initData содержит user как JSON строку
      let telegramUserId: string | undefined;
      let chatId: string | undefined;

      try {
        if (userData.user) {
          const userObj = JSON.parse(userData.user);
          telegramUserId = userObj.id;
        }
        if (userData.chat) {
          const chatObj = JSON.parse(userData.chat);
          chatId = chatObj.id;
        }
        // Fallback to direct values if JSON parsing fails
        if (!telegramUserId && userData.user_id) {
          telegramUserId = userData.user_id;
        }
        if (!chatId && userData.chat_instance) {
          chatId = userData.chat_instance;
        }
      } catch (parseError) {
        // If JSON parsing fails, try direct access
        telegramUserId = userData.user_id || userData.user;
        chatId = userData.chat_instance || userData.chat;
      }

      if (!telegramUserId || !chatId) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Invalid Telegram user data",
        });
      }

      return next({
        ctx: {
          ...ctx,
          telegramUserId,
          telegramChatId: chatId,
          isTelegramAnonymous: true,
        },
      });
    } catch (error) {
      if (error instanceof TRPCError) {
        throw error;
      }
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "Failed to validate Telegram initData",
      });
    }
  },
);

/**
 * Public (unauthed) procedure
 *
 * This is the base piece you use to build new queries and mutations on your
 * tRPC API. It does not guarantee that a user querying is authorized, but you
 * can still access user session data if they are logged in
 */
export const publicProcedure = t.procedure
  .use(timingMiddleware)
  .use(csrfMiddleware)
  .use(rateLimitMiddleware);

/**
 * Telegram anonymous procedure
 *
 * This procedure validates Telegram WebApp initData and provides
 * telegram-specific context for anonymous users.
 */
export const telegramAnonymousProcedure = t.procedure
  .use(timingMiddleware)
  .use(csrfMiddleware)
  .use(rateLimitMiddleware)
  .use(telegramAnonymousAuthMiddleware);

/**
 * Bot (authenticated) procedure
 *
 * This procedure is specifically for Telegram bot requests. It validates the bot token
 * and provides bot-specific context.
 */
export const botProcedure = t.procedure
  .use(timingMiddleware)
  .use(csrfMiddleware)
  .use(rateLimitMiddleware)
  .use(botAuthMiddleware);

/**
 * Protected (authenticated) procedure
 *
 * If you want a query or mutation to ONLY be accessible to logged in users, use this. It verifies
 * the session is valid and guarantees `ctx.session.user` is not null.
 *
 * @see https://trpc.io/docs/procedures
 */
export const protectedProcedure = t.procedure
  .use(timingMiddleware)
  .use(csrfMiddleware)
  .use(rateLimitMiddleware)
  .use(({ ctx, next }) => {
    if (!ctx.session?.user) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }
    return next({
      ctx: {
        // infers the `session` as non-nullable
        session: { ...ctx.session, user: ctx.session.user },
      },
    });
  });

// RBAC helpers
type Role = "user" | "admin";
const roleRank: Record<Role, number> = { user: 1, admin: 2 };

const requireRole = (minRole: Role) =>
  t.middleware(({ ctx, next }) => {
    interface WithRole {
      role?: Role;
    }
    let role: Role = "user";
    const maybeRole = (ctx.session?.user as WithRole | undefined)?.role;
    if (maybeRole) role = maybeRole;
    if (roleRank[role] < roleRank[minRole]) {
      throw new TRPCError({ code: "FORBIDDEN", message: "Insufficient role" });
    }
    return next();
  });

export const adminProcedure = protectedProcedure.use(requireRole("admin"));
