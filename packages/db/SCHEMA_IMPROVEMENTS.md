# Улучшения схем базы данных

## Основные исправления

### 1. Устранение проблем с рекурсиями и AnyPgColumn

#### Проблемы:

- ❌ Использование `AnyPgColumn` в `message.parentId`
- ❌ Отсутствие proper self-references в `tag.parentId`
- ❌ Проблемы с типизацией

#### Решения:

- ✅ Убрали `AnyPgColumn` и заменили на правильные relations
- ✅ Создали отдельные relation файлы для самоссылающихся FK
- ✅ Улучшили типизацию через drizzle relations

### 2. Добавление недостающих индексов

#### Добавленные индексы:

- **Conversation**: owner, channel, status, lastMessage
- **Message**: conversation, role, status, parent, createdAt, composite indexes
- **User**: email, role, status, createdAt
- **Session**: token, user, expires, active
- **Event**: household+occurred, user+occurred, status+type, priority, amount
- **Tag**: household, parent, name
- **Attachment**: household, event, type, createdAt

### 3. Улучшение типов данных

#### Новые Enums:

```sql
-- Auth
user_role: ["user", "admin", "moderator"]
user_status: ["active", "inactive", "suspended", "pending"]
verification_type: ["email", "phone", "password_reset", "otp"]

-- Core
household_status: ["active", "inactive", "archived"]
member_role: ["owner", "admin", "member", "viewer"]
member_status: ["active", "invited", "suspended", "left"]
theme_mode: ["light", "dark", "system"]

-- Events
event_status: ["active", "archived", "deleted"]
event_priority: ["low", "medium", "high", "urgent"]
attachment_type: ["image", "audio", "video", "pdf", "document", "receipt", "raw"]
log_type: ["text", "audio", "image", "video", "file"]
log_status: ["pending", "processing", "processed", "failed"]

-- Chat
chat_channel: ["telegram", "web", "mobile"]
message_role: ["system", "user", "assistant", "tool"]
```

### 4. Улучшение полей и ограничений

#### Новые поля:

- **User**: `status`, `lastLoginAt`, улучшенные timestamps
- **Session**: `isActive`, улучшенная структура
- **Account**: более четкие поля токенов
- **Verification**: `type`, `isUsed`, `attempts`
- **Household**: `description`, `status`, `settings`
- **HouseholdMember**: `status`, `settings`, `invitedAt`, `joinedAt`
- **UserProfile**: расширенные персональные настройки
- **Event**: `status`, `priority`, `amount`, `currency`, `updatedAt`
- **Tag**: `description`, `color`
- **Attachment**: `filename`, `size`, `thumbnailUrl`
- **EventLog**: `status`, `originalText`, `processedAt`

#### Улучшенные constraints:

- Все timestamps теперь с timezone
- Добавлены `$onUpdate` для автоматического обновления
- Proper defaults для всех полей
- Улучшенные unique constraints

### 5. Система Relations

#### Создана структура:

```
schemas/
├── auth/
│   ├── schema.ts       # Tables
│   ├── relations.ts    # Relations
│   └── index.ts        # Exports
├── core/
│   ├── household.ts
│   ├── household-member.ts
│   ├── user-profile.ts
│   ├── relations.ts
│   └── index.ts
├── events/
│   ├── event.ts
│   ├── tag.ts
│   ├── attachment.ts
│   ├── event-property.ts
│   ├── schema.ts       # eventLog
│   ├── relations.ts
│   └── index.ts
├── chat/
│   ├── schema.ts       # All chat tables
│   ├── relations.ts
│   └── index.ts
├── relations.ts        # Consolidated relations
└── index.ts           # Main export
```

### 6. Производительность

#### Composite indexes для основных запросов:

- `conversation_last_message_idx` - для сортировки бесед
- `message_conversation_created_idx` - для загрузки сообщений
- `event_household_type_occurred_idx` - для фильтрации событий
- `event_status_type_idx` - для поиска по статусу и типу

### 7. Безопасность и валидация

#### Добавлено:

- Proper cascade/set null для всех FK
- Статусы для мягкого удаления
- Поля для аудита (attempts, isUsed, isActive)
- Расширенные метаданные для отслеживания

## Применение изменений

1. **Создать новую миграцию**:

```bash
cd packages/db
bun run db:generate
```

2. **Применить миграцию**:

```bash
bun run db:migrate
```

3. **Обновить код** для использования новых типов и полей

## Преимущества

1. **Производительность**: Оптимизированные индексы для всех основных запросов
2. **Типизация**: Полная типизация через Drizzle ORM
3. **Поддержка**: Более простое сопровождение кода
4. **Масштабируемость**: Подготовка к росту данных
5. **Безопасность**: Proper constraints и валидация
6. **Аудит**: Полное отслеживание изменений

## Последние улучшения (2025)

### 8. Soft Delete

Добавлено поле `deletedAt` для мягкого удаления в критичные таблицы:

- **events**: `deletedAt` с индексом для фильтрации удаленных записей
- **households**: `deletedAt` для архивации домохозяйств
- **conversations**: `deletedAt` для сохранения истории диалогов

Преимущества:

- Возможность восстановления удаленных данных
- Сохранение истории для аудита
- Соответствие требованиям GDPR (право на забвение)

### 9. Полнотекстовый поиск

Подготовлена инфраструктура для полнотекстового поиска в таблице `events`:

- Документация в `FULLTEXT_SEARCH.md`
- SQL для добавления `search_vector` колонки
- GIN индекс для быстрого поиска
- Поддержка русского языка с морфологией
- Взвешивание полей (title > notes)

См. `FULLTEXT_SEARCH.md` для деталей реализации.
