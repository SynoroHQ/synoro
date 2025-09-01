import type { TRPCRouterRecord } from "@trpc/server";

import { processMessageAgentsRouter } from "./process-message-agents";
import { transcribeRouter } from "./transcribe";
import { fastResponseRouter } from "../telegram/fast-response";

export const messagesRouter = {
  processMessageAgents: processMessageAgentsRouter,
  transcribe: transcribeRouter,
  analyzeMessageForFastResponse: fastResponseRouter.analyze,
  fastResponse: fastResponseRouter,
} satisfies TRPCRouterRecord;
