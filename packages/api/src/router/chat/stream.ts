import type { TRPCRouterRecord } from "@trpc/server";
import { TRPCError } from "@trpc/server";
import { and, eq } from "drizzle-orm";
import { z } from "zod";

import { conversations } from "@synoro/db";
import { StreamInput } from "@synoro/validators";

import type { StreamEvent } from "../../lib/event-bus";
import { eventBus } from "../../lib/event-bus";
import { protectedProcedure, publicProcedure } from "../../trpc";

export const streamRouter: TRPCRouterRecord = {
  stream: protectedProcedure
    .input(StreamInput)
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

      const events = {
        [Symbol.asyncIterator]: () => {
          let unsubscribe: (() => void) | null = null;
          const MAX_QUEUE = 1000;
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
              if (queue.length >= MAX_QUEUE) {
                // отбрасываем самые старые события
                queue.shift();
              }
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

          const iterator = {
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
            async return(): Promise<IteratorResult<StreamEvent>> {
              done = true;
              unsubscribe?.();
              return { value: undefined, done: true };
            },
          };

          // гарантированная очистка при завершении итерации
          return new Proxy(iterator, {
            get(target, prop, receiver) {
              if (prop === "next") {
                const orig = target.next.bind(target);
                return async (...args: unknown[]) => {
                  try {
                    return await orig(...(args as []));
                  } finally {
                    if (done) unsubscribe?.();
                  }
                };
              }
              return Reflect.get(target, prop, receiver);
            },
          });
        },
      };
      for await (const event of events) {
        yield event;
      }
    }),

  // Для анонимных пользователей Telegram
  streamAnonymous: publicProcedure
    .input(
      z.object({
        runId: z.string(),
        conversationId: z.string().min(1),
        telegramChatId: z.string().min(1),
      }),
    )
    .subscription(async function* (opts) {
      const { runId, conversationId, telegramChatId } = opts.input;

      // Проверка доступа к диалогу для анонимного пользователя
      const row = await opts.ctx.db
        .select({ telegramChatId: conversations.telegramChatId })
        .from(conversations)
        .where(
          and(
            eq(conversations.id, conversationId),
            eq(conversations.telegramChatId, telegramChatId),
          ),
        )
        .limit(1);

      if (!row[0] || row[0].telegramChatId !== telegramChatId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Нет доступа к этому диалогу для данного Telegram чата",
        });
      }

      const events = {
        [Symbol.asyncIterator]: () => {
          let unsubscribe: (() => void) | null = null;
          const MAX_QUEUE = 1000;
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
              if (queue.length >= MAX_QUEUE) {
                // отбрасываем самые старые события
                queue.shift();
              }
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

          const iterator = {
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
            async return(): Promise<IteratorResult<StreamEvent>> {
              done = true;
              unsubscribe?.();
              return { value: undefined, done: true };
            },
          };

          // гарантированная очистка при завершении итерации
          return new Proxy(iterator, {
            get(target, prop, receiver) {
              if (prop === "next") {
                const orig = target.next.bind(target);
                return async (...args: unknown[]) => {
                  try {
                    return await orig(...(args as []));
                  } finally {
                    if (done) unsubscribe?.();
                  }
                };
              }
              return Reflect.get(target, prop, receiver);
            },
          });
        },
      };
      for await (const event of events) {
        yield event;
      }
    }),
};
