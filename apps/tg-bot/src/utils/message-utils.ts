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

  constructor(ctx: Context, messageType = "сообщение") {
    this.ctx = ctx;
    this.messageType = messageType;
  }

  /**
   * Запускает анимацию обработки
   */
  async start(): Promise<void> {
    try {
      const processingMsg = await this.ctx.reply(
        `⏳ Обрабатываем ваше ${this.messageType}...`,
        {
          parse_mode: "HTML",
        },
      );
      this.messageId = processingMsg.message_id;

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

    try {
      await this.ctx.api.editMessageText(
        this.ctx.chat!.id,
        this.messageId,
        `${stage.emoji} ${stage.text}`,
        {
          parse_mode: "HTML",
        },
      );
    } catch (error) {
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
