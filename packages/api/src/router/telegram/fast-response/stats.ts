import { FastResponseAgent } from "../../lib/agents";
import { protectedProcedure } from "../../trpc";

const fastResponseAgent = new FastResponseAgent();

export const fastResponseStats = protectedProcedure.query(() => {
  return {
    agentStats: fastResponseAgent.getStats(),
    serviceName: "FastResponseRouter",
    version: "1.0.0",
  };
});
