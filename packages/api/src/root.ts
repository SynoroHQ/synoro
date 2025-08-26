import { attachmentsRouter } from "./router/attachments";
import { chatRouter } from "./router/chat";
import { messagesRouter } from "./router/messages";
import { createTRPCRouter } from "./trpc";

export const appRouter = createTRPCRouter({
  attachments: attachmentsRouter,
  chat: chatRouter,
  messages: messagesRouter,
});

export type AppRouter = typeof appRouter;
