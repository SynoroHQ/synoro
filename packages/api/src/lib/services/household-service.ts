import { eq } from "drizzle-orm";

import { db } from "@synoro/db/client";
import { households } from "@synoro/db/schema";

export interface CreateHouseholdData {
  id?: string;
  name: string;
  description?: string;
  settings?: {
    timezone?: string;
    currency?: string;
    language?: string;
    features?: string[];
  };
}

export class HouseholdService {
  /**
   * Получить household по ID
   */
  async getHouseholdById(id: string) {
    const [household] = await db
      .select()
      .from(households)
      .where(eq(households.id, id))
      .limit(1);

    return household || null;
  }

  /**
   * Создать новый household
   */
  async createHousehold(data: CreateHouseholdData) {
    const [household] = await db
      .insert(households)
      .values({
        id: data.id,
        name: data.name,
        description: data.description,
        settings: data.settings,
        status: "active",
      })
      .returning();

    if (!household) {
      throw new Error("Не удалось создать household");
    }

    return household;
  }

  /**
   * Получить или создать household по умолчанию
   */
  async getOrCreateDefaultHousehold() {
    // Попытка вставки с игнорированием конфликта по ID
    await db
      .insert(households)
      .values({
        id: "default",
        name: "Домашнее хозяйство по умолчанию",
        description:
          "Домашнее хозяйство по умолчанию для анонимных пользователей",
        settings: {
          timezone: "Europe/Moscow",
          currency: "RUB",
          language: "ru",
          features: ["events", "reminders"],
        },
        status: "active",
      })
      .onConflictDoNothing({ target: households.id });

    // Получаем household после вставки (или существующий)
    return await this.getHouseholdById("default");
  }

  /**
   * Проверить существование household
   */
  async householdExists(id: string): Promise<boolean> {
    const household = await this.getHouseholdById(id);
    return household !== null;
  }
}
