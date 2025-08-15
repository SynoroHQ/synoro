import type { Context } from "grammy";
import { randomUUID } from "crypto";
import { advise } from "../services/openai";
import { logEvent } from "../services/db";

export async function handleText(ctx: Context): Promise<void> {
  const text = ctx.message?.text ?? "";
  let tip = "";
  try {
    const traceId = randomUUID();
    const chatId = String(ctx.chat?.id ?? "unknown");
    const userId = ctx.from?.id ? String(ctx.from.id) : "unknown";
    const messageId = ctx.message && "message_id" in ctx.message ? String(ctx.message.message_id) : undefined;

    tip = await advise(text, {
      functionId: "tg-handle-text",
      metadata: {
        langfuseTraceId: traceId,
        chatId,
        userId,
        ...(messageId ? { messageId } : {}),
        channel: "telegram",
        type: "text",
      },
    });
    const msg = tip ? `Записал: “${text}”.\nСовет: ${tip}` : `Записал: “${text}”.`;
    await ctx.reply(msg);
  } catch (err) {
    console.error("Text handling error:", err);
    await ctx.reply("Не удалось обработать сообщение. Попробуйте ещё раз позже.");
  } finally {
    await logEvent({
      chatId: String(ctx.chat?.id ?? "unknown"),
      type: "text",
      text,
      meta: { user: ctx.from?.username ?? ctx.from?.id },
    });
  }
}
