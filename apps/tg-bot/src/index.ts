import { createBot } from "./bot";
import { startTracing, stopTracing } from "./otel";

async function main() {
  await startTracing("synoro-tg-bot");
  const bot = createBot();
  console.log("TG Bot запускается...");
  await bot.start();
  console.log("TG Bot работает (long polling)");
}

main().catch((e: unknown) => {
  console.error(e);
  process.exit(1);
});

// Грейсфул-шутдаун: корректно выгружаем трассинг
for (const sig of ["SIGINT", "SIGTERM"]) {
  process.on(sig, async () => {
    try {
      await stopTracing();
    } finally {
      process.exit(0);
    }
  });
}
