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

Все модули объединяются в главном роутере `index.ts`, предоставляя единый API:

```typescript
export const remindersRouter = createTRPCRouter({
  create: createRemindersRouter, // reminders.create.*
  read: readRemindersRouter, // reminders.read.*
  update: updateRemindersRouter, // reminders.update.*
  delete: deleteRemindersRouter, // reminders.delete.*
});
```

### 3. **Типизация**

Все типы вынесены в отдельный файл `types.ts` для переиспользования и консистентности.

## API Endpoints

### Создание напоминаний (`reminders.create.*`)

#### `reminders.create.manual`

Создание напоминания вручную

```typescript
POST /api/trpc/reminders.create.manual
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

#### `reminders.create.fromText`

Создание напоминания из текста с помощью ИИ

```typescript
POST /api/trpc/reminders.create.fromText
{
  text: string;
  chatId?: string;
  timezone?: string;
  context?: Record<string, any>;
}
```

### Чтение напоминаний (`reminders.read.*`)

#### `reminders.read.list`

Получение списка напоминаний с фильтрацией и сортировкой

```typescript
GET /api/trpc/reminders.read.list
{
  filters?: ReminderFilters;
  sort?: ReminderSortOptions;
  limit?: number;
  offset?: number;
}
```

#### `reminders.read.getById`

Получение напоминания по ID

```typescript
GET /api/trpc/reminders.read.getById
{
  id: string;
  includeExecutions?: boolean;
}
```

#### `reminders.read.getStats`

Получение статистики напоминаний пользователя

```typescript
GET / api / trpc / reminders.read.getStats;
```

#### `reminders.read.findSimilar`

Поиск похожих напоминаний

```typescript
GET /api/trpc/reminders.read.findSimilar
{
  title: string;
  description?: string;
  limit?: number;
}
```

### Обновление напоминаний (`reminders.update.*`)

#### `reminders.update.reminder`

Обновление напоминания

```typescript
PUT / api / trpc / reminders.update.reminder;
{
  id: string;
  data: UpdateReminderInput;
}
```

#### `reminders.update.complete`

Отметить напоминание как выполненное

```typescript
PUT / api / trpc / reminders.update.complete;
{
  id: string;
}
```

#### `reminders.update.snooze`

Отложить напоминание

```typescript
PUT / api / trpc / reminders.update.snooze;
{
  id: string;
  snoozeUntil: Date;
}
```

### Удаление напоминаний (`reminders.delete.*`)

#### `reminders.delete.reminder`

Удаление напоминания

```typescript
DELETE / api / trpc / reminders.delete.reminder;
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
  | "task"
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
} from "./router/reminders";
```

### Вызов API

```typescript
// Создание
const newReminder = await trpc.reminders.create.manual.mutate({
  title: "Встреча",
  type: "meeting",
  priority: "high",
  reminderTime: new Date(),
});

// Чтение
const reminders = await trpc.reminders.read.list.query({
  filters: { status: ["pending", "active"] },
  limit: 10,
});

// Обновление
const updated = await trpc.reminders.update.complete.mutate({
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
trpc.reminders.create.manual.mutate(data);
trpc.reminders.read.list.query(filters);
trpc.reminders.update.reminder.mutate({ id, data });
trpc.reminders.delete.reminder.mutate({ id });
```

## Заключение

Новая модульная структура роутов напоминаний обеспечивает:

- **Лучшую организацию кода**
- **Простоту поддержки и расширения**
- **Четкое разделение ответственности**
- **Удобство тестирования**
- **Масштабируемость**

Все изменения обратно совместимы и легко мигрируются с существующего API.
