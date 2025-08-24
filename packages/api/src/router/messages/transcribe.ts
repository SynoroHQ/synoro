import { z } from "zod";

import { transcribe } from "../../lib/ai";
import { botProcedure, protectedProcedure, publicProcedure } from "../../trpc";

// Схема для входящего аудио
const TranscribeInput = z.object({
  audio: z.string(), // base64-encoded audio data
  filename: z.string(),
  channel: z.enum(["telegram", "web", "mobile"]),
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
    .mutation(async ({ ctx, input }) => {
      try {
        // Decode base64 audio string to Buffer
        const audioBuffer = Buffer.from(input.audio, "base64");

        const text = await transcribe(audioBuffer, input.filename, {
          functionId: "api-transcribe",
          metadata: {
            channel: input.channel,
            userId: ctx.session.user.id,
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
  transcribeFromTelegram: botProcedure
    .input(TranscribeInput)
    .output(TranscribeResponse)
    .mutation(async ({ ctx, input }) => {
      try {
        // Decode base64 audio string to Buffer
        const audioBuffer = Buffer.from(input.audio, "base64");

        // For bot requests, use botUserId from context
        const userId = ctx.botUserId || "bot_user";

        const text = await transcribe(audioBuffer, input.filename, {
          functionId: "api-transcribe",
          metadata: {
            channel: input.channel,
            userId: userId,
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
