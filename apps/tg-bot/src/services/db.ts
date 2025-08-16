import { and, between, ilike, or } from "drizzle-orm";

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

export async function searchEventsByKeywords(params: {
  chatId?: string;
  keywords: string[];
  limit?: number;
}): Promise<Array<{ id: string; text: string | null; createdAt: Date }>> {
  const { chatId, keywords, limit = 50 } = params;
  if (!keywords || keywords.length === 0) return [];
  const conditions = keywords.map((kw) => ilike(eventLog.text, `%${kw}%`));
  const where = chatId
    ? and(
        eventLog.chatId.eq?.(chatId) ?? (eventLog.chatId as any),
        or(...conditions),
      )
    : or(...conditions);
  const rows = await db
    .select({
      id: eventLog.id,
      text: eventLog.text,
      createdAt: eventLog.createdAt,
    })
    .from(eventLog)
    .where(where as any)
    .orderBy(eventLog.createdAt)
    .limit(limit);
  return rows;
}

export async function filterEventsByDate(params: {
  chatId?: string;
  from: Date;
  to: Date;
  limit?: number;
}): Promise<Array<{ id: string; text: string | null; createdAt: Date }>> {
  const { chatId, from, to, limit = 100 } = params;
  const dateCond = between(eventLog.createdAt, from, to);
  const where = chatId
    ? and(eventLog.chatId.eq?.(chatId) ?? (eventLog.chatId as any), dateCond)
    : dateCond;
  const rows = await db
    .select({
      id: eventLog.id,
      text: eventLog.text,
      createdAt: eventLog.createdAt,
    })
    .from(eventLog)
    .where(where as any)
    .orderBy(eventLog.createdAt)
    .limit(limit);
  return rows;
}
