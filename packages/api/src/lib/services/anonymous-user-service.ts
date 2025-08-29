import { and, eq, gt, lt } from "drizzle-orm";

import { db } from "@synoro/db/client";
import { user } from "@synoro/db/schema";

export interface CreateAnonymousUserData {
  telegramChatId: string;
  telegramUsername?: string;
  telegramFirstName?: string;
  telegramLastName?: string;
  name?: string;
}

export interface AnonymousUser {
  id: string;
  name: string;
  isAnonymous: boolean;
  telegramChatId: string;
  telegramUsername?: string;
  telegramFirstName?: string;
  telegramLastName?: string;
  anonymousExpiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Сервис для работы с анонимными пользователями
 * Создает временных пользователей для Telegram пользователей без учетной записи
 */
export class AnonymousUserService {
  /**
   * Создает или получает анонимного пользователя по Telegram Chat ID
   */
  async getOrCreateAnonymousUser(
    data: CreateAnonymousUserData,
  ): Promise<AnonymousUser> {
    // Сначала пытаемся найти существующего анонимного пользователя
    const anonymousUser = await this.findAnonymousUserByTelegramChatId(
      data.telegramChatId,
    );

    if (anonymousUser) {
      // Обновляем время истечения и последнюю активность
      await this.updateAnonymousUserActivity(anonymousUser.id);
      return anonymousUser;
    }

    // Создаем нового анонимного пользователя
    return await this.createAnonymousUser(data);
  }

  /**
   * Создает нового анонимного пользователя
   */
  private async createAnonymousUser(
    data: CreateAnonymousUserData,
  ): Promise<AnonymousUser> {
    const name = data.name || `Anonymous_${data.telegramChatId.slice(-6)}`;
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 дней

    const [newUser] = await db
      .insert(user)
      .values({
        name,
        email: `anon_${data.telegramChatId}@temp.local`,
        emailVerified: false,
        isAnonymous: true,
        telegramChatId: data.telegramChatId,
        telegramUsername: data.telegramUsername,
        telegramFirstName: data.telegramFirstName,
        telegramLastName: data.telegramLastName,
        anonymousExpiresAt: expiresAt,
        role: "user",
        status: "active",
      })
      .returning({
        id: user.id,
        name: user.name,
        isAnonymous: user.isAnonymous,
        telegramChatId: user.telegramChatId,
        telegramUsername: user.telegramUsername,
        telegramFirstName: user.telegramFirstName,
        telegramLastName: user.telegramLastName,
        anonymousExpiresAt: user.anonymousExpiresAt,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      });

    if (!newUser || !newUser.telegramChatId) {
      throw new Error("Не удалось создать анонимного пользователя");
    }

    return {
      ...newUser,
      telegramChatId: newUser.telegramChatId,
    };
  }

  /**
   * Находит анонимного пользователя по Telegram Chat ID
   */
  private async findAnonymousUserByTelegramChatId(
    telegramChatId: string,
  ): Promise<AnonymousUser | null> {
    const [foundUser] = await db
      .select({
        id: user.id,
        name: user.name,
        isAnonymous: user.isAnonymous,
        telegramChatId: user.telegramChatId,
        telegramUsername: user.telegramUsername,
        telegramFirstName: user.telegramFirstName,
        telegramLastName: user.telegramLastName,
        anonymousExpiresAt: user.anonymousExpiresAt,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      })
      .from(user)
      .where(
        and(
          eq(user.telegramChatId, telegramChatId),
          eq(user.isAnonymous, true),
          gt(user.anonymousExpiresAt, new Date()),
        ),
      )
      .limit(1);

    return foundUser || null;
  }

  /**
   * Обновляет активность анонимного пользователя
   */
  private async updateAnonymousUserActivity(userId: string): Promise<void> {
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // Продлеваем на 30 дней

    await db
      .update(user)
      .set({
        anonymousExpiresAt: expiresAt,
        lastLoginAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(user.id, userId));
  }

  /**
   * Получает анонимного пользователя по ID
   */
  async getAnonymousUserById(userId: string): Promise<AnonymousUser | null> {
    const [foundUser] = await db
      .select({
        id: user.id,
        name: user.name,
        isAnonymous: user.isAnonymous,
        telegramChatId: user.telegramChatId,
        telegramUsername: user.telegramUsername,
        telegramFirstName: user.telegramFirstName,
        telegramLastName: user.telegramLastName,
        anonymousExpiresAt: user.anonymousExpiresAt,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      })
      .from(user)
      .where(and(eq(user.id, userId), eq(user.isAnonymous, true)))
      .limit(1);

    return foundUser || null;
  }

  /**
   * Очищает истекшие анонимные сессии
   */
  async cleanupExpiredAnonymousUsers(): Promise<number> {
    const result = await db
      .delete(user)
      .where(
        and(
          eq(user.isAnonymous, true),
          lt(user.anonymousExpiresAt, new Date()),
        ),
      );

    return result.rowCount || 0;
  }

  /**
   * Конвертирует анонимного пользователя в обычного
   */
  async convertAnonymousToRegularUser(
    anonymousUserId: string,
    regularUserData: {
      email: string;
      name?: string;
      password?: string;
    },
  ): Promise<void> {
    await db
      .update(user)
      .set({
        email: regularUserData.email,
        name: regularUserData.name || user.name,
        isAnonymous: false,
        telegramChatId: null,
        telegramUsername: null,
        telegramFirstName: null,
        telegramLastName: null,
        anonymousExpiresAt: null,
        emailVerified: false,
        updatedAt: new Date(),
      })
      .where(and(eq(user.id, anonymousUserId), eq(user.isAnonymous, true)));
  }

  /**
   * Проверяет, является ли пользователь анонимным
   */
  async isAnonymousUser(userId: string): Promise<boolean> {
    const [foundUser] = await db
      .select({ isAnonymous: user.isAnonymous })
      .from(user)
      .where(eq(user.id, userId))
      .limit(1);

    return foundUser?.isAnonymous || false;
  }
}
