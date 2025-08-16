import { createId } from "@synoro/db";
import { db } from "@synoro/db/client";
import { eventLog } from "@synoro/db/schema";

export async function logEvent(params: {
  chatId: string;
  type: "text" | "audio";
  text?: string;
  meta?: Record<string, unknown> | null;
}): Promise<void> {
  try {
    await db.insert(eventLog).values({
      id: createId(),
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
