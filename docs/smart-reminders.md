# Система умных напоминаний Synoro

Система умных напоминаний - это комплексное решение для создания, управления и автоматической отправки напоминаний с использованием ИИ и планировщика задач.

## Архитектура

### Компоненты системы

1. **База данных** (`packages/db/src/schemas/reminders/`)
   - Схемы для напоминаний, истории выполнения и шаблонов
   - Поддержка повторяющихся напоминаний
   - ИИ-контекст и метаданные

2. **Сервис управления** (`packages/api/src/lib/services/reminder-service.ts`)
   - CRUD операции с напоминаниями
   - Фильтрация и поиск
   - Статистика и аналитика

3. **ИИ-агент** (`packages/api/src/lib/agents/smart-reminder-agent.ts`)
   - Создание напоминаний из естественного языка
   - Анализ контекста и извлечение временной информации
   - Умные предложения и рекомендации

4. **Планировщик задач** (`packages/trigger/src/trigger/reminders/`)
   - Автоматическая отправка напоминаний
   - Обработка повторяющихся напоминаний
   - Интеграция с различными каналами уведомлений

5. **API роуты** (`packages/api/src/router/reminders.ts`)
   - tRPC процедуры для фронтенда
   - Валидация входных данных
   - Обработка ошибок

## Схема базы данных

### Таблица `reminders`
Основная таблица для хранения напоминаний:

```sql
- id: UUID (PK)
- userId: UUID (FK to users)
- title: TEXT (название)
- description: TEXT (описание)
- type: ENUM (task, event, deadline, meeting, call, follow_up, custom)
- priority: ENUM (low, medium, high, urgent)
- status: ENUM (pending, active, completed, cancelled, snoozed)
- reminderTime: TIMESTAMP (время напоминания)
- recurrence: ENUM (none, daily, weekly, monthly, yearly, custom)
- aiGenerated: BOOLEAN (создано ИИ)
- aiContext: TEXT (JSON контекст ИИ)
- tags: TEXT (JSON массив тегов)
- chatId: UUID (связь с чатом)
- parentReminderId: UUID (для повторяющихся)
```

### Таблица `reminder_executions`
История выполнения напоминаний:

```sql
- id: UUID (PK)
- reminderId: UUID (FK to reminders)
- executedAt: TIMESTAMP
- status: TEXT (sent, failed, skipped)
- channel: TEXT (telegram, email, push)
- errorMessage: TEXT
```

### Таблица `reminder_templates`
Шаблоны напоминаний:

```sql
- id: UUID (PK)
- userId: UUID (FK to users)
- name: TEXT
- template: TEXT (JSON шаблон)
- isPublic: BOOLEAN
```

## API Endpoints

### Создание напоминаний

```typescript
// Создание вручную
trpc.reminders.create.mutate({
  title: "Встреча с клиентом",
  type: "meeting",
  priority: "high",
  reminderTime: new Date("2024-01-15T14:00:00Z")
})

// Создание из текста с ИИ
trpc.reminders.createFromText.mutate({
  text: "Напомни мне завтра в 15:00 позвонить маме",
  timezone: "Europe/Moscow"
})
```

### Управление напоминаниями

```typescript
// Получить список
trpc.reminders.list.query({
  filters: {
    status: ["active", "pending"],
    priority: ["high", "urgent"],
    dateFrom: new Date(),
    search: "встреча"
  },
  sort: { field: "reminderTime", direction: "asc" },
  limit: 20
})

// Обновить
trpc.reminders.update.mutate({
  id: "reminder-id",
  data: { status: "completed" }
})

// Отложить
trpc.reminders.snooze.mutate({
  id: "reminder-id",
  snoozeUntil: new Date(Date.now() + 60 * 60 * 1000) // +1 час
})
```

## Использование ИИ-агента

### Создание из текста

ИИ-агент умеет извлекать из естественного языка:

- **Время**: "завтра в 15:00", "через час", "в понедельник"
- **Тип**: автоматически определяет (встреча, звонок, задача)
- **Приоритет**: на основе контекста и ключевых слов
- **Теги**: извлекает из контекста

Примеры:

```typescript
// "Напомни мне завтра позвонить маме"
// → title: "Позвонить маме", type: "call", priority: "medium"

// "Встреча с клиентом в 14:00 завтра"
// → title: "Встреча с клиентом", type: "meeting", priority: "high"

// "Сдать отчет до пятницы"
// → title: "Сдать отчет", type: "deadline", priority: "high"
```

### Умные предложения

ИИ генерирует предложения по улучшению:

- **Перенос времени** на более подходящее
- **Изменение приоритета** на основе контекста
- **Связанные задачи** и подготовительные действия
- **Дополнительный контекст** и детали

## Планировщик задач (Trigger.dev)

### Основной планировщик

Запускается каждую минуту и проверяет:

```typescript
// Cron: "* * * * *" (каждую минуту)
export const reminderScheduler = schedules.task({
  id: "reminder-scheduler",
  cron: "* * * * *",
  run: async () => {
    // Находит активные напоминания для отправки
    // Запускает задачи отправки уведомлений
    // Обрабатывает повторяющиеся напоминания
  }
})
```

### Отправка уведомлений

```typescript
export const sendReminderNotification = task({
  id: "send-reminder-notification",
  run: async (payload) => {
    // Определяет каналы уведомлений
    // Отправляет через Telegram, Email, Push
    // Записывает результат в историю
  }
})
```

## Интеграция с каналами уведомлений

### Telegram
- Интеграция с существующим ботом
- Форматированные сообщения с кнопками действий
- Поддержка inline-команд для управления

### Email
- HTML-шаблоны уведомлений
- Поддержка вложений и календарных событий

### Push-уведомления
- Веб-push для браузеров
- Мобильные уведомления через FCM

## Повторяющиеся напоминания

Система поддерживает различные типы повторений:

- **Ежедневно**: каждый день в то же время
- **Еженедельно**: каждую неделю в тот же день
- **Ежемесячно**: каждый месяц в то же число
- **Ежегодно**: каждый год в ту же дату
- **Кастомные**: гибкие паттерны через JSON

```typescript
{
  recurrence: "custom",
  recurrencePattern: {
    type: "interval",
    interval: 2,
    unit: "weeks",
    daysOfWeek: [1, 3, 5] // Пн, Ср, Пт
  }
}
```

## Безопасность и производительность

### Безопасность
- Все напоминания привязаны к пользователю
- Валидация всех входных данных
- Защита от SQL-инъекций через Drizzle ORM

### Производительность
- Индексы на часто используемые поля
- Кэширование результатов ИИ-анализа
- Пагинация для больших списков
- Ограничение количества обрабатываемых напоминаний

### Мониторинг
- Логирование всех операций
- Телеметрия через OpenTelemetry
- Метрики производительности ИИ
- Отслеживание ошибок отправки

## Примеры использования

### Создание простого напоминания

```typescript
const reminder = await trpc.reminders.create.mutate({
  title: "Купить молоко",
  type: "task",
  priority: "low",
  reminderTime: new Date("2024-01-15T18:00:00Z")
})
```

### Создание с помощью ИИ

```typescript
const result = await trpc.reminders.createFromText.mutate({
  text: "Напомни мне через 2 часа проверить почту",
  timezone: "Europe/Moscow"
})

console.log(result.reminder.title) // "Проверить почту"
console.log(result.confidence) // 0.95
console.log(result.suggestions) // Умные предложения
```

### Получение статистики

```typescript
const stats = await trpc.reminders.getStats.query()
// {
//   total: 25,
//   pending: 5,
//   active: 10,
//   completed: 8,
//   overdue: 2
// }
```

## Развитие системы

### Планируемые функции

1. **Интеграция с календарями** (Google Calendar, Outlook)
2. **Голосовые напоминания** через синтез речи
3. **Геолокационные напоминания** по местоположению
4. **Командная работа** с общими напоминаниями
5. **Аналитика** и отчеты по продуктивности
6. **Мобильное приложение** с оффлайн-поддержкой

### Расширение ИИ-возможностей

1. **Контекстная осведомленность** о предыдущих напоминаниях
2. **Предиктивные предложения** на основе паттернов
3. **Автоматическая категоризация** и тегирование
4. **Интеллектуальное планирование** времени
5. **Обработка изображений** и документов

## Заключение

Система умных напоминаний Synoro предоставляет мощный и гибкий инструмент для управления задачами и событиями с использованием современных технологий ИИ и автоматизации.
