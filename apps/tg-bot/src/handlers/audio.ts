import { randomUUID } from "node:crypto";
import type { Context } from "grammy";

import { env } from "../env";
import { processClassifiedMessage } from "../lib/messageProcessor";
import {
  classifyMessageType,
  classifyRelevance,
  transcribe,
} from "../services/ai-service";
import { logEvent } from "../services/db";
import { extractTags } from "../services/relevance";

export async function handleAudio(ctx: Context): Promise<void> {
  const fileId = ctx.message?.voice?.file_id ?? ctx.message?.audio?.file_id;
  if (!fileId) {
    await ctx.reply("Не удалось получить файл аудио.");
    return;
  }

  // Показываем индикатор "печатает..." для аудио сообщений
  await ctx.replyWithChatAction("typing");

  try {
    const traceId = randomUUID();
    const chatId = String(ctx.chat?.id ?? "unknown");
    const userId = ctx.from?.id ? String(ctx.from.id) : "unknown";
    const messageId =
      ctx.message && "message_id" in ctx.message
        ? String(ctx.message.message_id)
        : undefined;

    const file = await ctx.api.getFile(fileId);
    if (!file.file_path) throw new Error("Telegram не вернул file_path");

    const url = `https://api.telegram.org/file/bot${env.TELEGRAM_BOT_TOKEN}/${file.file_path}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Ошибка скачивания аудио: ${res.status}`);
    const arrayBuffer = await res.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const parts = file.file_path.split("/");
    const filename = parts[parts.length - 1] || "audio.ogg";

    const text = await transcribe(buffer, filename, {
      functionId: "tg-transcribe-audio",
      metadata: {
        langfuseTraceId: traceId,
        chatId,
        userId,
        ...(messageId ? { messageId } : {}),
        channel: "telegram",
        type: "audio",
        filename,
      },
    });

    if (text.trim().length === 0) {
      await ctx.reply("Голос распознан, но текста не найдено.");
      return;
    }

    const telemetryBase = {
      langfuseTraceId: traceId,
      chatId,
      userId,
      channel: "telegram",
      type: "audio",
      filename,
      ...(messageId ? { messageId } : {}),
    };

    // Классифицируем тип распознанного сообщения
    const messageType = await classifyMessageType(text, {
      functionId: "tg-classify-audio-message-type",
      metadata: telemetryBase,
    });

    // Обрабатываем сообщение с помощью общей функции
    const result = await processClassifiedMessage(
      text,
      messageType,
      telemetryBase,
      {
        questionFunctionId: "tg-answer-audio-question",
        chatFunctionId: "tg-audio-chat-response",
        parseFunctionId: "tg-parse-audio",
        adviseFunctionId: "tg-advise-audio",
        fallbackParseFunctionId: "tg-parse-audio-fallback",
        fallbackAdviseFunctionId: "tg-advise-audio-fallback",
        responseTemplates: {
          question: (text, answer) => `Распознал: "${text}"\n\n${answer}`,
          event: (text, tip) =>
            tip
              ? `Распознал: "${text}"\nЗаписал!\nСовет: ${tip}`
              : `Распознал: "${text}"\nЗаписал!`,
          chat: (text, chatResponse) =>
            `Распознал: "${text}"\n\n${chatResponse}`,
          irrelevant: (text) =>
            `Распознал: "${text}"\n\nПонял, спасибо за сообщение! Если нужна помощь, просто спроси.`,
          fallback: (text, tip) =>
            tip
              ? `Распознал: "${text}"\nЗаписал!\nСовет: ${tip}`
              : `Распознал: "${text}"\nЗаписал!`,
        },
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
          type: "audio",
          text,
          meta: {
            file_path: file.file_path,
            parsed,
            tags,
            messageType: messageType.type,
            subtype: messageType.subtype,
            confidence: messageType.confidence,
          },
        });
      } catch (logError) {
        console.warn("Failed to log audio event:", logError);
      }
    }
  } catch (err) {
    console.error("Audio handling error:", err);
    await ctx.reply("Не удалось обработать аудио. Попробуйте ещё раз позже.");
  }
}
