import type { TRPCRouterRecord } from "@trpc/server";

import { processMessageRouter } from "./process-message";

export const messagesRouter = {
  processMessage: processMessageRouter,
} satisfies TRPCRouterRecord;
