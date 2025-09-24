import { TRPCError } from "@trpc/server";
import { and, eq } from "drizzle-orm";

import { db } from "@synoro/db/client";
import { conversations, users } from "@synoro/db/schema";

export interface TelegramUserContext {
  userId: string;
  telegramUserId: string;
  telegramUsername?: string;
  conversationId: string;
}

/**
 * Сервис для управления пользователями Telegram
 * Автоматически создает анонимных пользователей для Telegram пользователей
 * Убирает необходимость в identityLinks для базовой функциональности
 */
export class TelegramUserService {
  /**
   * Получает или создает контекст пользователя Telegram
   * @param telegramUserId - ID пользователя в Telegram
   * @param telegramUsername - Username пользователя в Telegram (опционально)
   * @returns Контекст пользователя с usersId и conversationId
   */
  static async getUserContext(
    telegramUserId: string,
    telegramUsername?: string,
  ): Promise<TelegramUserContext> {
    try {
      // 1. Ищем существующего пользователя по telegramUserId в email
      const existingUser = await db
        .select()
        .from(users)
        .where(eq(users.email, `telegram_${telegramUserId}@anonymous.local`))
        .limit(1);
      let userId: string;

      if (existingUser.length > 0) {
        // Пользователь уже существует, обновляем username если он изменился
        const user = existingUser[0]!;
        userId = user.id;

        // Обновляем username если он предоставлен и отличается от текущего
        if (telegramUsername && user.username !== telegramUsername) {
          await db
            .update(users)
            .set({
              username: telegramUsername,
              updatedAt: new Date(),
            })
            .where(eq(users.id, userId));
        }
      } else {
        // Создаем нового анонимного пользователя
        const [newUser] = await db
          .insert(users)
          .values({
            name: `Telegram User ${telegramUserId}`,
            email: `telegram_${telegramUserId}@anonymous.local`,
            emailVerified: false,
            username: telegramUsername,
            role: "user",
            status: "active",
          })
          .returning();
        if (!newUser) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Не удалось создать пользователя",
          });
        }

        userId = newUser.id;
      }

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
        telegramUsername,
        conversationId: conversation.id,
      };
    } catch (error) {
      console.error("Error in getUserContext:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Ошибка при получении контекста пользователя",
      });
    }
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
        title: `telegram_conversation_${Date.now()}`,
        status: "active",
      })
      .returning();

    return newConversation;
  }

  /**
   * Получает информацию о пользователе Telegram
   * @param telegramUserId - ID пользователя в Telegram
   * @returns Объект с данными пользователя или null если пользователь не найден
   */
  static async getTelegramUser(telegramUserId: string) {
    const user = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        username: users.username,
        role: users.role,
        status: users.status,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(eq(users.email, `telegram_${telegramUserId}@anonymous.local`))
      .limit(1);

    return user.length > 0 ? user[0] : null;
  }

  /**
   * Проверяет существование пользователя Telegram
   * @param telegramUserId - ID пользователя в Telegram
   * @returns true если пользователь существует, false если нет
   */
  static async checkTelegramUserExists(
    telegramUserId: string,
  ): Promise<boolean> {
    const user = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, `telegram_${telegramUserId}@anonymous.local`))
      .limit(1);

    return user.length > 0;
  }
}
