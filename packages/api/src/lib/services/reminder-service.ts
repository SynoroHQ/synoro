// Реэкспорт для обратной совместимости
export { ReminderService } from "./reminders";
export type { ReminderService as LegacyReminderService } from "./reminders";

// Устаревший экспорт - рекомендуется использовать новый ReminderService
export { ReminderService as ReminderServiceV1 } from "./reminders";
