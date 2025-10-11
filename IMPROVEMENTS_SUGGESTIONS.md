# Предложения по улучшению (опционально)

## 🔧 Быстрые улучшения

### 1. Добавить константы для магических чисел

**Файл:** `packages/api/src/lib/services/event-log-service.ts`

```typescript
// В начале файла добавить:
const RATE_LIMIT = {
  MAX_EVENTS_PER_MINUTE: 10,
  WINDOW_MS: 60000,
} as const;

const QUERY_LIMITS = {
  DEFAULT_LIMIT: 50,
  MAX_LIMIT: 1000,
  DEFAULT_OFFSET: 0,
} as const;
```

### 2. Добавить helper для безопасной работы с датами

**Файл:** `packages/api/src/lib/utils/date-helpers.ts` (создать новый)

```typescript
/**
 * Безопасно парсит дату из различных форматов
 */
export function safeParseDate(
  value: string | number | Date,
  fallback: Date = new Date(),
): Date {
  try {
    const parsed = new Date(value);
    if (!isFinite(parsed.getTime()) || Number.isNaN(parsed.getTime())) {
      console.warn(`Invalid date: ${value}, using fallback`);
      return fallback;
    }
    return parsed;
  } catch (error) {
    console.warn(`Failed to parse date: ${value}, using fallback`);
    return fallback;
  }
}
```

### 3. Добавить типизированные ошибки

**Файл:** `packages/api/src/lib/errors/event-log-errors.ts` (создать новый)

```typescript
export class EventLogError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: unknown,
  ) {
    super(message);
    this.name = "EventLogError";
  }
}

export class EventLogValidationError extends EventLogError {
  constructor(message: string, details?: unknown) {
    super(message, "VALIDATION_ERROR", details);
    this.name = "EventLogValidationError";
  }
}

export class EventLogNotFoundError extends EventLogError {
  constructor(id: string) {
    super(`Event log not found: ${id}`, "NOT_FOUND", { id });
    this.name = "EventLogNotFoundError";
  }
}

export class EventLogStatusTransitionError extends EventLogError {
  constructor(from: string, to: string) {
    super(
      `Invalid status transition from '${from}' to '${to}'`,
      "INVALID_TRANSITION",
      { from, to },
    );
    this.name = "EventLogStatusTransitionError";
  }
}
```

### 4. Добавить метод для bulk операций

**Файл:** `packages/api/src/lib/services/event-log-service.ts`

```typescript
/**
 * Создать несколько логов событий за один запрос
 * Эффективнее для массовых операций
 */
async createEventLogsBatch(
  dataArray: CreateEventLogData[]
): Promise<EventLog[]> {
  if (dataArray.length === 0) {
    return [];
  }

  try {
    // Валидируем все данные
    const validatedData = dataArray.map((data) =>
      createEventLogDataSchema.parse(data)
    );

    // Вставляем все за один запрос
    const eventLogs = await db
      .insert(eventLogs)
      .values(
        validatedData.map((data) => ({
          source: data.source,
          chatId: data.chatId,
          type: data.type,
          text: data.text,
          originalText: data.originalText,
          meta: data.meta,
          status: "pending" as const,
        }))
      )
      .returning();

    return eventLogs;
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(
        `Validation error in batch: ${error.issues.map((e) => `${e.path.join(".")}: ${e.message}`).join(", ")}`
      );
    }
    throw error;
  }
}
```

### 5. Добавить метод для очистки старых логов

**Файл:** `packages/api/src/lib/services/event-log-service.ts`

```typescript
/**
 * Удалить старые логи событий
 * Полезно для автоматической очистки
 */
async cleanupOldEventLogs(
  olderThanDays: number = 90,
  status?: "processed" | "failed"
): Promise<number> {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

  const conditions = [lte(eventLogs.createdAt, cutoffDate)];

  if (status) {
    conditions.push(eq(eventLogs.status, status));
  }

  const result = await db
    .delete(eventLogs)
    .where(and(...conditions));

  const deletedCount = result.rowCount ?? 0;
  console.log(`Cleaned up ${deletedCount} old event logs`);

  return deletedCount;
}
```

### 6. Добавить метод для получения последних логов

**Файл:** `packages/api/src/lib/services/event-log-service.ts`

```typescript
/**
 * Получить последние логи для чата
 * Удобно для отображения истории
 */
async getRecentEventLogsForChat(
  chatId: string,
  limit: number = 20
): Promise<EventLog[]> {
  return await db
    .select()
    .from(eventLogs)
    .where(eq(eventLogs.chatId, chatId))
    .orderBy(desc(eventLogs.createdAt))
    .limit(Math.min(limit, 100)); // Максимум 100
}
```

---

## 🔒 Улучшения безопасности

### 1. Добавить санитизацию текста

**Файл:** `packages/api/src/lib/utils/text-sanitizer.ts` (создать новый)

```typescript
/**
 * Санитизирует текст для безопасного хранения
 */
export function sanitizeText(text: string, maxLength: number = 10000): string {
  // Удаляем null bytes
  let sanitized = text.replace(/\0/g, "");

  // Обрезаем до максимальной длины
  if (sanitized.length > maxLength) {
    sanitized = sanitized.slice(0, maxLength);
  }

  // Удаляем потенциально опасные символы
  sanitized = sanitized.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "");

  return sanitized.trim();
}
```

### 2. Добавить валидацию chatId

**Файл:** `packages/api/src/lib/services/event-log-service.ts`

```typescript
// В начале createEventLog добавить:
private validateChatId(chatId: string): void {
  // Проверяем формат chatId (например, только буквы, цифры, дефисы)
  if (!/^[a-zA-Z0-9_-]+$/.test(chatId)) {
    throw new Error("Invalid chatId format");
  }

  // Проверяем длину
  if (chatId.length > 100) {
    throw new Error("ChatId too long");
  }
}
```

---

## 📊 Улучшения производительности

### 1. Добавить кэширование для статистики

**Файл:** `packages/api/src/lib/services/event-log-service.ts`

```typescript
private statsCache = new Map<string, { data: any; timestamp: number }>();
private CACHE_TTL = 60000; // 1 минута

async getEventLogStats(filters: EventLogFilters = {}): Promise<{...}> {
  const cacheKey = JSON.stringify(filters);
  const cached = this.statsCache.get(cacheKey);

  if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
    return cached.data;
  }

  const stats = await this.calculateStats(filters);
  this.statsCache.set(cacheKey, { data: stats, timestamp: Date.now() });

  return stats;
}
```

### 2. Добавить connection pooling мониторинг

**Файл:** `packages/db/src/client.ts`

```typescript
// Добавить логирование состояния пула
if (config.DATABASE_TYPE === "neon") {
  pool.on("connect", () => {
    console.log("New database connection established");
  });
  pool.on("error", (err) => {
    console.error("Database pool error:", err);
  });
}
```

---

## 🧪 Добавить простые проверки

### 1. Добавить health check endpoint

**Файл:** `packages/api/src/router/health.ts` (создать новый)

```typescript
import { EventLogService } from "../lib/services/event-log-service";
import { publicProcedure } from "../trpc";

export const healthRouter = {
  checkEventLogs: publicProcedure.query(async () => {
    try {
      const service = new EventLogService();
      const stats = await service.getEventLogStats();

      return {
        status: "healthy",
        totalLogs: stats.total,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        status: "unhealthy",
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      };
    }
  }),
};
```

---

## 📝 Улучшения документации

### 1. Добавить примеры использования

**Файл:** `packages/api/src/lib/services/README.md` (создать новый)

```markdown
# Event Log Service

## Использование

### Создание лога события

\`\`\`typescript
import { EventLogService } from "./event-log-service";

const service = new EventLogService();

const eventLog = await service.createEventLog({
source: "telegram",
chatId: "123456789",
type: "text",
text: "Пользователь отправил сообщение",
meta: {
userId: "user123",
messageId: "msg456",
},
});
\`\`\`

### Получение логов с фильтрацией

\`\`\`typescript
const logs = await service.getEventLogs(
{
source: "telegram",
status: "processed",
startDate: new Date("2025-01-01"),
},
{
limit: 50,
orderBy: "createdAt",
orderDirection: "desc",
}
);
\`\`\`

### Обновление статуса

\`\`\`typescript
await service.updateEventLogStatus(eventLog.id, "processing");
// ... обработка
await service.updateEventLogStatus(eventLog.id, "processed");
\`\`\`
```

---

## 🎯 Приоритеты внедрения

### Высокий приоритет:

1. ✅ Типизированные ошибки (улучшает отладку)
2. ✅ Санитизация текста (безопасность)
3. ✅ Health check endpoint (мониторинг)

### Средний приоритет:

4. ⚠️ Метод очистки старых логов (обслуживание)
5. ⚠️ Batch операции (производительность)
6. ⚠️ Кэширование статистики (производительность)

### Низкий приоритет:

7. 📝 Расширенная документация
8. 📝 Connection pooling мониторинг
9. 📝 Дополнительные helper методы

---

## ✅ Заключение

Все предложенные улучшения являются **опциональными** и не критичны для работы системы. Текущий код уже стабилен и надежен.

Рекомендуется внедрять улучшения постепенно, начиная с высокоприоритетных пунктов.
