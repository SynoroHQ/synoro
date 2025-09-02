import type { Context } from "grammy";

import { createMessageAnimation } from "./message-animation";

/**
 * Безопасно удаляет сообщение анимации, перехватывая ошибки
 */
export async function cleanupAnimation(
  animation: ReturnType<typeof createMessageAnimation>,
  ctx: Context,
): Promise<void> {
  const messageId = animation.getMessageId();
  const chatId = animation.getChatId();

  if (messageId && chatId) {
    try {
      await ctx.api.deleteMessage(chatId, messageId);
    } catch (error) {
      console.warn("Не удалось удалить анимацию:", error);
    }
  }

  // Останавливаем анимацию
  await animation.stop();
}

/**
 * Выполняет действие с анимацией, автоматически очищая её в блоке finally
 */
export async function runWithAnimation<T>(
  ctx: Context,
  animationType: "fast" | "processing" | "thinking" | "working" | "agents",
  duration: number,
  action: () => Promise<T>,
): Promise<T> {
  const animation = await createMessageAnimation();

  try {
    await animation.start(ctx, animationType, { maxDuration: duration });
    return await action();
  } finally {
    await cleanupAnimation(animation, ctx);
  }
}
