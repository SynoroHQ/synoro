import type { Context } from "grammy";

import { apiClient, createApiClientWithHeaders } from "../api/client";
import { runWithAnimation } from "../utils/animation-helpers";
import { createErrorMessage } from "../utils/html-message-builder";
import {
  formatForTelegram,
  OPTIMAL_TELEGRAM_FORMATTING,
} from "../utils/telegram-formatter";
import { createMessageContext } from "../utils/telegram-utils";

/**
 * Обработчик обычных текстовых сообщений с агентной системой
 * Все сообщения проходят через бота для детальной обработки
 */
export async function handleText(ctx: Context) {
  try {
    const messageContext = createMessageContext(ctx);
    const text = ctx.message?.text || "";

    console.log(
      `📝 Text handler: "${text}" from user ${messageContext.userId}`,
    );

    // Обрабатываем сообщение через агентную систему
    console.log(`🤖 Processing through agent system: "${text}"`);

    // Обрабатываем через систему с анимацией
    await runWithAnimation(ctx, "processing", 30000, async () => {
      try {
        // Создаем API клиент с дополнительными headers
        const clientWithHeaders = createApiClientWithHeaders({
          "X-Telegram-User-Id": messageContext.userId,
          "X-Telegram-Username": messageContext.username || "",
        });

        const result =
          await clientWithHeaders.messages.processMessageAgents.processMessageFromTelegramWithAgents.mutate(
            {
              text,
              channel: "telegram",
              messageId: messageContext.messageId,
              telegramUserId: messageContext.userId,
              telegramUsername: messageContext.username,
            },
          );

        if (result.success) {
          // Форматируем ответ для Telegram
          const formattedResponse = formatForTelegram(
            result.response,
            OPTIMAL_TELEGRAM_FORMATTING,
          );

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

    // Создаем API клиент с дополнительными headers
    const clientWithHeaders = createApiClientWithHeaders({
      "X-Telegram-User-Id": messageContext.userId,
      "X-Telegram-Username": messageContext.username || "",
    });

    const result =
      await clientWithHeaders.messages.processMessageAgents.processMessageFromTelegramWithAgents.mutate(
        {
          text,
          channel: "telegram",
          telegramUserId: messageContext.userId,
          telegramUsername: messageContext.username,
          messageId: messageContext.messageId,
        },
      );

    if (result.success && result.agentMetadata?.agentsUsed.length) {
      // Если в фоне получили результат от агентов, отправляем дополнительное сообщение
      const additionalInfo = `💡 Дополнительная информация от ${result.agentMetadata.agentsUsed.join(", ")}:`;
      const formattedResponse = formatForTelegram(
        result.response,
        OPTIMAL_TELEGRAM_FORMATTING,
      );

      await ctx.reply(`${additionalInfo}\n\n${formattedResponse.text}`, {
        parse_mode: "HTML",
      });
    }
  } catch (error) {
    console.error("Error in background processing:", error);
    // Не отправляем ошибку пользователю, так как у него уже есть быстрый ответ
  }
}
