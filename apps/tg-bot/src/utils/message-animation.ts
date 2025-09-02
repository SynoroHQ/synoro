import type { Context } from "grammy";

/**
 * Утилиты для анимации сообщений в Telegram боте
 */

export interface AnimationOptions {
  /** Интервал обновления анимации в миллисекундах */
  updateInterval?: number;
  /** Максимальное время анимации в миллисекундах */
  maxDuration?: number;
  /** Текст для отображения после завершения анимации */
  finalText?: string;
}

/**
 * Анимация обработки с различными индикаторами
 */
export class MessageAnimation {
  private messageId: number | null = null;
  private chatId: number | null = null;
  private animationInterval: NodeJS.Timeout | null = null;
  private startTime: number = 0;
  private isActive: boolean = false;

  // Различные варианты анимации - естественные для пользователя
  public readonly animations = {
    processing: ["🤔 Думаю...", "🤔 Думаю.", "🤔 Думаю..", "🤔 Думаю..."],
    thinking: [
      "💭 Размышляю...",
      "💭 Размышляю.",
      "💭 Размышляю..",
      "💭 Размышляю...",
    ],
    working: ["⚡ Работаю...", "⚡ Работаю.", "⚡ Работаю..", "⚡ Работаю..."],
    agents: [
      "✨ Обрабатываю...",
      "✨ Обрабатываю.",
      "✨ Обрабатываю..",
      "✨ Обрабатываю...",
    ],
    fast: [
      "⚡ Секундочку...",
      "⚡ Секундочку.",
      "⚡ Секундочку..",
      "⚡ Секундочку...",
    ],
  };

  /**
   * Запуск анимации обработки
   */
  async start(
    ctx: Context,
    type: keyof typeof MessageAnimation.prototype.animations = "processing",
    options: AnimationOptions = {},
  ): Promise<void> {
    if (this.isActive) {
      await this.stop();
    }

    const {
      updateInterval = 1000,
      maxDuration = 30000, // 30 секунд максимум
    } = options;

    this.chatId = ctx.chat?.id || null;
    this.startTime = Date.now();
    this.isActive = true;

    try {
      // Отправляем начальное сообщение
      const initialText = this.animations[type][0];
      if (!initialText) {
        throw new Error(`Invalid animation type: ${type}`);
      }
      const initialMessage = await ctx.reply(initialText);
      this.messageId = initialMessage.message_id;

      // Запускаем анимацию
      let frameIndex = 0;
      this.animationInterval = setInterval(async () => {
        if (!this.isActive || !this.messageId || !this.chatId) {
          return;
        }

        // Проверяем максимальное время
        if (Date.now() - this.startTime > maxDuration) {
          await this.stop();
          return;
        }

        try {
          frameIndex = (frameIndex + 1) % this.animations[type].length;
          const frameText = this.animations[type][frameIndex];
          if (frameText) {
            await ctx.api.editMessageText(
              this.chatId,
              this.messageId,
              frameText,
            );
          }
        } catch (error) {
          console.warn("Ошибка обновления анимации:", error);
          // Не останавливаем анимацию при ошибке редактирования
        }
      }, updateInterval);
    } catch (error) {
      console.error("Ошибка запуска анимации:", error);
      this.isActive = false;
    }
  }

  /**
   * Остановка анимации и замена на финальный текст
   */
  async stop(finalText?: string): Promise<void> {
    if (!this.isActive) {
      return;
    }

    this.isActive = false;

    if (this.animationInterval) {
      clearInterval(this.animationInterval);
      this.animationInterval = null;
    }

    // Если есть финальный текст, обновляем сообщение
    if (finalText && this.messageId && this.chatId) {
      try {
        // Используем глобальный объект бота для обновления
        // Это будет реализовано в обработчиках
        console.log(`🎯 Анимация завершена: ${finalText}`);
      } catch (error) {
        console.warn("Ошибка обновления финального текста:", error);
      }
    }

    this.messageId = null;
    this.chatId = null;
  }

  /**
   * Получение ID сообщения для последующего обновления
   */
  getMessageId(): number | null {
    return this.messageId;
  }

  /**
   * Получение ID чата для последующего обновления
   */
  getChatId(): number | null {
    return this.chatId;
  }

  /**
   * Проверка активности анимации
   */
  isRunning(): boolean {
    return this.isActive;
  }
}

/**
 * Создание экземпляра анимации
 */
export function createMessageAnimation(): MessageAnimation {
  return new MessageAnimation();
}

/**
 * Быстрая анимация для простых операций
 */
export async function quickAnimation(
  ctx: Context,
  type: keyof MessageAnimation["animations"] = "fast",
  duration: number = 2000,
): Promise<MessageAnimation> {
  const animation = createMessageAnimation();
  await animation.start(ctx, type, {
    updateInterval: 500,
    maxDuration: duration,
  });

  // Автоматически останавливаем через указанное время
  setTimeout(() => {
    animation.stop();
  }, duration);

  return animation;
}

/**
 * Анимация для мультиагентной обработки
 */
export async function agentsAnimation(
  ctx: Context,
  maxDuration: number = 30000,
): Promise<MessageAnimation> {
  const animation = createMessageAnimation();
  await animation.start(ctx, "agents", {
    updateInterval: 1200,
    maxDuration,
  });
  return animation;
}
