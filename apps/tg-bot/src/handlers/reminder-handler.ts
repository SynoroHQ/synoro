import type { Context } from "telegraf";
import { SmartReminderAgent } from "@synoro/api/lib/agents/smart-reminder-agent";
import { ReminderService } from "@synoro/api/lib/services/reminder-service";
import type { ReminderFilters } from "@synoro/db";

const reminderAgent = new SmartReminderAgent();
const reminderService = new ReminderService();

/**
 * Обработчик команд напоминаний для Telegram бота
 */
export class ReminderHandler {
  /**
   * Создание напоминания из текста
   */
  static async handleCreateReminder(ctx: Context, text: string, userId: string) {
    try {
      const result = await reminderAgent.createReminderFromText({
        text,
        userId,
        timezone: "Europe/Moscow", // TODO: получать из настроек пользователя
      });

      const reminder = result.reminder;
      const timeStr = reminder.reminderTime.toLocaleString("ru-RU", {
        timeZone: "Europe/Moscow",
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });

      let message = "✅ Создано напоминание:\n\n";
      message += `📝 **${reminder.title}**\n`;
      if (reminder.description) {
        message += `📄 ${reminder.description}\n`;
      }
      message += `⏰ ${timeStr}\n`;
      message += `🏷️ Тип: ${ReminderHandler.getTypeEmoji(reminder.type)} ${ReminderHandler.getTypeName(reminder.type)}\n`;
      message += `⚡ Приоритет: ${ReminderHandler.getPriorityEmoji(reminder.priority)} ${ReminderHandler.getPriorityName(reminder.priority)}\n`;

      if (result.confidence < 0.8) {
        message += `\n⚠️ Уверенность: ${Math.round(result.confidence * 100)}%`;
      }

      if (result.suggestions.length > 0) {
        message += "\n\n💡 **Предложения:**\n";
        result.suggestions.slice(0, 3).forEach((suggestion, index) => {
          message += `${index + 1}. ${suggestion.suggestion}\n`;
        });
      }

      await ctx.reply(message, {
        parse_mode: "Markdown",
        reply_markup: {
          inline_keyboard: [
            [
              { text: "✏️ Редактировать", callback_data: `edit_reminder_${reminder.id}` },
              { text: "❌ Удалить", callback_data: `delete_reminder_${reminder.id}` },
            ],
            [
              { text: "📋 Мои напоминания", callback_data: "list_reminders" },
            ],
          ],
        },
      });

    } catch (error) {
      console.error("Ошибка создания напоминания:", error);
      await ctx.reply(
        "❌ Не удалось создать напоминание. Попробуйте переформулировать запрос или указать время более точно.",
        {
          reply_markup: {
            inline_keyboard: [
              [{ text: "💡 Примеры", callback_data: "reminder_examples" }],
            ],
          },
        }
      );
    }
  }

  /**
   * Показать список напоминаний пользователя
   */
  static async handleListReminders(ctx: Context, userId: string, page = 0) {
    try {
      const limit = 5;
      const offset = page * limit;

      const filters: ReminderFilters = {
        status: ["pending", "active", "snoozed"],
      };

      const reminders = await reminderService.getUserReminders(
        userId,
        filters,
        { field: "reminderTime", direction: "asc" },
        limit,
        offset
      );

      if (reminders.length === 0) {
        await ctx.reply(
          page === 0 
            ? "📭 У вас пока нет активных напоминаний.\n\nЧтобы создать напоминание, просто напишите мне что-то вроде:\n• \"Напомни завтра в 15:00 позвонить врачу\"\n• \"Встреча с клиентом в понедельник\"\n• \"Сдать отчет до пятницы\""
            : "📭 Больше напоминаний нет.",
          {
            reply_markup: {
              inline_keyboard: [
                [{ text: "💡 Примеры", callback_data: "reminder_examples" }],
              ],
            },
          }
        );
        return;
      }

      let message = `📋 **Ваши напоминания** (стр. ${page + 1}):\n\n`;

      reminders.forEach((reminder, index) => {
        const timeStr = reminder.reminderTime.toLocaleString("ru-RU", {
          timeZone: "Europe/Moscow",
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });

        const statusEmoji = ReminderHandler.getStatusEmoji(reminder.status);
        const priorityEmoji = ReminderHandler.getPriorityEmoji(reminder.priority);

        message += `${offset + index + 1}. ${statusEmoji} **${reminder.title}**\n`;
        message += `   ⏰ ${timeStr} ${priorityEmoji}\n\n`;
      });

      const keyboard = [];
      
      // Кнопки навигации
      const navRow = [];
      if (page > 0) {
        navRow.push({ text: "⬅️ Назад", callback_data: `list_reminders_${page - 1}` });
      }
      if (reminders.length === limit) {
        navRow.push({ text: "➡️ Далее", callback_data: `list_reminders_${page + 1}` });
      }
      if (navRow.length > 0) {
        keyboard.push(navRow);
      }

      // Кнопки действий
      keyboard.push([
        { text: "📊 Статистика", callback_data: "reminder_stats" },
        { text: "🔄 Обновить", callback_data: `list_reminders_${page}` },
      ]);

      await ctx.reply(message, {
        parse_mode: "Markdown",
        reply_markup: { inline_keyboard: keyboard },
      });

    } catch (error) {
      console.error("Ошибка получения списка напоминаний:", error);
      await ctx.reply("❌ Не удалось загрузить список напоминаний.");
    }
  }

  /**
   * Показать статистику напоминаний
   */
  static async handleReminderStats(ctx: Context, userId: string) {
    try {
      const stats = await reminderService.getUserReminderStats(userId);

      let message = "📊 **Статистика напоминаний:**\n\n";
      message += `📝 Всего: ${stats.total}\n`;
      message += `⏳ Ожидают: ${stats.pending}\n`;
      message += `🔔 Активные: ${stats.active}\n`;
      message += `✅ Выполнено: ${stats.completed}\n`;
      
      if (stats.overdue > 0) {
        message += `⚠️ Просрочено: ${stats.overdue}\n`;
      }

      await ctx.reply(message, {
        parse_mode: "Markdown",
        reply_markup: {
          inline_keyboard: [
            [{ text: "📋 Показать список", callback_data: "list_reminders" }],
          ],
        },
      });

    } catch (error) {
      console.error("Ошибка получения статистики:", error);
      await ctx.reply("❌ Не удалось загрузить статистику.");
    }
  }

  /**
   * Показать примеры использования
   */
  static async handleReminderExamples(ctx: Context) {
    const message = "💡 **Примеры создания напоминаний:**\n\n" +
      "🕐 **Время:**\n" +
      `• "Напомни завтра в 15:00 позвонить врачу"\n` +
      `• "Встреча через 2 часа"\n` +
      `• "В понедельник в 9 утра совещание"\n\n` +
      
      "📅 **События:**\n" +
      `• "День рождения мамы 15 марта"\n` +
      `• "Отпуск с 1 по 10 июля"\n\n` +
      
      "📋 **Задачи:**\n" +
      `• "Сдать отчет до пятницы"\n` +
      `• "Купить продукты вечером"\n` +
      `• "Записаться к стоматологу на следующей неделе"\n\n` +
      
      "🔄 **Повторяющиеся:**\n" +
      `• "Каждый день в 8:00 принять витамины"\n` +
      `• "Еженедельно по понедельникам планерка"\n\n` +
      
      "Просто напишите мне, что и когда нужно напомнить!";

    await ctx.reply(message, {
      parse_mode: "Markdown",
      reply_markup: {
        inline_keyboard: [
          [{ text: "📋 Мои напоминания", callback_data: "list_reminders" }],
        ],
      },
    });
  }

  /**
   * Обработка callback-запросов
   */
  static async handleCallback(ctx: Context, data: string, userId: string) {
    try {
      if (data === "list_reminders") {
        await ReminderHandler.handleListReminders(ctx, userId);
      } else if (data.startsWith("list_reminders_")) {
        const page = Number.parseInt(data.split("_")[2]) || 0;
        await ReminderHandler.handleListReminders(ctx, userId, page);
      } else if (data === "reminder_stats") {
        await ReminderHandler.handleReminderStats(ctx, userId);
      } else if (data === "reminder_examples") {
        await ReminderHandler.handleReminderExamples(ctx);
      } else if (data.startsWith("delete_reminder_")) {
        const reminderId = data.split("_")[2];
        await ReminderHandler.handleDeleteReminder(ctx, reminderId, userId);
      } else if (data.startsWith("edit_reminder_")) {
        const reminderId = data.split("_")[2];
        await ReminderHandler.handleEditReminder(ctx, reminderId, userId);
      }
    } catch (error) {
      console.error("Ошибка обработки callback:", error);
      await ctx.reply("❌ Произошла ошибка при обработке запроса.");
    }
  }

  /**
   * Удаление напоминания
   */
  private static async handleDeleteReminder(ctx: Context, reminderId: string, userId: string) {
    try {
      const success = await reminderService.deleteReminder(reminderId, userId);
      
      if (success) {
        await ctx.reply("✅ Напоминание удалено.", {
          reply_markup: {
            inline_keyboard: [
              [{ text: "📋 Показать список", callback_data: "list_reminders" }],
            ],
          },
        });
      } else {
        await ctx.reply("❌ Напоминание не найдено или уже удалено.");
      }
    } catch (error) {
      console.error("Ошибка удаления напоминания:", error);
      await ctx.reply("❌ Не удалось удалить напоминание.");
    }
  }

  /**
   * Редактирование напоминания (заглушка)
   */
  private static async handleEditReminder(ctx: Context, reminderId: string, userId: string) {
    await ctx.reply(
      "✏️ Редактирование напоминаний будет добавлено в следующих версиях.\n\n" +
      "Пока что вы можете удалить старое напоминание и создать новое.",
      {
        reply_markup: {
          inline_keyboard: [
            [
              { text: "❌ Удалить", callback_data: `delete_reminder_${reminderId}` },
              { text: "📋 К списку", callback_data: "list_reminders" },
            ],
          ],
        },
      }
    );
  }

  // Вспомогательные методы для эмодзи и названий

  private static getTypeEmoji(type: string): string {
    const emojis: Record<string, string> = {
      task: "📋",
      event: "📅",
      deadline: "⏰",
      meeting: "🤝",
      call: "📞",
      follow_up: "🔄",
      custom: "📌",
    };
    return emojis[type] || "📌";
  }

  private static getTypeName(type: string): string {
    const names: Record<string, string> = {
      task: "Задача",
      event: "Событие",
      deadline: "Дедлайн",
      meeting: "Встреча",
      call: "Звонок",
      follow_up: "Напоминание",
      custom: "Другое",
    };
    return names[type] || "Другое";
  }

  private static getPriorityEmoji(priority: string): string {
    const emojis: Record<string, string> = {
      low: "🟢",
      medium: "🟡",
      high: "🟠",
      urgent: "🔴",
    };
    return emojis[priority] || "🟡";
  }

  private static getPriorityName(priority: string): string {
    const names: Record<string, string> = {
      low: "Низкий",
      medium: "Средний",
      high: "Высокий",
      urgent: "Срочный",
    };
    return names[priority] || "Средний";
  }

  private static getStatusEmoji(status: string): string {
    const emojis: Record<string, string> = {
      pending: "⏳",
      active: "🔔",
      completed: "✅",
      cancelled: "❌",
      snoozed: "😴",
    };
    return emojis[status] || "⏳";
  }
}
