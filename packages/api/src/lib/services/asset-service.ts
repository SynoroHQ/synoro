import { TRPCError } from "@trpc/server";
import { and, desc, eq } from "drizzle-orm";

import { db } from "@synoro/db/client";
import { assets, eventAssets } from "@synoro/db/schema";

export interface CreateAssetInput {
  householdId: string;
  type:
    | "vehicle"
    | "building"
    | "appliance"
    | "electronics"
    | "furniture"
    | "tool"
    | "other";
  name: string;
  description?: string;
  metadata?: Record<string, unknown>;
}

export interface UpdateAssetInput {
  id: string;
  householdId: string;
  name?: string;
  description?: string;
  status?: "active" | "inactive" | "maintenance" | "sold" | "disposed";
  metadata?: Record<string, unknown>;
}

export interface GetAssetEventsInput {
  assetId: string;
  householdId: string;
  limit?: number;
  offset?: number;
}

/**
 * Сервис для работы с объектами/активами домохозяйства
 */
export class AssetService {
  /**
   * Создать новый объект
   */
  async createAsset(input: CreateAssetInput) {
    try {
      const [asset] = await db
        .insert(assets)
        .values({
          householdId: input.householdId,
          type: input.type,
          name: input.name,
          description: input.description,
          metadata: input.metadata,
        })
        .returning();

      return asset;
    } catch (error) {
      console.error("Error creating asset:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Ошибка при создании объекта",
      });
    }
  }

  /**
   * Обновить объект
   */
  async updateAsset(input: UpdateAssetInput) {
    try {
      const [asset] = await db
        .update(assets)
        .set({
          name: input.name,
          description: input.description,
          status: input.status,
          metadata: input.metadata,
        })
        .where(
          and(
            eq(assets.id, input.id),
            eq(assets.householdId, input.householdId),
          ),
        )
        .returning();

      if (!asset) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Объект не найден",
        });
      }

      return asset;
    } catch (error) {
      console.error("Error updating asset:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Ошибка при обновлении объекта",
      });
    }
  }

  /**
   * Получить объекты домохозяйства
   */
  async getHouseholdAssets(householdId: string) {
    try {
      return await db.query.assets.findMany({
        where: eq(assets.householdId, householdId),
        orderBy: [desc(assets.createdAt)],
      });
    } catch (error) {
      console.error("Error getting household assets:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Ошибка при получении объектов",
      });
    }
  }

  /**
   * Получить объект по ID
   */
  async getAssetById(id: string, householdId: string) {
    try {
      const asset = await db.query.assets.findFirst({
        where: and(eq(assets.id, id), eq(assets.householdId, householdId)),
      });

      if (!asset) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Объект не найден",
        });
      }

      return asset;
    } catch (error) {
      console.error("Error getting asset:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Ошибка при получении объекта",
      });
    }
  }

  /**
   * Привязать событие к объекту
   */
  async linkEventToAsset(eventId: string, assetId: string) {
    try {
      await db.insert(eventAssets).values({
        eventId,
        assetId,
      });
    } catch (error) {
      console.error("Error linking event to asset:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Ошибка при привязке события к объекту",
      });
    }
  }

  /**
   * Получить события по объекту
   */
  async getAssetEvents(input: GetAssetEventsInput) {
    try {
      const { assetId, householdId, limit = 50, offset = 0 } = input;

      // Проверяем что объект принадлежит домохозяйству
      await this.getAssetById(assetId, householdId);

      const assetEvents = await db.query.eventAssets.findMany({
        where: eq(eventAssets.assetId, assetId),
        with: {
          event: {
            with: {
              properties: true,
              tags: {
                with: {
                  tag: true,
                },
              },
            },
          },
        },
        orderBy: [desc(eventAssets.createdAt)],
        limit,
        offset,
      });

      return assetEvents.map((ea: any) => ea.event);
    } catch (error) {
      console.error("Error getting asset events:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Ошибка при получении событий объекта",
      });
    }
  }

  /**
   * Удалить объект (мягкое удаление)
   */
  async deleteAsset(id: string, householdId: string) {
    try {
      const [asset] = await db
        .update(assets)
        .set({
          deletedAt: new Date(),
        })
        .where(and(eq(assets.id, id), eq(assets.householdId, householdId)))
        .returning();

      if (!asset) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Объект не найден",
        });
      }

      return asset;
    } catch (error) {
      console.error("Error deleting asset:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Ошибка при удалении объекта",
      });
    }
  }
}
