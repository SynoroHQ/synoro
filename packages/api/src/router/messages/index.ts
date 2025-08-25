import type { TRPCRouterRecord } from "@trpc/server";

import { processMessageRouter } from "./process-message";
import { transcribeRouter } from "./transcribe";

export const messagesRouter = {
  processMessage: processMessageRouter,
  transcribe: transcribeRouter,
} satisfies TRPCRouterRecord;
