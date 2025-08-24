# Система контекста для AI бесед

## Обзор

Система контекста позволяет боту помнить предыдущие сообщения в беседе и учитывать их при формировании ответов. Это делает общение более естественным и контекстно-зависимым.

## Основные компоненты

### 1. Context Manager (`src/lib/context-manager.ts`)

Основной модуль для работы с контекстом беседы:

- `getConversationContext()` - получение истории беседы
- `saveMessageToConversation()` - сохранение нового сообщения
- `trimContextByTokens()` - умная обрезка контекста
- `estimateTokenCount()` - оценка количества токенов

### 2. Модифицированный процессор сообщений

В `src/router/messages/process-message.ts` добавлена поддержка контекста:

- Автоматическое получение истории беседы
- Сохранение пользовательских сообщений
- Передача контекста в AI функции
- Сохранение ответов ассистента

### 3. Обновленные AI функции

В `src/lib/ai/advisor.ts`:

- `answerQuestion()` - учитывает контекст при ответах
- `advise()` - дает советы с учетом истории

## Как это работает

### 1. Получение сообщения от пользователя

```typescript
// Автоматически получаем контекст беседы
const conversationContext = await getConversationContext(
  ctx,
  userId,
  channel,
  chatId,
  {
    maxMessages: 20,
    includeSystemMessages: false,
    maxAgeHours: 48,
  },
);
```

### 2. Умная обрезка контекста

```typescript
// Адаптивная обрезка в зависимости от типа сообщения
const maxTokens = text.includes("?") || text.length < 50 ? 2000 : 1000;
const trimmedContext = trimContextByTokens(
  conversationContext.messages,
  maxTokens,
);
```

### 3. Передача контекста в AI

```typescript
const classification = await classifyMessage(text, {
  functionId: "api-message-classifier",
  metadata: {
    // ... другие метаданные
    context: trimmedContext, // Контекст передается здесь
  },
});
```

### 4. Использование контекста в AI функциях

```typescript
// В answerQuestion()
const context = (telemetry?.metadata?.context as ContextMessage[]) || [];

let conversationHistory = "";
if (context.length > 0) {
  conversationHistory = "\n\nИстория беседы:\n";
  context.forEach((msg, index) => {
    const role = msg.role === "user" ? "Пользователь" : "Ассистент";
    conversationHistory += `${index + 1}. ${role}: ${msg.content.text}\n`;
  });
}
```

## Стратегия умной обрезки контекста

### Приоритеты сохранения сообщений:

1. **Последние 2 сообщения** - всегда сохраняются (текущий контекст)
2. **Важные сообщения**:
   - Содержащие вопросы (с "?")
   - Длинные сообщения (>100 символов)
   - С ключевыми словами: "как", "что", "где", "помоги", etc.
3. **Остальные сообщения** - заполняют оставшееся место

### Адаптивные лимиты токенов:

- **2000 токенов** - для вопросов и коротких сообщений (больше контекста)
- **1000 токенов** - для событий и длинных сообщений (меньше контекста)

## Хранение в базе данных

### Структура таблиц:

```sql
-- Беседы
conversations:
  - id (primary key)
  - owner_user_id (FK to users)
  - channel (telegram/web/mobile)
  - title (для Telegram = chatId)
  - status, created_at, updated_at, last_message_at

-- Сообщения
messages:
  - id (primary key)
  - conversation_id (FK to conversations)
  - role (user/assistant/system/tool)
  - content (JSONB с текстом)
  - model, status, parent_id, created_at
```

### Автоматическое создание бесед:

- Беседа создается автоматически при первом сообщении
- Для Telegram: `title` = `chatId`
- Для Web/Mobile: `title` = `{channel}_conversation`

## Конфигурация

### Настройки контекста:

```typescript
interface ContextOptions {
  maxMessages?: number; // Макс. сообщений (по умолчанию: 10)
  includeSystemMessages?: boolean; // Включать системные (по умолчанию: false)
  maxAgeHours?: number; // Макс. возраст в часах (по умолчанию: 24)
}
```

### Лимиты токенов:

- Оценка: ~4 символа = 1 токен (для русского текста)
- Overhead: ~50 символов на сообщение для метаданных
- Максимум: 2000 токенов для вопросов, 1000 для событий

## Тестирование

Запустите тестовый скрипт:

```bash
bun run packages/api/src/scripts/test-context.ts
```

Тест проверяет:

- Подсчет токенов
- Обрезку контекста
- Приоритет важных сообщений
- Форматирование для AI

## Логирование

Система выводит полезную информацию в консоль:

```
📚 Контекст беседы: 5 сообщений (ID: conv_123...)
🚀 Using unified message classification with context
⏱️ Classification took 150ms
```

## Производительность

### Оптимизации:

1. **Ленивая загрузка** - контекст загружается только при необходимости
2. **Умная обрезка** - сохраняет только важные сообщения
3. **Адаптивные лимиты** - разные лимиты для разных типов сообщений
4. **Кэширование** - переиспользование подключений к БД

### Метрики:

- **Время получения контекста**: ~20-50ms
- **Время обрезки**: ~1-5ms
- **Overhead токенов**: ~10-15% от лимита

## Будущие улучшения

1. **Семантическое сжатие** - сжатие старых сообщений в краткое резюме
2. **Важность по времени** - учет времени при определении важности
3. **Пользовательские настройки** - настройка лимитов для разных пользователей
4. **Кэширование контекста** - Redis кэш для часто используемых бесед
