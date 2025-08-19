import { createBot } from "./bot";
import { env } from "./env";
import { startTracing, stopTracing } from "./otel";

async function main() {
  console.log("🚀 Запуск Telegram Bot...");
  console.log(`📋 Конфигурация:`);
  console.log(`   - AI Provider: ${env.AI_PROVIDER}`);
  console.log(
    `   - OpenAI API Key: ${env.OPENAI_API_KEY ? "✅ установлен" : "❌ не установлен"}`,
  );
  console.log(
    `   - Moonshot API Key: ${env.MOONSHOT_API_KEY ? "✅ установлен" : "❌ не установлен"}`,
  );
  console.log(
    `   - Langfuse: ${env.LANGFUSE_PUBLIC_KEY && env.LANGFUSE_SECRET_KEY ? "✅ настроен" : "❌ не настроен"}`,
  );

  await startTracing("synoro-tg-bot");
  const bot = createBot();

  console.log("🔄 Инициализация бота...");
  await bot.start();

  console.log("✅ Telegram Bot успешно запущен!");
  console.log("📱 Режим: long polling");
  console.log("🤖 Бот готов к приему сообщений");
}

main().catch((e: unknown) => {
  console.error("❌ Ошибка при запуске Telegram Bot:", e);
  process.exit(1);
});

// Грейсфул-шутдаун: корректно выгружаем трассинг
for (const sig of ["SIGINT", "SIGTERM"]) {
  process.on(sig, async () => {
    console.log(`\n🛑 Получен сигнал ${sig}, завершение работы...`);
    try {
      console.log("🔄 Остановка трассинга...");
      await stopTracing();
      console.log("✅ Telegram Bot корректно завершен");
    } finally {
      process.exit(0);
    }
  });
}
