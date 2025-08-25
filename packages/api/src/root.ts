import { attachmentsRouter } from "./router/attachments";
import { chatRouter } from "./router/chat";
import { messagesRouter } from "./router/messages";
import { telegramUsersRouter } from "./router/telegram/telegram-users";
import { createTRPCRouter } from "./trpc";

export const appRouter = createTRPCRouter({
  attachments: attachmentsRouter,
  chat: chatRouter,
  messages: messagesRouter,
  telegramUsers: telegramUsersRouter,
});

export type AppRouter = typeof appRouter;
