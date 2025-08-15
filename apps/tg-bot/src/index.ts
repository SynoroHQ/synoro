import { Bot, type Context } from "grammy";
import OpenAI from "openai";
import { toFile } from "openai/uploads";
import { env } from "./env";
import { db } from "@synoro/db/client";
import { eventLog } from "@synoro/db/schema";

const bot = new Bot(env.TELEGRAM_BOT_TOKEN);
const openai = new OpenAI({ apiKey: env.OPENAI_API_KEY });

const TRANSCRIBE_MODEL = process.env.OPENAI_TRANSCRIBE_MODEL ?? "whisper-1"; // or "gpt-4o-mini-transcribe"
const ADVICE_MODEL = process.env.OPENAI_ADVICE_MODEL ?? "gpt-4o-mini";

async function advise(input: string): Promise<string> {
  const res = await openai.chat.completions.create({
    model: ADVICE_MODEL,
    messages: [
      {
        role: "system",
        content:
          "Ты полезный домашний ассистент. Кратко анализируй событие и давай практичные советы. Отвечай по-русски, до 3 предложений.",
      },
      { role: "user", content: input },
    ],
    temperature: 0.4,
  });
  return res.choices[0]?.message?.content?.trim() ?? "";
}

async function logEvent(params: {
  chatId: string;
  type: "text" | "audio";
  text?: string;
  meta?: Record<string, unknown> | null;
}) {
  try {
    await db.insert(eventLog).values({
      id: crypto.randomUUID(),
      source: "telegram",
      chatId: params.chatId,
      type: params.type,
      text: params.text ?? null,
      meta: params.meta ?? null,
      createdAt: new Date(),
    });
  } catch (e) {
    console.error("DB log error:", e);
  }
}

bot.command("start", async (ctx: Context) => {
  await ctx.reply(
    "Привет! Я цифровой мозг для дома: логирую события, понимаю текст и голос, помогаю советами.\n\n" +
      "Отправь текст или голосовое сообщение — я всё пойму."
  );
});

bot.on("message:text", async (ctx: Context) => {
  const text = ctx.message.text ?? "";
  // TODO: логировать в БД (@synoro/db)
  const tip = await advise(text);
  const msg = tip
    ? `Записал: “${text}”.\nСовет: ${tip}`
    : `Записал: “${text}”.`;
  await ctx.reply(msg);
  await logEvent({
    chatId: String(ctx.chat?.id ?? "unknown"),
    type: "text",
    text,
    meta: { user: ctx.from?.username ?? ctx.from?.id },
  });
});

bot.on(["message:voice", "message:audio"], async (ctx: Context) => {
  const fileId = ctx.message.voice?.file_id ?? ctx.message.audio?.file_id;
  if (!fileId) {
    await ctx.reply("Не удалось получить файл аудио.");
    return;
  }

  try {
    // 1) Получаем путь к файлу у Telegram
    const file = await ctx.api.getFile(fileId);
    if (!file.file_path) throw new Error("Telegram не вернул file_path");

    const url = `https://api.telegram.org/file/bot${env.TELEGRAM_BOT_TOKEN}/${file.file_path}`;

    // 2) Скачиваем аудио-файл
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Ошибка скачивания аудио: ${res.status}`);
    const arrayBuffer = await res.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Определим имя файла по расширению в пути (если есть)
    const fileName = (() => {
      const parts = file.file_path.split("/");
      const base = parts[parts.length - 1] || "audio.ogg";
      return base;
    })();

    // 3) Транскрибация в текст
    const transcription = await openai.audio.transcriptions.create({
      file: await toFile(buffer, fileName),
      model: TRANSCRIBE_MODEL,
      // language: "ru" // опционально, если хотите фиксировать язык
    });

    const text = transcription.text ?? "";

    // TODO: логировать в БД (@synoro/db)
    await logEvent({
      chatId: String(ctx.chat?.id ?? "unknown"),
      type: "audio",
      text,
      meta: { file_path: file.file_path },
    });

    // 4) Ответ пользователю
    if (text.trim().length === 0) {
      await ctx.reply("Голос распознан, но текста не найдено.");
    } else {
      const tip = await advise(text);
      await ctx.reply(
        tip ? `Распознал: ${text}\nСовет: ${tip}` : `Распознал: ${text}`,
      );
    }
  } catch (err: unknown) {
    console.error("Audio handling error:", err);
    await ctx.reply("Не удалось обработать аудио. Попробуйте ещё раз позже.");
  }
});

async function main() {
  console.log("TG Bot запускается...");
  bot.catch((err: unknown) => console.error("Bot error:", err));
  await bot.start();
  console.log("TG Bot работает (long polling)");
}

main().catch((e: unknown) => {
  console.error(e);
  process.exit(1);
});
