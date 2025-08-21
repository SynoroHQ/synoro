import { attachmentsRouter } from "./router/attachments";
import { chatRouter } from "./router/chat";
import { createTRPCRouter } from "./trpc";

export const appRouter = createTRPCRouter({
  attachments: attachmentsRouter,
  chat: chatRouter,
});

export type AppRouter = typeof appRouter;
