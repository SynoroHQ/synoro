import { createTRPCRouter } from "../../trpc";
import { createRemindersRouter } from "./create";
import { deleteRemindersRouter } from "./delete";
import { readRemindersRouter } from "./read";
import { updateRemindersRouter } from "./update";

/**
 * Главный роутер для напоминаний
 * Объединяет все функциональные модули в единую структуру
 */
export const remindersRouter = createTRPCRouter({
  // Создание напоминаний
  ...createRemindersRouter,

  // Чтение и поиск напоминаний
  ...readRemindersRouter,

  // Обновление напоминаний
  ...updateRemindersRouter,

  // Удаление напоминаний
  ...deleteRemindersRouter,
});

// Экспортируем типы
export * from "./types";
