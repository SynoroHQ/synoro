import type { Context } from "grammy";
import { Bot } from "grammy";

import { env } from "./env";
import { handleAudio } from "./handlers/audio-handler";
import { handleOther } from "./handlers/other-handler";
import { handleSmartText } from "./handlers/smart-text-handler";
import { handleText } from "./handlers/text-handler";
import { buildRateLimitKey, checkRateLimit } from "./lib/rate-limit";
import { getMessageType, getUserIdentifier } from "./utils/telegram-utils";

export function createBot(): Bot<Context> {
  const bot = new Bot(env.TELEGRAM_BOT_TOKEN);

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
    if (allowedChats.size > 0) {
      const chatId = ctx.chat?.id ? String(ctx.chat.id) : null;
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

  // Middleware: basic rate limiting per user
  bot.use(async (ctx, next) => {
    const userId = ctx.from?.id ? String(ctx.from.id) : "anon";
    const key = buildRateLimitKey(["tg", userId]);
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
    const messageType = getMessageType(ctx.message);

    console.log(
      `📨 Получено сообщение: тип=${messageType}, пользователь=${user}`,
    );
    await next();
  });

  bot.command("start", async (ctx) => {
    const user = getUserIdentifier(ctx.from);
    console.log(`👋 Команда /start от пользователя: ${user}`);

    await ctx.reply(
      "Привет! Я умный помощник для дома.\n\n" +
        "💬 Отправь текстовое сообщение — я его разберу и проанализирую\n" +
        "🎤 Отправь голосовое — переведу в текст и обработаю\n" +
        "📋 Помогу с делами, вопросами и дам полезные советы\n\n" +
        "Просто начинай разговор!",
      {
        parse_mode: "HTML",
      },
    );
  });

  // Обработчики сообщений
  // Используем умный обработчик, если включена агентная система
  const textHandler = env.TG_USE_AGENT_SYSTEM ? handleSmartText : handleText;
  bot.on("message:text", textHandler);
  bot.on(["message:voice", "message:audio"], handleAudio);
  // Fallback для всех остальных типов сообщений
  bot.on("message", handleOther);

  bot.catch((err: unknown) => {
    console.error("❌ Ошибка в боте:", err);
  });

  return bot;
}
