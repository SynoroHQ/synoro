import { logger, schedules, task } from "@trigger.dev/sdk";
import { and, eq, isNull, lte, or } from "drizzle-orm";

import { db } from "@synoro/db/client";
import { reminderExecutions, reminders } from "@synoro/db/schema";

// Задача для проверки и отправки напоминаний каждую минуту
export const reminderScheduler = schedules.task({
  id: "reminder-scheduler",
  // Каждую минуту
  cron: "* * * * *",
  maxDuration: 300, // 5 минут
  run: async (payload, { ctx }) => {
    logger.log("Запуск планировщика напоминаний", {
      timestamp: payload.timestamp,
      timezone: payload.timezone,
    });

    const now = new Date();

    try {
      // Получаем активные напоминания, которые нужно отправить
      const activeReminders = await db
        .select()
        .from(reminders)
        .where(
          and(
            eq(reminders.status, "active"),
            lte(reminders.reminderTime, now),
            eq(reminders.notificationSent, false),
            or(isNull(reminders.snoozeUntil), lte(reminders.snoozeUntil, now)),
          ),
        )
        .limit(50); // Ограничиваем количество для предотвращения перегрузки

      logger.log(`Найдено ${activeReminders.length} напоминаний для отправки`);

      // Обрабатываем каждое напоминание
      for (const reminder of activeReminders) {
        try {
          // Запускаем задачу отправки напоминания
          await sendReminderNotification.trigger({
            reminderId: reminder.id,
            userId: reminder.userId,
            title: reminder.title,
            description: reminder.description ?? undefined,
            type: reminder.type,
            priority: reminder.priority,
          });

          logger.log(`Запущена отправка напоминания: ${reminder.id}`);
        } catch (error) {
          logger.error(
            `Ошибка запуска отправки напоминания ${reminder.id}:`,
            error as Record<string, unknown>,
          );

          // Записываем ошибку в историю
          await db.insert(reminderExecutions).values({
            reminderId: reminder.id,
            status: "failed",
            errorMessage:
              error instanceof Error ? error.message : "Неизвестная ошибка",
            executedAt: now,
          });
        }
      }

      // Обрабатываем повторяющиеся напоминания
      await processRecurringReminders();

      logger.log("Планировщик напоминаний завершен успешно");
    } catch (error) {
      logger.error(
        "Ошибка в планировщике напоминаний:",
        error as Record<string, unknown>,
      );
      throw error;
    }
  },
});

// Задача для отправки конкретного напоминания
export const sendReminderNotification = task({
  id: "send-reminder-notification",
  maxDuration: 120, // 2 минуты
  run: async (payload: {
    reminderId: string;
    userId: string;
    title: string;
    description?: string;
    type: string;
    priority: string;
  }) => {
    const { reminderId, userId, title, description, type, priority } = payload;

    logger.log(`Отправка напоминания: ${reminderId}`, {
      userId,
      title,
      type,
      priority,
    });

    try {
      // Здесь будет логика отправки уведомлений через различные каналы
      // Пока что просто логируем и отмечаем как отправленное

      const notificationChannels = await determineNotificationChannels(
        userId,
        type,
        priority,
      );

      let sentSuccessfully = false;
      const errors: string[] = [];

      // Отправляем через каждый канал
      for (const channel of notificationChannels) {
        try {
          await sendNotificationViaChannel(channel, {
            reminderId,
            userId,
            title,
            description,
            type,
            priority,
          });

          sentSuccessfully = true;
          logger.log(`Напоминание отправлено через ${channel}`, { reminderId });

          // Записываем успешную отправку
          await db.insert(reminderExecutions).values({
            reminderId,
            status: "sent",
            channel,
            executedAt: new Date(),
          });
        } catch (channelError) {
          const errorMsg =
            channelError instanceof Error
              ? channelError.message
              : "Ошибка канала";
          errors.push(`${channel}: ${errorMsg}`);
          logger.error(
            `Ошибка отправки через ${channel}:`,
            channelError as Record<string, unknown>,
          );

          // Записываем ошибку канала
          await db.insert(reminderExecutions).values({
            reminderId,
            status: "failed",
            channel,
            errorMessage: errorMsg,
            executedAt: new Date(),
          });
        }
      }

      // Обновляем статус напоминания
      if (sentSuccessfully) {
        await db
          .update(reminders)
          .set({
            notificationSent: true,
            updatedAt: new Date(),
          })
          .where(eq(reminders.id, reminderId));

        logger.log(`Напоминание ${reminderId} успешно отправлено`);
      } else {
        logger.error(`Не удалось отправить напоминание ${reminderId}:`);
        throw new Error(`Ошибки отправки: ${errors.join(", ")}`);
      }
    } catch (error) {
      logger.error(
        `Критическая ошибка отправки напоминания ${reminderId}:`,
        error as Record<string, unknown>,
      );

      // Записываем критическую ошибку
      await db.insert(reminderExecutions).values({
        reminderId,
        status: "failed",
        errorMessage:
          error instanceof Error ? error.message : "Критическая ошибка",
        executedAt: new Date(),
      });

      throw error;
    }
  },
});

// Задача для обработки повторяющихся напоминаний
async function processRecurringReminders() {
  const now = new Date();

  // Получаем завершенные напоминания с повторениями
  const recurringReminders = await db
    .select()
    .from(reminders)
    .where(
      and(
        eq(reminders.notificationSent, true),
        eq(reminders.recurrence, "daily"), // Пока только ежедневные
      ),
    );

  for (const reminder of recurringReminders) {
    try {
      // Вычисляем следующее время напоминания
      if (reminder.recurrence) {
        const nextTime = calculateNextReminderTime(
          reminder.reminderTime,
          reminder.recurrence,
        );

        if (
          nextTime &&
          (!reminder.recurrenceEndDate ||
            nextTime <= reminder.recurrenceEndDate)
        ) {
          // Создаем новое напоминание
          await db.insert(reminders).values({
            userId: reminder.userId,
            title: reminder.title,
            description: reminder.description,
            type: reminder.type,
            priority: reminder.priority,
            reminderTime: nextTime,
            recurrence: reminder.recurrence,
            recurrencePattern: reminder.recurrencePattern,
            recurrenceEndDate: reminder.recurrenceEndDate,
            aiGenerated: reminder.aiGenerated,
            aiContext: reminder.aiContext,
            tags: reminder.tags,
            chatId: reminder.chatId,
            parentReminderId: reminder.id,
            status: "active",
            notificationSent: false,
          });

          logger.log(`Создано повторяющееся напоминание для ${reminder.id}`, {
            nextTime: nextTime.toISOString(),
          });
        }
      }
    } catch (error) {
      logger.error(
        `Ошибка создания повторяющегося напоминания для ${reminder.id}:`,
        error as Record<string, unknown>,
      );
    }
  }
}

// Определение каналов уведомлений для пользователя
async function determineNotificationChannels(
  userId: string,
  type: string,
  priority: string,
): Promise<string[]> {
  // Пока что возвращаем базовые каналы
  // В будущем здесь будет логика определения предпочтений пользователя
  const channels = ["telegram"];

  // Для срочных напоминаний добавляем дополнительные каналы
  if (priority === "urgent") {
    channels.push("push", "email");
  }

  return channels;
}

// Отправка уведомления через конкретный канал
async function sendNotificationViaChannel(
  channel: string,
  notification: {
    reminderId: string;
    userId: string;
    title: string;
    description?: string;
    type: string;
    priority: string;
  },
) {
  switch (channel) {
    case "telegram":
      await sendTelegramNotification(notification);
      break;
    case "push":
      await sendPushNotification(notification);
      break;
    case "email":
      await sendEmailNotification(notification);
      break;
    default:
      throw new Error(`Неподдерживаемый канал: ${channel}`);
  }
}

// Отправка через Telegram
async function sendTelegramNotification(notification: any) {
  // Здесь будет интеграция с Telegram Bot API
  // Пока что просто логируем
  logger.log("Отправка Telegram уведомления", notification);

  // TODO: Интегрировать с существующим Telegram ботом
  // Можно использовать существующие сервисы из apps/tg-bot
}

// Отправка push уведомления
async function sendPushNotification(notification: any) {
  logger.log("Отправка Push уведомления", notification);
  // TODO: Интегрировать с push-сервисом
}

// Отправка email уведомления
async function sendEmailNotification(notification: any) {
  logger.log("Отправка Email уведомления", notification);
  // TODO: Интегрировать с email-сервисом
}

// Вычисление следующего времени для повторяющихся напоминаний
function calculateNextReminderTime(
  currentTime: Date,
  recurrence: string,
): Date | null {
  const next = new Date(currentTime);

  switch (recurrence) {
    case "daily":
      next.setDate(next.getDate() + 1);
      return next;
    case "weekly":
      next.setDate(next.getDate() + 7);
      return next;
    case "monthly":
      next.setMonth(next.getMonth() + 1);
      return next;
    case "yearly":
      next.setFullYear(next.getFullYear() + 1);
      return next;
    default:
      return null;
  }
}
