import type { TRPCRouterRecord } from "@trpc/server";

import { processMessageRouter } from "./process-message";
import { processMessageAgentsRouter } from "./process-message-agents";
import { transcribeRouter } from "./transcribe";

export const messagesRouter = {
  processMessage: processMessageRouter,
  processMessageAgents: processMessageAgentsRouter,
  transcribe: transcribeRouter,
} satisfies TRPCRouterRecord;
