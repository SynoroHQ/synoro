import { randomUUID } from "node:crypto";
import type { Context } from "grammy";

import { processClassifiedMessage } from "../lib/messageProcessor";
import { classifyMessageType } from "../services/ai-service";
import { logEvent } from "../services/db";
import { extractTags, isObviousSpam } from "../services/relevance";
import { env } from "../env";

export async function handleText(ctx: Context): Promise<void> {
  const text = ctx.message?.text ?? "";

  // Basic input constraints
  const maxLength = env.TG_MESSAGE_MAX_LENGTH ?? 3000;
  if (text.length > maxLength) {
    await ctx.reply(
      `Слишком длинное сообщение (${text.length} символов). Пожалуйста, сократите до ${maxLength}.`,
    );
    return;
  }

  if (isObviousSpam(text)) {
    await ctx.reply(
      "Похоже на спам или бессодержательное сообщение. Отправьте, пожалуйста, более осмысленный текст.",
    );
    return;
  }

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

    // Обрабатываем сообщение с помощью общей функции
    const result = await processClassifiedMessage(
      text,
      messageType,
      telemetryBase,
      {
        questionFunctionId: "tg-answer-question",
        chatFunctionId: "tg-chat-response",
        parseFunctionId: "tg-parse-text",
        adviseFunctionId: "tg-handle-text",
        fallbackParseFunctionId: "tg-parse-text-fallback",
        fallbackAdviseFunctionId: "tg-handle-text-fallback",
      },
    );

    const { response, parsed } = result;

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
