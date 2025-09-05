import crypto from "crypto";
import { TRPCError } from "@trpc/server";

import type { TRPCInstance } from "../../trpc";
import { env } from "../../../env";
import { buildRateLimitKey, checkRateLimit } from "../rate-limit";

/**
 * Middleware for timing procedure execution and adding an articifial delay in development.
 *
 * You can remove this if you don't like it, but it can help catch unwanted waterfalls by simulating
 * network latency that would occur in production but not in local development.
 */
export const createTimingMiddleware = (t: TRPCInstance) =>
  t.middleware(async (opts: any) => {
    const { next, path, type } = opts;
    const start = Date.now();

    if (t._config.isDev) {
      // artificial delay in dev 100-500ms
      const waitMs = Math.floor(Math.random() * 400) + 100;
      await new Promise((resolve) => setTimeout(resolve, waitMs));
    }

    const result = await next();

    const durationMs = Date.now() - start;
    const meta = { path, type, durationMs };

    // Log timing information
    result.ok
      ? console.log("OK request timing:", meta)
      : console.error("Non-OK request timing", meta);

    return result;
  });

/**
 * Logging middleware for tracking request timing and results
 * Based on the official tRPC documentation example
 */
export const createLoggingMiddleware = (t: TRPCInstance) =>
  t.middleware(async (opts: any) => {
    const { next, path, type } = opts;
    const start = Date.now();

    const result = await next();

    const durationMs = Date.now() - start;
    const meta = { path, type, durationMs };

    result.ok
      ? console.log("OK request timing:", meta)
      : console.error("Non-OK request timing", meta);

    return result;
  });

// Basic rate limiting middleware (per user or per IP)
export const createRateLimitMiddleware = (t: TRPCInstance) =>
  t.middleware(
    async ({
      ctx,
      type,
      path,
      next,
    }: {
      ctx: any;
      type: any;
      path: any;
      next: any;
    }) => {
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
    },
  );

// CSRF protection for state-changing operations (mutations)
export const createCsrfMiddleware = (t: TRPCInstance) =>
  t.middleware(
    async ({ ctx, type, next }: { ctx: any; type: any; next: any }) => {
      if (type !== "mutation") return next();
      // Allow server-to-server calls without Origin/Referer
      const { origin, referer } = ctx;
      const allowed = [env.APP_URL, env.WEB_APP_URL].filter(
        Boolean,
      ) as string[];
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
    },
  );

// Simple bot authentication middleware that only validates the bot token
export const createBotAuthMiddleware = (t: TRPCInstance) =>
  t.middleware(async ({ ctx, next }) => {
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

    return next({
      ctx: {
        ...ctx,
        botUserId: ctx.session?.user?.id ?? "bot_user",
        isBotRequest: true,
      },
    });
  });

// Enhanced bot middleware that extracts telegramUserId and resolves userId
// This should be used as a second middleware after input validation
export const createEnhancedBotAuthMiddleware = (t: TRPCInstance) =>
  t.middleware(async ({ ctx, next }) => {
    // Extract telegramUserId from validated input or headers
    let telegramUserId: string | undefined;
    let telegramUsername: string | undefined;
    let userId: string | null = null;
    let conversationId: string | undefined;

    // Если не получили из input, пытаемся получить из headers
    if (!telegramUserId) {
      telegramUserId = ctx.headers.get("x-telegram-user-id") || undefined;
      telegramUsername = ctx.headers.get("x-telegram-username") || undefined;
    }
    if (telegramUserId) {
      try {
        // Import TelegramUserService dynamically to avoid circular dependencies
        const { TelegramUserService } = await import(
          "../services/telegram-user-service"
        );
        const userContext = await TelegramUserService.getUserContext(
          telegramUserId,
          telegramUsername,
        );
        userId = userContext.userId;
        conversationId = userContext.conversationId;
      } catch (error) {
        console.error(
          `Failed to get or create user context for ${telegramUserId}:`,
          error,
        );
        // If we can't get or create the user, throw an error
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Не удалось создать пользователя в системе",
        });
      }
    }

    return next({
      ctx: {
        ...ctx,
        telegramUserId,
        telegramUsername,
        userId: userId!, // userId is guaranteed to be non-null after our logic
        conversationId,
      },
    });
  });

// Telegram anonymous authentication middleware
export const createTelegramAnonymousAuthMiddleware = (t: TRPCInstance) =>
  t.middleware(
    async ({ ctx, input, next }: { ctx: any; input: any; next: any }) => {
      // Check if this is a Telegram anonymous request
      if (
        !input ||
        typeof input !== "object" ||
        !("telegramInitData" in input)
      ) {
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

        // Check auth_date freshness (within 5 minutes)
        const authDate = urlParams.get("auth_date");
        if (authDate) {
          const authTimestamp = Number.parseInt(authDate, 10);
          const currentTimestamp = Math.floor(Date.now() / 1000);
          const timeDiff = Math.abs(currentTimestamp - authTimestamp);

          if (timeDiff > 300) {
            // 5 minutes = 300 seconds
            throw new TRPCError({
              code: "UNAUTHORIZED",
              message: "Telegram initData is too old (auth_date expired)",
            });
          }
        }

        // Create data check string by sorting all parameters except hash
        const params = new URLSearchParams(telegramInitData);
        params.delete("hash");
        const dataCheckString = Array.from(params.entries())
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([key, value]) => `${key}=${value}`)
          .join("\n"); // Use newline separator as per Telegram docs

        // Derive secret key: HMAC-SHA256 with bot token as key and "WebAppData" as message
        const secretKey = crypto
          .createHmac("sha256", env.TELEGRAM_BOT_TOKEN)
          .update("WebAppData")
          .digest();

        // Calculate hash using HMAC-SHA256 with derived secret key
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

        try {
          if (userData.user) {
            const userObj = JSON.parse(userData.user);
            telegramUserId = userObj.id;
          }
          // Fallback to direct values if JSON parsing fails
          if (!telegramUserId && userData.user_id) {
            telegramUserId = userData.user_id;
          }
        } catch (parseError) {
          // If JSON parsing fails, try direct access
          telegramUserId = userData.user_id || userData.user;
        }

        if (!telegramUserId) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Invalid Telegram user data",
          });
        }

        return next({
          ctx: {
            ...ctx,
            telegramUserId,
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
