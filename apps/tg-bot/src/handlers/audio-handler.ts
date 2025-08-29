import type { Context } from "grammy";

import { apiClient } from "../api/client";
import { DEFAULT_AGENT_OPTIONS } from "../config/agents";
import { env } from "../env";
import { transcribeAudio } from "../services/message-service";
import {
  ProcessingAnimation,
  removeProcessingMessage,
  sendProcessingMessage,
} from "../utils/message-utils";
import { formatForTelegram } from "../utils/telegram-formatter";
import {
  createMessageContext,
  downloadTelegramFile,
  getUserIdentifier,
} from "../utils/telegram-utils";

/**
 * Обрабатывает аудио и голосовые сообщения
 */
export async function handleAudio(ctx: Context): Promise<void> {
  const fileId = ctx.message?.voice?.file_id ?? ctx.message?.audio?.file_id;
  if (!fileId) {
    await ctx.reply("Не удалось получить файл аудио.");
    return;
  }

  // Показываем индикатор "печатает..." для аудио сообщений
  await ctx.replyWithChatAction("typing");

  // Запускаем анимированный индикатор обработки
  const processingAnimation = new ProcessingAnimation(ctx, "аудио сообщение");
  await processingAnimation.start();

  try {
    const messageContext = createMessageContext(ctx);

    console.log(
      `🎤 Обработка аудио от ${getUserIdentifier(ctx.from)} в чате ${messageContext.chatId}`,
    );

    // Проверяем ограничения по длительности
    const maxDurationSec = env.TG_AUDIO_MAX_DURATION_SEC ?? 120; // 2 min default
    const durationSec =
      (ctx.message?.voice as any)?.duration ??
      (ctx.message?.audio as any)?.duration;

    if (typeof durationSec === "number" && durationSec > maxDurationSec) {
      // Останавливаем анимацию обработки перед отправкой ошибки
      await processingAnimation.stop();

      await ctx.reply(
        `Слишком длинное аудио (${durationSec}s). Лимит — ${maxDurationSec}s. Пожалуйста, укоротите запись.`,
      );
      return;
    }

    // Скачиваем файл
    const { buffer, filename } = await downloadTelegramFile(ctx, fileId);

    // Транскрибируем аудио через API
    const transcriptionResult = await transcribeAudio(
      buffer,
      filename,
      messageContext,
    );

    if (!transcriptionResult.success) {
      // Останавливаем анимацию обработки перед отправкой ошибки
      await processingAnimation.stop();

      await ctx.reply("Не удалось распознать аудио. Попробуйте ещё раз позже.");
      return;
    }
    if (!transcriptionResult.text.trim()) {
      // Останавливаем анимацию обработки перед отправкой ошибки
      await processingAnimation.stop();

      await ctx.reply("Голос распознан, но текста не найдено.");
      return;
    }

    let text = transcriptionResult.text.trim();

    // Enforce max text length for downstream processing
    const maxTextLength = env.TG_MESSAGE_MAX_LENGTH ?? 3000;
    if (text.length > maxTextLength) {
      text = text.slice(0, maxTextLength);
    }

    console.log(
      `🎯 Аудио транскрибировано: "${text.slice(0, 50)}${text.length > 50 ? "..." : ""}"`,
    );

    // Обрабатываем транскрибированный текст через агентную систему
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
            ...messageContext.metadata,
            transcribedFrom: "audio",
            originalFilename: filename,
            duration: durationSec,
            smartMode: true,
            timestamp: new Date().toISOString(),
          },
        },
      );

    // Останавливаем анимацию обработки
    await processingAnimation.stop();

    if (!result.success) {
      const prefix = `Распознал: "${text}"\n\n`;
      const MAX_TG_MESSAGE = 4096;
      const room = MAX_TG_MESSAGE - prefix.length;
      const body =
        result.response.length > room
          ? result.response.slice(0, room - 1) + "…"
          : result.response;

      const formattedMessage = formatForTelegram(prefix + body, {
        useEmojis: true,
        useHTML: true,
        addSeparators: true,
      });

      await ctx.reply(formattedMessage.text, {
        parse_mode: formattedMessage.parse_mode,
        disable_web_page_preview: formattedMessage.disable_web_page_preview,
      });
      return;
    }

    // Формируем ответ с указанием распознанного текста
    const prefix = `Распознал: "${text}"\n\n`;
    const MAX_TG_MESSAGE = 4096;
    const room = MAX_TG_MESSAGE - prefix.length;
    const body =
      result.response.length > room
        ? result.response.slice(0, room - 1) + "…"
        : result.response;

    const formattedMessage = formatForTelegram(prefix + body, {
      useEmojis: true,
      useHTML: true,
      addSeparators: true,
    });

    await ctx.reply(formattedMessage.text, {
      parse_mode: formattedMessage.parse_mode,
      disable_web_page_preview: formattedMessage.disable_web_page_preview,
    });
    // Логируем результат обработки
    console.log(
      `✅ Аудио обработано: тип=${result.messageType?.type}, релевантность=${result.relevance?.relevant}`,
    );
  } catch (error) {
    // Останавливаем анимацию обработки в случае ошибки
    await processingAnimation.stop();

    console.error("Audio handling error:", error);

    if (error instanceof Error && error.message.includes("слишком большой")) {
      await ctx.reply(error.message);
    } else {
      await ctx.reply("Не удалось обработать аудио. Попробуйте ещё раз позже.");
    }
  }
}
