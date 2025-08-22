import { z } from "zod";

import { transcribe } from "../../lib/ai";
import { protectedProcedure, publicProcedure } from "../../trpc";

// Схема для входящего аудио
const TranscribeInput = z.object({
  audio: z.instanceof(Buffer),
  filename: z.string(),
  channel: z.enum(["telegram", "web", "mobile"]),
  userId: z.string(),
  chatId: z.string().optional(),
  messageId: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

// Схема для ответа
const TranscribeResponse = z.object({
  success: z.boolean(),
  text: z.string(),
  filename: z.string(),
});

export const transcribeRouter = {
  // Универсальный эндпоинт для транскрипции аудио (для веб/мобайл клиентов)
  transcribe: protectedProcedure
    .input(TranscribeInput)
    .output(TranscribeResponse)
    .mutation(async ({ input }) => {
      try {
        const text = await transcribe(input.audio, input.filename, {
          functionId: "api-transcribe",
          metadata: {
            channel: input.channel,
            userId: input.userId,
            ...(input.chatId && { chatId: input.chatId }),
            ...(input.messageId && { messageId: input.messageId }),
            filename: input.filename,
            ...input.metadata,
          },
        });

        return {
          success: true,
          text,
          filename: input.filename,
        };
      } catch (error) {
        console.error("Ошибка транскрипции:", error);
        throw new Error(
          error instanceof Error ? error.message : "Неизвестная ошибка",
        );
      }
    }),

  // Публичный эндпоинт для Telegram бота
  transcribeFromTelegram: publicProcedure
    .input(TranscribeInput)
    .output(TranscribeResponse)
    .mutation(async ({ input }) => {
      try {
        const text = await transcribe(input.audio, input.filename, {
          functionId: "api-transcribe",
          metadata: {
            channel: input.channel,
            userId: input.userId,
            ...(input.chatId && { chatId: input.chatId }),
            ...(input.messageId && { messageId: input.messageId }),
            filename: input.filename,
            ...input.metadata,
          },
        });

        return {
          success: true,
          text,
          filename: input.filename,
        };
      } catch (error) {
        console.error("Ошибка транскрипции:", error);
        throw new Error(
          error instanceof Error ? error.message : "Неизвестная ошибка",
        );
      }
    }),
};
