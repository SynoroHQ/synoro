import type { Context } from "grammy";

import { env } from "../env";
import { processTextMessage } from "../services/message-service";
import {
  createMessageContext,
  getUserIdentifier,
  isObviousSpam,
} from "../utils/telegram-utils";

/**
 * Обрабатывает текстовые сообщения
 */
export async function handleText(ctx: Context): Promise<void> {
  const text = ctx.message?.text ?? "";

  // Basic input constraints
  const maxLength = env.TG_MESSAGE_MAX_LENGTH ?? 3000;
  if (text.length > maxLength) {
    await ctx.reply(
      `Слишком длинное сообщение (${text.length} символов). Пожалуйста, сократите до ${maxLength}.`,
    );
    return;
  }

  // Check for obvious spam
  if (isObviousSpam(text)) {
    await ctx.reply(
      "Похоже на спам или бессодержательное сообщение. Отправьте, пожалуйста, более осмысленный текст.",
    );
    return;
  }

  // Показываем индикатор "печатает..."
  await ctx.replyWithChatAction("typing");

  try {
    const messageContext = createMessageContext(ctx);

    console.log(
      `📝 Обработка текста от ${getUserIdentifier(ctx.from)} в чате ${messageContext.chatId}: "${text.slice(0, 50)}${text.length > 50 ? "..." : ""}"`,
    );

    // Обрабатываем сообщение через API
    const result = await processTextMessage(text, messageContext);

    if (!result.success) {
      await ctx.reply(result.response);
      return;
    }

    // Отправляем ответ пользователю
    await ctx.reply(result.response);

    // Логируем результат обработки
    console.log(
      `✅ Сообщение обработано: тип=${result.messageType?.type}, релевантность=${result.relevance?.relevant}`,
    );
  } catch (error) {
    console.error("Text handling error:", error);
    await ctx.reply(
      "Не удалось обработать сообщение. Попробуйте ещё раз позже.",
    );
  }
}
