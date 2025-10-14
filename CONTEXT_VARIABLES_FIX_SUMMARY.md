# Исправление переменных контекста - Краткая сводка

## Что было исправлено

### Проблема

Переменные контекста (`{{userId}}`, `{{householdId}}`, `{{currentTime}}`, `{{timezone}}`, `{{messageHistory}}`, `{{eventContext}}`) не заменялись в промптах агентов.

### Причины

1. Агенты использовали Langfuse `compile()` с ограниченным набором переменных
2. `PromptContextService` не использовался (не был включен `USE_PROMPT_CONTEXT_SERVICE`)
3. Отсутствовал `timezone` в контексте задачи
4. Не обрабатывался `{{eventContext}}`

### Решение

#### 1. Включен `PromptContextService`

```bash
# .env
USE_PROMPT_CONTEXT_SERVICE="true"
DEBUG_PROMPTS="true"
```

#### 2. Обновлен `getPrompt()`

Теперь возвращает промпт с плейсхолдерами (без замены через Langfuse `compile()`), если `USE_PROMPT_CONTEXT_SERVICE=true`.

#### 3. Обновлены все агенты

- `general-assistant-agent.ts`
- `event-processor-agent.ts`
- `event-analyzer-agent.ts`

Теперь используют `PromptContextService.processPrompt()` для замены всех переменных.

#### 4. Добавлен `timezone` в контекст

```typescript
context: {
  userId,
  channel,
  messageId,
  householdId: metadata?.householdId,
  timezone: metadata?.timezone || "Europe/Moscow", // ✅
  db: ctx.db,
  conversationId: metadata?.conversationId,
  ...metadata,
}
```

#### 5. Добавлена обработка `{{eventContext}}`

```typescript
// В PromptContextService
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

## Результат

✅ Все переменные контекста теперь корректно заменяются:

- `{{userId}}` → ID пользователя или "anonymous"
- `{{householdId}}` → ID домохозяйства или "none"
- `{{currentTime}}` → Текущее время в ISO формате
- `{{timezone}}` → Часовой пояс или "UTC"
- `{{messageHistory}}` → Форматированная история сообщений
- `{{eventContext}}` → Контекст событий пользователя

✅ История диалога передается и форматируется корректно

✅ Логирование работает (при `DEBUG_PROMPTS=true`)

## Тестирование

Для проверки:

1. Убедитесь, что `USE_PROMPT_CONTEXT_SERVICE="true"` в `.env`
2. Включите `DEBUG_PROMPTS="true"` для просмотра метаданных
3. Отправьте сообщение через Telegram бота
4. Проверьте логи - должны быть видны замененные плейсхолдеры

Пример лога:

```
GeneralAssistantAgent prompt metadata: {
  placeholdersReplaced: ["messageHistory", "userId", "currentTime", "timezone", "householdId", "eventContext"],
  historyMessagesCount: 2,
  historyTruncated: false,
  estimatedTokens: 85
}
```

## Файлы изменены

1. `.env` - добавлены переменные
2. `.env.example` - добавлены переменные
3. `packages/prompts/src/prompt-service.ts` - обновлен `getPrompt()`
4. `packages/api/src/lib/services/prompt-context-service.ts` - добавлена обработка `{{eventContext}}`
5. `packages/api/src/router/messages/process-message-agents.ts` - добавлен `timezone`
6. `packages/api/src/lib/agents/general-assistant-agent.ts` - использует `PromptContextService`
7. `packages/api/src/lib/agents/event-processor-agent.ts` - использует `PromptContextService`
8. `packages/api/src/lib/agents/event-analyzer-agent.ts` - использует `PromptContextService`
