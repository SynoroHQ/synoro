import { createBot } from "./bot";

async function main() {
  const bot = createBot();
  console.log("TG Bot запускается...");
  await bot.start();
  console.log("TG Bot работает (long polling)");
}

main().catch((e: unknown) => {
  console.error(e);
  process.exit(1);
});
