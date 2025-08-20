import { randomUUID } from "node:crypto";
import type { Context } from "grammy";

import { env } from "../env";
import { processClassifiedMessage } from "../lib/messageProcessor";
import {
  classifyMessageType,
  transcribe,
} from "../services/ai-service";
import { logEvent } from "../services/db";
import { extractTags } from "../services/relevance";
import { generateS3Key, uploadBufferToS3 } from "@synoro/lib";

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

    // Limits from env
    const maxDurationSec = env.TG_AUDIO_MAX_DURATION_SEC ?? 120; // 2 min default
    const maxBytes = env.TG_AUDIO_MAX_BYTES ?? 8 * 1024 * 1024; // 8MB default
    const fetchTimeoutMs = env.TG_FETCH_TIMEOUT_MS ?? 25_000; // 25s default

    // Validate duration if available
    const durationSec =
      (ctx.message?.voice as any)?.duration ?? (ctx.message?.audio as any)?.duration;
    if (typeof durationSec === "number" && durationSec > maxDurationSec) {
      await ctx.reply(
        `Слишком длинное аудио (${durationSec}s). Лимит — ${maxDurationSec}s. Пожалуйста, укоротите запись.`,
      );
      return;
    }

    const file = await ctx.api.getFile(fileId);
    if (!file.file_path) throw new Error("Telegram не вернул file_path");

    // If Telegram returned file size, enforce it before downloading
    const declaredSize = (file as any).file_size as number | undefined;
    const msgDeclaredSize =
      (ctx.message?.voice as any)?.file_size ?? (ctx.message?.audio as any)?.file_size;
    const sizeToCheck = declaredSize ?? msgDeclaredSize;
    if (typeof sizeToCheck === "number" && sizeToCheck > maxBytes) {
      await ctx.reply(
        `Файл слишком большой (${Math.ceil(sizeToCheck / (1024 * 1024))} МБ). Лимит — ${Math.floor(
          maxBytes / (1024 * 1024),
        )} МБ.`,
      );
      return;
    }

    const url = `https://api.telegram.org/file/bot${env.TELEGRAM_BOT_TOKEN}/${file.file_path}`;

    // Fetch with timeout
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), fetchTimeoutMs);
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);
    if (!res.ok) throw new Error(`Ошибка скачивания аудио: ${res.status}`);
    const arrayBuffer = await res.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    if (buffer.byteLength > maxBytes) {
      await ctx.reply(
        `Файл слишком большой после скачивания (${Math.ceil(
          buffer.byteLength / (1024 * 1024),
        )} МБ). Лимит — ${Math.floor(maxBytes / (1024 * 1024))} МБ.`,
      );
      return;
    }

    const parts = file.file_path.split("/");
    const filename = parts[parts.length - 1] || "audio.ogg";
    const contentType = filename.endsWith(".ogg") || filename.endsWith(".oga")
      ? "audio/ogg"
      : filename.endsWith(".mp3")
        ? "audio/mpeg"
        : filename.endsWith(".m4a") || filename.endsWith(".mp4")
          ? "audio/mp4"
          : "application/octet-stream";

    // Persist raw audio in S3
    const s3Key = generateS3Key(`telegram/${chatId}/${messageId ?? traceId}-${filename}`);
    await uploadBufferToS3(s3Key, buffer, contentType);

    let text = await transcribe(buffer, filename, {
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

    // Enforce max text length for downstream processing/logging
    const maxTextLength = env.TG_MESSAGE_MAX_LENGTH ?? 3000;
    if (text.length > maxTextLength) {
      text = text.slice(0, maxTextLength);
    }

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
            telegram: {
              file_id: fileId,
              duration: durationSec,
            },
            storage: {
              provider: process.env.AWS_S3_ENDPOINT ? "minio" : "s3",
              key: s3Key,
              content_type: contentType,
              size_bytes: buffer.byteLength,
            },
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
