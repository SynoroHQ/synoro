# Event Log Service - Документация

## Обзор

Сервис для логирования событий из различных источников (Telegram, Web, Mobile, API) в базу данных.

## Доступные версии

### EventLogService (базовая версия)

Стандартная версия с основными функциями логирования.

### EventLogServiceEnhanced (улучшенная версия)

Расширенная версия с дополнительными возможностями:

- ✅ Rate limiting (защита от спама)
- ✅ Batch операции (массовые вставки)
- ✅ Санитизация данных
- ✅ Типизированные ошибки
- ✅ Валидация входных данных

---

## Использование

### Создание лога события

```typescript
import { EventLogService } from "./event-log-service";

const service = new EventLogService();

const eventLog = await service.createEventLog({
  source: "telegram",
  chatId: "123456789",
  type: "text",
  text: "Пользователь отправил сообщение",
  originalText: "Оригинальный текст",
  meta: {
    userId: "user123",
    messageId: "msg456",
    timestamp: new Date().toISOString(),
  },
});

console.log("Создан лог события:", eventLog.id);
```

### Получение логов с фильтрацией

```typescript
const logs = await service.getEventLogs(
  {
    source: "telegram",
    status: "processed",
    startDate: new Date("2025-01-01"),
    endDate: new Date("2025-12-31"),
  },
  {
    limit: 50,
    offset: 0,
    orderBy: "createdAt",
    orderDirection: "desc",
  },
);

console.log(`Найдено ${logs.length} логов`);
```

### Обновление статуса

```typescript
// Переход: pending -> processing
await service.updateEventLogStatus(eventLog.id, "processing");

// Обработка...

// Переход: processing -> processed
await service.updateEventLogStatus(eventLog.id, "processed");
```

### Получение статистики

```typescript
const stats = await service.getEventLogStats({
  source: "telegram",
  startDate: new Date("2025-01-01"),
});

console.log("Всего логов:", stats.total);
console.log("По статусам:", stats.byStatus);
console.log("По типам:", stats.byType);
console.log("По источникам:", stats.bySource);
```

---

## Использование улучшенной версии

### Создание с автоматической санитизацией

```typescript
import { EventLogServiceEnhanced } from "./event-log-service-enhanced";

const service = new EventLogServiceEnhanced();

try {
  const eventLog = await service.createEventLog({
    source: "telegram",
    chatId: "user_123",
    type: "text",
    text: "Текст с потенциально опасными символами\x00\x01",
    meta: {
      userId: "user123",
      // Опасные ключи будут отфильтрованы
      __proto__: "dangerous",
      normalKey: "safe value",
    },
  });

  console.log("Лог создан с санитизацией:", eventLog.id);
} catch (error) {
  if (error instanceof EventLogValidationError) {
    console.error("Ошибка валидации:", error.message);
  } else if (error instanceof EventLogRateLimitError) {
    console.error("Превышен лимит запросов:", error.message);
  }
}
```

### Batch операции

```typescript
const logsData = [
  {
    source: "telegram",
    chatId: "chat1",
    type: "text" as const,
    text: "Сообщение 1",
  },
  {
    source: "telegram",
    chatId: "chat1",
    type: "text" as const,
    text: "Сообщение 2",
  },
  {
    source: "web",
    chatId: "chat2",
    type: "text" as const,
    text: "Сообщение 3",
  },
];

const createdLogs = await service.createEventLogsBatch(logsData);
console.log(`Создано ${createdLogs.length} логов за один запрос`);
```

### Получение последних логов для чата

```typescript
const recentLogs = await service.getRecentEventLogsForChat("chat123", 20);
console.log(`Последние ${recentLogs.length} логов для чата`);
```

### Очистка старых логов

```typescript
// Удалить обработанные логи старше 90 дней
const deletedCount = await service.cleanupOldEventLogs(90, "processed");
console.log(`Удалено ${deletedCount} старых логов`);
```

### Мониторинг rate limiter

```typescript
const stats = service.getRateLimiterStats();
console.log("Активных ключей:", stats.totalKeys);
console.log("Топ источников:", stats.topSources);
```

---

## Обработка ошибок

### Типы ошибок

```typescript
import {
  EventLogDatabaseError,
  EventLogError,
  EventLogNotFoundError,
  EventLogRateLimitError,
  EventLogStatusTransitionError,
  EventLogValidationError,
} from "../errors/event-log-errors";

try {
  await service.createEventLog(data);
} catch (error) {
  if (error instanceof EventLogValidationError) {
    // Ошибка валидации данных
    console.error("Невалидные данные:", error.details);
  } else if (error instanceof EventLogRateLimitError) {
    // Превышен лимит запросов
    console.error("Rate limit:", error.details);
  } else if (error instanceof EventLogNotFoundError) {
    // Лог не найден
    console.error("Не найден:", error.details);
  } else if (error instanceof EventLogStatusTransitionError) {
    // Недопустимый переход статуса
    console.error("Недопустимый переход:", error.details);
  } else if (error instanceof EventLogDatabaseError) {
    // Ошибка базы данных
    console.error("Ошибка БД:", error.details);
  }
}
```

---

## Валидация данных

### Валидация chatId

```typescript
import { validateChatId } from "../utils/text-sanitizer";

const result = validateChatId("user_123");
if (!result.valid) {
  console.error("Невалидный chatId:", result.error);
}
```

### Валидация source

```typescript
import { validateSource } from "../utils/text-sanitizer";

const result = validateSource("telegram");
if (!result.valid) {
  console.error("Невалидный source:", result.error);
}
```

### Санитизация текста

```typescript
import { sanitizeText } from "../utils/text-sanitizer";

const clean = sanitizeText("Текст\x00с\x01опасными\x02символами", 1000);
console.log("Очищенный текст:", clean);
```

---

## Работа с датами

```typescript
import { isValidDate, safeParseDate } from "../utils/date-helpers";

// Безопасный парсинг даты
const date = safeParseDate("2025-01-15", new Date());

// Проверка валидности
if (isValidDate(date)) {
  console.log("Дата валидна:", date.toISOString());
}
```

---

## Rate Limiting

### Настройки по умолчанию

- **Лимит:** 60 событий в минуту на комбинацию source:chatId
- **Окно:** 60 секунд
- **Очистка:** каждые 5 минут

### Обход rate limiting

Rate limiting применяется только в `EventLogServiceEnhanced`. Если нужно обойти лимит для системных операций, используйте базовый `EventLogService`.

---

## Best Practices

### 1. Используйте правильный тип события

```typescript
// ✅ Правильно
type: "text" | "audio" | "image" | "video" | "file";

// ❌ Неправильно
type: "unknown"; // Не существует
```

### 2. Ограничивайте размер метаданных

```typescript
// ✅ Правильно - компактные метаданные
meta: {
  userId: "123",
  messageId: "456",
}

// ❌ Неправильно - слишком много данных
meta: {
  fullUserObject: { /* огромный объект */ },
  entireMessageHistory: [ /* массив из 1000 элементов */ ],
}
```

### 3. Обрабатывайте ошибки

```typescript
// ✅ Правильно
try {
  await service.createEventLog(data);
} catch (error) {
  console.error("Failed to log event:", error);
  // Не прерываем основной поток
}

// ❌ Неправильно
await service.createEventLog(data); // Может упасть весь процесс
```

### 4. Используйте batch для массовых операций

```typescript
// ✅ Правильно - один запрос
await service.createEventLogsBatch(logsArray);

// ❌ Неправильно - много запросов
for (const log of logsArray) {
  await service.createEventLog(log);
}
```

---

## Мониторинг

### Health Check

```typescript
import { healthRouter } from "../../router/health";

// Проверка здоровья системы логирования
const health = await healthRouter.checkEventLogs.query();
console.log("Status:", health.status);
console.log("Total logs:", health.totalLogs);
```

---

## Миграция с базовой на улучшенную версию

```typescript
// Было
import { EventLogService } from "./event-log-service";
// Стало
import { EventLogServiceEnhanced } from "./event-log-service-enhanced";

const service = new EventLogService();

const service = new EventLogServiceEnhanced();

// API остается совместимым, но добавляются новые возможности
```

---

## Производительность

### Рекомендации

1. **Используйте индексы** - все необходимые индексы уже созданы в схеме
2. **Batch операции** - для массовых вставок используйте `createEventLogsBatch`
3. **Пагинация** - всегда используйте limit и offset для больших выборок
4. **Очистка** - регулярно удаляйте старые логи через `cleanupOldEventLogs`

### Ожидаемая производительность

- Вставка одного лога: < 50ms
- Получение по ID: < 10ms
- Получение списка (50 записей): < 100ms
- Статистика: < 200ms
- Batch вставка (100 записей): < 200ms

---

## Troubleshooting

### Проблема: Rate limit exceeded

**Решение:** Уменьшите частоту запросов или используйте базовый `EventLogService`

### Проблема: Validation error

**Решение:** Проверьте формат данных, используйте утилиты валидации

### Проблема: Database error

**Решение:** Проверьте подключение к БД, логи PostgreSQL

---

## Дополнительные ресурсы

- [Схема базы данных](../../../db/src/schemas/events/schema.ts)
- [Типы ошибок](../errors/event-log-errors.ts)
- [Утилиты санитизации](../utils/text-sanitizer.ts)
- [Утилиты для дат](../utils/date-helpers.ts)
