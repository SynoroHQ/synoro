import { TranscribeInput, TranscribeResponse } from "@synoro/validators";

import { transcribe } from "../../lib/ai/transcriber";
import { TelegramUserService } from "../../lib/services/telegram-user-service";
import { enhancedBotProcedure, protectedProcedure, publicProcedure } from "../../trpc";

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
  transcribeFromTelegram: enhancedBotProcedure
    .input(TranscribeInput)
    .output(TranscribeResponse)
    .mutation(async ({ ctx, input }) => {
      try {
        // userId теперь автоматически доступен в контексте
        if (!ctx.userId) {
          throw new Error("Пользователь не зарегистрирован в системе");
        }

        // Decode base64 audio string to Buffer
        const audioBuffer = Buffer.from(input.audio, "base64");

        const text = await transcribe(audioBuffer, input.filename, {
          functionId: "api-transcribe",
          metadata: {
            channel: input.channel,
            userId: ctx.userId,
            ...(input.messageId && { messageId: input.messageId }),
            filename: input.filename,
            telegramUserId: ctx.telegramUserId,
            conversationId: ctx.conversationId,
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
