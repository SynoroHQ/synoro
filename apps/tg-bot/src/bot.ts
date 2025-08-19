import type { Context } from "grammy";
import { Bot } from "grammy";

import { env } from "./env";
import { handleAudio } from "./handlers/audio";
import { handleOther } from "./handlers/other";
import { handleText } from "./handlers/text";

export function createBot(): Bot<Context> {
  const bot = new Bot<Context>(env.TELEGRAM_BOT_TOKEN);

  // Middleware для логирования входящих сообщений
  bot.use(async (ctx, next) => {
    const user =
      ctx.from?.username || ctx.from?.first_name || ctx.from?.id || "unknown";
    const chatId = ctx.chat?.id || "unknown";
    const messageType = ctx.message
      ? ctx.message.text
        ? "text"
        : ctx.message.voice
          ? "voice"
          : ctx.message.audio
            ? "audio"
            : "other"
      : "unknown";

    console.log(
      `📨 Получено сообщение: тип=${messageType}, пользователь=${user}, чат=${chatId}`,
    );
    await next();
  });

  bot.command("start", async (ctx) => {
    const user = ctx.from?.username || ctx.from?.first_name || "пользователь";
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
