import type { Context } from "grammy";

import { apiClient } from "../api/client";
import { DEFAULT_AGENT_OPTIONS } from "../config/agents";
import { env } from "../env";
import {
  ProcessingAnimation,
  removeProcessingMessage,
  sendProcessingMessage,
} from "../utils/message-utils";
import { formatForTelegram } from "../utils/telegram-formatter";
import {
  createMessageContext,
  getUserIdentifier,
  isObviousSpam,
} from "../utils/telegram-utils";

/**
 * Умный обработчик текстовых сообщений с автоматическим выбором агентной системы
 */
export async function handleSmartText(ctx: Context): Promise<void> {
  const text = ctx.message?.text ?? "";

  // Basic input constraints
  const maxLength = env.TG_MESSAGE_MAX_LENGTH ?? 3000;
  if (text.length > maxLength) {
    await ctx.reply(
      `Слишком длинное сообщение (${text.length} символов). Пожалуйста, сократите до ${maxLength}.`,
    );
    return;
  }

  // Check for obvious spam
  if (isObviousSpam(text)) {
    await ctx.reply(
      "Похоже на спам или бессодержательное сообщение. Отправьте, пожалуйста, более осмысленный текст.",
    );
    return;
  }

  // Показываем индикатор "печатает..."
  await ctx.replyWithChatAction("typing");

  // Запускаем анимированный индикатор обработки
  const processingAnimation = new ProcessingAnimation(ctx, "запрос");
  await processingAnimation.start();

  try {
    const messageContext = createMessageContext(ctx);
    console.log(
      `📝 [AGENTS] Обработка текста от ${getUserIdentifier(ctx.from)} в чате ${messageContext.chatId}: "${text.slice(0, 50)}${text.length > 50 ? "..." : ""}"`,
    );

    // Используем агентную систему
    const result =
      await apiClient.messages.processMessageAgents.processMessageFromTelegramWithAgents.mutate(
        {
          text,
          channel: "telegram",
          chatId: messageContext.chatId,
          messageId: messageContext.messageId,
          telegramUserId: messageContext.userId,
          agentOptions: DEFAULT_AGENT_OPTIONS,
          metadata: {
            smartMode: true,
            timestamp: new Date().toISOString(),
          },
        },
      );

    // Останавливаем анимацию обработки
    await processingAnimation.stop();

    if (!result.success) {
      await ctx.reply(result.response);
      return;
    }

    // Отправляем ответ пользователю
    let reply = result.response;
    const MAX_TG_MESSAGE = 4096;

    if (reply.length > MAX_TG_MESSAGE) {
      reply = reply.slice(0, MAX_TG_MESSAGE - 1) + "…";
    }

    // Добавляем индикатор режима обработки (только для разработки)
    if (
      env.NODE_ENV === "development" &&
      "agentMetadata" in result &&
      result.agentMetadata
    ) {
      const agentInfo = result.agentMetadata;
      reply += `\n\n🔬 Debug: ${agentInfo.processingMode} | ${agentInfo.agentsUsed.join("→")} | Q:${(agentInfo.qualityScore * 100).toFixed(0)}%`;
    }

    // Форматируем ответ для Telegram
    const formattedMessage = formatForTelegram(reply, {
      useEmojis: true,
      useMarkdown: true,
      maxLineLength: 80,
    });

    await ctx.reply(formattedMessage.text, {
      parse_mode: formattedMessage.parse_mode,
    });

    // Логируем результат обработки
    if ("agentMetadata" in result && result.agentMetadata) {
      console.log(
        `✅ [AGENTS] Сообщение обработано: режим=${result.agentMetadata.processingMode}, агенты=${result.agentMetadata.agentsUsed.join("→")}, качество=${result.agentMetadata.qualityScore.toFixed(2)}`,
      );
    }
  } catch (error) {
    // Останавливаем анимацию обработки в случае ошибки
    await processingAnimation.stop();

    console.error("Smart text handling error:", error);
    await ctx.reply(
      "Не удалось обработать сообщение. Попробуйте ещё раз позже.",
    );
  }
}
