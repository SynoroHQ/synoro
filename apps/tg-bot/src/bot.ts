import type { Context } from "grammy";
import type { Message, User } from "grammy/types";
import { Bot } from "grammy";

import { env } from "./env";
import { handleAudio } from "./handlers/audio";
import { handleOther } from "./handlers/other";
import { handleText } from "./handlers/text";

/**
 * Определяет тип сообщения Telegram на основе его содержимого
 * @param message - объект сообщения Telegram
 * @returns строка, представляющая тип сообщения
 */
function getMessageType(message?: Message): string {
  if (!message) {
    return "unknown";
  }

  if (message.text) {
    return "text";
  }

  if (message.voice) {
    return "voice";
  }

  if (message.audio) {
    return "audio";
  }

  if (message.photo) {
    return "photo";
  }

  if (message.video) {
    return "video";
  }

  if (message.document) {
    return "document";
  }

  if (message.sticker) {
    return "sticker";
  }

  if (message.contact) {
    return "contact";
  }

  if (message.location) {
    return "location";
  }

  return "other";
}

/**
 * Получает идентификатор пользователя с fallback логикой
 * @param from - объект пользователя Telegram
 * @returns строка, представляющая идентификатор пользователя
 */
function getUserIdentifier(from?: User): string {
  return (
    from?.username || from?.first_name || from?.id?.toString() || "unknown"
  );
}

export function createBot(): Bot<Context> {
  const bot = new Bot<Context>(env.TELEGRAM_BOT_TOKEN);

  // Middleware для логирования входящих сообщений
  bot.use(async (ctx, next) => {
    const user = getUserIdentifier(ctx.from);
    const chatId = ctx.chat?.id || "unknown";
    const messageType = getMessageType(ctx.message);

    console.log(
      `📨 Получено сообщение: тип=${messageType}, пользователь=${user}, чат=${chatId}`,
    );
    await next();
  });

  bot.command("start", async (ctx) => {
    const user = getUserIdentifier(ctx.from);
    console.log(`👋 Команда /start от пользователя: ${user}`);

    await ctx.reply(
      "Привет! Я цифровой мозг для дома: логирую события, понимаю текст и голос, помогаю советами.\n\n" +
        "Отправь текст или голосовое сообщение — я всё пойму.",
    );
  });

  bot.on("message:text", handleText);
  bot.on(["message:voice", "message:audio"], handleAudio);
  // Fallback for any other message types
  bot.on("message", handleOther);

  bot.catch((err: unknown) => {
    console.error("❌ Ошибка в боте:", err);
  });

  return bot;
}
