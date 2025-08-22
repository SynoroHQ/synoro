import type { Context } from "grammy";

import { getMessageType } from "../utils/telegram-utils";

/**
 * Обрабатывает все остальные типы сообщений (фото, видео, стикеры и т.д.)
 */
export async function handleOther(ctx: Context): Promise<void> {
  const msg: any = ctx.message;
  if (!msg) return;

  // Skip if already handled by text/voice/audio handlers
  if ("text" in msg || "voice" in msg || "audio" in msg) return;

  // Показываем индикатор "печатает..." для других типов сообщений
  await ctx.replyWithChatAction("typing");

  try {
    const messageType = getMessageType(ctx.message);

    // If a caption exists (e.g., photo with caption), extract it
    const caption = typeof msg.caption === "string" ? msg.caption.trim() : "";

    if (caption) {
      await ctx.reply(
        `Получил ${getMessageTypeDisplayName(messageType)} с подписью: "${caption}"\n\n` +
          "Для более точного анализа отправьте текст отдельным сообщением.",
      );
      return;
    }

    // For messages without caption
    await ctx.reply(
      `Получил ${getMessageTypeDisplayName(messageType)}. ` +
        "Я умею обрабатывать текстовые и голосовые сообщения. " +
        "Отправьте текст или голосовое сообщение для анализа.",
    );
  } catch (error) {
    console.error("Other message handling error:", error);
    await ctx.reply(
      "Получил ваше сообщение, но не смог его обработать. " +
        "Попробуйте отправить текстовое или голосовое сообщение.",
    );
  }
}

/**
 * Возвращает человекопонятное название типа сообщения
 */
function getMessageTypeDisplayName(type: string): string {
  const typeMap: Record<string, string> = {
    photo: "фотографию",
    video: "видео",
    document: "документ",
    sticker: "стикер",
    contact: "контакт",
    location: "местоположение",
    animation: "GIF",
    poll: "опрос",
    voice: "голосовое сообщение",
    audio: "аудиофайл",
    text: "текстовое сообщение",
  };

  return typeMap[type] || "сообщение";
}
