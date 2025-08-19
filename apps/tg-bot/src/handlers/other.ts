import type { Context } from "grammy";

import { classifyRelevance } from "../services/ai-service";
import { logEvent } from "../services/db";

// Fallback handler for any other message types the bot doesn't process yet
export async function handleOther(ctx: Context): Promise<void> {
  const msg: any = ctx.message;
  if (!msg) return;

  // Skip if already handled by text/voice/audio handlers
  if ("text" in msg || "voice" in msg || "audio" in msg) return;

  try {
    // If a caption exists (e.g., photo with caption), try to log if relevant
    const caption = typeof msg.caption === "string" ? msg.caption.trim() : "";
    if (caption) {
      try {
        const cls = await classifyRelevance(caption);
        if (cls?.relevant === true) {
          await logEvent({
            chatId: String(ctx.chat?.id ?? "unknown"),
            type: "text",
            text: caption,
            meta: {
              kind: "caption",
              messageType:
                "photo" in msg
                  ? "photo"
                  : "video" in msg
                    ? "video"
                    : "document" in msg
                      ? "document"
                      : "animation" in msg
                        ? "animation"
                        : "sticker" in msg
                          ? "sticker"
                          : "location" in msg
                            ? "location"
                            : "contact" in msg
                              ? "contact"
                              : "poll" in msg
                                ? "poll"
                                : "other",
            },
          });
        }
      } catch (_e) {
        // ignore classification errors; do not log
      }
      await ctx.reply(
        "Принял подпись к медиа. Если хотите, можете отправить её отдельным текстом для более точного анализа.",
      );
      return;
    }

    await ctx.reply(
      "Я пока умею понимать текст и голос. Отправьте текстовое сообщение или голосовое — я всё пойму.",
    );
  } catch (e) {
    console.error("Other message handling error:", e);
  }
}
