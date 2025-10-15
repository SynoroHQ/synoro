# Автоматическое создание Household для пользователей

## Проблема

При запросе анализа событий возникала ошибка: **"No householdId provided"**

Это происходило потому, что `householdId` не передавался в контекст агентов при обработке сообщений от Telegram пользователей.

## Решение

Реализована автоматическая привязка пользователей к дефолтному household при первом обращении.

### Изменения

#### 1. Обновлён `TelegramUserService`

**Файл:** `packages/api/src/lib/services/telegram-user-service.ts`

- Добавлено поле `householdId` в интерфейс `TelegramUserContext`
- В методе `getUserContext` добавлена логика получения или создания дефолтного household
- Используется `HouseholdService.getOrCreateDefaultHousehold()` для получения household с ID `"default"`

```typescript
export interface TelegramUserContext {
  userId: string;
  telegramUserId: string;
  telegramUsername?: string;
  conversationId: string;
  householdId: string; // ← Добавлено
}
```

#### 2. Обновлён middleware

**Файл:** `packages/api/src/lib/trpc/trpc-middleware.ts`

- В `createEnhancedBotAuthMiddleware` добавлено извлечение `householdId` из контекста пользователя
- `householdId` передаётся в контекст запроса

#### 3. Обновлена обработка сообщений

**Файл:** `packages/api/src/router/messages/process-message-agents.ts`

- В `processMessageFromTelegramWithAgents` добавлена передача `householdId` в metadata
- Используется `ctx.householdId` из middleware или fallback на `input.metadata?.householdId`

#### 4. Создан дефолтный household

**Файл:** `packages/db/migrations/0004_create_default_household.sql`

SQL миграция для создания household с ID `"default"`:

```sql
INSERT INTO households (id, name, description, settings, status, created_at, updated_at)
VALUES (
  'default',
  'Домашнее хозяйство по умолчанию',
  'Домашнее хозяйство по умолчанию для анонимных пользователей',
  '{"timezone": "Europe/Moscow", "currency": "RUB", "language": "ru", "features": ["events", "reminders"]}',
  'active',
  NOW(),
  NOW()
)
ON CONFLICT (id) DO NOTHING;
```

**Скрипт для создания:** `packages/db/src/scripts/create-default-household.ts`

### Как это работает

1. Пользователь отправляет сообщение через Telegram бота
2. `enhancedBotAuthMiddleware` вызывает `TelegramUserService.getUserContext()`
3. Сервис:
   - Создаёт или находит пользователя
   - Создаёт или находит conversation
   - **Получает или создаёт дефолтный household** ← новое
4. `householdId` передаётся в контекст агента
5. Агенты используют `householdId` для работы с событиями

### Преимущества

- ✅ Все пользователи автоматически получают доступ к функциям событий
- ✅ Не требуется ручная настройка household для каждого пользователя
- ✅ Ошибка "No householdId provided" больше не возникает
- ✅ Можно легко мигрировать пользователей на персональные household в будущем

### Дальнейшие улучшения

В будущем можно реализовать:

1. **Персональные household** - создавать отдельный household для каждого пользователя
2. **Семейные household** - позволить пользователям создавать и присоединяться к общим household
3. **Миграция** - перенести пользователей из дефолтного household в персональные

### Проверка

Для проверки наличия дефолтного household:

```bash
cd packages/db
bun run with-env -- bun run src/scripts/check-default-household.ts
```

Для создания дефолтного household (если его нет):

```bash
cd packages/db
bun run with-env -- bun run src/scripts/create-default-household.ts
```
