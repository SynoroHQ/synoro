# Telegram Anonymous Authentication

## Обзор

Реализована безопасная система аутентификации для анонимных пользователей Telegram с использованием WebApp `initData` и HMAC-SHA256 подписи.

## Основные компоненты

### 1. Middleware аутентификации

`telegramAnonymousAuthMiddleware` валидирует Telegram WebApp `initData`:

- Проверяет наличие обязательного поля `telegramInitData`
- Валидирует HMAC-SHA256 подпись используя `TELEGRAM_BOT_TOKEN`
- Извлекает `telegramUserId` и `telegramChatId` из валидированных данных
- Добавляет контекст `isTelegramAnonymous: true`

### 2. Процедура для анонимных пользователей

`telegramAnonymousProcedure` предоставляет безопасный доступ:

- Применяет все стандартные middleware (timing, CSRF, rate limiting)
- Требует валидный `telegramInitData` для каждого запроса
- Автоматически отклоняет неавторизованные запросы

### 3. Идемпотентность сообщений

Реализована система предотвращения дублирования:

- Таблица `processed_idempotency_keys` хранит обработанные ключи
- Уникальный индекс по `(telegramChatId, idempotencyKey)`
- Автоматическая очистка старых записей (24 часа)

## Использование

### Отправка сообщений

```typescript
// Клиент должен предоставить telegramInitData
const result = await api.sendAnonymousMessage.mutate({
  channel: "telegram",
  content: { text: "Привет!" },
  idempotencyKey: "unique-key-123", // Опционально
  attachments: [], // Поддерживается
  metadata: { source: "webapp" }, // Поддерживается
  model: "gpt-5", // Опционально
  telegramInitData: "query_id=...&user=...&hash=...", // Обязательно
});
```

### Получение списка бесед

```typescript
const conversations = await api.listAnonymousConversations.query({
  telegramInitData: "query_id=...&user=...&hash=...",
  limit: 20,
});
```

## Безопасность

1. **Валидация подписи**: Каждый запрос проверяется через HMAC-SHA256
2. **Изоляция данных**: Пользователи могут получить доступ только к своим беседам
3. **Rate limiting**: Применяется ко всем анонимным запросам
4. **CSRF защита**: Защита от межсайтовых запросов

## Схема базы данных

### processed_idempotency_keys

```sql
CREATE TABLE processed_idempotency_keys (
  id TEXT PRIMARY KEY,
  telegram_chat_id TEXT NOT NULL,
  idempotency_key TEXT NOT NULL,
  message_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

  UNIQUE(telegram_chat_id, idempotency_key)
);
```

## Очистка данных

Запуск скрипта очистки старых ключей:

```bash
cd packages/db
bun run src/scripts/cleanup-idempotency-keys.ts
```

## Обработка ошибок

- **401 UNAUTHORIZED**: Невалидный `initData` или подпись
- **400 BAD_REQUEST**: Отсутствует `telegramInitData`
- **403 FORBIDDEN**: Недостаточно прав доступа
- **429 TOO_MANY_REQUESTS**: Превышен лимит запросов

## Миграции

Drizzle автоматически создаст новую таблицу `processed_idempotency_keys` при следующем запуске.
