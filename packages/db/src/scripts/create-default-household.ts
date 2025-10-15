import { db } from "../client.js";
import { households } from "../schema.js";

async function createDefaultHousehold() {
  try {
    console.log("Создаём дефолтный household...");

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

    console.log("✅ Дефолтный household создан или уже существует");
  } catch (error) {
    console.error("❌ Ошибка при создании:", error);
  }
  process.exit(0);
}

createDefaultHousehold();
