# Telegram Integration - Summary of Changes

## Обзор

Реализована полная интеграция с Telegram, поддерживающая два режима работы:

1. **Анонимные пользователи** - могут пользоваться ботом без регистрации
2. **Зарегистрированные пользователи** - связаны с внутренними пользователями системы

## Внесенные изменения

### 1. Новые файлы

#### `packages/api/src/lib/services/telegram-user-service.ts`

- Сервис для управления пользователями Telegram
- Автоматическое создание conversations для анонимных пользователей
- Связывание Telegram аккаунтов с внутренними пользователями
- Проверка идемпотентности для предотвращения дублирования

#### `packages/api/src/router/telegram/telegram-users.ts`

- API для управления связями пользователей
- `linkUser` - связать Telegram с внутренним пользователем
- `unlinkUser` - отвязать Telegram
- `getLinkedUser` - получить информацию о связанном пользователе

#### `docs/telegram-integration-flow.md`

- Подробная документация по архитектуре и флоу
- Примеры использования API
- Схемы базы данных

### 2. Обновленные файлы

#### `packages/validators/src/messages.ts`

- Добавлено поле `telegramUserId` в `ProcessMessageInput` и `TranscribeInput`
- Валидация: для Telegram канала обязательны `telegramUserId` и `chatId`
- Zod схемы с автоматическими проверками

#### `packages/api/src/router/messages/process-message.ts`

- `processMessageFromTelegram` теперь использует `TelegramUserService`
- Автоматическое определение типа пользователя (анонимный/зарегистрированный)
- Передача правильного `userId` и `conversationId`

#### `packages/api/src/router/messages/transcribe.ts`

- `transcribeFromTelegram` использует `TelegramUserService`
- Поддержка анонимных пользователей
- Правильная передача метаданных

#### `packages/api/src/lib/services/message-processor.ts`

- `ProcessMessageParams.userId` теперь может быть `null`
- Обновлена логика валидации для поддержки анонимных пользователей
- Автоматическое создание conversations

#### `packages/api/src/lib/utils/message-utils.ts`

- `createCommonMetadata` поддерживает nullable `userId`
- Автоматическое преобразование `null` в `"anonymous"`

#### `packages/api/src/lib/message-processor/types.ts`

- `MessageContext.userId` теперь может быть `null`
- Поддержка анонимных пользователей

#### `packages/api/src/lib/message-processor/processor.ts`

- Все вызовы функций используют `userId || "anonymous"`
- Поддержка nullable `userId` во всех местах

#### `packages/api/src/root.ts`

- Добавлен `telegramUsers` роутер в основной API

### 3. Архитектурные изменения

#### Поддержка nullable userId

- `userId` может быть `null` для анонимных пользователей
- Автоматическое преобразование в `"anonymous"` для метаданных
- Обратная совместимость с существующими веб/мобайл клиентами

#### Автоматическое управление conversations

- Создание conversations по требованию
- Разделение по `ownerUserId` (зарегистрированные) и `telegramChatId` (анонимные)
- Поддержка существующей схемы базы данных

#### Проверка идемпотентности

- Предотвращение дублирования сообщений для анонимных пользователей
- Использование `messageId` как ключа идемпотентности
- Автоматическая очистка старых ключей

## Преимущества нового подхода

1. **Гибкость**: Поддержка как анонимных, так и зарегистрированных пользователей
2. **Безопасность**: Проверка идемпотентности и валидация входных данных
3. **Масштабируемость**: Легко добавить новые провайдеры (Discord, Slack, etc.)
4. **Обратная совместимость**: Существующие клиенты не затронуты
5. **Аналитика**: Полная трассировка всех взаимодействий

## API Endpoints

### Обработка сообщений

```
POST /api/trpc/messages.processMessageFromTelegram
{
  text: string,
  channel: "telegram",
  chatId: string,        // Обязательно
  messageId?: string,    // Для идемпотентности
  telegramUserId: string, // Обязательно
  metadata?: Record<string, unknown>
}
```

### Управление связями

```
POST /api/trpc/telegramUsers.linkUser
POST /api/trpc/telegramUsers.unlinkUser
GET /api/trpc/telegramUsers.getLinkedUser
```

## Проверка типов

Все изменения прошли проверку TypeScript:

- ✅ `packages/validators` - типы корректны
- ✅ `packages/api` - типы корректны
- ✅ `apps/tg-bot` - типы корректны

## Следующие шаги

1. **Тестирование**: Проверить работу с реальными Telegram сообщениями
2. **Мониторинг**: Добавить логирование для отслеживания анонимных пользователей
3. **Аналитика**: Создать дашборд для анализа использования бота
4. **Расширение**: Добавить поддержку других платформ (Discord, Slack)
