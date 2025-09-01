import { TRPCError } from "@trpc/server";
import { and, eq } from "drizzle-orm";

import { db } from "@synoro/db/client";
import {
  conversations,
  identityLinks,
  processedIdempotencyKeys,
  user,
} from "@synoro/db/schema";

export interface TelegramUserContext {
  userId: string | null; // null для анонимных пользователей
  telegramUserId: string;
  isAnonymous: boolean;
  conversationId: string;
}

/**
 * Сервис для управления пользователями Telegram
 * Обеспечивает связь между telegramUserId и внутренними пользователями системы
 */
export class TelegramUserService {
  /**
   * Получает или создает контекст пользователя Telegram
   * @param telegramUserId - ID пользователя в Telegram
   * @param messageId - ID сообщения для идемпотентности
   * @returns Контекст пользователя с userId (null для анонимных) и conversationId
   */
  static async getUserContext(
    telegramUserId: string,
    messageId?: string,
  ): Promise<TelegramUserContext> {
    // 1. Пытаемся найти связанного пользователя через identityLinks
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

    let userId: string | null = null;
    let isAnonymous = false;

    if (identityLink.length > 0) {
      // Пользователь зарегистрирован в системе
      const link = identityLink[0];
      if (link) {
        userId = link.userId;
        isAnonymous = false;
      } else {
        userId = null;
        isAnonymous = true;
      }
    } else {
      // Анонимный пользователь
      userId = null;
      isAnonymous = true;
    }

    // 2. Получаем или создаем conversation
    const conversation = await TelegramUserService.getOrCreateConversation(
      userId,
      telegramUserId,
      isAnonymous,
    );

    // 3. Если это анонимный пользователь и есть messageId, проверяем идемпотентность
    if (isAnonymous && messageId) {
      await TelegramUserService.checkIdempotency(telegramUserId, messageId);
    }

    if (!conversation) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Не удалось создать или найти conversation",
      });
    }

    return {
      userId,
      telegramUserId,
      isAnonymous,
      conversationId: conversation.id,
    };
  }

  /**
   * Получает или создает conversation для пользователя
   */
  private static async getOrCreateConversation(
    userId: string | null,
    telegramUserId: string,
    isAnonymous: boolean,
  ) {
    if (isAnonymous) {
      // Для анонимных пользователей ищем по telegramUserId
      const existingConversation = await db
        .select()
        .from(conversations)
        .where(
          and(
            eq(conversations.telegramUserId, telegramUserId),
            eq(conversations.channel, "telegram"),
          ),
        )
        .limit(1);

      if (existingConversation.length > 0) {
        return existingConversation[0];
      }

      // Создаем новую conversation для анонимного пользователя
      const [newConversation] = await db
        .insert(conversations)
        .values({
          telegramUserId: telegramUserId,
          channel: "telegram",
          title: `Telegram User ${telegramUserId}`,
          status: "active",
        })
        .returning();

      return newConversation;
    }
      // Для зарегистрированных пользователей ищем по userId
      const existingConversation = await db
        .select()
        .from(conversations)
        .where(
          and(
            eq(conversations.ownerUserId, userId!),
            eq(conversations.channel, "telegram"),
          ),
        )
        .limit(1);

      if (existingConversation.length > 0) {
        return existingConversation[0];
      }

      // Создаем новую conversation для зарегистрированного пользователя
      const [newConversation] = await db
        .insert(conversations)
        .values({
          ownerUserId: userId!,
          channel: "telegram",
          title: `Telegram User ${telegramUserId}`,
          status: "active",
        })
        .returning();

      return newConversation;
  }

  /**
   * Проверяет идемпотентность для анонимных пользователей
   */
  private static async checkIdempotency(telegramUserId: string, messageId: string) {
    const existingKey = await db
      .select()
      .from(processedIdempotencyKeys)
      .where(
        and(
          eq(processedIdempotencyKeys.telegramUserId, telegramUserId),
          eq(processedIdempotencyKeys.idempotencyKey, messageId),
        ),
      )
      .limit(1);

    if (existingKey.length > 0) {
      throw new TRPCError({
        code: "CONFLICT",
        message: "Сообщение уже было обработано",
      });
    }
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
    const userExists = await db
      .select()
      .from(user)
      .where(eq(user.id, internalUserId))
      .limit(1);

    if (userExists.length === 0) {
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
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
      })
      .from(identityLinks)
      .innerJoin(user, eq(identityLinks.userId, user.id))
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
