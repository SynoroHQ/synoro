import type { TRPCRouterRecord } from "@trpc/server";
import { sendMessageRouter } from "./send-message";
import { streamRouter } from "./stream";
import { getHistoryRouter } from "./get-history";
import { listConversationsRouter } from "./list-conversations";

export const chatRouter: TRPCRouterRecord = {
  ...sendMessageRouter,
  ...streamRouter,
  ...getHistoryRouter,
  ...listConversationsRouter,
};
