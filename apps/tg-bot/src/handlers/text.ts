import { randomUUID } from "node:crypto";
import type { Context } from "grammy";

import {
  advise,
  answerQuestion,
  classifyMessageType,
  classifyRelevance,
  parseTask,
} from "../services/ai-service";
import { logEvent } from "../services/db";
import { extractTags } from "../services/relevance";

export async function handleText(ctx: Context): Promise<void> {
  const text = ctx.message?.text ?? "";

  // Показываем индикатор "печатает..."
  await ctx.replyWithChatAction("typing");

  try {
    const traceId = randomUUID();
    const chatId = String(ctx.chat?.id ?? "unknown");
    const userId = ctx.from?.id ? String(ctx.from.id) : "unknown";
    const messageId =
      ctx.message && "message_id" in ctx.message
        ? String(ctx.message.message_id)
        : undefined;

    const telemetryBase = {
      langfuseTraceId: traceId,
      chatId,
      userId,
      channel: "telegram",
      type: "text",
      ...(messageId ? { messageId } : {}),
    };

    // Классифицируем тип сообщения
    const messageType = await classifyMessageType(text, {
      functionId: "tg-classify-message-type",
      metadata: telemetryBase,
    });

    let response = "";
    let parsed: unknown = null;

    // Обрабатываем в зависимости от типа сообщения
    switch (messageType.type) {
      case "question":
        // Отвечаем на вопрос без записи в базу
        response = await answerQuestion(text, messageType, {
          functionId: "tg-answer-question",
          metadata: telemetryBase,
        });
        break;

      case "event":
        // Обрабатываем событие: парсим и даем совет
        parsed = await parseTask(text, {
          functionId: "tg-parse-text",
          metadata: telemetryBase,
        });

        const tip = await advise(text, {
          functionId: "tg-handle-text",
          metadata: telemetryBase,
        });

        response = tip
          ? `Записал: "${text}".\nСовет: ${tip}`
          : `Записал: "${text}".`;
        break;

      case "chat":
        // Простое общение - даем дружелюбный ответ
        response = await answerQuestion(text, messageType, {
          functionId: "tg-chat-response",
          metadata: telemetryBase,
        });
        break;

      case "irrelevant":
        // Игнорируем спам и нерелевантные сообщения
        response =
          "Понял, спасибо за сообщение! Если нужна помощь, просто спроси.";
        break;

      default:
        // Fallback - обрабатываем как событие
        parsed = await parseTask(text, {
          functionId: "tg-parse-text-fallback",
          metadata: telemetryBase,
        });

        const fallbackTip = await advise(text, {
          functionId: "tg-handle-text-fallback",
          metadata: telemetryBase,
        });

        response = fallbackTip
          ? `Записал: "${text}".\nСовет: ${fallbackTip}`
          : `Записал: "${text}".`;
    }

    await ctx.reply(response);

    // Логируем в базу только если нужно
    if (messageType.need_logging || parsed) {
      try {
        const tags = extractTags(text);
        await logEvent({
          chatId,
          type: "text",
          text,
          meta: {
            user: ctx.from?.username ?? ctx.from?.id,
            parsed,
            tags,
            messageType: messageType.type,
            subtype: messageType.subtype,
            confidence: messageType.confidence,
          },
        });
      } catch (logError) {
        console.warn("Failed to log event:", logError);
      }
    }
  } catch (err) {
    console.error("Text handling error:", err);
    await ctx.reply(
      "Не удалось обработать сообщение. Попробуйте ещё раз позже.",
    );
  }
}
