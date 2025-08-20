import type { Context } from "grammy";
import type { Message, User } from "grammy/types";
import { Bot } from "grammy";

import { env } from "./env";
import { handleAudio } from "./handlers/audio";
import { handleOther } from "./handlers/other";
import { handleText } from "./handlers/text";
import { buildRateLimitKey, checkRateLimit } from "./lib/rate-limit";

/**
 * Определяет тип сообщения Telegram на основе его содержимого
 * @param message - объект сообщения Telegram
 * @returns строка, представляющая тип сообщения
 */
function getMessageType(message?: Message): string {
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

  // Parse allowlist of chat IDs (optional)
  const allowedChats = new Set<string>(
    (env.TG_ALLOWED_CHAT_IDS ?? "")
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s.length > 0),
  );

  const rlWindow = env.TG_RATE_LIMIT_WINDOW_MS ?? 60_000; // 1 min
  const rlLimit = env.TG_RATE_LIMIT_LIMIT ?? 30; // 30 updates per window per user/chat

  // Middleware: allowlist check (if configured)
  bot.use(async (ctx, next) => {
    const chatId = ctx.chat?.id ? String(ctx.chat.id) : null;
    if (allowedChats.size > 0) {
      if (!chatId || !allowedChats.has(chatId)) {
        // Политика: отвечаем один раз на любое сообщение из неразрешённого чата
        try {
          if (chatId) {
            await ctx.reply(
              "Бот недоступен в этом чате. Обратитесь к администратору для доступа.",
            );
          }
        } catch {}
        return; // stop processing
      }
    }
    await next();
  });

  // Middleware: basic rate limiting per chat+user
  bot.use(async (ctx, next) => {
    const chatId = ctx.chat?.id ? String(ctx.chat.id) : "unknown";
    const userId = ctx.from?.id ? String(ctx.from.id) : "anon";
    const key = buildRateLimitKey(["tg", chatId, userId]);
    const { allowed, remaining, resetMs } = checkRateLimit(key, {
      windowMs: rlWindow,
      limit: rlLimit,
    });
    if (!allowed) {
      try {
        await ctx.reply(
          `Слишком много запросов. Попробуйте позже (через ${Math.ceil(resetMs / 1000)} с).`,
        );
      } catch {}
      return;
    }
    await next();
  });

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
