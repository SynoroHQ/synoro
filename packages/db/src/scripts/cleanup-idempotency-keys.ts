// Скрипт временно отключен - таблица processedIdempotencyKeys была удалена из схемы
// TODO: Восстановить или удалить скрипт после уточнения необходимости

/*
import { lt } from "drizzle-orm";

import { db } from "../client";
import { processedIdempotencyKeys } from "../schemas/chat/schema";

/**
 * Скрипт для очистки старых ключей идемпотентности
 * Удаляет записи старше 24 часов для экономии места в БД
 */
/*
export async function cleanupIdempotencyKeys() {
  const cutoffTime = new Date();
  cutoffTime.setHours(cutoffTime.getHours() - 24);

  try {
    const result = await db
      .delete(processedIdempotencyKeys)
      .where(lt(processedIdempotencyKeys.createdAt, cutoffTime))
      .returning();

    console.log(`Удалено ${result.length} старых ключей идемпотентности`);
    return result.length;
  } catch (error) {
    console.error("Ошибка при очистке ключей идемпотентности:", error);
    throw error;
  }
}

// Запуск скрипта если он вызван напрямую
if (require.main === module) {
  cleanupIdempotencyKeys()
    .then(() => {
      console.log("Очистка завершена успешно");
      process.exit(0);
    })
    .catch((error) => {
      console.error("Ошибка при очистке:", error);
      process.exit(1);
    });
}
*/
