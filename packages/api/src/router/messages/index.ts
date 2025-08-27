import type { TRPCRouterRecord } from "@trpc/server";

import { processMessageAgentsRouter } from "./process-message-agents";
import { transcribeRouter } from "./transcribe";

export const messagesRouter = {
  processMessageAgents: processMessageAgentsRouter,
  transcribe: transcribeRouter,
} satisfies TRPCRouterRecord;
