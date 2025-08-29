import { attachmentsRouter } from "./router/attachments";
import { chatRouter } from "./router/chat";
import { messagesRouter } from "./router/messages";
import { remindersRouter } from "./router/reminders";
import { telegramUsersRouter } from "./router/telegram/telegram-users";
import { createTRPCRouter } from "./trpc";

export const appRouter = createTRPCRouter({
  attachments: attachmentsRouter,
  chat: chatRouter,
  messages: messagesRouter,
  reminders: remindersRouter,
  telegramUsers: telegramUsersRouter,
});

export type AppRouter = typeof appRouter;
