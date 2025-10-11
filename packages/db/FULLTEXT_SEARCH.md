# Полнотекстовый поиск для Events

## Описание

Добавление полнотекстового поиска для таблицы `events` позволяет эффективно искать по полям `title` и `notes`.

## SQL для миграции

После генерации миграции (`bun run generate`), добавьте следующий SQL в новый файл миграции:

```sql
-- Добавление колонки для полнотекстового поиска
ALTER TABLE "events" ADD COLUMN "search_vector" tsvector
  GENERATED ALWAYS AS (
    setweight(to_tsvector('russian', coalesce(title, '')), 'A') ||
    setweight(to_tsvector('russian', coalesce(notes, '')), 'B')
  ) STORED;

-- Создание GIN индекса для быстрого поиска
CREATE INDEX "event_search_vector_idx" ON "events" USING gin("search_vector");

-- Опционально: добавить индекс для английского языка
-- ALTER TABLE "events" ADD COLUMN "search_vector_en" tsvector
--   GENERATED ALWAYS AS (
--     setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
--     setweight(to_tsvector('english', coalesce(notes, '')), 'B')
--   ) STORED;
-- CREATE INDEX "event_search_vector_en_idx" ON "events" USING gin("search_vector_en");
```

## Использование

### Простой поиск

```typescript
import { sql } from "drizzle-orm";

import { db } from "./client";
import { events } from "./schema";

// Поиск по ключевым словам
const searchResults = await db
  .select()
  .from(events)
  .where(
    sql`${events.searchVector} @@ plainto_tsquery('russian', ${searchQuery})`,
  )
  .limit(20);
```

### Поиск с ранжированием

```typescript
// Поиск с сортировкой по релевантности
const rankedResults = await db
  .select({
    ...events,
    rank: sql<number>`ts_rank(${events.searchVector}, plainto_tsquery('russian', ${searchQuery}))`,
  })
  .from(events)
  .where(
    sql`${events.searchVector} @@ plainto_tsquery('russian', ${searchQuery})`,
  )
  .orderBy(
    sql`ts_rank(${events.searchVector}, plainto_tsquery('russian', ${searchQuery})) DESC`,
  )
  .limit(20);
```

### Поиск с подсветкой результатов

```typescript
// Поиск с выделением найденных фрагментов
const highlightedResults = await db
  .select({
    id: events.id,
    title: events.title,
    notes: events.notes,
    headline: sql<string>`ts_headline('russian', coalesce(${events.title}, '') || ' ' || coalesce(${events.notes}, ''), plainto_tsquery('russian', ${searchQuery}))`,
  })
  .from(events)
  .where(
    sql`${events.searchVector} @@ plainto_tsquery('russian', ${searchQuery})`,
  )
  .limit(20);
```

## Преимущества

1. **Производительность**: GIN индекс обеспечивает быстрый поиск даже по большим объемам данных
2. **Морфология**: Поддержка русского языка с учетом словоформ (например, "купил" найдет "покупка")
3. **Взвешивание**: Title имеет больший вес (A) чем notes (B) при ранжировании
4. **Автоматическое обновление**: GENERATED ALWAYS гарантирует актуальность индекса

## Альтернативные функции поиска

- `to_tsquery()` - для сложных запросов с операторами (AND, OR, NOT)
- `phraseto_tsquery()` - для поиска точных фраз
- `websearch_to_tsquery()` - для веб-подобного синтаксиса поиска
