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
    const existing = await this.getHouseholdById("default");
    
    if (existing) {
      return existing;
    }

    return await this.createHousehold({
      id: "default",
      name: "Default Household",
      description: "Default household for anonymous users",
      settings: {
        timezone: "Europe/Moscow",
        currency: "RUB",
        language: "ru",
        features: ["events", "reminders"]
      }
    });
  }

  /**
   * Проверить существование household
   */
  async householdExists(id: string): Promise<boolean> {
    const household = await this.getHouseholdById(id);
    return household !== null;
  }
}
