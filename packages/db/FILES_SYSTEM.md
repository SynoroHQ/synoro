# Универсальная система файлов

## Обзор

Новая система файлов предоставляет централизованный способ управления всеми файлами в системе через единую таблицу `files` и гибкую систему связей `fileRelations`.

## Архитектура

### Основные таблицы

#### 1. `files` - Основная таблица файлов

```typescript
export const files = pgTable("files", {
  id: text("id").primaryKey().$defaultFn(createId),
  name: text("name").notNull(), // оригинальное имя файла
  type: fileType("type").notNull(), // тип файла
  status: fileStatus("status").notNull(), // статус обработки
  mime: text("mime"), // MIME тип
  size: bigint("size"), // размер в байтах
  extension: text("extension"), // расширение файла
  storageKey: text("storage_key").notNull(), // ключ в S3/хранилище
  storageUrl: text("storage_url"), // прямая ссылка (опционально)
  thumbnailKey: text("thumbnail_key"), // ключ для превью
  thumbnailUrl: text("thumbnail_url"), // ссылка на превью
  uploadedBy: text("uploaded_by").notNull(), // ID пользователя
  householdId: text("household_id"), // ID домохозяйства
  meta: jsonb("meta"), // дополнительные метаданные
  createdAt: timestamp("created_at"),
  updatedAt: timestamp("updated_at"),
  deletedAt: timestamp("deleted_at"), // soft delete
});
```

#### 2. `fileRelations` - Связи файлов с сущностями

```typescript
export const fileRelations = pgTable("file_relations", {
  id: text("id").primaryKey().$defaultFn(createId),
  fileId: text("file_id").notNull(), // ссылка на файл
  entityType: entityType("entity_type").notNull(), // тип сущности
  entityId: text("entity_id").notNull(), // ID сущности
  role: text("role"), // роль файла (main, thumbnail, etc.)
  order: text("order"), // порядок файлов
  meta: text("meta"), // метаданные связи
  createdAt: timestamp("created_at"),
  updatedAt: timestamp("updated_at"),
});
```

### Типы файлов

```typescript
export const fileType = pgEnum("file_type", [
  // Общие типы
  "image",
  "audio",
  "video",
  "document",
  "pdf",
  "archive",
  "raw",

  // Специфичные типы
  "avatar",
  "receipt",
  "invoice",
  "contract",
  "template",
]);
```

### Статусы файлов

```typescript
export const fileStatus = pgEnum("file_status", [
  "uploading",
  "processing",
  "ready",
  "failed",
  "deleted",
]);
```

### Типы сущностей

```typescript
export const entityType = pgEnum("entity_type", [
  "event",
  "message",
  "user_profile",
  "household",
  "task",
  "receipt",
  "document",
  "template",
  "report",
]);
```

## Использование

### Создание файла

```typescript
import { createFile } from "@synoro/db/schemas/core/file-utils";

const file = await createFile(db, {
  name: "receipt.jpg",
  type: "image",
  mime: "image/jpeg",
  size: 1024000,
  extension: "jpg",
  storageKey: "receipts/2024/01/receipt_123.jpg",
  storageUrl: "https://storage.example.com/receipts/2024/01/receipt_123.jpg",
  uploadedBy: "user_123",
  householdId: "household_456",
  meta: {
    width: 1920,
    height: 1080,
  },
});
```

### Связывание файла с сущностью

```typescript
import { linkFileToEntity } from "@synoro/db/schemas/core/file-utils";

await linkFileToEntity(db, {
  fileId: file.id,
  entityType: "event",
  entityId: "event_789",
  role: "attachment",
  order: "1",
  meta: JSON.stringify({ description: "Чек за покупки" }),
});
```

### Получение файлов сущности

```typescript
import { getEntityFiles } from "@synoro/db/schemas/core/file-utils";

// Все файлы события
const eventFiles = await getEntityFiles(db, "event", "event_789");

// Только изображения события
const eventImages = await getEntityFiles(db, "event", "event_789", "image");

// Только превью
const eventThumbnails = await getEntityFiles(
  db,
  "event",
  "event_789",
  "thumbnail",
);
```

### Обновление статуса файла

```typescript
import { updateFileStatus } from "@synoro/db/schemas/core/file-utils";

await updateFileStatus(db, "file_123", "ready");
```

### Soft delete файла

```typescript
import { softDeleteFile } from "@synoro/db/schemas/core/file-utils";

await softDeleteFile(db, "file_123");
```

## Миграция

### Запуск миграции

```bash
cd packages/db
bun run migrate-to-files
```

### Что происходит при миграции

1. **Attachments**: Данные из таблицы `attachments` переносятся в `files`
2. **MessageAttachments**: Данные из `messageAttachments` переносятся в `files`
3. **Связи**: Создаются записи в `fileRelations` для связи файлов с сущностями
4. **Флаги**: В старых таблицах устанавливаются флаги `migratedToFiles: "true"`
5. **Валидация**: Проверяется корректность миграции

### Обратная совместимость

Старые таблицы (`attachments`, `messageAttachments`) остаются доступными для чтения, но помечены как `@deprecated`. Новые поля `fileId` позволяют связать старые записи с новой системой.

## Индексы и производительность

### Основные индексы

- `file_type_idx` - по типу файла
- `file_status_idx` - по статусу
- `file_uploaded_by_idx` - по пользователю
- `file_household_idx` - по домохозяйству
- `file_created_at_idx` - по дате создания

### Составные индексы

- `file_type_status_idx` - по типу и статусу
- `file_household_type_idx` - по домохозяйству и типу
- `file_relation_entity_idx` - по типу и ID сущности

### Уникальные ограничения

- `file_storage_key_uidx` - уникальность storage key
- `file_relation_file_entity_role_uidx` - уникальность связи файл-сущность-роль

## Безопасность

### Контроль доступа

- Файлы привязаны к пользователям через `uploadedBy`
- Файлы привязаны к домохозяйствам через `householdId`
- Soft delete через `deletedAt` для аудита

### Валидация

- Проверка типов файлов через enum
- Проверка статусов через enum
- Уникальность storage key

## Расширение

### Добавление новых типов файлов

```typescript
// В fileType enum
export const fileType = pgEnum("file_type", [
  // ... существующие типы
  "new_file_type",
]);
```

### Добавление новых сущностей

```typescript
// В entityType enum
export const entityType = pgEnum("entity_type", [
  // ... существующие типы
  "new_entity",
]);
```

### Добавление новых полей

```typescript
// В таблицу files
export const files = pgTable("files", {
  // ... существующие поля
  newField: text("new_field"),
});
```

## Мониторинг и статистика

### Получение статистики

```typescript
import { getFileStats } from "@synoro/db/schemas/core/file-utils";

// Общая статистика
const globalStats = await getFileStats(db);

// Статистика по домохозяйству
const householdStats = await getFileStats(db, "household_123");
```

### Метрики

- Общее количество файлов
- Общий размер файлов
- Распределение по типам
- Распределение по статусам
- Статистика по домохозяйствам

## Лучшие практики

### 1. Используйте правильные типы файлов

```typescript
// ✅ Хорошо
type: "image"; // для изображений
type: "document"; // для документов

// ❌ Плохо
type: "raw"; // только если нет подходящего типа
```

### 2. Устанавливайте роли для файлов

```typescript
// ✅ Хорошо
role: "main"; // основной файл
role: "thumbnail"; // превью
role: "attachment"; // вложение

// ❌ Плохо
role: undefined; // без роли
```

### 3. Используйте метаданные для дополнительной информации

```typescript
meta: {
  width: 1920,
  height: 1080,
  duration: 300, // для видео
  pages: 5,     // для документов
  checksum: "abc123", // контрольная сумма
}
```

### 4. Обрабатывайте ошибки

```typescript
try {
  const file = await createFile(db, input);
  await linkFileToEntity(db, { fileId: file.id, ... });
} catch (error) {
  // Обработка ошибок
  console.error("Ошибка создания файла:", error);
}
```

## Troubleshooting

### Частые проблемы

1. **Дублирование storage key**: Убедитесь, что `storageKey` уникален
2. **Отсутствие связей**: Проверьте, что файл связан с сущностью через `fileRelations`
3. **Ошибки миграции**: Запустите скрипт миграции повторно

### Отладка

```typescript
// Проверка файла
const file = await getFileById(db, "file_123");
console.log("Файл:", file);

// Проверка связей
const relations = await getEntityFiles(db, "event", "event_789");
console.log("Связи:", relations);
```

## Заключение

Новая система файлов предоставляет:

- ✅ Централизованное управление файлами
- ✅ Гибкие связи с любыми сущностями
- ✅ Обратную совместимость
- ✅ Высокую производительность
- ✅ Безопасность и аудит
- ✅ Простоту расширения

Используйте эту систему для всех новых файлов в проекте и постепенно мигрируйте существующие данные.
