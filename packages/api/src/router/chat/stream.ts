import type { TRPCRouterRecord } from "@trpc/server";
import { z } from "zod";
import { observable } from "@trpc/server/observable";
import { protectedProcedure } from "../../trpc";
import { eventBus } from "../../lib/event-bus";

export const streamRouter: TRPCRouterRecord = {
export const streamRouter: TRPCRouterRecord = {
  stream: protectedProcedure
    .input(
      z.object({
        runId: z.string(),
        conversationId: z.string().min(1),
      }),
    )
    .subscription(async ({ ctx, input }) => {
      const { runId, conversationId } = input;
      const userId = ctx.session.user.id;

      // Проверка владения диалогом
      const row = await ctx.db
        .select({ ownerUserId: conversation.ownerUserId })
        .from(conversation)
        .where(eq(conversation.id, conversationId))
        .limit(1);

      if (!row[0] || row[0].ownerUserId !== userId) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      return observable<StreamEvent>((emit) => {
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
};
