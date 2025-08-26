import type { Context } from "grammy";

import { apiClient } from "../api/client";
import { env } from "../env";
import {
  removeProcessingMessage,
  sendProcessingMessage,
} from "../utils/message-utils";
import {
  createMessageContext,
  escapeTelegramMarkdownV2,
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

  // Определяем, нужна ли агентная обработка
  const shouldUseAgents = shouldUseAgentProcessing(text);
  const messageType = shouldUseAgents ? "запрос" : "сообщение";
  const processingMessageId = await sendProcessingMessage(ctx, messageType);

  try {
    const messageContext = createMessageContext(ctx);
    console.log(
      `📝 ${shouldUseAgents ? "[AGENTS]" : "[LEGACY]"} Обработка текста от ${getUserIdentifier(ctx.from)} в чате ${messageContext.chatId}: "${text.slice(0, 50)}${text.length > 50 ? "..." : ""}"`,
    );

    let result;

    if (shouldUseAgents) {
      // Используем агентную систему
      result =
        await apiClient.messages.processMessageAgents.processMessageFromTelegramWithAgents.mutate(
          {
            text,
            channel: "telegram",
            chatId: messageContext.chatId,
            messageId: messageContext.messageId,
            telegramUserId: messageContext.userId,
            agentOptions: {
              useQualityControl: true,
              maxQualityIterations: 2,
              targetQuality: 0.8,
            },
            metadata: {
              smartMode: true,
              timestamp: new Date().toISOString(),
            },
          },
        );
    } else {
      // Используем обычную обработку
      const { processTextMessage } = await import(
        "../services/message-service"
      );
      result = await processTextMessage(text, messageContext);
    }

    // Удаляем сообщение "Обрабатываем..."
    await removeProcessingMessage(ctx, processingMessageId, ctx.chat!.id);

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
      shouldUseAgents &&
      "agentMetadata" in result &&
      result.agentMetadata
    ) {
      const agentInfo = result.agentMetadata;
      reply += `\n\n🔬 _Debug: ${agentInfo.processingMode} | ${agentInfo.agentsUsed.join("→")} | Q:${(agentInfo.qualityScore * 100).toFixed(0)}%_`;
    }

    await ctx.reply(escapeTelegramMarkdownV2(reply), {
      parse_mode: "MarkdownV2",
    });

    // Логируем результат обработки
    if ("agentMetadata" in result && result.agentMetadata) {
      console.log(
        `✅ [AGENTS] Сообщение обработано: режим=${result.agentMetadata.processingMode}, агенты=${result.agentMetadata.agentsUsed.join("→")}, качество=${result.agentMetadata.qualityScore.toFixed(2)}`,
      );
    } else {
      console.log(
        `✅ [LEGACY] Сообщение обработано: тип=${result.messageType?.type}, релевантность=${result.relevance?.relevant}`,
      );
    }
  } catch (error) {
    // Удаляем сообщение "Обрабатываем..." в случае ошибки
    await removeProcessingMessage(ctx, processingMessageId, ctx.chat!.id);

    console.error("Smart text handling error:", error);
    await ctx.reply(
      "Не удалось обработать сообщение. Попробуйте ещё раз позже.",
    );
  }
}

/**
 * Определяет, нужно ли использовать агентную систему для сообщения
 */
function shouldUseAgentProcessing(text: string): boolean {
  // Критерии для агентной обработки:

  // 1. Длинные сообщения (>100 символов)
  if (text.length > 100) return true;

  // 2. Сложные ключевые слова
  const complexKeywords = [
    "анализ",
    "анализируй",
    "статистика",
    "сравни",
    "найди паттерн",
    "оптимизируй",
    "улучши",
    "план",
    "планирование",
    "стратегия",
    "исследование",
    "детальный",
    "подробный",
    "комплексный",
    "рекомендации",
    "предложения",
    "варианты",
    "альтернативы",
  ];

  const textLower = text.toLowerCase();
  if (complexKeywords.some((keyword) => textLower.includes(keyword))) {
    return true;
  }

  // 3. Множественные вопросы (содержит несколько вопросительных знаков или вопросительных слов)
  const questionWords = [
    "что",
    "как",
    "где",
    "когда",
    "зачем",
    "почему",
    "какой",
    "кто",
  ];
  const questionWordCount = questionWords.filter((word) =>
    textLower.includes(word),
  ).length;
  const questionMarkCount = (text.match(/\?/g) || []).length;

  if (questionWordCount >= 2 || questionMarkCount >= 2) {
    return true;
  }

  // 4. Финансовые запросы с анализом
  const financialAnalysisKeywords = [
    "расходы",
    "доходы",
    "бюджет",
    "экономия",
    "трата",
    "финансы",
    "сколько потратил",
    "сколько заработал",
    "финансовый план",
  ];

  if (
    financialAnalysisKeywords.some((keyword) => textLower.includes(keyword))
  ) {
    return true;
  }

  // 5. Запросы с несколькими действиями (содержит "и", "а также", "еще")
  const multiActionIndicators = [
    " и ",
    " а также ",
    " еще ",
    " также ",
    " плюс ",
  ];
  if (
    multiActionIndicators.some((indicator) => textLower.includes(indicator))
  ) {
    return true;
  }

  return false;
}
