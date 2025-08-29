# Руководство по индексам для схемы напоминаний

## Обзор

Этот документ описывает оптимизированную стратегию индексации для схемы напоминаний, основанную на [лучших практиках Drizzle ORM](https://orm.drizzle.team/docs/indexes-constraints).

## Принципы оптимизации индексов

### 1. **Порядок столбцов в составных индексах**

- **Первый столбец**: наиболее селективный (с наименьшим количеством уникальных значений)
- **Второй столбец**: следующий по селективности
- **Последний столбец**: для сортировки или дополнительной фильтрации

### 2. **Типы индексов**

- **B-tree**: для точных совпадений, диапазонов и сортировки
- **GIN**: для JSON полей и полнотекстового поиска
- **Составные**: для сложных запросов с несколькими условиями

### 3. **Селективность**

- Индексируем столбцы с высокой селективностью (много уникальных значений)
- Избегаем индексов на столбцы с низкой селективностью (например, boolean с преобладанием одного значения)

## Оптимизированные индексы

### Таблица `reminders`

#### Основные индексы

```typescript
// Одиночные индексы для часто используемых полей
userIdIdx: index("reminders_user_id_idx").on(table.userId),
reminderTimeIdx: index("reminders_reminder_time_idx").on(table.reminderTime),
statusIdx: index("reminders_status_idx").on(table.status),
typeIdx: index("reminders_type_idx").on(table.type),
```

#### Составные индексы (оптимизированы по порядку)

```typescript
// userId + status - для фильтрации по пользователю и статусу
userStatusIdx: index("reminders_user_status_idx").on(table.userId, table.status),

// userId + type + status - для фильтрации по пользователю, типу и статусу
userTypeStatusIdx: index("reminders_user_type_status_idx").on(
  table.userId, table.type, table.status
),

// userId + priority + reminderTime - для сортировки по приоритету и времени
userPriorityTimeIdx: index("reminders_user_priority_time_idx").on(
  table.userId, table.priority, table.reminderTime
),

// userId + reminderTime + status - для поиска активных напоминаний по времени
userTimeStatusIdx: index("reminders_user_time_status_idx").on(
  table.userId, table.reminderTime, table.status
),
```

#### GIN индексы для JSON полей

```typescript
// GIN индекс для тегов с поддержкой операторов JSON
tagsGinIdx: index("reminders_tags_gin_idx").using("gin").on(table.tags),

// GIN индекс для метаданных
metadataGinIdx: index("reminders_metadata_gin_idx").using("gin").on(table.metadata),

// GIN индекс для паттерна повторения
recurrencePatternGinIdx: index("reminders_recurrence_pattern_gin_idx").using("gin").on(table.recurrencePattern),
```

#### Специальные индексы

```typescript
// Индексы для повторений
recurrenceIdx: index("reminders_recurrence_idx").on(table.recurrence),
recurrenceEndDateIdx: index("reminders_recurrence_end_date_idx").on(table.recurrenceEndDate),

// Индексы для временных полей
createdAtIdx: index("reminders_created_at_idx").on(table.createdAt),
updatedAtIdx: index("reminders_updated_at_idx").on(table.updatedAt),
completedAtIdx: index("reminders_completed_at_idx").on(table.completedAt),
snoozeUntilIdx: index("reminders_snooze_until_idx").on(table.snoozeUntil),
```

### Таблица `reminder_executions`

#### Основные индексы

```typescript
reminderIdIdx: index("reminder_executions_reminder_id_idx").on(table.reminderId),
executedAtIdx: index("reminder_executions_executed_at_idx").on(table.executedAt),
statusIdx: index("reminder_executions_status_idx").on(table.status),
channelIdx: index("reminder_executions_channel_idx").on(table.channel),
```

#### Составные индексы

```typescript
// reminderId + status - для фильтрации по напоминанию и статусу
reminderStatusIdx: index("reminder_executions_reminder_status_idx").on(
  table.reminderId, table.status
),

// reminderId + executedAt - для сортировки по времени выполнения
reminderExecutedAtIdx: index("reminder_executions_reminder_executed_at_idx").on(
  table.reminderId, table.executedAt
),

// status + executedAt - для анализа по статусу и времени
statusExecutedAtIdx: index("reminder_executions_status_executed_at_idx").on(
  table.status, table.executedAt
),

// channel + status - для анализа по каналу и статусу
channelStatusIdx: index("reminder_executions_channel_status_idx").on(
  table.channel, table.status
),
```

#### GIN индекс

```typescript
// GIN индекс для метаданных выполнения
metadataGinIdx: index("reminder_executions_metadata_gin_idx").using("gin").on(table.metadata),
```

### Таблица `reminder_templates`

#### Основные индексы

```typescript
userIdIdx: index("reminder_templates_user_id_idx").on(table.userId),
isPublicIdx: index("reminder_templates_is_public_idx").on(table.isPublic),
nameIdx: index("reminder_templates_name_idx").on(table.name),
```

#### Составные индексы

```typescript
// isPublic + name - для поиска публичных шаблонов по имени
publicNameIdx: index("reminder_templates_public_name_idx").on(
  table.isPublic, table.name
),

// userId + isPublic - для фильтрации по пользователю и публичности
userPublicIdx: index("reminder_templates_user_public_idx").on(
  table.userId, table.isPublic
),

// name + usageCount - для сортировки по популярности
nameUsageIdx: index("reminder_templates_name_usage_idx").on(
  table.name, table.usageCount
),
```

#### Уникальные индексы

```typescript
// Уникальное имя шаблона для каждого пользователя
userTemplateNameUnique: uniqueIndex("reminder_templates_user_name_unique").on(
  table.userId, table.name
),
```

#### GIN индекс

```typescript
// GIN индекс для шаблона
templateGinIdx: index("reminder_templates_template_gin_idx").using("gin").on(table.template),
```

## Рекомендуемые запросы

### 1. **Поиск активных напоминаний пользователя**

```sql
-- Использует: userTimeStatusIdx
SELECT * FROM reminders
WHERE user_id = ? AND status IN ('pending', 'active') AND reminder_time <= NOW()
ORDER BY reminder_time ASC;
```

### 2. **Фильтрация по типу и статусу**

```sql
-- Использует: userTypeStatusIdx
SELECT * FROM reminders
WHERE user_id = ? AND type = ? AND status = ?
ORDER BY reminder_time ASC;
```

### 3. **Поиск по приоритету и времени**

```sql
-- Использует: userPriorityTimeIdx
SELECT * FROM reminders
WHERE user_id = ? AND priority = ?
ORDER BY reminder_time ASC;
```

### 4. **Поиск по тегам**

```sql
-- Использует: tagsGinIdx
SELECT * FROM reminders
WHERE user_id = ? AND tags ?| array['работа', 'встреча']
ORDER BY reminder_time ASC;
```

### 5. **Анализ выполнения напоминаний**

```sql
-- Использует: reminderStatusIdx + executedAtIdx
SELECT * FROM reminder_executions
WHERE reminder_id = ? AND status = ?
ORDER BY executed_at DESC;
```

## Мониторинг производительности

### 1. **Анализ использования индексов**

```sql
-- Проверка использования индексов
SELECT schemaname, tablename, indexname, idx_scan, idx_tup_read, idx_tup_fetch
FROM pg_stat_user_indexes
WHERE tablename LIKE 'reminder%'
ORDER BY idx_scan DESC;
```

### 2. **Анализ медленных запросов**

```sql
-- Включение логирования медленных запросов
ALTER SYSTEM SET log_min_duration_statement = 1000; -- 1 секунда
SELECT pg_reload_conf();
```

### 3. **Анализ планов выполнения**

```sql
EXPLAIN (ANALYZE, BUFFERS)
SELECT * FROM reminders
WHERE user_id = ? AND status = 'pending'
ORDER BY reminder_time ASC;
```

## Рекомендации по оптимизации

### 1. **Регулярный анализ**

- Еженедельно анализируйте использование индексов
- Удаляйте неиспользуемые индексы
- Добавляйте индексы для медленных запросов

### 2. **Размер индексов**

- Мониторьте размер индексов
- Используйте частичные индексы для больших таблиц
- Рассмотрите использование индексов с условиями

### 3. **Обновление статистики**

```sql
-- Обновление статистики для таблиц
ANALYZE reminders;
ANALYZE reminder_executions;
ANALYZE reminder_templates;
```

## Заключение

Оптимизированная стратегия индексации обеспечивает:

- **Быстрый поиск** по пользователю и статусу
- **Эффективную фильтрацию** по типу и приоритету
- **Оптимальную сортировку** по времени
- **Быстрый поиск** по JSON полям
- **Уникальность** для критических полей

Все индексы спроектированы с учетом реальных паттернов использования и следуют лучшим практикам Drizzle ORM.
