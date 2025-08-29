# Сервисы напоминаний

Этот модуль содержит разбитые на логические компоненты сервисы для работы с напоминаниями.

## Структура

### `base-reminder-service.ts`

Базовый сервис с основными CRUD операциями:

- Создание напоминания
- Получение по ID
- Обновление
- Удаление
- Отметка как выполненное
- Откладывание
- Логирование выполнения

### `reminder-search-service.ts`

Сервис для поиска и фильтрации:

- Получение списка с фильтрами
- Поиск похожих напоминаний
- Получение активных для выполнения

### `reminder-stats-service.ts`

Сервис для статистики:

- Статистика пользователя
- Статистика анонимного пользователя

### `reminder-recurrence-service.ts`

Сервис для повторяющихся напоминаний:

- Создание повторяющихся
- Расчет следующего времени
- Поддержка различных паттернов

### `anonymous-reminder-service.ts`

Сервис для анонимных пользователей:

- Работа с Telegram Chat ID
- Создание напоминаний для анонимных
- Статистика анонимных пользователей

### `reminder-service.ts`

Главный сервис, объединяющий все функциональности.

## Использование

### Базовое использование

```typescript
import { ReminderService } from "./reminders";

const reminderService = new ReminderService();

// Создание напоминания
const reminder = await reminderService.createReminder({
  userId: "user123",
  title: "Важное напоминание",
  reminderTime: new Date(),
  // ... другие поля
});
```

### Использование отдельных сервисов

```typescript
import { BaseReminderService, ReminderSearchService } from "./reminders";

const baseService = new BaseReminderService();
const searchService = new ReminderSearchService();

// Используем базовые операции
const reminder = await baseService.getReminderById("id", "userId");

// Используем поиск
const reminders = await searchService.getUserReminders("userId", {
  status: ["active", "pending"],
  priority: ["high", "urgent"],
});
```

## Преимущества новой структуры

1. **Разделение ответственности** - каждый сервис отвечает за свою область
2. **Легкость тестирования** - можно тестировать каждый сервис отдельно
3. **Переиспользование** - базовые сервисы можно использовать независимо
4. **Читаемость** - код легче понимать и поддерживать
5. **Масштабируемость** - легко добавлять новые функции в соответствующие сервисы

## Обратная совместимость

Старый `ReminderService` продолжает работать через реэкспорт, но рекомендуется переходить на новую структуру.
