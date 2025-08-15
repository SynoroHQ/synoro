import type { Context } from "grammy";
import { advise } from "../services/openai";
import { logEvent } from "../services/db";

export async function handleText(ctx: Context): Promise<void> {
  const text = ctx.message?.text ?? "";
  let tip = "";
  try {
    tip = await advise(text);
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
