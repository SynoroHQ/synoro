import { TRPCError } from "@trpc/server";
import { and, eq } from "drizzle-orm";

import { db } from "@synoro/db/client";
import {
  conversations,
  identityLinks,
  users,
} from "@synoro/db/schema";

export interface TelegramUserContext {
  userId: string;
  telegramUserId: string;
  conversationId: string;
}

/**
 * Сервис для управления пользователями Telegram
 * Обеспечивает связь между telegramUserId и внутренними пользователями системы
 * Теперь все пользователи должны быть зарегистрированы в системе
 */
export class TelegramUserService {
  /**
   * Получает или создает контекст пользователя Telegram
   * @param telegramUserId - ID пользователя в Telegram
   * @returns Контекст пользователя с usersId и conversationId
   */
  static async getUserContext(
    telegramUserId: string,
  ): Promise<TelegramUserContext> {
    // 1. Ищем связанного пользователя через identityLinks
    const identityLink = await db
      .select()
      .from(identityLinks)
      .where(
        and(
          eq(identityLinks.provider, "telegram"),
          eq(identityLinks.providerUserId, telegramUserId),
        ),
      )
      .limit(1);

    if (identityLink.length === 0) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "Пользователь не зарегистрирован в системе",
      });
    }

    const link = identityLink[0];
    if (!link) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "Пользователь не зарегистрирован в системе",
      });
    }

    const userId = link.userId;

    // 2. Получаем или создаем conversation
    const conversation = await TelegramUserService.getOrCreateConversation(
      userId,
      telegramUserId,
    );

    if (!conversation) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Не удалось создать или найти conversation",
      });
    }

    return {
      userId,
      telegramUserId,
      conversationId: conversation.id,
    };
  }

  /**
   * Получает или создает conversation для пользователя
   */
  private static async getOrCreateConversation(
    userId: string,
    telegramUserId: string,
  ) {
    // Ищем существующую conversation по userId
    const existingConversation = await db
      .select()
      .from(conversations)
      .where(
        and(
          eq(conversations.ownerUserId, userId),
          eq(conversations.channel, "telegram"),
        ),
      )
      .limit(1);

    if (existingConversation.length > 0) {
      return existingConversation[0];
    }

    // Создаем новую conversation для пользователя
    const [newConversation] = await db
      .insert(conversations)
      .values({
        ownerUserId: userId,
        channel: "telegram",
        title: `Telegram User ${telegramUserId}`,
        status: "active",
      })
      .returning();

    return newConversation;
  }



  /**
   * Связывает Telegram пользователя с внутренним пользователем
   * @param telegramUserId - ID пользователя в Telegram
   * @param internalUserId - ID пользователя в системе
   */
  static async linkUser(
    telegramUserId: string,
    internalUserId: string,
  ): Promise<void> {
    // Проверяем, что пользователь существует
    const usersExists = await db
      .select()
      .from(users)
      .where(eq(users.id, internalUserId))
      .limit(1);

    if (usersExists.length === 0) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Пользователь не найден",
      });
    }

    // Создаем связь
    await db
      .insert(identityLinks)
      .values({
        userId: internalUserId,
        provider: "telegram",
        providerUserId: telegramUserId,
      })
      .onConflictDoNothing(); // Игнорируем дубликаты
  }

  /**
   * Отвязывает Telegram пользователя от внутреннего пользователя
   */
  static async unlinkUser(telegramUserId: string): Promise<void> {
    await db
      .delete(identityLinks)
      .where(
        and(
          eq(identityLinks.provider, "telegram"),
          eq(identityLinks.providerUserId, telegramUserId),
        ),
      );
  }

  /**
   * Получает информацию о связанном пользователе
   * ⚠️ ВНИМАНИЕ: Этот метод возвращает PII (имя, email) и должен использоваться
   * только авторизованными источниками (бот, внутренние сервисы)
   * @param telegramUserId - ID пользователя в Telegram
   * @returns Объект с данными пользователя или null если связь не найдена
   */
  static async getLinkedUser(telegramUserId: string) {
    const link = await db
      .select({
        userId: identityLinks.userId,
        users: {
          id: users.id,
          name: users.name,
          email: users.email,
        },
      })
      .from(identityLinks)
      .innerJoin(users, eq(identityLinks.userId, users.id))
      .where(
        and(
          eq(identityLinks.provider, "telegram"),
          eq(identityLinks.providerUserId, telegramUserId),
        ),
      )
      .limit(1);

    return link.length > 0 ? link[0] : null;
  }

  /**
   * Проверяет статус связи пользователя Telegram (без возврата PII)
   * @param telegramUserId - ID пользователя в Telegram
   * @returns true если пользователь связан, false если нет
   */
  static async checkUserLinkStatus(telegramUserId: string): Promise<boolean> {
    const link = await db
      .select({ userId: identityLinks.userId })
      .from(identityLinks)
      .where(
        and(
          eq(identityLinks.provider, "telegram"),
          eq(identityLinks.providerUserId, telegramUserId),
        ),
      )
      .limit(1);

    return link.length > 0;
  }
}
