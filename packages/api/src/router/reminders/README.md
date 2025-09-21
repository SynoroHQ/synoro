# Роуты напоминаний (Reminders Router)

## Обзор

Модульная структура роутов для управления напоминаниями, разделенная по функциональным блокам для лучшей организации кода и поддержки.

## Структура файлов

```
reminders/
├── index.ts           # Главный роутер, объединяющий все модули
├── types.ts           # TypeScript типы для всех роутов
├── create.ts          # Роуты для создания напоминаний
├── read.ts            # Роуты для чтения и поиска
├── update.ts          # Роуты для обновления
├── delete.ts          # Роуты для удаления
└── README.md          # Документация
```

## Архитектура

### 1. **Модульная структура**

Каждый функциональный блок вынесен в отдельный файл:

- **`create.ts`** - создание напоминаний (ручное и через ИИ)
- **`read.ts`** - чтение, поиск, статистика, похожие напоминания
- **`update.ts`** - обновление, завершение, откладывание
- **`delete.ts`** - удаление напоминаний

### 2. **Единый интерфейс**

Все модули объединяются в главном роутере `index.ts` с помощью spread оператора:

```typescript
export const remindersRouter = createTRPCRouter({
  ...createRemindersRouter, // reminders.manual, reminders.fromText
  ...readRemindersRouter, // reminders.list, reminders.getById, reminders.getStats, reminders.findSimilar
  ...updateRemindersRouter, // reminders.reminder, reminders.complete, reminders.snooze
  ...deleteRemindersRouter, // reminders.reminder
});
```

### 3. **Типизация**

Все типы вынесены в отдельный файл `types.ts` для переиспользования и консистентности.

## API Endpoints

### Создание напоминаний

#### `reminders.manual`

Создание напоминания вручную

```typescript
POST /api/trpc/reminders.manual
{
  title: string;
  description?: string;
  type: ReminderType;
  priority: ReminderPriority;
  reminderTime: Date;
  recurrence?: RecurrenceType;
  tags?: string[];
  chatId?: string;
}
```

#### `reminders.fromText`

Создание напоминания из текста с помощью ИИ

```typescript
POST /api/trpc/reminders.fromText
{
  text: string;
  chatId?: string;
  timezone?: string;
  context?: Record<string, any>;
}
```

### Чтение напоминаний

#### `reminders.list`

Получение списка напоминаний с фильтрацией и сортировкой

```typescript
GET /api/trpc/reminders.list
{
  filters?: ReminderFilters;
  sort?: ReminderSortOptions;
  limit?: number;
  offset?: number;
}
```

#### `reminders.getById`

Получение напоминания по ID

```typescript
GET /api/trpc/reminders.getById
{
  id: string;
  includeExecutions?: boolean;
}
```

#### `reminders.getStats`

Получение статистики напоминаний пользователя

```typescript
GET / api / trpc / reminders.getStats;
```

#### `reminders.findSimilar`

Поиск похожих напоминаний

```typescript
GET /api/trpc/reminders.findSimilar
{
  title: string;
  description?: string;
  limit?: number;
}
```

### Обновление напоминаний

#### `reminders.reminder`

Обновление напоминания

```typescript
PUT / api / trpc / reminders.reminder;
{
  id: string;
  data: UpdateReminderInput;
}
```

#### `reminders.complete`

Отметить напоминание как выполненное

```typescript
PUT / api / trpc / reminders.complete;
{
  id: string;
}
```

#### `reminders.snooze`

Отложить напоминание

```typescript
PUT / api / trpc / reminders.snooze;
{
  id: string;
  snoozeUntil: Date;
}
```

### Удаление напоминаний

#### `reminders.reminder`

Удаление напоминания

```typescript
DELETE / api / trpc / reminders.reminder;
{
  id: string;
}
```

## Типы данных

### Основные типы

```typescript
export type CreateReminderInput = {
  title: string;
  description?: string;
  type: ReminderType;
  priority: ReminderPriority;
  reminderTime: Date;
  recurrence?: RecurrenceType;
  tags?: string[];
  chatId?: string;
};

export type UpdateReminderInput = {
  title?: string;
  description?: string;
  type?: ReminderType;
  priority?: ReminderPriority;
  status?: ReminderStatus;
  // ... другие поля
};

export type ReminderFilters = {
  status?: ReminderStatus[];
  type?: ReminderType[];
  priority?: ReminderPriority[];
  dateFrom?: Date;
  dateTo?: Date;
  tags?: string[];
  aiGenerated?: boolean;
  search?: string;
};
```

### Enum типы

```typescript
export type ReminderType =
  | "work"
  | "event"
  | "deadline"
  | "meeting"
  | "call"
  | "follow_up"
  | "custom";

export type ReminderPriority = "low" | "medium" | "high" | "urgent";

export type ReminderStatus =
  | "pending"
  | "active"
  | "completed"
  | "cancelled"
  | "snoozed";
```

## Преимущества новой структуры

### 1. **Модульность**

- Каждый функциональный блок в отдельном файле
- Легко добавлять новые функции
- Простое тестирование отдельных модулей

### 2. **Читаемость**

- Четкое разделение ответственности
- Понятная структура API
- Легко найти нужную функцию

### 3. **Поддержка**

- Простое рефакторинг отдельных модулей
- Изолированные изменения
- Лучшая организация кода

### 4. **Масштабируемость**

- Легко добавлять новые модули
- Простое расширение функциональности
- Гибкая архитектура

## Использование

### Импорт роутера

```typescript
import { remindersRouter } from "./router/reminders";

// В главном роутере
export const appRouter = createTRPCRouter({
  reminders: remindersRouter,
  // другие роуты...
});
```

### Импорт типов

```typescript
import type {
  CreateReminderInput,
  ReminderFilters,
  UpdateReminderInput,
} from "./router/reminders/types";
```

### Вызов API

```typescript
// Создание
const newReminder = await trpc.reminders.manual.mutate({
  title: "Встреча",
  type: "meeting",
  priority: "high",
  reminderTime: new Date(),
});

// Чтение
const reminders = await trpc.reminders.list.query({
  filters: { status: ["pending", "active"] },
  limit: 10,
});

// Обновление
const updated = await trpc.reminders.complete.mutate({
  id: "reminder-id",
});
```

## Миграция с старой структуры

### Старый API

```typescript
// Было
trpc.reminders.create.mutate(data);
trpc.reminders.list.query(filters);
trpc.reminders.update.mutate({ id, data });
trpc.reminders.delete.mutate({ id });
```

### Новый API

```typescript
// Стало
trpc.reminders.manual.mutate(data);
trpc.reminders.list.query(filters);
trpc.reminders.reminder.mutate({ id, data });
trpc.reminders.reminder.mutate({ id });
```

## Заключение

Новая модульная структура роутов напоминаний обеспечивает:

- **Лучшую организацию кода**
- **Простоту поддержки и расширения**
- **Четкое разделение ответственности**
- **Удобство тестирования**
- **Масштабируемость**

Все изменения обратно совместимы и легко мигрируются с существующего API.
