import { db } from "../client";
import { processedIdempotencyKeys } from "../schemas/chat/schema";

/**
 * Скрипт для очистки старых ключей идемпотентности
 * Удаляет записи старше 24 часов для экономии места в БД
 */
export async function cleanupIdempotencyKeys() {
  const cutoffTime = new Date();
  cutoffTime.setHours(cutoffTime.getHours() - 24);

  try {
    const result = await db
      .delete(processedIdempotencyKeys)
      .where(processedIdempotencyKeys.createdAt < cutoffTime);

    console.log(`Удалено ${result.rowCount} старых ключей идемпотентности`);
    return result.rowCount;
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
