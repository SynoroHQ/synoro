# Исправление переменных контекста в промптах

## Проблема

Переменные контекста (`{{userId}}`, `{{householdId}}`, `{{currentTime}}`, `{{timezone}}`, `{{eventContext}}`, `{{messageHistory}}`) не заменялись в промптах агентов по следующим причинам:

1. **Отсутствовал `timezone`** в контексте задачи при создании `AgentTask`
2. **Не обрабатывался `{{eventContext}}`** в `PromptContextService`
3. **Агенты не использовали `PromptContextService`** - они напрямую вызывали `getPrompt()` из Langfuse с ограниченным набором переменных
4. **Langfuse `compile()` заменял переменные ДО обработки** в `PromptContextService`, что делало сервис бесполезным
5. **`USE_PROMPT_CONTEXT_SERVICE` не был включен** в `.env`

## Внесенные изменения

### 1. Добавлен `timezone` в контекст задачи

**Файл:** `packages/api/src/router/messages/process-message-agents.ts`

```typescript
context: {
  userId,
  channel,
  messageId,
  householdId: metadata?.householdId,
  timezone: metadata?.timezone || "Europe/Moscow", // ✅ Добавлено
  db: ctx.db,
  conversationId: metadata?.conversationId,
  ...metadata,
}
```

### 2. Добавлена обработка `{{eventContext}}`

**Файл:** `packages/api/src/lib/services/prompt-context-service.ts`

Добавлена замена плейсхолдера `{{eventContext}}`:

```typescript
// Заменяем eventContext
if (processedPrompt.includes("{{eventContext}}")) {
  const eventContext =
    context.eventContext ?? "События пользователя не загружены";
  processedPrompt = processedPrompt.replace(
    /\{\{eventContext\}\}/g,
    eventContext,
  );
  replaced.push("eventContext");
}
```

Добавлено значение по умолчанию:

```typescript
const DEFAULT_VALUES = {
  userId: "anonymous",
  householdId: "none",
  currentTime: () => new Date().toISOString(),
  timezone: "UTC",
  messageHistory: "История диалога пуста",
  eventContext: "События пользователя не загружены", // ✅ Добавлено
};
```

### 3. Обновлен `getPrompt` для поддержки `PromptContextService`

**Файл:** `packages/prompts/src/prompt-service.ts`

Теперь `getPrompt` НЕ использует Langfuse `compile()`, если `USE_PROMPT_CONTEXT_SERVICE=true`:

```typescript
// Если USE_PROMPT_CONTEXT_SERVICE включен, НЕ используем compile
// Вместо этого возвращаем промпт с плейсхолдерами для обработки в PromptContextService
const usePromptContextService =
  process.env.USE_PROMPT_CONTEXT_SERVICE === "true";

if (
  variables &&
  Object.keys(variables).length > 0 &&
  !usePromptContextService
) {
  const compiled = cloudPrompt.compile(variables);
  return compiled;
}
// Иначе возвращаем промпт с плейсхолдерами
if ("prompt" in cloudPrompt) {
  return cloudPrompt.prompt;
}
```

### 4. Обновлены все агенты для использования `PromptContextService`

**Файлы:**

- `packages/api/src/lib/agents/general-assistant-agent.ts`
- `packages/api/src/lib/agents/event-processor-agent.ts`
- `packages/api/src/lib/agents/event-analyzer-agent.ts`

Теперь агенты:

1. Получают промпт из Langfuse БЕЗ переменных
2. Обрабатывают промпт через `PromptContextService.processPrompt()`
3. Используют обработанный промпт с замененными переменными

Пример:

```typescript
// Получаем промпт из Langfuse (без переменных)
const basePrompt = await getPrompt(
  PROMPT_KEYS.GENERAL_ASSISTANT_AGENT,
  "latest",
);

// Обрабатываем через PromptContextService
const processed = this.promptContextService.processPrompt(basePrompt, task, {
  maxHistoryLength: 1500,
  maxHistoryMessages: 10,
  includeSystemMessages: false,
  maxHistoryTokens: 500,
});

// Используем обработанный промпт
const { text } = await generateText({
  model: this.getModel(),
  system: processed.prompt,
  prompt: task.input,
});
```

### 5. Добавлены переменные окружения

**Файлы:** `.env`, `.env.example`

```bash
# Prompt Context Service
USE_PROMPT_CONTEXT_SERVICE="true"
DEBUG_PROMPTS="true"
```

## Поддерживаемые переменные

Теперь `PromptContextService` корректно обрабатывает все переменные:

- `{{userId}}` - ID пользователя (по умолчанию: "anonymous")
- `{{householdId}}` - ID домохозяйства (по умолчанию: "none")
- `{{currentTime}}` - Текущее время в ISO формате
- `{{timezone}}` - Часовой пояс (по умолчанию: "UTC")
- `{{messageHistory}}` - История сообщений (по умолчанию: "История диалога пуста")
- `{{eventContext}}` - Контекст событий пользователя (по умолчанию: "События пользователя не загружены")

## Использование

### В промптах

```typescript
const prompt = `
КОНТЕКСТ:
- Пользователь: {{userId}}
- Домашнее хозяйство: {{householdId}}
- Время запроса: {{currentTime}}
- Часовой пояс: {{timezone}}

ИСТОРИЯ ДИАЛОГА:
{{messageHistory}}

СОБЫТИЯ ПОЛЬЗОВАТЕЛЯ:
{{eventContext}}
`;
```

### При создании задачи

```typescript
const task: AgentTask = {
  id: "task-123",
  type: "general",
  input: "Пользовательский запрос",
  context: {
    userId: "user-123",
    householdId: "household-456",
    timezone: "Europe/Moscow",
    eventContext: "Последние события: ...",
  },
  priority: 1,
  createdAt: new Date(),
  messageHistory: [...],
};
```

## Логирование

При отсутствии переменных в контексте выводятся предупреждения:

```
userId not found in context, using default value
timezone not found in context, using default value
householdId not found in context, using default value
```

Для отладки можно включить `DEBUG_PROMPTS=true` в `.env`.

## Тестирование

Все переменные успешно заменяются:

- ✅ С полным контекстом - все переменные заменяются на реальные значения
- ✅ С пустым контекстом - используются значения по умолчанию
- ✅ Логирование предупреждений работает корректно
