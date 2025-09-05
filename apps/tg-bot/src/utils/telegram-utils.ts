import type { Context } from "grammy";
import type { Message, User } from "grammy/types";

import { env } from "../env";

/**
 * Определяет тип сообщения Telegram на основе его содержимого
 */
export function getMessageType(message?: Message): string {
  if (!message) {
    return "unknown";
  }

  // Карта свойств сообщения к их типам в порядке приоритета
  const messageTypeMap: Array<[keyof Message, string]> = [
    ["text", "text"],
    ["voice", "voice"],
    ["audio", "audio"],
    ["photo", "photo"],
    ["video", "video"],
    ["document", "document"],
    ["sticker", "sticker"],
    ["contact", "contact"],
    ["location", "location"],
  ];

  // Итерируем по карте в порядке приоритета
  for (const [property, type] of messageTypeMap) {
    if (message[property]) {
      return type;
    }
  }

  return "other";
}

/**
 * Получает идентификатор пользователя с fallback логикой
 */
export function getUserIdentifier(from?: User): string {
  return (
    from?.username || from?.first_name || from?.id?.toString() || "unknown"
  );
}

/**
 * Создает контекст для обработки сообщения
 */
export function createMessageContext(ctx: Context) {
  const userId = ctx.from?.id ? String(ctx.from.id) : "unknown";
  const messageId =
    ctx.message && "message_id" in ctx.message
      ? String(ctx.message.message_id)
      : undefined;

  return {
    userId,
    messageId,
    username: ctx.from?.username,
    metadata: {
      user: ctx.from?.username ?? ctx.from?.id,
      chatType: ctx.chat?.type,
      messageType: getMessageType(ctx.message),
    },
  };
}

/**
 * Скачивает файл из Telegram
 */
export async function downloadTelegramFile(
  ctx: Context,
  fileId: string,
): Promise<{
  buffer: Buffer;
  filename: string;
  contentType: string;
}> {
  const maxBytes = env.TG_AUDIO_MAX_BYTES ?? 8 * 1024 * 1024; // 8MB default
  const fetchTimeoutMs = env.TG_FETCH_TIMEOUT_MS ?? 25_000; // 25s default

  const file = await ctx.api.getFile(fileId);
  if (!file.file_path) {
    throw new Error("Telegram не вернул file_path");
  }

  // If Telegram returned file size, enforce it before downloading
  const declaredSize = (file as any).file_size as number | undefined;
  if (typeof declaredSize === "number" && declaredSize > maxBytes) {
    throw new Error(
      `Файл слишком большой (${Math.ceil(declaredSize / (1024 * 1024))} МБ). Лимит — ${Math.floor(
        maxBytes / (1024 * 1024),
      )} МБ.`,
    );
  }

  const url = `https://api.telegram.org/file/bot${env.TELEGRAM_BOT_TOKEN}/${file.file_path}`;

  // Fetch with timeout
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), fetchTimeoutMs);

  try {
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);

    if (!res.ok) {
      throw new Error(`Ошибка скачивания файла: ${res.status}`);
    }

    const arrayBuffer = await res.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    if (buffer.byteLength > maxBytes) {
      throw new Error(
        `Файл слишком большой после скачивания (${Math.ceil(
          buffer.byteLength / (1024 * 1024),
        )} МБ). Лимит — ${Math.floor(maxBytes / (1024 * 1024))} МБ.`,
      );
    }

    // Определяем имя файла и тип контента
    const parts = file.file_path.split("/");
    const filename = parts[parts.length - 1] || "audio.ogg";
    const contentType = getContentTypeFromFilename(filename);

    return { buffer, filename, contentType };
  } catch (error) {
    clearTimeout(timeout);
    throw error;
  }
}

/**
 * Определяет тип контента по имени файла
 */
function getContentTypeFromFilename(filename: string): string {
  if (filename.endsWith(".ogg") || filename.endsWith(".oga")) {
    return "audio/ogg";
  }
  if (filename.endsWith(".mp3")) {
    return "audio/mpeg";
  }
  if (filename.endsWith(".m4a") || filename.endsWith(".mp4")) {
    return "audio/mp4";
  }
  return "application/octet-stream";
}

/**
 * Проверяет, является ли сообщение спамом
 */
export function isObviousSpam(text: string): boolean {
  const t = (text || "").trim();
  if (t.length < 2) return true;

  // Too many URLs
  const urlCount = (t.match(/https?:\/\//gi) || []).length;
  if (urlCount >= 2) return true;

  // Excessive character repetition (e.g., "hhhhhhhhhh")
  if (/(.)\1{9,}/.test(t)) return true;

  // Mostly non-alphanumeric (emojis/symbols only)
  const alnum = t.replace(/[^\p{L}\p{N}]+/gu, "");
  if (alnum.length < 2 && t.length > 10) return true;

  return false;
}

/**
 * Безопасно форматирует текст для отправки в Telegram
 * Использует HTML форматирование для максимальной совместимости
 */
export function formatTelegramText(
  text: string,
  preferHTML = true,
): {
  text: string;
  parse_mode?: "HTML";
} {
  if (!text) return { text };

  if (preferHTML) {
    // Применяем базовое HTML форматирование
    let formattedText = text;

    // Заменяем Markdown заголовки на HTML (жирный текст)
    formattedText = formattedText.replace(/\*\*([^*]+)\*\*/g, "<b>$1</b>");

    // Форматируем курсив (одиночные звездочки)
    formattedText = formattedText.replace(
      /(?<!\*)\*([^*]+)\*(?!\*)/g,
      "<i>$1</i>",
    );

    // Форматируем код
    formattedText = formattedText.replace(/`([^`]+)`/g, "<code>$1</code>");

    // Экранируем HTML символы (но не теги)
    const parts = formattedText.split(/(<[^>]+>)/g);
    formattedText = parts
      .map((part, index) => {
        // Если это HTML тег (четные индексы), не экранируем
        if (index % 2 === 1) {
          return part;
        }

        // Если это обычный текст, экранируем только амперсанд
        return part.replace(/&/g, "&amp;");
      })
      .join("");

    return {
      text: formattedText,
      parse_mode: "HTML",
    };
  }

  // Если HTML отключен, возвращаем как есть
  return { text };
}
