import { TRPCError } from "@trpc/server";

import type { TRPCInstance } from "../../trpc";
import {
  createCsrfMiddleware,
  createEnhancedBotAuthMiddleware,
  createLoggingMiddleware,
  createRateLimitMiddleware,
  createTelegramAnonymousAuthMiddleware,
  createTimingMiddleware,
} from "./trpc-middleware";
import { createRequireRoleMiddleware } from "./trpc-rbac";

/**
 * Create all tRPC procedures with their respective middleware
 */
export const createProcedures = (t: TRPCInstance) => {
  const timingMiddleware = createTimingMiddleware(t);
  const loggingMiddleware = createLoggingMiddleware(t);
  const rateLimitMiddleware = createRateLimitMiddleware(t);
  const csrfMiddleware = createCsrfMiddleware(t);
  const enhancedBotAuthMiddleware = createEnhancedBotAuthMiddleware(t);
  const telegramAnonymousAuthMiddleware =
    createTelegramAnonymousAuthMiddleware(t);
  const requireRole = createRequireRoleMiddleware(t);

  /**
   * Public (unauthed) procedure
   *
   * This is the base piece you use to build new queries and mutations on your
   * tRPC API. It does not guarantee that a user querying is authorized, but you
   * can still access user session data if they are logged in
   */
  const publicProcedure = t.procedure
    .use(timingMiddleware)
    .use(csrfMiddleware)
    .use(rateLimitMiddleware);

  /**
   * Telegram anonymous procedure
   *
   * This procedure validates Telegram WebApp initData and provides
   * telegram-specific context for anonymous users.
   */
  const telegramAnonymousProcedure = t.procedure
    .use(timingMiddleware)
    .use(csrfMiddleware)
    .use(rateLimitMiddleware)
    .use(telegramAnonymousAuthMiddleware);

  /**
   * Enhanced bot procedure
   *
   * This procedure automatically extracts telegramUserId from input and resolves userId
   * through TelegramUserService. Use this when you need userId to be available in context.
   */
  const enhancedBotProcedure = t.procedure
    .use(timingMiddleware)
    .use(csrfMiddleware)
    .use(rateLimitMiddleware)
    .use(enhancedBotAuthMiddleware);

  /**
   * Protected (authenticated) procedure
   *
   * If you want a query or mutation to ONLY be accessible to logged in users, use this. It verifies
   * the session is valid and guarantees `ctx.session.user` is not null.
   *
   * @see https://trpc.io/docs/procedures
   */
  const protectedProcedure = t.procedure
    .use(timingMiddleware)
    .use(csrfMiddleware)
    .use(rateLimitMiddleware)
    .use(function isAuthed({ ctx, next }) {
      // `ctx.session.user` is nullable
      if (!ctx.session?.user) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      return next({
        ctx: {
          session: { ...ctx.session, user: ctx.session.user },
        },
      });
    });

  const adminProcedure = protectedProcedure.use(requireRole("admin"));

  /**
   * Logged procedure - includes timing and result logging
   * Based on the official tRPC documentation example
   */
  const loggedProcedure = publicProcedure.use(loggingMiddleware);

  return {
    publicProcedure,
    telegramAnonymousProcedure,
    enhancedBotProcedure,
    protectedProcedure,
    adminProcedure,
    loggedProcedure,
  };
};
