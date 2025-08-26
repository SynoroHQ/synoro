import type { TRPCRouterRecord } from "@trpc/server";

import { getHistoryRouter } from "./get-history";
import { listConversationsRouter } from "./list-conversations";
import { sendAnonymousMessageRouter } from "./send-anonymous-message";
import { sendMessageRouter } from "./send-message";
import { streamRouter } from "./stream";

export const chatRouter: TRPCRouterRecord = {
  ...sendMessageRouter,
  ...sendAnonymousMessageRouter,
  ...streamRouter,
  ...getHistoryRouter,
  ...listConversationsRouter,
};
