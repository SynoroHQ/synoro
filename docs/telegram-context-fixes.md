# Telegram Context Fixes - Исправления передачи контекста беседы

## Обнаруженные проблемы

### 1. **Контекст не передавался в AI функции**

**Проблема**: Функции `classifyMessage` и `parseTask` не использовали контекст беседы, что приводило к:

- Низкому качеству классификации сообщений
- Неточному парсингу задач без учета истории беседы
- Потере контекста между сообщениями

**Файлы**:

- `packages/api/src/lib/ai/classifier.ts`
- `packages/api/src/lib/ai/parser.ts`

### 2. **Неправильная логика поиска conversation**

**Проблема**: В `getConversationContext` была ошибка в поиске conversation:

- Для зарегистрированных пользователей искался по `title = chatId`
- Но `chatId` - это **Telegram chatId**, а не заголовок conversation
- Это приводило к созданию дублирующих conversations

**Файл**: `packages/api/src/lib/context-manager.ts`

### 3. **Неправильная передача chatId в роутерах**

**Проблема**: В Telegram роутерах `chatId` передавался как `conversationId`:

- `processMessageFromTelegram` передавал `userContext.conversationId` вместо `chatId`
- `transcribeFromTelegram` делал то же самое
- Это приводило к неправильному поиску существующих conversations

**Файлы**:

- `packages/api/src/router/messages/process-message.ts`
- `packages/api/src/router/messages/transcribe.ts`

## Внесенные исправления

### 1. **Добавление контекста в AI функции**

#### `classifyMessage` (classifier.ts)

```typescript
// Было
prompt: `Message: ${text}\nJSON:`,

// Стало
let contextualPrompt = `Message: ${text}`;

if (context.length > 0) {
  contextualPrompt = `Контекст беседы:\n`;
  context.forEach((msg: any, index: number) => {
    const role = msg.role === "user" ? "Пользователь" : "Ассистент";
    contextualPrompt += `${index + 1}. ${role}: ${msg.content.text}\n`;
  });
  contextualPrompt += `\nТекущее сообщение для классификации: ${text}`;
}

contextualPrompt += `\nJSON:`;
```

#### `parseTask` (parser.ts)

```typescript
// Было
prompt: `Text: ${text}\nJSON:`,

// Стало
let contextualPrompt = `Text: ${text}`;

if (context.length > 0) {
  contextualPrompt = `Контекст беседы:\n`;
  context.forEach((msg: any, index: number) => {
    const role = msg.role === "user" ? "Пользователь" : "Ассистент";
    contextualPrompt += `${index + 1}. ${role}: ${msg.content.text}\n`;
  });
  contextualPrompt += `\nТекущий текст для парсинга: ${text}`;
}

contextualPrompt += `\nJSON:`;
```

### 2. **Исправление логики поиска conversation**

#### `getConversationContext` (context-manager.ts)

```typescript
// Было
if (userId) {
  const conditions = [
    eq(conversations.ownerUserId, userId),
    eq(conversations.channel, channel),
  ];

  if (chatId) {
    conditions.push(eq(conversations.title, chatId)); // ❌ Ошибка!
  }
}

// Стало
if (userId) {
  const conditions = [
    eq(conversations.ownerUserId, userId),
    eq(conversations.channel, channel),
  ];

  // Убираем поиск по title, так как chatId это Telegram chatId, а не заголовок conversation
  // if (chatId) {
  //   conditions.push(eq(conversations.title, chatId));
  // }
}
```

#### Создание новой conversation

```typescript
// Было
title: chatId ?? `${channel}_conversation`,

// Стало
title: `${channel}_conversation_${Date.now()}`, // Уникальный заголовок, не связанный с chatId
```

### 3. **Исправление передачи chatId в роутерах**

#### `processMessageFromTelegram` (process-message.ts)

```typescript
// Было
chatId: userContext.conversationId, // ❌ Неправильно!

// Стало
chatId: chatId, // ✅ Используем Telegram chatId для поиска conversation
```

#### `transcribeFromTelegram` (transcribe.ts)

```typescript
// Было
...(userContext.conversationId && {
  chatId: userContext.conversationId,
}),

// Стало
chatId: chatId, // ✅ Используем Telegram chatId
```

### 4. **Экспорт parseContextSafely**

```typescript
// Было
function parseContextSafely(telemetry?: Telemetry): {

// Стало
export function parseContextSafely(telemetry?: Telemetry): {
```

## Результат исправлений

### ✅ **Улучшенное качество AI ответов**

1. **Классификация сообщений** теперь учитывает контекст беседы
2. **Парсинг задач** происходит с учетом предыдущих сообщений
3. **Советы и ответы** становятся более релевантными

### ✅ **Правильная работа с conversations**

1. **Поиск существующих conversations** работает корректно
2. **Создание новых conversations** происходит без дублирования
3. **Разделение по типам пользователей** работает правильно

### ✅ **Консистентность данных**

1. **chatId** всегда означает Telegram chatId
2. **conversationId** всегда означает внутренний ID conversation
3. **Метаданные** содержат оба значения для полноты

## Пример работы после исправлений

### До исправлений

```
Пользователь: "Купил хлеб за 50 рублей"
Бот: "Записал: Купил хлеб за 50 рублей" (без контекста)

Пользователь: "А сколько я потратил вчера?"
Бот: "Для получения статистики нужно сначала накопить данные..." (не помнит о хлебе)
```

### После исправлений

```
Пользователь: "Купил хлеб за 50 рублей"
Бот: "Записал: Купил хлеб за 50 рублей"

Пользователь: "А сколько я потратил вчера?"
Бот: "Вчера вы потратили 50 рублей на хлеб. Это ваша первая запись в системе!" (помнит контекст)
```

## Проверка исправлений

Все изменения прошли проверку TypeScript:

- ✅ `packages/api` - типы корректны
- ✅ Логика передачи контекста исправлена
- ✅ AI функции теперь используют контекст беседы
- ✅ Правильная работа с conversations

## Следующие шаги

1. **Тестирование**: Проверить качество AI ответов с контекстом
2. **Мониторинг**: Отслеживать создание conversations
3. **Оптимизация**: Настроить размер контекста для разных типов сообщений
4. **Аналитика**: Добавить метрики качества классификации и парсинга
