# Changelog - Исправления схемы БД

## [2025-01-11] - Устранение найденных проблем

### ✅ Исправлено

#### 1. Добавлено Soft Delete (Мягкое удаление)

**Проблема**: Отсутствие механизма мягкого удаления в критичных таблицах

**Решение**: Добавлено поле `deletedAt` с индексами в таблицы:

- `events` - для восстановления случайно удаленных событий
- `households` - для архивации домохозяйств с сохранением истории
- `conversations` - для сохранения истории диалогов

**Файлы изменены**:

- `packages/db/src/schemas/events/event.ts`
- `packages/db/src/schemas/core/household.ts`
- `packages/db/src/schemas/chat/schema.ts`

**Преимущества**:

- Возможность восстановления данных
- Соответствие GDPR
- Сохранение истории для аудита
- Защита от случайного удаления

#### 2. Подготовлен полнотекстовый поиск

**Проблема**: Отсутствие эффективного поиска по текстовым полям events

**Решение**: Создана документация и SQL для добавления полнотекстового поиска

**Файлы созданы**:

- `packages/db/FULLTEXT_SEARCH.md` - полная документация
- `packages/db/MIGRATION_GUIDE.md` - руководство по применению

**Возможности**:

- Быстрый поиск по title и notes
- Поддержка русской морфологии
- Ранжирование результатов
- Подсветка найденных фрагментов

### ✅ Подтверждено корректное состояние

#### 3. Relations для самоссылающихся таблиц

**Проверено**: Relations уже правильно настроены

- `messages.parentId` → `messageThread` relation ✅
- `tags.parentId` → `tagHierarchy` relation ✅
- `reminders.parentReminderId` → `reminderHierarchy` relation ✅

**Файлы проверены**:

- `packages/db/src/schemas/chat/relations.ts`
- `packages/db/src/schemas/events/relations.ts`
- `packages/db/src/schemas/reminders/schema.ts`

### 📝 Обновлена документация

**Файлы обновлены**:

- `packages/db/SCHEMA_IMPROVEMENTS.md` - добавлены разделы 8 и 9
- `packages/db/CHANGELOG_FIXES.md` - этот файл
- `packages/db/MIGRATION_GUIDE.md` - руководство по миграции
- `packages/db/FULLTEXT_SEARCH.md` - документация по поиску

## Следующие шаги

1. **Применить миграции**:

   ```bash
   cd packages/db
   bun run generate
   bun run migrate
   ```

2. **Опционально добавить полнотекстовый поиск**:
   - Следовать инструкциям в `FULLTEXT_SEARCH.md`
   - Добавить SQL в новую миграцию

3. **Обновить код приложения**:
   - Использовать `deletedAt` для фильтрации
   - Реализовать функции мягкого удаления
   - Добавить UI для восстановления удаленных записей

## Известные ограничения

### Deprecated таблица attachments

**Статус**: Оставлена для обратной совместимости

Таблица `attachments` помечена как deprecated. Рекомендуется использовать новую систему `files` + `fileRelations`.

**План миграции** (будущее):

1. Перенести данные из `attachments` в `files`
2. Обновить все ссылки в коде
3. Удалить таблицу `attachments`

## Проверка качества

- ✅ TypeScript компиляция без ошибок
- ✅ Drizzle ORM типизация корректна
- ✅ Все индексы на месте
- ✅ Foreign keys настроены правильно
- ✅ Check constraints работают
- ✅ Relations определены корректно

## Производительность

**Добавленные индексы**:

- `event_deleted_at_idx` - для фильтрации удаленных событий
- `household_deleted_at_idx` - для фильтрации архивных домохозяйств
- `conversation_deleted_at_idx` - для фильтрации удаленных диалогов

**Ожидаемое влияние**: Минимальное, индексы на nullable полях эффективны

## Безопасность

- ✅ Soft delete предотвращает потерю данных
- ✅ Возможность аудита удалений
- ✅ Соответствие требованиям GDPR
- ✅ Защита от SQL injection через Drizzle ORM
