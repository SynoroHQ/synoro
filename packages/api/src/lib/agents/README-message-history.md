# История сообщений в мультиагентной системе

## Обзор

Система истории сообщений позволяет агентам понимать контекст диалога и принимать более обоснованные решения на основе предыдущих сообщений пользователя.

## Архитектура

### Основные компоненты

1. **MessageHistoryItem** - тип для представления сообщения в истории
2. **AgentMessageHistoryService** - сервис для работы с историей сообщений
3. **AbstractAgent** - базовый класс с методами для работы с историей
4. **AgentTask** - расширенный интерфейс задачи с полем messageHistory

### Поток данных

```
Пользователь → AgentMessageProcessor → AgentMessageHistoryService → AgentManager → Агенты
```

## Использование

### В базовом классе агента

```typescript
export class MyAgent extends AbstractAgent {
  async process(task: AgentTask): Promise<AgentResult<string>> {
    // Используем историю в промпте
    const systemPrompt = this.createPromptWithHistory(basePrompt, task, {
      includeSummary: true,
    });

    // Или получаем полную историю
    const fullHistory = this.formatMessageHistory(task, 2000);

    // Анализируем историю для понимания контекста
    const historyAnalysis = await this.analyzeMessageHistory(task);
  }
}
```

### Методы для работы с историей

#### `formatMessageHistory(task, maxLength)`

Форматирует историю сообщений для включения в промпт:

```typescript
const history = this.formatMessageHistory(task, 1500);
// Результат: "[10:00] Пользователь: Привет!\n[10:01] Ассистент: Привет! Как дела?"
```

#### `getHistorySummary(task, maxMessages)`

Получает краткую сводку последних сообщений:

```typescript
const summary = this.getHistorySummary(task, 3);
// Результат: "Последние 3 сообщения:\n1. Пользователь: Вопрос\n2. Ассистент: Ответ"
```

#### `createPromptWithHistory(basePrompt, task, options)`

Создает расширенный промпт с историей:

```typescript
const prompt = this.createPromptWithHistory("Ты помощник...", task, {
  includeFullHistory: false,
  includeSummary: true,
  maxHistoryLength: 1500,
});
```

#### `analyzeMessageHistory(task)`

Анализирует историю для понимания контекста:

```typescript
const analysis = await this.analyzeMessageHistory(task);
// Результат: {
//   conversationTopic: "Покупки",
//   userIntent: "Создать напоминание",
//   conversationMood: "positive",
//   keyTopics: ["покупки", "напоминания"],
//   needsFollowUp: true
// }
```

## Настройка

### Параметры истории сообщений

```typescript
const messageHistory = await AgentMessageHistoryService.getMessageHistory(
  ctx,
  userId,
  channel,
  {
    maxMessages: 10, // Максимум сообщений
    includeSystemMessages: false, // Включать системные сообщения
    maxAgeHours: 24, // Максимальный возраст сообщений
  },
);
```

### Умная обрезка по токенам

```typescript
const messageHistory =
  await AgentMessageHistoryService.getMessageHistoryWithTokenLimit(
    ctx,
    userId,
    channel,
    2000, // Максимум токенов
  );
```

## Примеры использования

### RouterAgent с историей

```typescript
// В RouterAgent.classifyMessage()
const historyContext =
  task.messageHistory && task.messageHistory.length > 0
    ? `\n\nИСТОРИЯ ДИАЛОГА:\n${this.formatMessageHistory(task, 1000)}`
    : "";

const prompt = `Проанализируй сообщение: "${task.input}"${historyContext}`;
```

### TaskOrchestratorAgent с контекстом

```typescript
// В TaskOrchestratorAgent.createExecutionPlan()
const prompt = this.createPromptWithHistory(
  `Создай план выполнения задачи: "${task.input}"`,
  task,
  { includeSummary: true },
);
```

### SmartReminderAgent с анализом истории

```typescript
// В SmartReminderAgent.extractReminderInfo()
const prompt = this.createPromptWithHistory(
  `Текст: "${text}"`,
  { input: text, context, messageHistory: [] } as any,
  { includeSummary: true },
);
```

## Оптимизация производительности

### Кэширование

История сообщений кэшируется в базовом классе агента для избежания повторных запросов к БД.

### Умная обрезка

Система автоматически обрезает историю по токенам, сохраняя:

1. Последние 2 сообщения (текущий контекст)
2. Важные сообщения (вопросы, длинные ответы)
3. Системные сообщения

### Лимиты

- Максимум сообщений: 10 (настраивается)
- Максимум токенов: 2000 (настраивается)
- Максимальный возраст: 24 часа (настраивается)

## Тестирование

```typescript
import { AgentMessageHistoryService } from "./agent-message-history-service";

describe("AgentMessageHistoryService", () => {
  it("should format history correctly", () => {
    const messages = [
      /* ... */
    ];
    const result = AgentMessageHistoryService.formatHistoryForPrompt(messages);
    expect(result).toContain("Пользователь:");
  });
});
```

## Лучшие практики

1. **Используйте краткую сводку** для большинства случаев (`includeSummary: true`)
2. **Полную историю** только когда критически важен контекст
3. **Анализируйте историю** для сложных задач
4. **Настраивайте лимиты** в зависимости от типа агента
5. **Тестируйте** с различными размерами истории

## Совместимость

Система истории сообщений полностью совместима с существующими агентами. Агенты без поддержки истории будут работать как раньше, просто не получая поле `messageHistory`.
