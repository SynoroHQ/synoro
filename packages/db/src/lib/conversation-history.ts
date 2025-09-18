import { and, desc, eq } from "drizzle-orm";

import { conversations, messages } from "../schemas/chat/schema";

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
  db: any;
  userId: string;
  channel: string;
  limit?: number;
  conversationId?: string;
}): Promise<MessageHistoryItem[]> {
  try {
    let query = db
      .select({
        id: messages.id,
        role: messages.role,
        content: messages.content,
        createdAt: messages.createdAt,
        conversationId: messages.conversationId,
      })
      .from(messages)
      .innerJoin(conversations, eq(conversations.id, messages.conversationId))
      .where(
        and(
          eq(conversations.ownerUserId, userId),
          eq(conversations.channel, channel as "telegram" | "web" | "mobile"),
        ),
      )
      .orderBy(desc(messages.createdAt))
      .limit(limit);

    // Если указан конкретный диалог, фильтруем по нему
    if (conversationId) {
      query = query.where(
        and(
          eq(conversations.ownerUserId, userId),
          eq(conversations.channel, channel as "telegram" | "web" | "mobile"),
          eq(messages.conversationId, conversationId),
        ),
      );
    }

    const rows = await query;

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
  db: any;
  userId: string;
  channel: string;
}): Promise<string | null> {
  try {
    const result = await db
      .select({ id: conversations.id })
      .from(conversations)
      .where(
        and(
          eq(conversations.ownerUserId, userId),
          eq(conversations.channel, channel as "telegram" | "web" | "mobile"),
          eq(conversations.status, "active"),
        ),
      )
      .orderBy(desc(conversations.lastMessageAt))
      .limit(1);

    return result.length > 0 ? result[0].id : null;
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
