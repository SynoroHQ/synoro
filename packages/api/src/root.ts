import { attachmentsRouter } from "./router/attachments";
import { createTRPCRouter } from "./trpc";

export const appRouter = createTRPCRouter({
  attachments: attachmentsRouter,
});

export type AppRouter = typeof appRouter;
