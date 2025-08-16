import type { Context } from "grammy";
import { Bot } from "grammy";

import { env } from "./env";
import { handleAudio } from "./handlers/audio";
import { handleText } from "./handlers/text";

export function createBot(): Bot<Context> {
  const bot = new Bot<Context>(env.TELEGRAM_BOT_TOKEN);

  bot.command("start", async (ctx) => {
    await ctx.reply(
      "Привет! Я цифровой мозг для дома: логирую события, понимаю текст и голос, помогаю советами.\n\n" +
        "Отправь текст или голосовое сообщение — я всё пойму.",
    );
  });

  bot.on("message:text", handleText);
  bot.on(["message:voice", "message:audio"], handleAudio);

  bot.catch((err: unknown) => console.error("Bot error:", err));

  return bot;
}
