import type { Context } from "grammy";

/**
 * Этапы анимации обработки
 */
const PROCESSING_STAGES = [
  { emoji: "🔍", text: "Анализируем запрос..." },
  { emoji: "🧠", text: "Обрабатываем через ИИ..." },
  { emoji: "⚡", text: "Генерируем ответ..." },
  { emoji: "✨", text: "Финальная обработка..." },
  { emoji: "🎯", text: "Почти готово..." },
];

/**
 * Анимированный индикатор обработки
 */
export class ProcessingAnimation {
  private messageId: number | undefined;
  private ctx: Context;
  private intervalId: NodeJS.Timeout | undefined;
  private currentStage = 0;
  private messageType: string;
  private currentText: string = "";

  constructor(ctx: Context, messageType = "сообщение") {
    this.ctx = ctx;
    this.messageType = messageType;
  }

  /**
   * Запускает анимацию обработки
   */
  async start(): Promise<void> {
    try {
      const initialText = `⏳ Обрабатываем ваше ${this.messageType}...`;
      const processingMsg = await this.ctx.reply(initialText, {
        parse_mode: "HTML",
      });
      this.messageId = processingMsg.message_id;
      this.currentText = initialText;

      // Запускаем анимацию с интервалом 2 секунды
      this.intervalId = setInterval(() => {
        this.updateAnimation();
      }, 2000);
    } catch (error) {
      console.warn("Не удалось запустить анимацию обработки:", error);
    }
  }

  /**
   * Обновляет анимацию на следующий этап
   */
  private async updateAnimation(): Promise<void> {
    if (!this.messageId) return;

    this.currentStage = (this.currentStage + 1) % PROCESSING_STAGES.length;
    const stage = PROCESSING_STAGES[this.currentStage];

    if (!stage) return;

    const newText = `${stage.emoji} ${stage.text}`;

    // Проверяем, изменился ли текст
    if (newText === this.currentText) {
      return;
    }

    try {
      await this.ctx.api.editMessageText(
        this.ctx.chat!.id,
        this.messageId,
        newText,
        {
          parse_mode: "HTML",
        },
      );
      this.currentText = newText;
    } catch (error) {
      // Игнорируем ошибку 400 "message is not modified"
      if (
        error &&
        typeof error === "object" &&
        "error_code" in error &&
        error.error_code === 400
      ) {
        return;
      }
      console.warn("Не удалось обновить анимацию:", error);
    }
  }

  /**
   * Останавливает анимацию и удаляет сообщение
   */
  async stop(): Promise<void> {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = undefined;
    }

    if (this.messageId) {
      try {
        await this.ctx.api.deleteMessage(this.ctx.chat!.id, this.messageId);
      } catch (error) {
        console.warn("Не удалось удалить сообщение анимации:", error);
      }
      this.messageId = undefined;
    }

    this.currentText = "";
  }

  /**
   * Получает ID сообщения анимации
   */
  getMessageId(): number | undefined {
    return this.messageId;
  }
}

/**
 * Плавно удаляет сообщение с анимацией затухания
 * Сначала редактирует сообщение, делая его полупрозрачным, затем удаляет
 */
export async function smoothDeleteMessage(
  ctx: Context,
  messageId: number,
): Promise<void> {
  try {
    // Сначала делаем сообщение полупрозрачным
    await ctx.api.editMessageText(
      ctx.chat!.id,
      messageId,
      "⏳ Обрабатываем...",
      {
        parse_mode: "HTML",
      },
    );

    // Небольшая задержка для плавности
    await new Promise((resolve) => setTimeout(resolve, 300));

    // Удаляем сообщение
    await ctx.api.deleteMessage(ctx.chat!.id, messageId);
  } catch (error) {
    // Игнорируем ошибку 400 "message is not modified"
    if (
      error &&
      typeof error === "object" &&
      "error_code" in error &&
      error.error_code === 400
    ) {
      // Пытаемся удалить сообщение напрямую
      try {
        await ctx.api.deleteMessage(ctx.chat!.id, messageId);
      } catch (deleteError) {
        console.warn("Не удалось удалить сообщение:", deleteError);
      }
      return;
    }

    console.warn("Не удалось плавно удалить сообщение:", error);

    // Fallback: пытаемся удалить напрямую
    try {
      await ctx.api.deleteMessage(ctx.chat!.id, messageId);
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
  messageType = "сообщение",
): Promise<number | undefined> {
  try {
    const processingMsg = await ctx.reply(
      `⏳ Обрабатываем ваше ${messageType}...`,
      {
        parse_mode: "HTML",
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
): Promise<void> {
  if (!messageId) return;

  try {
    await ctx.api.deleteMessage(ctx.chat!.id, messageId);
  } catch (error) {
    console.warn("Не удалось удалить сообщение 'Обрабатываем':", error);
  }
}

/**
 * Удаляет сообщение пользователя с обработкой ошибок
 * Используется для очистки чата после получения ответа от бота
 */
export async function deleteUserMessage(
  ctx: Context,
  messageId: number | undefined,
): Promise<void> {
  if (!messageId) return;

  try {
    await ctx.api.deleteMessage(ctx.chat!.id, messageId);
    console.log(`🗑️ Удалено сообщение пользователя: ${messageId}`);
  } catch (error) {
    // Игнорируем ошибки удаления сообщений пользователя
    // Это может происходить если сообщение уже удалено или бот не имеет прав
    console.warn(
      `Не удалось удалить сообщение пользователя ${messageId}:`,
      error,
    );
  }
}
