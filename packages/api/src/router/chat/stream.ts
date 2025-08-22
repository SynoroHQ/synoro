import type { TRPCRouterRecord } from "@trpc/server";
import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";
import { z } from "zod";

import { conversations } from "@synoro/db";

import type { StreamEvent } from "../../lib/event-bus";
import { eventBus } from "../../lib/event-bus";
import { protectedProcedure } from "../../trpc";

export const streamRouter: TRPCRouterRecord = {
  stream: protectedProcedure
    .input(
      z.object({
        runId: z.string(),
        conversationId: z.string().min(1),
      }),
    )
    .subscription(async function* (opts) {
      const { runId, conversationId } = opts.input;
      const userId = opts.ctx.session.user.id;

      // Проверка владения диалогом
      const row = await opts.ctx.db
        .select({ ownerUserId: conversations.ownerUserId })
        .from(conversations)
        .where(eq(conversations.id, conversationId))
        .limit(1);

      if (!row[0] || row[0].ownerUserId !== userId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Нет доступа к этому диалогу",
        });
      }

      // Создаем async iterable из eventBus
      const events = {
        [Symbol.asyncIterator]: () => {
          let unsubscribe: (() => void) | null = null;
          const queue: StreamEvent[] = [];
          let resolve: ((value: IteratorResult<StreamEvent>) => void) | null =
            null;
          let done = false;

          unsubscribe = eventBus.subscribe(runId, (event) => {
            if (done) return;

            if (resolve) {
              resolve({ value: event, done: false });
              resolve = null;
            } else {
              queue.push(event);
            }

            if (event.type === "done" || event.type === "error") {
              done = true;
              unsubscribe?.();
            }
          });

          opts.signal?.addEventListener("abort", () => {
            done = true;
            unsubscribe?.();
            if (resolve) {
              resolve({ value: undefined, done: true });
              resolve = null;
            }
          });

          return {
            async next(): Promise<IteratorResult<StreamEvent>> {
              if (done) return { value: undefined, done: true };

              if (queue.length > 0) {
                const event = queue.shift()!;
                if (event.type === "done" || event.type === "error") {
                  done = true;
                  unsubscribe?.();
                }
                return { value: event, done: false };
              }

              return new Promise((res) => {
                resolve = res;
              });
            },
            async return() {
              done = true;
              unsubscribe?.();
              return { value: undefined, done: true };
            },
          };
        },
      };

      for await (const event of events) {
        yield event;
      }
    }),
};
