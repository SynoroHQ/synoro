# Telegram Integration Flow

## Обзор

Система поддерживает два режима работы с пользователями Telegram:

1. **Анонимные пользователи** - могут пользоваться ботом без регистрации в системе
2. **Зарегистрированные пользователи** - связаны с внутренними пользователями системы

## Архитектура

### Основные компоненты

- **`TelegramUserService`** - управляет связями между Telegram и внутренними пользователями
- **`identityLinks`** - таблица связей пользователей с внешними провайдерами
- **`conversations`** - поддерживает как зарегистрированных, так и анонимных пользователей
- **`processedIdempotencyKeys`** - предотвращает дублирование сообщений для анонимных пользователей

### Схема базы данных

```sql
-- Связи пользователей с внешними провайдерами
identity_links (
  id, user_id, provider, provider_user_id, created_at, updated_at
)

-- Диалоги (поддерживают оба типа пользователей)
conversations (
  id, owner_user_id, telegram_chat_id, channel, title, status, ...
)

-- Ключи идемпотентности для анонимных пользователей
processed_idempotency_keys (
  id, telegram_chat_id, idempotency_key, message_id, created_at
)
```

## Флоу обработки сообщений

### 1. Анонимные пользователи

```
Telegram Bot → API → TelegramUserService.getUserContext()
                ↓
         Проверка identityLinks
                ↓
         Пользователь не найден → isAnonymous = true
                ↓
         Создание/поиск conversation по telegramChatId
                ↓
         Проверка идемпотентности по messageId
                ↓
         processMessageInternal(userId = null, chatId = conversationId)
```

### 2. Зарегистрированные пользователи

```
Telegram Bot → API → TelegramUserService.getUserContext()
                ↓
         Проверка identityLinks
                ↓
         Пользователь найден → isAnonymous = false
                ↓
         Создание/поиск conversation по userId
                ↓
         processMessageInternal(userId = internalUserId, chatId = conversationId)
```

## API Endpoints

### Обработка сообщений

```typescript
// POST /api/trpc/messages.processMessageFromTelegram
{
  text: string,
  channel: "telegram",
  chatId: string,        // Обязательно для Telegram
  messageId?: string,    // Для идемпотентности
  telegramUserId: string, // Обязательно для Telegram
  metadata?: Record<string, unknown>
}
```

### Управление связями

```typescript
// Связать Telegram с внутренним пользователем
POST /api/trpc/telegramUsers.linkUser
{
  telegramUserId: string
}

// Отвязать Telegram
POST /api/trpc/telegramUsers.unlinkUser
{
  telegramUserId: string
}

// Получить информацию о связанном пользователе
GET /api/trpc/telegramUsers.getLinkedUser?telegramUserId=string
```

## Валидация

### Обязательные поля для Telegram

- `telegramUserId` - ID пользователя в Telegram
- `chatId` - ID чата в Telegram
- `channel` должен быть "telegram"

### Автоматические проверки

- Валидация через Zod схемы
- Проверка идемпотентности для анонимных пользователей
- Автоматическое создание conversations

## Преимущества нового подхода

1. **Гибкость**: Поддержка как анонимных, так и зарегистрированных пользователей
2. **Безопасность**: Проверка идемпотентности предотвращает дублирование
3. **Масштабируемость**: Легко добавить новые провайдеры (Discord, Slack, etc.)
4. **Обратная совместимость**: Существующие веб/мобайл клиенты не затронуты
5. **Аналитика**: Полная трассировка всех взаимодействий

## Примеры использования

### Анонимный пользователь

```typescript
// Telegram бот отправляет сообщение
const result =
  await apiClient.messages.processMessage.processMessageFromTelegram.mutate({
    text: "Привет!",
    channel: "telegram",
    chatId: "123456789",
    telegramUserId: "987654321",
    messageId: "msg_001",
  });

// Система автоматически:
// 1. Создает conversation для telegramChatId
// 2. Проверяет идемпотентность
// 3. Обрабатывает сообщение с userId = null
```

### Зарегистрированный пользователь

```typescript
// Пользователь связывает свой Telegram аккаунт
await apiClient.telegramUsers.linkUser.mutate({
  telegramUserId: "987654321",
});

// Теперь все сообщения от этого пользователя будут связаны с его аккаунтом
// userId будет установлен в internalUserId из identityLinks
```

## Миграция

### Существующие данные

- Все существующие conversations остаются без изменений
- Новые поля добавляются как optional
- Обратная совместимость гарантирована

### Новые требования

- Для Telegram канала обязательны `telegramUserId` и `chatId`
- Автоматическая проверка идемпотентности
- Создание conversations по требованию
