# Схема напоминаний (Reminders Schema)

## Обзор

Схема напоминаний предоставляет полную структуру для управления системой умных напоминаний с поддержкой ИИ, повторений и различных типов уведомлений.

## Структура файлов

```
reminders/
├── schema.ts      # Основная схема базы данных
├── types.ts       # TypeScript типы и интерфейсы
├── constants.ts   # Константы и ограничения
├── validators.ts  # Zod валидаторы
├── utils.ts       # Утилиты и SQL запросы
├── index.ts       # Экспорт всех модулей
└── README.md      # Документация
```

## Основные таблицы

### 1. `reminders` - Основная таблица напоминаний

Основная таблица для хранения всех напоминаний с поддержкой:

- Различных типов (задача, событие, дедлайн, встреча, звонок, follow-up, кастомный)
- Приоритетов (низкий, средний, высокий, срочный)
- Статусов (ожидающий, активный, завершенный, отмененный, отложенный)
- Повторений (ежедневно, еженедельно, ежемесячно, ежегодно, кастомно)
- ИИ-контекста и умных предложений
- Тегов и метаданных

### 2. `reminder_executions` - История выполнения

Отслеживает все попытки отправки уведомлений:

- Статус выполнения (отправлено, неудачно, пропущено)
- Канал уведомления (Telegram, email, push, SMS, webhook)
- Ошибки и метаданные

### 3. `reminder_templates` - Шаблоны напоминаний

Хранит переиспользуемые шаблоны:

- Публичные и приватные шаблоны
- Счетчик использования
- JSON структура шаблона

## Особенности

### JSON поля с типизацией

Все JSON поля имеют строгую типизацию TypeScript:

```typescript
// Паттерн повторения
recurrencePattern: jsonb("recurrence_pattern").$type<RecurrencePattern>;

// ИИ контекст
aiContext: jsonb("ai_context").$type<AIContext>;

// Умные предложения
smartSuggestions: jsonb("smart_suggestions").$type<SmartSuggestions>;
```

### Оптимизированные индексы

- **Основные индексы**: для часто используемых полей
- **Составные индексы**: для сложных запросов по пользователю и статусу/типу/приоритету
- **GIN индексы**: для эффективного поиска по JSON полям (теги, метаданные)

### Поддержка snake_case

Схема использует `casing: "snake_case"` в конфигурации Drizzle, что автоматически преобразует camelCase поля TypeScript в snake_case в базе данных.

## Использование

### Импорт схемы

```typescript
import {
  reminderExecutions,
  reminders,
  reminderTemplates,
} from "@your-org/db/schemas/reminders";
```

### Импорт типов

```typescript
import type {
  InsertReminder,
  RecurrencePattern,
  UpdateReminder,
} from "@your-org/db/schemas/reminders";
```

### Импорт утилит

```typescript
import {
  getActiveRemindersQuery,
  getNextReminderTime,
  shouldShowReminder,
} from "@your-org/db/schemas/reminders";
```

### Импорт валидаторов

```typescript
import {
  reminderSchema,
  validateReminder,
  validateReminderTime,
} from "@your-org/db/schemas/reminders";
```

## Примеры запросов

### Создание напоминания

```typescript
import { db } from "@your-org/db";
import { reminders } from "@your-org/db/schemas/reminders";

const newReminder = await db.insert(reminders).values({
  userId: "user-123",
  title: "Встреча с командой",
  description: "Обсуждение планов на неделю",
  type: "meeting",
  priority: "high",
  reminderTime: new Date("2024-01-15T10:00:00Z"),
  recurrence: "weekly",
  tags: ["работа", "встреча", "команда"],
});
```

### Поиск активных напоминаний

```typescript
import { getActiveRemindersQuery } from "@your-org/db/schemas/reminders";

const activeReminders = await db.execute(getActiveRemindersQuery("user-123"));
```

### Валидация данных

```typescript
import { validateReminder } from "@your-org/db/schemas/reminders";

try {
  const validatedData = validateReminder(inputData);
  // Данные валидны, можно использовать
} catch (error) {
  // Обработка ошибок валидации
  console.error("Validation failed:", error);
}
```

## Миграции

Drizzle автоматически генерирует миграции на основе изменений в схеме. Для создания миграции:

```bash
bun run db:generate
```

Для применения миграций:

```bash
bun run db:migrate
```

## Производительность

### Рекомендуемые запросы

1. **Поиск по пользователю и статусу**: используйте составной индекс `userStatusIdx`
2. **Поиск по времени**: используйте индекс `reminderTimeIdx`
3. **Поиск по тегам**: используйте GIN индекс `tagsGinIdx`
4. **Поиск по метаданным**: используйте GIN индекс `metadataGinIdx`

### Мониторинг

Отслеживайте производительность запросов с помощью:

- Анализа планов выполнения запросов
- Мониторинга использования индексов
- Анализа медленных запросов

## Расширение схемы

При добавлении новых полей или таблиц:

1. Обновите схему в `schema.ts`
2. Добавьте соответствующие типы в `types.ts`
3. Обновите валидаторы в `validators.ts`
4. Добавьте константы в `constants.ts` при необходимости
5. Создайте миграцию с помощью Drizzle
6. Обновите документацию

## Поддержка

Для вопросов по схеме напоминаний обращайтесь к команде разработки или создавайте issue в репозитории.
