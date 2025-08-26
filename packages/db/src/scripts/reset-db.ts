import { sql } from "drizzle-orm";

import { db } from "../client";

// Объявление типов для Bun
declare global {
  const Bun: {
    spawn: (
      command: string[],
      options?: {
        stdio?: [string, string, string];
        cwd?: string;
      },
    ) => {
      exited: Promise<number>;
    };
  };
}

async function resetDatabase() {
  console.log("🗑️ Начинаю обнуление базы данных...");

  try {
    // Удаляем схему public полностью
    console.log("🧹 Удаление схемы public...");
    await db.execute(sql`DROP SCHEMA IF EXISTS public CASCADE;`);

    // Создаем схему public заново
    console.log("🔨 Создание схемы public...");
    await db.execute(sql`CREATE SCHEMA public;`);

    console.log("✅ Схема public успешно пересоздана");
    console.log("🎉 База данных успешно обнулена и готова к миграциям");
  } catch (error) {
    console.error("❌ Ошибка при обнулении базы данных:", error);
    process.exit(1);
  }
}

resetDatabase().catch((error) => {
  console.error("❌ Необработанная ошибка:", error);
  process.exit(1);
});
