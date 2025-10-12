# Design Document

## Overview

Данный документ описывает архитектурное решение для корректной работы агентов с историей сообщений и контекстом диалога. Решение включает создание сервиса для замены плейсхолдеров в промптах, улучшение форматирования истории и оптимизацию размера контекста.

## Architecture

### High-Level Architecture

```
┌─────────────────┐
│  AgentManager   │
│                 │
│  - Получает     │
│    историю из БД│
│  - Создает      │
│    задачу       │
└────────┬────────┘
         │
         ▼
┌─────────────────────────┐
│ PromptContextService    │
│                         │
│ - Заменяет плейсхолдеры │
│ - Форматирует историю   │
│ - Оптимизирует размер   │
└────────┬────────────────┘
         │
         ▼
┌─────────────────┐
│  BaseAgent      │
│                 │
│  - Использует   │
│    обработанный │
│    промпт       │
└─────────────────┘
```

### Component Interaction Flow

1. **AgentManager** получает историю сообщений из БД через `getConversationHistory()`
2. **AgentManager** создает `AgentTask` с историей сообщений
3. **BaseAgent** вызывает **PromptContextService** для обработки промпта
4. **PromptContextService** заменяет все плейсхолдеры на реальные значения
5. **BaseAgent** отправляет обработанный промпт в AI модель

## Components and Interfaces

### 1. PromptContextService

Новый сервис для обработки промптов и замены плейсхолдеров.

```typescript
interface PromptContextOptions {
  maxHistoryLength?: number;
  maxHistoryMessages?: number;
  includeSystemMessages?: boolean;
  timezone?: string;
}

interface ProcessedPrompt {
  prompt: string;
  metadata: {
    historyMessagesCount: number;
    historyTruncated: boolean;
    placeholdersReplaced: string[];
    estimatedTokens: number;
  };
}

class PromptContextService {
  /**
   * Обрабатывает промпт, заменяя все плейсхолдеры на реальные значения
   */
  processPrompt(
    promptTemplate: string,
    task: AgentTask,
    options?: PromptContextOptions,
  ): ProcessedPrompt;

  /**
   * Заменяет плейсхолдер {{messageHistory}} на форматированную историю
   */
  private replaceMessageHistory(
    prompt: string,
    messageHistory: MessageHistoryItem[],
    options: PromptContextOptions,
  ): { prompt: string; metadata: any };

  /**
   * Заменяет контекстные плейсхолдеры (userId, currentTime, timezone, householdId)
   */
  private replaceContextPlaceholders(
    prompt: string,
    context: AgentContext,
  ): { prompt: string; replaced: string[] };

  /**
   * Форматирует историю сообщений для промпта
   */
  private formatMessageHistory(
    messages: MessageHistoryItem[],
    maxLength: number,
  ): string;

  /**
   * Оптимизирует историю по размеру токенов
   */
  private optimizeHistorySize(
    messages: MessageHistoryItem[],
    maxTokens: number,
  ): MessageHistoryItem[];

  /**
   * Оценивает количество токенов в тексте
   */
  private estimateTokens(text: string): number;
}
```

### 2. Обновление BaseAgent

Интеграция `PromptContextService` в базовый класс агента.

```typescript
abstract class AbstractAgent implements BaseAgent {
  protected promptContextService: PromptContextService;

  constructor(defaultModel = "gpt-5") {
    this.defaultModel = defaultModel;
    this.contextManager = new AgentContextManager();
    this.promptContextService = new PromptContextService();
  }

  /**
   * Обновленный метод создания оптимизированного промпта
   */
  protected async createOptimizedPrompt(
    basePrompt: string,
    task: AgentTask,
    options?: PromptContextOptions,
  ): Promise<string> {
    // Обрабатываем промпт через PromptContextService
    const processed = this.promptContextService.processPrompt(
      basePrompt,
      task,
      options,
    );

    // Логируем метаданные для отладки
    if (process.env.DEBUG_PROMPTS === "true") {
      console.log("Prompt processing metadata:", processed.metadata);
    }

    return processed.prompt;
  }
}
```

### 3. Обновление констант промптов

Убедиться, что все промпты используют правильные плейсхолдеры.

```typescript
// packages/prompts/src/core/constants.ts
export const CONTEXT_VARIABLES = `
КОНТЕКСТ:
- Пользователь: {{userId}}
- Домашнее хозяйство: {{householdId}}
- Время запроса: {{currentTime}}
- Часовой пояс: {{timezone}}

ИСТОРИЯ ДИАЛОГА:
{{messageHistory}}`.trim();
```

### 4. Интеграция DatabaseToolsService в агенты

Обновить агенты для доступа к событиям из базы данных.

```typescript
// packages/api/src/lib/agents/general-assistant-agent.ts
export class GeneralAssistantAgent extends AbstractAgent {
  private databaseService: DatabaseToolsService;

  constructor() {
    super("gpt-5");
    this.databaseService = new DatabaseToolsService();
  }

  async process(task: AgentTask): Promise<AgentResult<string>> {
    // Проверяем, запрашивает ли пользователь события
    const needsEventData = this.detectEventRequest(task.input);

    let eventContext = "";
    if (needsEventData && task.context.householdId) {
      const events = await this.databaseService.getUserEvents({
        userId: task.context.userId,
        householdId: task.context.householdId,
        limit: 20,
        startDate: needsEventData.startDate,
        endDate: needsEventData.endDate,
        type: needsEventData.type,
      });

      eventContext = this.formatEventsForPrompt(events);
    }

    // Добавляем контекст событий в промпт
    const systemPrompt = await getPrompt(
      PROMPT_KEYS.GENERAL_ASSISTANT_AGENT,
      "latest",
      {
        userId: task.context?.userId || "Неизвестен",
        householdId: task.context?.householdId || "Неизвестно",
        currentTime: new Date().toLocaleString("ru-RU"),
        eventContext: eventContext || "События не запрашивались",
      },
    );

    // ... остальная логика
  }

  /**
   * Определяет, запрашивает ли пользователь информацию о событиях
   */
  private detectEventRequest(input: string): {
    needsEvents: boolean;
    startDate?: string;
    endDate?: string;
    type?: string;
  } | null {
    const inputLower = input.toLowerCase();

    const eventKeywords = [
      "событи",
      "дела",
      "задач",
      "что я делал",
      "покажи",
      "расход",
      "трат",
      "покупк",
      "список",
    ];

    const needsEvents = eventKeywords.some((keyword) =>
      inputLower.includes(keyword),
    );

    if (!needsEvents) return null;

    // Определяем период
    let startDate: string | undefined;
    let endDate = new Date().toISOString();

    if (inputLower.includes("вчера")) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      yesterday.setHours(0, 0, 0, 0);
      startDate = yesterday.toISOString();

      const endOfYesterday = new Date(yesterday);
      endOfYesterday.setHours(23, 59, 59, 999);
      endDate = endOfYesterday.toISOString();
    } else if (inputLower.includes("сегодня")) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      startDate = today.toISOString();
    } else if (inputLower.includes("неделю") || inputLower.includes("7 дней")) {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      startDate = weekAgo.toISOString();
    } else if (inputLower.includes("месяц") || inputLower.includes("30 дней")) {
      const monthAgo = new Date();
      monthAgo.setDate(monthAgo.getDate() - 30);
      startDate = monthAgo.toISOString();
    } else {
      // По умолчанию - последние 7 дней
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      startDate = weekAgo.toISOString();
    }

    return {
      needsEvents: true,
      startDate,
      endDate,
    };
  }

  /**
   * Форматирует события для включения в промпт
   */
  private formatEventsForPrompt(events: EventWithDetails[]): string {
    if (events.length === 0) {
      return "События не найдены";
    }

    const formatted = events
      .map((event) => {
        const date = new Date(event.occurredAt).toLocaleString("ru-RU");
        const tags = event.tags?.map((t) => t.name).join(", ") || "";
        const amount = event.amount
          ? ` (${event.amount} ${event.currency})`
          : "";

        return `- [${date}] ${event.title}${amount}${tags ? ` #${tags}` : ""}${event.notes ? `\n  ${event.notes}` : ""}`;
      })
      .join("\n");

    return `СОБЫТИЯ ПОЛЬЗОВАТЕЛЯ:\n${formatted}`;
  }
}
```

## Data Models

### ProcessedPrompt

```typescript
interface ProcessedPrompt {
  // Обработанный промпт с замененными плейсхолдерами
  prompt: string;

  // Метаданные обработки
  metadata: {
    // Количество сообщений в истории
    historyMessagesCount: number;

    // Была ли обрезана история
    historyTruncated: boolean;

    // Список замененных плейсхолдеров
    placeholdersReplaced: string[];

    // Приблизительное количество токенов
    estimatedTokens: number;

    // Предупреждения (если есть)
    warnings?: string[];
  };
}
```

### PromptContextOptions

```typescript
interface PromptContextOptions {
  // Максимальная длина истории в символах
  maxHistoryLength?: number; // default: 1500

  // Максимальное количество сообщений в истории
  maxHistoryMessages?: number; // default: 10

  // Включать ли системные сообщения
  includeSystemMessages?: boolean; // default: false

  // Часовой пояс для форматирования времени
  timezone?: string; // default: "UTC"

  // Максимальное количество токенов для истории
  maxHistoryTokens?: number; // default: 500
}
```

## Error Handling

### Обработка отсутствующих данных

```typescript
// Если данные для плейсхолдера отсутствуют
const DEFAULT_VALUES = {
  userId: "anonymous",
  householdId: "none",
  currentTime: () => new Date().toISOString(),
  timezone: "UTC",
  messageHistory: "История диалога пуста",
};
```

### Обработка ошибок форматирования

```typescript
try {
  const processed = promptContextService.processPrompt(prompt, task);
  return processed.prompt;
} catch (error) {
  console.error("Failed to process prompt:", error);
  // Возвращаем промпт без обработки, но логируем ошибку
  return prompt;
}
```

### Логирование предупреждений

```typescript
if (!task.context.userId) {
  console.warn("userId not found in context, using default value");
  warnings.push("userId not found");
}

if (messageHistory.length === 0) {
  console.info("Message history is empty");
}

if (historyTruncated) {
  console.info(
    `Message history truncated from ${originalLength} to ${finalLength} messages`,
  );
}
```

## Testing Strategy

### Unit Tests

1. **PromptContextService Tests**
   - Тест замены каждого плейсхолдера отдельно
   - Тест замены всех плейсхолдеров одновременно
   - Тест обработки отсутствующих данных
   - Тест форматирования истории различной длины
   - Тест оптимизации размера истории
   - Тест оценки токенов

2. **BaseAgent Tests**
   - Тест интеграции с PromptContextService
   - Тест создания оптимизированного промпта
   - Тест обработки ошибок

### Integration Tests

1. **End-to-End Tests**
   - Тест полного цикла: получение истории → обработка промпта → генерация ответа
   - Тест с различными агентами (EventProcessor, EventAnalyzer, GeneralAssistant)
   - Тест с различными сценариями истории (пустая, короткая, длинная)

### Test Scenarios

```typescript
describe("PromptContextService", () => {
  it("should replace all placeholders correctly", () => {
    const prompt =
      "User: {{userId}}, Time: {{currentTime}}, History: {{messageHistory}}";
    const task = createMockTask();
    const result = service.processPrompt(prompt, task);

    expect(result.prompt).not.toContain("{{");
    expect(result.metadata.placeholdersReplaced).toHaveLength(3);
  });

  it("should format message history correctly", () => {
    const messages = [
      { role: "user", content: "Hello", timestamp: new Date() },
      { role: "assistant", content: "Hi!", timestamp: new Date() },
    ];
    const formatted = service.formatMessageHistory(messages, 1000);

    expect(formatted).toContain("Пользователь: Hello");
    expect(formatted).toContain("Ассистент: Hi!");
  });

  it("should truncate long history", () => {
    const longHistory = createLongMessageHistory(100);
    const result = service.processPrompt(
      "{{messageHistory}}",
      {
        messageHistory: longHistory,
      },
      { maxHistoryMessages: 10 },
    );

    expect(result.metadata.historyTruncated).toBe(true);
    expect(result.metadata.historyMessagesCount).toBe(10);
  });
});
```

## Performance Considerations

### Оптимизация производительности

1. **Кэширование форматированной истории**
   - Кэшировать форматированную историю для одинаковых наборов сообщений
   - Использовать хеш от ID сообщений как ключ кэша

2. **Ленивая обработка**
   - Обрабатывать плейсхолдеры только если они присутствуют в промпте
   - Использовать регулярные выражения для быстрой проверки наличия плейсхолдеров

3. **Оптимизация памяти**
   - Не хранить полную историю в памяти, если она не нужна
   - Использовать потоковую обработку для больших историй

### Метрики производительности

```typescript
interface PerformanceMetrics {
  promptProcessingTime: number; // ms
  historyFormattingTime: number; // ms
  placeholderReplacementTime: number; // ms
  totalTokens: number;
  historyTokens: number;
}
```

## Security Considerations

### Защита данных пользователя

1. **Санитизация истории**
   - Удалять чувствительные данные из истории перед отправкой в AI
   - Маскировать персональные данные (телефоны, email, адреса)

2. **Ограничение размера**
   - Ограничивать максимальный размер истории для предотвращения DoS
   - Ограничивать количество сообщений в истории

3. **Логирование**
   - Не логировать полное содержимое сообщений в production
   - Логировать только метаданные (количество сообщений, размер)

## Migration Strategy

### Поэтапное внедрение

1. **Фаза 1: Создание PromptContextService**
   - Создать новый сервис
   - Написать unit тесты
   - Не интегрировать с агентами

2. **Фаза 2: Интеграция с BaseAgent**
   - Обновить BaseAgent для использования PromptContextService
   - Добавить feature flag для включения/выключения новой функциональности
   - Тестировать на staging

3. **Фаза 3: Обновление всех агентов**
   - Обновить EventProcessorAgent
   - Обновить EventAnalyzerAgent
   - Обновить GeneralAssistantAgent
   - Обновить RouterAgent

4. **Фаза 4: Production rollout**
   - Включить feature flag на production
   - Мониторить метрики и ошибки
   - Постепенно увеличивать процент пользователей

### Обратная совместимость

```typescript
// Feature flag для включения новой функциональности
const USE_PROMPT_CONTEXT_SERVICE =
  process.env.USE_PROMPT_CONTEXT_SERVICE === "true";

protected async createOptimizedPrompt(
  basePrompt: string,
  task: AgentTask,
  options?: PromptContextOptions
): Promise<string> {
  if (USE_PROMPT_CONTEXT_SERVICE) {
    // Новая логика с PromptContextService
    const processed = this.promptContextService.processPrompt(
      basePrompt,
      task,
      options
    );
    return processed.prompt;
  } else {
    // Старая логика (fallback)
    return this.createPromptWithHistory(basePrompt, task);
  }
}
```

## Monitoring and Observability

### Метрики для мониторинга

1. **Метрики обработки промптов**
   - Среднее время обработки промпта
   - Количество замененных плейсхолдеров
   - Частота обрезки истории

2. **Метрики качества**
   - Процент успешных обработок
   - Количество предупреждений
   - Количество ошибок

3. **Метрики использования токенов**
   - Среднее количество токенов в истории
   - Среднее количество токенов в промпте
   - Экономия токенов после оптимизации

### Логирование

```typescript
// Структурированное логирование
logger.info("Prompt processed", {
  agentName: this.name,
  taskId: task.id,
  historyMessagesCount: metadata.historyMessagesCount,
  historyTruncated: metadata.historyTruncated,
  estimatedTokens: metadata.estimatedTokens,
  processingTime: metadata.processingTime,
});
```

## Future Enhancements

1. **Умная компрессия истории**
   - Использовать AI для суммаризации длинной истории
   - Сохранять только ключевые моменты диалога

2. **Персонализация контекста**
   - Адаптировать размер истории под тип агента
   - Использовать разные стратегии форматирования для разных агентов

3. **Кэширование на уровне AI модели**
   - Использовать prompt caching от OpenAI
   - Кэшировать часто используемые части промпта

4. **Анализ релевантности истории**
   - Определять, какие сообщения из истории релевантны для текущего запроса
   - Включать только релевантные сообщения
