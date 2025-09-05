import { analyticsRouter } from "./router/analytics";
import { attachmentsRouter } from "./router/attachments";
import { chatRouter } from "./router/chat";
import { messagesRouter } from "./router/messages";
import { remindersRouter } from "./router/reminders";
// import { fastResponseRouter } from "./router/telegram/fast-response";
import { telegramUsersRouter } from "./router/telegram/telegram-users";
import { createTRPCRouter } from "./trpc";

export const appRouter = createTRPCRouter({
  attachments: attachmentsRouter,
  chat: chatRouter,
  messages: messagesRouter,
  reminders: remindersRouter,
  telegramUsers: telegramUsersRouter,
  // fastResponse: fastResponseRouter,
  analytics: analyticsRouter,
});

export type AppRouter = typeof appRouter;
