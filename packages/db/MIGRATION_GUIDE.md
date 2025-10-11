# Руководство по применению изменений схемы БД

## Внесенные изменения

### 1. Добавлено Soft Delete

Добавлено поле `deletedAt` в следующие таблицы:

- `events` - для мягкого удаления событий
- `households` - для архивации домохозяйств
- `conversations` - для сохранения истории диалогов

### 2. Подготовлен полнотекстовый поиск

Создана документация для добавления полнотекстового поиска в таблицу `events`.
См. `FULLTEXT_SEARCH.md` для деталей.

## Применение изменений

### Шаг 1: Генерация миграции

```bash
cd packages/db
bun run generate
```

Эта команда создаст новый файл миграции в папке `migrations/`.

### Шаг 2: Проверка миграции

Откройте созданный файл миграции и проверьте SQL:

```bash
# Файл будет примерно такой: migrations/0002_*.sql
```

Ожидаемые изменения:

- `ALTER TABLE "events" ADD COLUMN "deleted_at" timestamp with time zone;`
- `ALTER TABLE "households" ADD COLUMN "deleted_at" timestamp with time zone;`
- `ALTER TABLE "conversations" ADD COLUMN "deleted_at" timestamp with time zone;`
- Создание индексов для `deleted_at`

### Шаг 3: Применение миграции

```bash
bun run migrate
```

### Шаг 4 (Опционально): Добавление полнотекстового поиска

Если нужен полнотекстовый поиск для events, добавьте SQL из `FULLTEXT_SEARCH.md` в новую миграцию:

```bash
# Создайте новый файл миграции вручную или через drizzle-kit
# Добавьте SQL для search_vector из FULLTEXT_SEARCH.md
bun run migrate
```

## Использование Soft Delete

### В запросах

```typescript
import { isNull } from "drizzle-orm";

import { db } from "./client";
import { events } from "./schema";

// Получить только активные (не удаленные) события
const activeEvents = await db
  .select()
  .from(events)
  .where(isNull(events.deletedAt));

// Получить удаленные события
const deletedEvents = await db
  .select()
  .from(events)
  .where(isNotNull(events.deletedAt));
```

### Мягкое удаление

```typescript
import { eq } from "drizzle-orm";

import { db } from "./client";
import { events } from "./schema";

// Мягкое удаление события
await db
  .update(events)
  .set({ deletedAt: new Date() })
  .where(eq(events.id, eventId));
```

### Восстановление

```typescript
// Восстановление удаленного события
await db.update(events).set({ deletedAt: null }).where(eq(events.id, eventId));
```

### Жесткое удаление

```typescript
// Окончательное удаление (используйте с осторожностью!)
await db.delete(events).where(eq(events.id, eventId));
```

## Откат изменений

Если нужно откатить изменения:

```bash
# Drizzle Kit не поддерживает автоматический откат
# Нужно создать миграцию вручную:

# migrations/0003_rollback_soft_delete.sql
ALTER TABLE "events" DROP COLUMN "deleted_at";
ALTER TABLE "households" DROP COLUMN "deleted_at";
ALTER TABLE "conversations" DROP COLUMN "deleted_at";

# Затем применить:
bun run migrate
```

## Проверка применения

```bash
# Проверить структуру таблицы
bun run studio

# Или через psql:
psql $DATABASE_URL -c "\d events"
```

## Рекомендации

1. **Резервное копирование**: Сделайте backup БД перед применением миграций
2. **Тестирование**: Протестируйте миграции на dev/staging окружении
3. **Мониторинг**: После применения проверьте логи и производительность
4. **Индексы**: Убедитесь, что индексы для `deleted_at` созданы корректно
