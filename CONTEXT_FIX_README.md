# 📚 Документация: Исправление переменных контекста

## 🎯 Обзор

Этот набор документов описывает исправление проблемы с переменными контекста в промптах агентов системы Synoro AI.

**Проблема:** Переменные `{{userId}}`, `{{householdId}}`, `{{currentTime}}`, `{{timezone}}`, `{{messageHistory}}`, `{{eventContext}}` не заменялись в промптах.

**Решение:** Внедрен `PromptContextService` для централизованной обработки всех переменных контекста.

## 📖 Документы

### 🚀 Для быстрого старта

- **[QUICK_START_CONTEXT_FIX.md](QUICK_START_CONTEXT_FIX.md)** - начните здесь! Быстрая проверка за 5 минут

### 📋 Для понимания изменений

- **[CONTEXT_VARIABLES_FIX_SUMMARY.md](CONTEXT_VARIABLES_FIX_SUMMARY.md)** - краткая сводка изменений
- **[CHANGES_SUMMARY.md](CHANGES_SUMMARY.md)** - полный список измененных файлов

### 🔍 Для детального изучения

- **[PROMPT_CONTEXT_FIX.md](PROMPT_CONTEXT_FIX.md)** - подробное техническое описание

### ✅ Для проверки

- **[VERIFICATION_CHECKLIST.md](VERIFICATION_CHECKLIST.md)** - чеклист проверки в продакшене

## 🎬 Быстрый старт

### 1. Проверьте `.env`

```bash
USE_PROMPT_CONTEXT_SERVICE="true"
DEBUG_PROMPTS="true"
```

### 2. Перезапустите приложение

```bash
bun run dev
```

### 3. Проверьте работу

Отправьте боту в Telegram:

- "Привет!"
- "Потратил 1500₽ на продукты"
- "Покажи мои траты"

### 4. Проверьте логи

Должны быть записи:

```
Prompt processing completed: {
  placeholdersReplaced: ["messageHistory", "userId", ...],
  historyMessagesCount: 2,
  ...
}
```

## 🔧 Что было изменено

### Основные изменения

1. ✅ Добавлен `timezone` в контекст задачи
2. ✅ Добавлена обработка `{{eventContext}}`
3. ✅ Обновлен `getPrompt()` для поддержки `PromptContextService`
4. ✅ Все агенты используют `PromptContextService`
5. ✅ Добавлены переменные окружения

### Измененные файлы

- `.env` и `.env.example`
- `packages/api/src/lib/services/prompt-context-service.ts`
- `packages/prompts/src/prompt-service.ts`
- `packages/api/src/router/messages/process-message-agents.ts`
- `packages/api/src/lib/agents/general-assistant-agent.ts`
- `packages/api/src/lib/agents/event-processor-agent.ts`
- `packages/api/src/lib/agents/event-analyzer-agent.ts`

## 📊 Результаты

### До

❌ Переменные не заменялись  
❌ История не передавалась  
❌ Контекст событий отсутствовал

### После

✅ Все переменные заменяются  
✅ История работает  
✅ Контекст событий доступен  
✅ Логирование работает

## 🎯 Поддерживаемые переменные

| Переменная           | Описание         | По умолчанию                        |
| -------------------- | ---------------- | ----------------------------------- |
| `{{userId}}`         | ID пользователя  | "anonymous"                         |
| `{{householdId}}`    | ID домохозяйства | "none"                              |
| `{{currentTime}}`    | Текущее время    | ISO timestamp                       |
| `{{timezone}}`       | Часовой пояс     | "UTC"                               |
| `{{messageHistory}}` | История диалога  | "История диалога пуста"             |
| `{{eventContext}}`   | Контекст событий | "События пользователя не загружены" |

## 🔍 Отладка

### Включить отладочные логи

```bash
# В .env
DEBUG_PROMPTS="true"
```

### Проверить логи

```bash
# Ищите строки:
# - "Prompt processing completed"
# - "placeholdersReplaced"
# - "historyMessagesCount"
```

### Проверить Langfuse

1. Откройте Langfuse Dashboard
2. Найдите последние трейсы
3. Убедитесь, что промпты не содержат `{{...}}`

## ⚠️ Важно

1. **Обязательно установите** `USE_PROMPT_CONTEXT_SERVICE="true"`
2. **Перезапустите приложение** после изменения `.env`
3. **Мониторьте логи** первые 24 часа после развертывания
4. **Проверьте Langfuse** на наличие ошибок

## 🆘 Проблемы?

### Плейсхолдеры не заменяются

→ Проверьте `USE_PROMPT_CONTEXT_SERVICE="true"` в `.env`

### История пустая

→ Проверьте, что `conversationId` передается в контексте

### Timezone не работает

→ Проверьте, что `metadata.timezone` передается при создании задачи

### Ошибки в логах

→ Проверьте `VERIFICATION_CHECKLIST.md` для диагностики

## 📞 Поддержка

1. Изучите документацию в этой папке
2. Проверьте чеклист `VERIFICATION_CHECKLIST.md`
3. Включите `DEBUG_PROMPTS=true` для детальных логов
4. Обратитесь к команде разработки

## 🎉 Готово!

Теперь все переменные контекста работают корректно. Агенты имеют полный доступ к:

- ✅ Истории диалога
- ✅ Контексту событий
- ✅ Информации о пользователе
- ✅ Временным данным

---

**Версия:** 1.0.0  
**Дата:** 14 октября 2025  
**Статус:** ✅ Готово к использованию
