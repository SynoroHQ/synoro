import { Context } from "grammy";

import { fastResponseSystem } from "../utils/fast-response-system";
import { formatForTelegram } from "../utils/telegram-formatter";

/**
 * Обработчик обычных текстовых сообщений с Fast Response System
 */
export async function handleText(ctx: Context) {
  try {
    const text = ctx.message?.text || "";

    console.log(`📝 Text handler: "${text}" from user ${ctx.from?.id}`);

    // Проверяем, можно ли дать быстрый ответ
    const fastResponse = fastResponseSystem.analyzeMessage(text);

    if (fastResponse.shouldSendFast) {
      console.log(
        `⚡ Fast response in text handler: ${fastResponse.processingType}`,
      );

      // Отправляем быстрый ответ
      await ctx.reply(fastResponse.fastResponse);
      return;
    }

    // Если быстрый ответ не сработал, отправляем стандартное сообщение
    const response =
      "Понял ваше сообщение! Для более детальной обработки используйте команду /smart";

    const formattedResponse = formatForTelegram(response, {
      useEmojis: true,
      useMarkdown: true,
      addSeparators: false,
    });

    await ctx.reply(formattedResponse.text, {
      parse_mode: formattedResponse.parse_mode || "MarkdownV2",
    });
  } catch (error) {
    console.error("Error in text handler:", error);
    await ctx.reply("❌ Произошла ошибка. Попробуйте еще раз.");
  }
}
