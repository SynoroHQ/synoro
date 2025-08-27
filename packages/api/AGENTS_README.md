# Мультиагентная система Synoro AI

## Обзор

Мультиагентная система Synoro AI - это интеллектуальная архитектура обработки сообщений, основанная на принципах [Vercel AI SDK](https://ai-sdk.dev/docs/foundations/agents). Система использует специализированных агентов для разных типов задач и автоматически выбирает оптимальный подход для каждого запроса пользователя.

## Архитектура

### Основные компоненты

1. **Router Agent** - Классифицирует сообщения и направляет к подходящим агентам
2. **Q&A Specialist Agent** - Отвечает на вопросы о системе и предоставляет информацию
3. **Event Processor Agent** - Обрабатывает события (покупки, задачи, встречи)
4. **Task Orchestrator Agent** - Координирует сложные многоэтапные задачи
5. **Quality Evaluator Agent** - Оценивает и улучшает качество ответов

### Паттерны обработки

Система реализует следующие паттерны из AI SDK:

- **Sequential Processing** - Последовательная обработка этапов
- **Parallel Processing** - Параллельная обработка независимых задач
- **Routing** - Интеллектуальная маршрутизация запросов
- **Evaluation-Optimization Loops** - Циклы оценки и улучшения качества
- **Multi-Step Tool Usage** - Использование инструментов в несколько шагов

## Использование

### Включение агентной системы

```env
# В .env файле Telegram бота
TG_USE_AGENT_SYSTEM=true
TG_AGENT_AUTO_MODE=true
```

### API эндпоинты

```typescript
// Обработка с агентами для веб/мобильных клиентов
await api.messages.processMessageAgents.processMessageWithAgents.mutate({
  text: "Проанализируй мои расходы",
  channel: "web",
  agentOptions: {
    useQualityControl: true,
    targetQuality: 0.8,
  },
});

// Обработка для Telegram
await api.messages.processMessageAgents.processMessageFromTelegramWithAgents.mutate(
  {
    text: "Купил хлеб за 45 рублей",
    channel: "telegram",
    chatId: "123",
    telegramUserId: "456",
  },
);

// Статистика агентов
const stats = await api.messages.processMessageAgents.getAgentStats.query();
```

### Telegram команды

- `/agents` - Информация о мультиагентной системе
- `/agent_test` - Тестирование агентной обработки

## Автоматический выбор режима

Система автоматически переключается в агентный режим для:

- Длинных сообщений (>100 символов)
- Сложных ключевых слов (анализ, планирование, оптимизация)
- Множественных вопросов
- Финансовых запросов с анализом
- Запросов с несколькими действиями

## Агенты

### Router Agent

**Возможности:**

- Классификация типа сообщения
- Выбор подходящего агента
- Определение сложности задачи

**Поддерживаемые типы:**

- `question` - Вопросы
- `event` - События для логирования
- `chat` - Обычное общение
- `complex_task` - Сложные задачи
- `irrelevant` - Спам/бессмысленные сообщения

### Telegram Formatter Agent

**Возможности:**

- Автоматическое форматирование всех ответов для Telegram
- Использование Markdown разметки и эмодзи
- Улучшение читабельности контента
- Структурирование информации

**Автоматическое участие:**

`TelegramFormatterAgent` теперь **всегда участвует** в процессе обработки сообщений для Telegram:

1. **Автоматическое форматирование**: После получения ответа от основного агента, `TelegramFormatterAgent` автоматически форматирует ответ для Telegram
2. **Интеграция в процесс**: Агент вызывается в конце процесса обработки в `AgentManager.processMessage()`
3. **Улучшение качества**: Добавляет эмодзи, структуру и Markdown разметку для лучшего восприятия

**Пример работы:**

```typescript
// В AgentManager.processMessage() автоматически вызывается:
if (context.channel === "telegram" && finalResponse) {
  const telegramFormatter = this.getAgent("telegram-formatter");
  if (telegramFormatter) {
    const formattingTask = this.createAgentTask(
      finalResponse,
      "telegram-formatting",
      context,
      1,
    );

    const formattingResult = await telegramFormatter.process(
      formattingTask,
      telemetry,
    );
    if (formattingResult.success && formattingResult.data) {
      result.finalResponse = formattingResult.data; // Отформатированный ответ
      agentsUsed.push(telegramFormatter.name);
    }
  }
}
```

**Результат:**

- Все ответы для Telegram автоматически форматируются
- Улучшенная читабельность с эмодзи и структурой
- Консистентный стиль оформления
- Агент всегда участвует в процессе (не может быть пропущен)

### Q&A Specialist Agent

**Возможности:**

- Ответы о функциях бота
- Помощь в использовании системы
- Общие знания с контекстом Synoro

**Инструменты:**

- Поиск информации о системе
- Контекстные ответы

### Event Processor Agent

**Возможности:**

- Парсинг покупок с суммами
- Извлечение задач и встреч
- Автоматическая категоризация
- Контекстные советы

**Инструменты:**

- Категоризация событий
- Извлечение финансовой информации

### Task Orchestrator Agent

**Возможности:**

- Планирование сложных задач
- Координация других агентов
- Параллельная обработка
- Адаптивное планирование

**Инструменты:**

- Планировщик задач
- Оценщик качества

### Quality Evaluator Agent

**Возможности:**

- Оценка по критериям (точность, релевантность, полнота)
- Генерация улучшенных версий
- Итеративное улучшение

**Метрики качества:**

- Accuracy (точность)
- Relevance (релевантность)
- Completeness (полнота)
- Clarity (ясность)
- Helpfulness (полезность)

## Конфигурация

### Опции агентной обработки

```typescript
interface AgentOptions {
  forceAgentMode?: boolean; // Принудительный агентный режим
  useQualityControl?: boolean; // Контроль качества (по умолчанию true)
  maxQualityIterations?: number; // Макс. итераций улучшения (по умолчанию 2)
  targetQuality?: number; // Целевое качество 0-1 (по умолчанию 0.8)
}
```

### Переменные окружения

```env
# Telegram бот
TG_USE_AGENT_SYSTEM=true           # Включить агентную систему
TG_AGENT_AUTO_MODE=true            # Автоматический выбор режима

# API (наследует от существующих)
AI_PROVIDER=openai                 # Провайдер AI (openai/moonshot)
OPENAI_API_KEY=your_key           # OpenAI API ключ
OPENAI_ADVICE_MODEL=gpt-5-nano   # Модель для советов
```

## Мониторинг и отладка

### Логирование

```
🤖 [AGENTS] Контекст беседы: 3 сообщения (ID: conv-123)
🔍 [AGENTS] Классификация сообщения с контекстом...
⏱️ [AGENTS] Классификация: 150ms → question (0.92)
🚀 [AGENTS] Обработка агентами: 800ms (режим: agents)
🤖 [AGENTS] Использованы агенты: Router Agent → Q&A Specialist → Quality Evaluator
📊 [AGENTS] Качество: 0.89, шагов: 3
✅ [AGENTS] Сообщение обработано: режим=agents, агенты=Router Agent→Q&A Specialist, качество=0.89
```

### Метрики в ответе

```typescript
interface AgentMetadata {
  agentsUsed: string[]; // Список использованных агентов
  totalSteps: number; // Общее количество шагов
  qualityScore: number; // Оценка качества (0-1)
  processingTime: number; // Время обработки в мс
  processingMode: "agents" | "legacy"; // Режим обработки
}
```

## Тестирование

### Запуск тестов

```bash
# Из директории packages/api
bun run src/scripts/test-agents.ts
```

### Тестовые сценарии

```typescript
const testMessages = [
  "Что ты умеешь?", // Q&A Agent
  "Купил хлеб за 45 рублей", // Event Processor
  "Привет! Как дела?", // Chat Assistant
  "Проанализируй расходы и дай рекомендации", // Task Orchestrator
  "Сколько я потратил на продукты?", // Data Analysis
];
```

## Производительность

### Автоматическая оптимизация

- Простые сообщения обрабатываются legacy системой (быстрее)
- Сложные сообщения направляются к агентам (выше качество)
- Кэширование результатов классификации
- Параллельная обработка независимых задач

### Таймауты и лимиты

- Максимум 5 итераций улучшения качества
- Таймаут обработки: 30 секунд
- Автоматический fallback к legacy режиму при ошибках

## Расширение системы

### Добавление нового агента

1. Создайте класс, наследующий `AbstractAgent`
2. Реализуйте методы `canHandle()` и `process()`
3. Добавьте агента в `AgentManager`
4. Обновите `RouterAgent` для поддержки нового типа

### Пример нового агента

```typescript
export class CustomAgent extends AbstractAgent {
  name = "Custom Agent";
  description = "Описание агента";
  capabilities = [
    {
      name: "Custom Capability",
      description: "Описание возможности",
      category: "custom",
      confidence: 0.9,
    },
  ];

  async canHandle(task: AgentTask): Promise<boolean> {
    return task.type === "custom";
  }

  async process(
    task: AgentTask,
    telemetry?: AgentTelemetry,
  ): Promise<AgentResult> {
    // Логика обработки
    return this.createSuccessResult("Результат", 0.9);
  }
}
```

## Миграция

### Переход с legacy системы

1. Включите агентную систему в настройках
2. Протестируйте на небольшой группе пользователей
3. Мониторьте качество и производительность
4. Постепенно расширяйте использование

### Гибридный режим

Система поддерживает гибридный режим, автоматически выбирая:

- Legacy систему для простых случаев
- Агентную систему для сложных задач

Это обеспечивает оптимальный баланс производительности и качества.
