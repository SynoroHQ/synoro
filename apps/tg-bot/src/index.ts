import { createBot } from "./bot";
import { env } from "./env";

async function main() {
  console.log("🚀 Запуск Telegram Bot с API интеграцией...");
  console.log(`📋 Конфигурация:`);
  console.log(
    `   - Telegram Bot Token: ${env.TELEGRAM_BOT_TOKEN ? "✅ установлен" : "❌ не установлен"}`,
  );
  console.log(`   - API URL: ${env.API_BASE_URL}`);
  console.log(
    `   - API Token: ${env.API_TOKEN ? "✅ установлен" : "❌ не установлен"}`,
  );

  const bot = createBot();

  console.log("🔄 Инициализация бота...");
  bot.start();

  console.log("✅ Telegram Bot успешно запущен!");
  console.log("📱 Режим: long polling с API интеграцией");
  console.log("🤖 Бот готов к приему сообщений через API");
}

main().catch((e: unknown) => {
  console.error("❌ Ошибка при запуске Telegram Bot:", e);
  process.exit(1);
});

// Грейсфул-шутдаун
for (const sig of ["SIGINT", "SIGTERM"]) {
  process.on(sig, async () => {
    console.log(`\n🛑 Получен сигнал ${sig}, завершение работы...`);
    console.log("✅ Telegram Bot корректно завершен");
    process.exit(0);
  });
}
