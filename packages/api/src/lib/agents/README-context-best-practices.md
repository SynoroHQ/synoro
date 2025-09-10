# 🎯 Best Practices для передачи контекста между агентами

## 📋 Обзор

Данный документ описывает оптимизированную систему передачи контекста между агентами в Synoro AI, основанную на best practices для работы с LLM.

## ❌ Проблемы старого подхода

### Что НЕ нужно делать:

- ❌ **Передавать "сырой чат целиком"** - это неэффективно и дорого
- ❌ **Смешивать инструкции с контекстом** - агент не понимает свою роль
- ❌ **Передавать всю историю без фильтрации** - много шума, мало сигнала
- ❌ **Использовать неструктурированный текст** - сложно парсить и понимать

## ✅ Новый подход (Best Practices)

### Структурированная передача контекста:

1. **🔹 Инструкция (роль агента)**
   - Четкое определение роли и ответственности
   - Описание возможностей агента
   - Правила поведения

2. **🔹 Краткий контекст (суммарно или извлечённо)**
   - Тема разговора
   - Намерение пользователя
   - Ключевая информация
   - Настроение диалога

3. **🔹 Последние шаги (несколько сообщений)**
   - Только релевантные сообщения
   - Структурированный формат
   - Временные метки

4. **🔹 Конкретная задача**
   - Четкое описание текущего запроса
   - Ожидаемый результат
   - Приоритет выполнения

## 🏗️ Архитектура

### Основные компоненты:

```typescript
interface StructuredAgentContext {
  instruction: string; // Роль агента
  contextSummary: {
    // Краткий контекст
    conversationTopic: string;
    userIntent: string;
    keyInformation: string[];
    conversationMood: "positive" | "neutral" | "negative";
  };
  recentSteps: {
    // Последние шаги
    userMessage: string;
    assistantResponse?: string;
    timestamp: Date;
    stepType: string;
  }[];
  currentTask: {
    // Конкретная задача
    input: string;
    type: string;
    priority: number;
    expectedOutput: string;
  };
  metadata: {
    // Метаданные
    conversationId?: string;
    userId?: string;
    channel?: string;
    contextVersion: string;
    compressedFrom: number;
  };
}
```

### Менеджер контекста:

```typescript
class AgentContextManager {
  // Создает структурированный контекст
  async createStructuredContext(
    task,
    agentName,
    agentDescription,
  ): Promise<StructuredAgentContext>;

  // Форматирует для промпта
  formatContextForPrompt(context): string;

  // Создает сжатую версию
  createCompressedContext(context, maxLength): string;
}
```

## 🚀 Использование

### В базовом классе агента:

```typescript
export class MyAgent extends AbstractAgent {
  async process(task: AgentTask): Promise<AgentResult<string>> {
    // Используем новую систему контекста
    const systemPrompt = await this.createOptimizedPrompt(basePrompt, task, {
      useStructuredContext: true,
      maxContextLength: 1000, // Настраиваем под агента
    });

    const response = await this.generateResponse(
      task.input,
      systemPrompt,
      task,
      {
        useStructuredContext: true,
        maxContextLength: 1000,
      },
    );

    return this.createSuccessResult(response);
  }
}
```

### Для разных типов агентов:

```typescript
// Роутер (ограниченный контекст)
const routerPrompt = await this.createOptimizedPrompt(basePrompt, task, {
  useStructuredContext: true,
  maxContextLength: 400, // Мало контекста
});

// Специализированный агент (больше контекста)
const specialistPrompt = await this.createOptimizedPrompt(basePrompt, task, {
  useStructuredContext: true,
  maxContextLength: 1200, // Больше контекста
});

// Агент с ограниченным контекстом (сжатая версия)
const compressedPrompt = contextManager.createCompressedContext(
  structuredContext,
  300, // Очень мало места
);
```

## 📊 Преимущества

### Экономия ресурсов:

- **70% меньше токенов** - передаем только нужную информацию
- **Быстрее обработка** - агенты получают структурированные данные
- **Меньше ошибок** - четкое разделение роли и контекста

### Качество ответов:

- **Более точные ответы** - агенты лучше понимают контекст
- **Консистентность** - единый формат для всех агентов
- **Релевантность** - только важная информация

### Разработка и отладка:

- **Легче отлаживать** - структурированные данные
- **Проще тестировать** - предсказуемый формат
- **Масштабируемость** - легко добавлять новых агентов

## 🔧 Настройка

### Параметры контекста:

```typescript
const contextOptions = {
  useStructuredContext: true, // Использовать новую систему
  maxContextLength: 1000, // Максимальная длина контекста
  includeFullHistory: false, // Включать полную историю (legacy)
};
```

### Адаптация под агентов:

```typescript
// Для роутера - минимум контекста
const routerOptions = {
  useStructuredContext: true,
  maxContextLength: 400,
};

// Для оркестратора - максимум контекста
const orchestratorOptions = {
  useStructuredContext: true,
  maxContextLength: 1500,
};

// Для чат-агента - средний контекст
const chatOptions = {
  useStructuredContext: true,
  maxContextLength: 600,
};
```

## 📈 Метрики

### Отслеживаемые показатели:

```typescript
interface ContextMetrics {
  originalMessageCount: number; // Исходное количество сообщений
  compressedMessageCount: number; // Сжатое количество
  contextLength: number; // Длина контекста в символах
  compressionRatio: number; // Коэффициент сжатия
  processingTime: number; // Время обработки
  agentType: string; // Тип агента
}
```

### Пример метрик:

```typescript
// До оптимизации
{
  originalMessageCount: 20,
  contextLength: 5000,
  compressionRatio: 1.0,
  processingTime: 2000,
}

// После оптимизации
{
  originalMessageCount: 20,
  compressedMessageCount: 3,
  contextLength: 1200,
  compressionRatio: 0.24, // 76% экономии
  processingTime: 800,    // 60% быстрее
}
```

## 🔄 Миграция

### Поэтапное внедрение:

1. **Этап 1**: Создание новой системы контекста
2. **Этап 2**: Обновление базового класса агента
3. **Этап 3**: Миграция существующих агентов
4. **Этап 4**: Удаление legacy кода

### Обратная совместимость:

```typescript
// Старый метод (legacy)
const legacyPrompt = this.createPromptWithHistory(basePrompt, task, {
  includeSummary: true,
});

// Новый метод (рекомендуемый)
const optimizedPrompt = await this.createOptimizedPrompt(basePrompt, task, {
  useStructuredContext: true,
});
```

## 🧪 Тестирование

### Примеры тестов:

```typescript
describe("AgentContextManager", () => {
  it("should create structured context from message history", async () => {
    const context = await contextManager.createStructuredContext(
      task,
      "Test Agent",
      "Test description",
    );

    expect(context.instruction).toContain("Test Agent");
    expect(context.contextSummary).toBeDefined();
    expect(context.recentSteps).toHaveLength(3);
    expect(context.currentTask.input).toBe(task.input);
  });

  it("should compress context for limited agents", () => {
    const compressed = contextManager.createCompressedContext(
      structuredContext,
      300,
    );

    expect(compressed.length).toBeLessThanOrEqual(300);
    expect(compressed).toContain("Test Agent");
  });
});
```

## 📚 Дополнительные ресурсы

- [Примеры использования](./examples/context-usage-example.ts)
- [API документация](./context-manager.ts)
- [Миграционный гайд](./migration-guide.md)
- [Метрики и мониторинг](./metrics.md)

---

**Помните**: Никогда не давайте LLM "сырой чат целиком". Всегда структурируйте контекст согласно best practices!
