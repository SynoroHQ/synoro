import { FastResponseAgent } from "../../lib/agents";
import { protectedProcedure } from "../../trpc";

const fastResponseAgent = new FastResponseAgent();

export const fastResponseClearCache = protectedProcedure.mutation(() => {
  fastResponseAgent.clearCache();
  return { success: true };
});
