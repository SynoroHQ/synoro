import type { Context } from "grammy";

import { env } from "../env";
import { processTextMessage } from "../services/message-service";
import {
  ProcessingAnimation,
  removeProcessingMessage,
  sendProcessingMessage,
} from "../utils/message-utils";
import {
  createMessageContext,
  getUserIdentifier,
  isObviousSpam,
} from "../utils/telegram-utils";
import { formatForTelegram } from "../utils/telegram-formatter";

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

  // Запускаем анимированный индикатор обработки
  const processingAnimation = new ProcessingAnimation(ctx, "текстовое сообщение");
  await processingAnimation.start();

  try {
    const messageContext = createMessageContext(ctx);
    console.log(
      `📝 Обработка текста от ${getUserIdentifier(ctx.from)} в чате ${messageContext.chatId}: "${text.slice(0, 50)}${text.length > 50 ? "..." : ""}"`,
    );

    // Обрабатываем сообщение через существующий сервис
    const result = await processTextMessage(text, {
      ...messageContext,
      metadata: {
        ...messageContext.metadata,
        smartMode: true,
      },
    });

    // Останавливаем анимацию обработки
    await processingAnimation.stop();

    if (!result.success) {
      await ctx.reply(result.response);
      return;
    }

    // Отправляем ответ пользователю
    const MAX_TG_MESSAGE = 4096;
    let reply = result.response;
    
    if (reply.length > MAX_TG_MESSAGE) {
      reply = reply.slice(0, MAX_TG_MESSAGE - 1) + "…";
    }

    // Форматируем ответ для Telegram
    const formattedMessage = formatForTelegram(reply, {
      useEmojis: true,
      useMarkdown: true,
      maxLineLength: 80,
    });

    await ctx.reply(formattedMessage.text, {
      parse_mode: formattedMessage.parse_mode,
      disable_web_page_preview: formattedMessage.disable_web_page_preview,
    });
    // Логируем результат обработки
    console.log(
      `✅ Сообщение обработано: тип=${result.messageType?.type}, релевантность=${result.relevance?.relevant}`,
    );
  } catch (error) {
    // Останавливаем анимацию обработки в случае ошибки
    await processingAnimation.stop();

    console.error("Text handling error:", error);
    await ctx.reply(
      "Не удалось обработать сообщение. Попробуйте ещё раз позже.",
    );
  }
}
