import type { Context } from "grammy";
import { randomUUID } from "crypto";
import { env } from "../env";
import { advise, transcribe } from "../services/openai";
import { logEvent } from "../services/db";

export async function handleAudio(ctx: Context): Promise<void> {
  const fileId = ctx.message?.voice?.file_id ?? ctx.message?.audio?.file_id;
  if (!fileId) {
    await ctx.reply("Не удалось получить файл аудио.");
    return;
  }

  try {
    const traceId = randomUUID();
    const chatId = String(ctx.chat?.id ?? "unknown");
    const userId = ctx.from?.id ? String(ctx.from.id) : "unknown";
    const messageId = ctx.message && "message_id" in ctx.message ? String(ctx.message.message_id) : undefined;

    const file = await ctx.api.getFile(fileId);
    if (!file.file_path) throw new Error("Telegram не вернул file_path");

    const url = `https://api.telegram.org/file/bot${env.TELEGRAM_BOT_TOKEN}/${file.file_path}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Ошибка скачивания аудио: ${res.status}`);
    const arrayBuffer = await res.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const parts = file.file_path.split("/");
    const filename = parts[parts.length - 1] || "audio.ogg";

    const text = await transcribe(buffer, filename, {
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

    await logEvent({
      chatId: String(ctx.chat?.id ?? "unknown"),
      type: "audio",
      text,
      meta: { file_path: file.file_path },
    });

    if (text.trim().length === 0) {
      await ctx.reply("Голос распознан, но текста не найдено.");
      return;
    }

    const tip = await advise(text, {
      functionId: "tg-advise-audio",
      metadata: {
        langfuseTraceId: traceId,
        chatId,
        userId,
        ...(messageId ? { messageId } : {}),
        channel: "telegram",
        type: "audio",
      },
    });
    await ctx.reply(tip ? `Распознал: ${text}\nСовет: ${tip}` : `Распознал: ${text}`);
  } catch (err) {
    console.error("Audio handling error:", err);
    await ctx.reply("Не удалось обработать аудио. Попробуйте ещё раз позже.");
  }
}
