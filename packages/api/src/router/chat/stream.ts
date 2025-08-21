import type { TRPCRouterRecord } from "@trpc/server";
import { z } from "zod";
import { observable } from "@trpc/server/observable";
import { protectedProcedure } from "../../trpc";
import { eventBus } from "../../lib/event-bus";

export const streamRouter: TRPCRouterRecord = {
  stream: protectedProcedure
    .input(z.object({ runId: z.string() }))
    .subscription(({ input }) => {
      const { runId } = input;
      return observable<{ type: string; data?: unknown }>((emit) => {
        const unsub = eventBus.subscribe(runId, (evt) => {
          emit.next(evt);
          if (evt.type === "done" || evt.type === "error") {
            emit.complete();
          }
        });
        return () => {
          unsub();
        };
      });
    }),
};
