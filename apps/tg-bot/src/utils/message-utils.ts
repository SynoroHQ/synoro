import type { Context } from "grammy";

/**
 * Плавно удаляет сообщение с анимацией затухания
 * Сначала редактирует сообщение, делая его полупрозрачным, затем удаляет
 */
export async function smoothDeleteMessage(
  ctx: Context,
  messageId: number,
  chatId: number,
): Promise<void> {
  try {
    // Сначала делаем сообщение полупрозрачным
    await ctx.api.editMessageText(chatId, messageId, "⏳ Обрабатываем...", {
      parse_mode: "HTML",
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: "⏳",
              callback_data: "processing",
            },
          ],
        ],
      },
    });

    // Небольшая задержка для плавности
    await new Promise((resolve) => setTimeout(resolve, 300));

    // Удаляем сообщение
    await ctx.api.deleteMessage(chatId, messageId);
  } catch (error) {
    console.warn("Не удалось плавно удалить сообщение:", error);

    // Fallback: пытаемся удалить напрямую
    try {
      await ctx.api.deleteMessage(chatId, messageId);
    } catch (deleteError) {
      console.warn("Не удалось удалить сообщение даже напрямую:", deleteError);
    }
  }
}

/**
 * Отправляет сообщение "Обрабатываем..." с красивым форматированием
 */
export async function sendProcessingMessage(
  ctx: Context,
  messageType: string = "сообщение",
): Promise<number | undefined> {
  try {
    const processingMsg = await ctx.reply(
      `⏳ Обрабатываем ваше ${messageType}...`,
      {
        parse_mode: "HTML",
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: "⏳ Обрабатываем...",
                callback_data: "processing",
              },
            ],
          ],
        },
      },
    );
    return processingMsg.message_id;
  } catch (error) {
    console.warn("Не удалось отправить сообщение 'Обрабатываем':", error);
    return undefined;
  }
}

/**
 * Удаляет сообщение "Обрабатываем..." с обработкой ошибок
 */
export async function removeProcessingMessage(
  ctx: Context,
  messageId: number | undefined,
  chatId: number,
): Promise<void> {
  if (!messageId) return;

  try {
    await ctx.api.deleteMessage(chatId, messageId);
  } catch (error) {
    console.warn("Не удалось удалить сообщение 'Обрабатываем':", error);
  }
}
