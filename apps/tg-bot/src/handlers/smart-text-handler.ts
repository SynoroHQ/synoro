import type { Context } from "grammy";

import { apiClient } from "../api/client";
import { telegramFastResponseService } from "../services/fast-response-service";
import {
  createErrorMessage,
  createSuccessMessage,
} from "../utils/html-message-builder";
import { formatForTelegram } from "../utils/telegram-formatter";
import { createMessageContext } from "../utils/telegram-utils";

/**
 * Обработчик умных текстовых сообщений с использованием FastResponseAgent
 */
export async function handleSmartText(ctx: Context) {
  try {
    const messageContext = createMessageContext(ctx);
    const text = ctx.message?.text || "";

    console.log(
      `🤖 Smart text handler: "${text}" from user ${messageContext.userId}`,
    );

    // 1. Анализируем сообщение через FastResponseAgent
    const fastResponse = await telegramFastResponseService.analyzeMessage(
      text,
      messageContext.userId,
      messageContext.messageId
    );

    if (fastResponse.shouldSendFast) {
      console.log(`⚡ Fast response triggered: ${fastResponse.processingType} (confidence: ${fastResponse.confidence})`);

      // Отправляем быстрый ответ
      await ctx.reply(fastResponse.fastResponse);

      // Если нужна полная обработка, запускаем её в фоне
      if (fastResponse.needsFullProcessing) {
        console.log(`🔄 Starting background processing for: "${text}"`);

        // Запускаем обработку в фоне без ожидания
        processMessageInBackground(text, messageContext, ctx);
      }

      return;
    }

    // 2. Если быстрый ответ не сработал, обрабатываем через мультиагентов
    console.log(`🔄 Processing message through multi-agent system: "${text}"`);

    // Показываем индикатор обработки
    const processingMsg = await ctx.reply("🤔 Обрабатываю ваш запрос...");

    try {
      const result =
        await apiClient.messages.processMessageAgents.processMessageFromTelegramWithAgents.mutate(
          {
            text,
            channel: "telegram",
            userId: messageContext.userId,
            messageId: messageContext.messageId,
          },
        );

      if (result.success) {
        // Форматируем ответ для Telegram
        const formattedResponse = formatForTelegram(result.response, {
          useEmojis: true,
          useHTML: true,
          addSeparators: false,
        });

        // Обновляем сообщение с результатом
        await ctx.api.editMessageText(
          ctx.chat!.id,
          processingMsg.message_id,
          formattedResponse.text,
          { parse_mode: "HTML" },
        );
      } else {
        // Обрабатываем ошибку
        const errorMessage = createErrorMessage(
          "Произошла ошибка при обработке запроса. Попробуйте еще раз.",
          "Ошибка обработки",
        );

        await ctx.api.editMessageText(
          ctx.chat!.id,
          processingMsg.message_id,
          errorMessage,
          { parse_mode: "HTML" },
        );
      }
    } catch (error) {
      console.error("Error in smart text processing:", error);

      // Обновляем сообщение с ошибкой
      const errorMessage = createErrorMessage(
        "Произошла ошибка при обработке запроса. Попробуйте еще раз.",
        "Ошибка обработки",
      );

              await ctx.api.editMessageText(
          ctx.chat!.id,
          processingMsg.message_id,
          errorMessage,
          { parse_mode: "HTML" },
        );
    }
  } catch (error) {
    console.error("Error in smart text handler:", error);
    const errorMessage = createErrorMessage(
      "Произошла ошибка. Попробуйте еще раз.",
      "Системная ошибка",
    );
    await ctx.reply(errorMessage, { parse_mode: "HTML" });
  }
}

/**
 * Обработка сообщения в фоне для случаев, когда нужна полная обработка
 */
async function processMessageInBackground(
  text: string,
  messageContext: ReturnType<typeof createMessageContext>,
  ctx: Context,
) {
  try {
    console.log(`🔄 Background processing started for: "${text}"`);

    const result =
      await apiClient.messages.processMessageAgents.processMessageFromTelegramWithAgents.mutate(
        {
          text,
          channel: "telegram",
          userId: messageContext.userId,
          messageId: messageContext.messageId,
          telegramUserId: messageContext.userId,
        },
      );

    if (result.success && result.agentMetadata?.agentsUsed.length) {
      // Если в фоне получили результат от агентов, отправляем дополнительное сообщение
      const additionalInfo = `💡 Дополнительная информация от ${result.agentMetadata.agentsUsed.join(", ")}:`;
      const formattedResponse = formatForTelegram(result.response, {
        useEmojis: true,
        useHTML: true,
        addSeparators: false,
      });

      await ctx.reply(`${additionalInfo}\n\n${formattedResponse.text}`, {
        parse_mode: "HTML",
      });
    }
  } catch (error) {
    console.error("Error in background processing:", error);
    // Не отправляем ошибку пользователю, так как у него уже есть быстрый ответ
  }
}
