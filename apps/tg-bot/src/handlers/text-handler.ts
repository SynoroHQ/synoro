import type { Context } from "grammy";

import { apiClient } from "../api/client";
import { runWithAnimation } from "../utils/animation-helpers";
import { FastResponseSystem } from "../utils/fast-response-system";
import { createErrorMessage } from "../utils/html-message-builder";
import { formatForTelegram } from "../utils/telegram-formatter";
import { createMessageContext } from "../utils/telegram-utils";

/**
 * Обработчик обычных текстовых сообщений с Fast Response System
 * Все сообщения проходят через бота для детальной обработки
 */
export async function handleText(ctx: Context) {
  try {
    const messageContext = createMessageContext(ctx);
    const text = ctx.message?.text || "";

    console.log(
      `📝 Text handler: "${text}" from user ${messageContext.userId}`,
    );

    // 1. Создаем экземпляр системы быстрых ответов с API клиентом
    const fastResponseSystem = new FastResponseSystem(apiClient);

    // 2. Проверяем, можно ли дать быстрый ответ через AI
    const fastResponse = await fastResponseSystem.analyzeMessage(text);

    if (fastResponse.shouldSendFast) {
      console.log(
        `⚡ Fast response in text handler: ${fastResponse.processingType}`,
      );

      // Отправляем быстрый ответ с анимацией
      await runWithAnimation(ctx, "fast", 1000, async () => {
        await ctx.reply(fastResponse.fastResponse);
      });

      // Если нужна полная обработка, запускаем её в фоне
      if (fastResponse.needsFullProcessing) {
        console.log(`🔄 Starting background processing for: "${text}"`);
        processMessageInBackground(text, messageContext, ctx);
      }

      return;
    }

    // 2. Если быстрый ответ не сработал, обрабатываем через систему
    console.log(`🔄 Processing message through system: "${text}"`);

    // Обрабатываем через систему с анимацией
    await runWithAnimation(ctx, "processing", 30000, async () => {
      try {
        const result =
          await apiClient.messages.processMessageAgents.processMessageFromTelegramWithAgents.mutate(
            {
              text,
              channel: "telegram",
              messageId: messageContext.messageId,
              telegramUserId: messageContext.userId,
            },
          );

        if (result.success) {
          // Форматируем ответ для Telegram
          const formattedResponse = formatForTelegram(result.response, {
            useEmojis: true,
            useHTML: true,
            addSeparators: false,
          });

          // Отправляем новый ответ
          await ctx.reply(formattedResponse.text, { parse_mode: "HTML" });
        } else {
          // Обрабатываем ошибку
          const errorMessage = createErrorMessage(
            "Произошла ошибка при обработке запроса. Попробуйте еще раз.",
            "Ошибка обработки",
          );

          await ctx.reply(errorMessage, { parse_mode: "HTML" });
        }
      } catch (error) {
        console.error("Error in text processing:", error);

        const errorMessage = createErrorMessage(
          "Произошла ошибка при обработке запроса. Попробуйте еще раз.",
          "Ошибка обработки",
        );

        await ctx.reply(errorMessage, { parse_mode: "HTML" });
      }
    });
  } catch (error) {
    console.error("Error in text handler:", error);
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
          telegramUserId: messageContext.userId,
          messageId: messageContext.messageId,
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
