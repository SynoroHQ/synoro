# Database Tools для мультиагентов

Этот модуль предоставляет tools для мультиагентов, которые позволяют получать информацию о делах и событиях пользователя из базы данных.

## Доступные Tools

### 1. `get_user_events`

Получить события пользователя с возможностью фильтрации.

**Параметры:**

- `userId` (string) - ID пользователя
- `householdId` (string) - ID домохозяйства
- `limit` (number, optional) - Максимальное количество событий (по умолчанию 10)
- `offset` (number, optional) - Смещение для пагинации (по умолчанию 0)
- `type` (string, optional) - Тип события: "expense", "task", "maintenance", "other"
- `status` (string, optional) - Статус события: "active", "archived", "deleted"
- `priority` (string, optional) - Приоритет: "low", "medium", "high", "urgent"
- `startDate` (string, optional) - Начальная дата в формате ISO (YYYY-MM-DD)
- `endDate` (string, optional) - Конечная дата в формате ISO (YYYY-MM-DD)
- `search` (string, optional) - Поисковый запрос по заголовку и заметкам

### 2. `get_event_by_id`

Получить детальную информацию о конкретном событии.

**Параметры:**

- `eventId` (string) - ID события
- `householdId` (string) - ID домохозяйства

### 3. `get_user_stats`

Получить статистику событий пользователя.

**Параметры:**

- `userId` (string) - ID пользователя
- `householdId` (string) - ID домохозяйства
- `startDate` (string, optional) - Начальная дата
- `endDate` (string, optional) - Конечная дата
- `type` (string, optional) - Тип события для фильтрации

### 4. `search_events`

Поиск событий по тексту в заголовке и заметках.

**Параметры:**

- `householdId` (string) - ID домохозяйства
- `userId` (string, optional) - ID пользователя
- `query` (string) - Поисковый запрос
- `limit` (number, optional) - Максимальное количество результатов
- `type` (string, optional) - Тип события

### 5. `get_recent_events`

Получить недавние события пользователя.

**Параметры:**

- `householdId` (string) - ID домохозяйства
- `userId` (string, optional) - ID пользователя
- `days` (number, optional) - Количество дней назад (по умолчанию 7)
- `limit` (number, optional) - Максимальное количество событий

### 6. `get_upcoming_tasks`

Получить предстоящие задачи пользователя.

**Параметры:**

- `householdId` (string) - ID домохозяйства
- `userId` (string, optional) - ID пользователя
- `days` (number, optional) - Количество дней вперед (по умолчанию 7)
- `limit` (number, optional) - Максимальное количество задач

### 7. `get_expense_summary`

Получить сводку по расходам пользователя.

**Параметры:**

- `householdId` (string) - ID домохозяйства
- `userId` (string, optional) - ID пользователя
- `startDate` (string, optional) - Начальная дата
- `endDate` (string, optional) - Конечная дата
- `currency` (string, optional) - Валюта для группировки (по умолчанию "RUB")

## Использование в агентах

### DatabaseAgent

Специализированный агент для работы с базой данных. Автоматически определяет, какие tools использовать на основе запроса пользователя.

**Примеры запросов:**

- "Покажи мои недавние события"
- "Найди все расходы за месяц"
- "Какая у меня статистика по задачам?"
- "Покажи предстоящие дела"

### Интеграция с другими агентами

Любой агент может использовать DatabaseToolsHandler для получения информации из базы данных:

```typescript
import { DatabaseToolsHandler } from "@synoro/api/lib/agents/database-tools-handler";

const handler = new DatabaseToolsHandler();

// Получить события пользователя
const events = await handler.executeTool("get_user_events", {
  userId: "user123",
  householdId: "household456",
  limit: 10,
});

// Получить статистику
const stats = await handler.executeTool("get_user_stats", {
  userId: "user123",
  householdId: "household456",
});
```

## Типы данных

### EventWithDetails

```typescript
interface EventWithDetails {
  id: string;
  householdId: string;
  userId: string | null;
  source: "telegram" | "web" | "mobile" | "api";
  type: "expense" | "task" | "maintenance" | "other";
  status: "active" | "archived" | "deleted";
  priority: "low" | "medium" | "high" | "urgent";
  occurredAt: string;
  ingestedAt: string;
  updatedAt: string;
  title: string | null;
  notes: string | null;
  amount: string | null;
  currency: string;
  data: Record<string, unknown> | null;
  properties: Array<{
    key: string;
    value: unknown;
  }>;
  tags: Array<{
    id: string;
    name: string;
    description: string | null;
    color: string | null;
  }>;
}
```

### UserStats

```typescript
interface UserStats {
  total: number;
  byType: Record<string, number>;
  byStatus: Record<string, number>;
  byCurrency: Record<
    string,
    {
      totalAmount: number;
      averageAmount: number;
      count: number;
    }
  >;
}
```

### ExpenseSummary

```typescript
interface ExpenseSummary {
  totalAmount: number;
  currency: string;
  byType: Record<string, { count: number; amount: number }>;
  byPeriod: Record<string, { count: number; amount: number }>;
  topCategories: Array<{
    category: string;
    amount: number;
    count: number;
  }>;
}
```

## Утилиты

### dateUtils

Вспомогательные функции для работы с датами:

- `parseDate(dateString: string): Date` - Парсинг даты из строки
- `getDaysAgo(days: number): Date` - Получить дату N дней назад
- `getDaysAhead(days: number): Date` - Получить дату N дней вперед
- `formatISODate(date: Date): string` - Форматирование в ISO формат

### formatUtils

Функции для форматирования данных:

- `formatCurrency(amount: number, currency?: string): string` - Форматирование валюты
- `formatDate(dateString: string): string` - Форматирование даты
- `formatRelativeTime(dateString: string): string` - Относительное время

## Примеры использования

### Получение недавних событий

```typescript
const recentEvents = await handler.executeTool("get_recent_events", {
  householdId: "household123",
  userId: "user456",
  days: 7,
  limit: 5,
});
```

### Поиск расходов

```typescript
const expenses = await handler.executeTool("search_events", {
  householdId: "household123",
  userId: "user456",
  query: "продукты",
  type: "expense",
  limit: 10,
});
```

### Анализ расходов за месяц

```typescript
const expenseSummary = await handler.executeTool("get_expense_summary", {
  householdId: "household123",
  userId: "user456",
  startDate: "2024-01-01",
  endDate: "2024-01-31",
  currency: "RUB",
});
```
