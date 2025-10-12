import { createId } from "@paralleldrive/cuid2";
import {
  index,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

import { households } from "./household";

export const assetType = pgEnum("asset_type", [
  "vehicle", // Транспорт (машина, мотоцикл, велосипед)
  "building", // Строение (дом, квартира, дача)
  "appliance", // Техника (холодильник, стиральная машина)
  "electronics", // Электроника (компьютер, телефон)
  "furniture", // Мебель
  "tool", // Инструменты
  "other", // Другое
]);

export const assetStatus = pgEnum("asset_status", [
  "active", // Активно используется
  "inactive", // Не используется
  "maintenance", // На обслуживании
  "sold", // Продано
  "disposed", // Утилизировано
]);

/**
 * Таблица объектов/активов домохозяйства
 * Хранит информацию о машинах, строениях, технике и других объектах
 * Позволяет привязывать события к конкретным объектам для аналитики
 */
export const assets = pgTable(
  "assets",
  {
    id: text("id").primaryKey().$defaultFn(createId),
    householdId: text("household_id")
      .notNull()
      .references(() => households.id, { onDelete: "cascade" }),
    type: assetType("type").notNull(),
    status: assetStatus("status").notNull().default("active"),
    name: text("name").notNull(), // Название (например: "Toyota Camry", "Квартира на Ленина")
    description: text("description"), // Описание
    // Метаданные специфичные для типа объекта
    metadata: jsonb("metadata").$type<{
      // Для транспорта
      make?: string; // Марка
      model?: string; // Модель
      year?: number; // Год выпуска
      vin?: string; // VIN номер
      licensePlate?: string; // Гос. номер
      mileage?: number; // Пробег
      // Для строений
      address?: string; // Адрес
      area?: number; // Площадь
      rooms?: number; // Количество комнат
      // Для техники/электроники
      brand?: string; // Бренд
      serialNumber?: string; // Серийный номер
      purchaseDate?: string; // Дата покупки
      warrantyUntil?: string; // Гарантия до
      // Общие поля
      photos?: string[]; // Ссылки на фото
      documents?: string[]; // Ссылки на документы
      [key: string]: unknown;
    } | null>(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (table) => [
    index("asset_household_idx").on(table.householdId),
    index("asset_type_idx").on(table.type),
    index("asset_status_idx").on(table.status),
    index("asset_household_type_idx").on(table.householdId, table.type),
  ],
);
