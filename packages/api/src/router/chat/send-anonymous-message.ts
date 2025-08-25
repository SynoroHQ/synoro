import type { TRPCRouterRecord } from "@trpc/server";
import { createId } from "@paralleldrive/cuid2";
import { TRPCError } from "@trpc/server";
import { and, eq } from "drizzle-orm";

import {
  conversations,
  messages,
  processedIdempotencyKeys,
} from "@synoro/db/schema";
import { SendMessageInput, SendMessageOutput } from "@synoro/validators";

import { startCompletionRun } from "../../lib/llm";
import { telegramAnonymousProcedure } from "../../trpc";

export const sendAnonymousMessageRouter: TRPCRouterRecord = {
  sendAnonymousMessage: telegramAnonymousProcedure
    .input(SendMessageInput)
    .output(SendMessageOutput)
    .mutation(async ({ ctx, input }) => {
      const db = ctx.db;
      const now = new Date();

      // Для анонимных пользователей требуется telegramChatId из контекста middleware
      if (input.channel !== "telegram" || !ctx.telegramChatId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message:
            "Анонимные сообщения поддерживаются только для Telegram с валидным initData",
        });
      }

      // Предварительно генерируем ID для избежания дублирования
      const userMsgId = createId();
      const runId = createId();

      // Используем одну транзакцию для всех операций
      return await db.transaction(async (tx) => {
        // Проверяем идемпотентность внутри транзакции
        if (input.idempotencyKey) {
          // Пытаемся вставить ключ идемпотентности, если он уже существует - получаем существующий
          const idempotencyResult = await tx
            .insert(processedIdempotencyKeys)
            .values({
              telegramChatId: ctx.telegramChatId,
              idempotencyKey: input.idempotencyKey,
              messageId: userMsgId, // Временно используем новый ID
              createdAt: now,
            })
            .onConflictDoUpdate({
              target: [
                processedIdempotencyKeys.telegramChatId,
                processedIdempotencyKeys.idempotencyKey,
              ],
              set: {
                // Не обновляем существующую запись
              },
            })
            .returning();

          // Если запись уже существовала (onConflict сработал), получаем существующую
          if (idempotencyResult.length === 0) {
            // Запись уже существует, получаем её
            const existingIdempotency = await tx
              .select()
              .from(processedIdempotencyKeys)
              .where(
                and(
                  eq(
                    processedIdempotencyKeys.telegramChatId,
                    ctx.telegramChatId,
                  ),
                  eq(
                    processedIdempotencyKeys.idempotencyKey,
                    input.idempotencyKey,
                  ),
                ),
              )
              .limit(1);

            if (existingIdempotency.length > 0) {
              const existingIdempotencyRecord = existingIdempotency[0];
              if (!existingIdempotencyRecord) {
                throw new TRPCError({
                  code: "INTERNAL_SERVER_ERROR",
                  message: "Invalid idempotency record",
                });
              }

              // Получаем информацию о существующем сообщении
              const existingMessage = await tx
                .select({ conversationId: messages.conversationId })
                .from(messages)
                .where(eq(messages.id, existingIdempotencyRecord.messageId))
                .limit(1);

              if (existingMessage.length > 0) {
                const existingMessageRecord = existingMessage[0];
                if (!existingMessageRecord) {
                  throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "Invalid message record",
                  });
                }

                // Возвращаем существующий результат
                return {
                  runId: createId(), // Новый runId для каждого запроса
                  conversationId: existingMessageRecord.conversationId,
                  userMessageId: existingIdempotencyRecord.messageId,
                };
              }
            }
          }
        }

        // Resolve conversation
        let convId: string;

        if (!input.conversationId || input.createNew) {
          // Создаем новую беседу для анонимного пользователя
          convId = createId();
          await tx.insert(conversations).values({
            id: convId,
            telegramChatId: ctx.telegramChatId,
            channel: input.channel,
            status: "active",
            createdAt: now,
            updatedAt: now,
            lastMessageAt: now,
          });
        } else {
          // Используем существующую беседу
          convId = input.conversationId;

          // Проверяем, что диалог существует и принадлежит этому Telegram чату
          const existingConv = await tx
            .select()
            .from(conversations)
            .where(
              and(
                eq(conversations.id, convId),
                eq(conversations.telegramChatId, ctx.telegramChatId),
              ),
            )
            .limit(1);

          if (existingConv.length === 0) {
            throw new TRPCError({
              code: "NOT_FOUND",
              message: "Диалог не найден для данного Telegram чата",
            });
          }

          // Обновляем временные метки беседы
          await tx
            .update(conversations)
            .set({ updatedAt: now, lastMessageAt: now })
            .where(eq(conversations.id, convId));
        }

        // Создаем пользовательское сообщение с полным содержимым
        const messageContent: Record<string, unknown> = {
          text: input.content.text,
        };

        // Добавляем attachments если они есть
        if (input.attachments.length > 0) {
          messageContent.attachments = input.attachments;
        }

        // Добавляем metadata если оно есть
        if (input.metadata && Object.keys(input.metadata).length > 0) {
          messageContent.metadata = input.metadata;
        }

        await tx.insert(messages).values({
          id: userMsgId,
          conversationId: convId,
          role: "user",
          content: messageContent,
          model: input.model ?? undefined,
          status: "completed",
          parentId: undefined,
          createdAt: now,
        });

        // Если ключ идемпотентности не был вставлен ранее (новый запрос), вставляем его
        if (input.idempotencyKey) {
          // Проверяем, не был ли уже вставлен ключ
          const existingKey = await tx
            .select()
            .from(processedIdempotencyKeys)
            .where(
              and(
                eq(processedIdempotencyKeys.telegramChatId, ctx.telegramChatId),
                eq(
                  processedIdempotencyKeys.idempotencyKey,
                  input.idempotencyKey,
                ),
              ),
            )
            .limit(1);

          if (existingKey.length === 0) {
            // Вставляем ключ идемпотентности
            await tx.insert(processedIdempotencyKeys).values({
              telegramChatId: ctx.telegramChatId,
              idempotencyKey: input.idempotencyKey,
              messageId: userMsgId,
              createdAt: now,
            });
          }
        }

        // Запускаем LLM completion в фоновом режиме
        startCompletionRun({
          runId,
          conversationId: convId,
          _userMessageId: userMsgId,
          prompt: input.content.text,
          model: input.model,
          // userId не передаем для анонимных пользователей,
          // startCompletionRun использует внутреннюю логику opts.userId ?? "unknown"
          telegramChatId: ctx.telegramChatId,
        }).catch((error) => {
          console.error(
            "Ошибка при запуске LLM completion для анонимного пользователя:",
            {
              runId,
              conversationId: convId,
              telegramChatId: ctx.telegramChatId,
              error:
                error instanceof Error ? error.message : "Неизвестная ошибка",
            },
          );
        });

        return { runId, conversationId: convId, userMessageId: userMsgId };
      });
    }),
};
