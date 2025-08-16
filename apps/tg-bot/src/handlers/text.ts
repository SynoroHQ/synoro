import { randomUUID } from "node:crypto";
import type { Context } from "grammy";

import { logEvent } from "../services/db";
import { advise, parseTask, classifyRelevance } from "../services/openai";

export async function handleText(ctx: Context): Promise<void> {
  const text = ctx.message?.text ?? "";
  let tip = "";
  let parsed: unknown = null;
  try {
    const traceId = randomUUID();
    const chatId = String(ctx.chat?.id ?? "unknown");
    const userId = ctx.from?.id ? String(ctx.from.id) : "unknown";
    const messageId =
      ctx.message && "message_id" in ctx.message
        ? String(ctx.message.message_id)
        : undefined;

    parsed = await parseTask(text, {
      functionId: "tg-parse-text",
      metadata: {
        langfuseTraceId: traceId,
        chatId,
        userId,
        channel: "telegram",
        type: "text",
      },
    });
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
    const msg = tip
      ? `Записал: “${text}”.\nСовет: ${tip}`
      : `Записал: “${text}”.`;
    await ctx.reply(msg);
  } catch (err) {
    console.error("Text handling error:", err);
    await ctx.reply(
      "Не удалось обработать сообщение. Попробуйте ещё раз позже.",
    );
  } finally {
    try {
      const cls = await classifyRelevance(text);
      const relevant = (cls?.relevant === true) || Boolean(parsed);
      if (relevant) {
        await logEvent({
          chatId: String(ctx.chat?.id ?? "unknown"),
          type: "text",
          text,
          meta: { user: ctx.from?.username ?? ctx.from?.id, parsed },
        });
      }
    } catch (_e) {
      // If classification fails, log only if parsed exists
      if (parsed) {
        await logEvent({
          chatId: String(ctx.chat?.id ?? "unknown"),
          type: "text",
          text,
          meta: { user: ctx.from?.username ?? ctx.from?.id, parsed },
        });
      }
    }
  }
}
