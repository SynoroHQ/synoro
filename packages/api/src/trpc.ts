/**
 * YOU PROBABLY DON'T NEED TO EDIT THIS FILE, UNLESS:
 * 1. You want to modify request context (see Part 1)
 * 2. You want to create a new middleware or type of procedure (see Part 3)
 *
 * tl;dr - this is where all the tRPC server stuff is created and plugged in.
 * The pieces you will need to use are documented accordingly near the end
 */
import { initTRPC } from "@trpc/server";
import superjson from "superjson";
import { ZodError } from "zod";

import type { TRPCContext } from "./lib/trpc/trpc-context";
import { createHonoContext, createTRPCContext } from "./lib/trpc/trpc-context";
import { createProcedures } from "./lib/trpc/trpc-procedures";

// Re-export context functions for backward compatibility
export { createTRPCContext, createHonoContext, type TRPCContext };

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
export type TRPCInstance = typeof t;

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

// Create all procedures using the modular approach
const procedures = createProcedures(t);

// Export procedures for backward compatibility
export const {
  publicProcedure,
  telegramAnonymousProcedure,
  enhancedBotProcedure,
  protectedProcedure,
  adminProcedure,
  loggedProcedure,
} = procedures;
