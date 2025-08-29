import { createTRPCRouter } from "../../trpc";
import { createRemindersRouter } from "./create";
import { deleteRemindersRouter } from "./delete";
import { readRemindersRouter } from "./read";
import { updateRemindersRouter } from "./update";

// Экспорт типов
export * from "./types";

/**
 * Главный роутер для напоминаний
 * Объединяет все функциональные модули
 */
export const remindersRouter = createTRPCRouter({
  // Создание напоминаний
  create: createRemindersRouter,

  // Чтение и поиск напоминаний
  read: readRemindersRouter,

  // Обновление напоминаний
  update: updateRemindersRouter,

  // Удаление напоминаний
  delete: deleteRemindersRouter,
});
