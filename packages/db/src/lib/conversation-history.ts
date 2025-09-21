import { and, desc, eq, isNotNull, sql } from "drizzle-orm";

import type { Database } from "../types";
import { conversations, messages } from "../schemas/chat/schema";

// Тип для каналов
type Channel = "telegram" | "web" | "mobile";

// Определяем тип локально, чтобы избежать циклических зависимостей
export interface MessageHistoryItem {
  id: string;
  role: "user" | "assistant" | "system" | "tool";
  content: string;
  timestamp: Date;
  metadata?: {
    agentName?: string;
    model?: string;
    confidence?: number;
    [key: string]: unknown;
  };
}

/**
 * Получение истории сообщений для пользователя и канала
 * Возвращает последние сообщения в хронологическом порядке
 */
export async function getConversationHistory({
  db,
  userId,
  channel,
  limit = 20,
  conversationId,
}: {
  db: Database;
  userId: string;
  channel: Channel;
  limit?: number;
  conversationId?: string;
}): Promise<MessageHistoryItem[]> {
  try {
    console.log("getConversationHistory called with:", {
      userId,
      channel,
      limit,
      conversationId,
    });

    // Создаем массив условий для фильтрации
    const conditions = [
      eq(conversations.ownerUserId, userId),
      eq(conversations.channel, channel),
    ];

    // Если указан конкретный диалог, добавляем условие фильтрации по нему
    if (conversationId) {
      conditions.push(eq(messages.conversationId, conversationId));
    }

    const query = db
      .select({
        id: messages.id,
        role: messages.role,
        content: messages.content,
        createdAt: messages.createdAt,
        conversationId: messages.conversationId,
      })
      .from(messages)
      .orderBy(desc(messages.createdAt))
      .limit(limit);

    // Если указан конкретный диалог, используем только фильтр по conversationId
    if (conversationId) {
      query = query.where(eq(messages.conversationId, conversationId));
    } else {
      // Если conversationId не указан, используем фильтры по conversations и добавляем join
      query = query
        .innerJoin(conversations, eq(conversations.id, messages.conversationId))
        .where(
          and(
            eq(conversations.ownerUserId, userId),
            eq(conversations.channel, channel as "telegram" | "web" | "mobile"),
          ),
        );
    }

    const rows = await query;
    console.log("Found messages in database:", rows.length);

    // Преобразуем в MessageHistoryItem и разворачиваем порядок (старые сначала)
    const history: MessageHistoryItem[] = rows.reverse().map((row: any) => ({
      id: row.id,
      role: row.role as "user" | "assistant" | "system" | "tool",
      content: extractTextFromContent(row.content),
      timestamp: row.createdAt,
      metadata: {
        conversationId: row.conversationId,
      },
    }));

    return history;
  } catch (error) {
    console.error("Error fetching conversation history:", error);
    return [];
  }
}

/**
 * Получение активного диалога пользователя для канала
 */
export async function getActiveConversation({
  db,
  userId,
  channel,
}: {
  db: Database;
  userId: string;
  channel: Channel;
}): Promise<string | null> {
  try {
    const result = await db
      .select({ id: conversations.id })
      .from(conversations)
      .where(
        and(
          eq(conversations.ownerUserId, userId),
          eq(conversations.channel, channel),
          eq(conversations.status, "active"),
          isNotNull(conversations.lastMessageAt),
        ),
      )
      .orderBy(sql`${conversations.lastMessageAt} DESC NULLS LAST`)
      .limit(1);

    return result.length > 0 ? (result[0]?.id ?? null) : null;
  } catch (error) {
    console.error("Error fetching active conversation:", error);
    return null;
  }
}

/**
 * Извлечение текста из содержимого сообщения
 */
function extractTextFromContent(content: any): string {
  if (typeof content === "string") {
    return content;
  }

  if (typeof content === "object" && content !== null) {
    // Поддерживаем различные форматы контента
    if (content.text) {
      return String(content.text);
    }
    if (content.message) {
      return String(content.message);
    }
    if (content.content) {
      return String(content.content);
    }
  }

  return String(content);
}
