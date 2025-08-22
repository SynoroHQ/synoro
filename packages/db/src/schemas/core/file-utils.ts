import { and, eq, sql } from "drizzle-orm";

import type { Database } from "../../types";
import { fileRelations } from "./file-relations";
import { files } from "./files";

/**
 * Утилиты для работы с новой системой файлов
 */

export interface CreateFileInput {
  name: string;
  type: string;
  mime?: string;
  size?: number;
  extension?: string;
  storageKey: string;
  storageUrl?: string;
  thumbnailKey?: string;
  thumbnailUrl?: string;
  uploadedBy: string;
  householdId?: string;
  meta?: Record<string, unknown>;
}

export interface LinkFileToEntityInput {
  fileId: string;
  entityType: string;
  entityId: string;
  role?: string;
  order?: string;
  meta?: string;
}

/**
 * Создает новый файл в системе
 */
export async function createFile(db: Database, input: CreateFileInput) {
  const [file] = await db
    .insert(files)
    .values({
      name: input.name,
      type: input.type as any, // TODO: типизировать
      mime: input.mime,
      size: input.size ? BigInt(input.size) : null,
      extension: input.extension,
      storageKey: input.storageKey,
      storageUrl: input.storageUrl,
      thumbnailKey: input.thumbnailKey,
      thumbnailUrl: input.thumbnailUrl,
      uploadedBy: input.uploadedBy,
      householdId: input.householdId,
      meta: input.meta,
    })
    .returning();

  return file;
}

/**
 * Связывает файл с сущностью
 */
export async function linkFileToEntity(
  db: Database,
  input: LinkFileToEntityInput,
) {
  const [relation] = await db
    .insert(fileRelations)
    .values({
      fileId: input.fileId,
      entityType: input.entityType as any, // TODO: типизировать
      entityId: input.entityId,
      role: input.role,
      order: input.order,
      meta: input.meta,
    })
    .returning();

  return relation;
}

/**
 * Получает все файлы для сущности
 */
export async function getEntityFiles(
  db: Database,
  entityType: string,
  entityId: string,
  role?: string,
) {
  let query = and(
    eq(fileRelations.entityType, entityType as any),
    eq(fileRelations.entityId, entityId),
  );

  if (role) {
    query = and(query, eq(fileRelations.role, role));
  }

  const relations = await db
    .select({
      relation: fileRelations,
      file: files,
    })
    .from(fileRelations)
    .innerJoin(files, eq(fileRelations.fileId, files.id))
    .where(query)
    .orderBy(fileRelations.order, fileRelations.createdAt);

  return relations.map(({ relation, file }) => ({
    ...file,
    relation,
  }));
}

/**
 * Получает файл по ID
 */
export async function getFileById(db: Database, fileId: string) {
  const [file] = await db
    .select()
    .from(files)
    .where(eq(files.id, fileId))
    .limit(1);

  return file;
}

/**
 * Получает файл по storage key
 */
export async function getFileByStorageKey(db: Database, storageKey: string) {
  const [file] = await db
    .select()
    .from(files)
    .where(eq(files.storageKey, storageKey))
    .limit(1);

  return file;
}

/**
 * Обновляет статус файла
 */
export async function updateFileStatus(
  db: Database,
  fileId: string,
  status: string,
) {
  const [file] = await db
    .update(files)
    .set({
      status: status as any, // TODO: типизировать
      updatedAt: new Date(),
    })
    .where(eq(files.id, fileId))
    .returning();

  return file;
}

/**
 * Помечает файл как удаленный (soft delete)
 */
export async function softDeleteFile(db: Database, fileId: string) {
  const [file] = await db
    .update(files)
    .set({
      status: "deleted" as any,
      deletedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(files.id, fileId))
    .returning();

  return file;
}

/**
 * Получает статистику по файлам
 */
export async function getFileStats(db: Database, householdId?: string) {
  const whereClause = householdId
    ? eq(files.householdId, householdId)
    : sql`1=1`;

  const stats = await db
    .select({
      totalFiles: sql<number>`count(*)`,
      totalSize: sql<bigint>`coalesce(sum(size), 0)`,
      byType: files.type,
      byStatus: files.status,
    })
    .from(files)
    .where(and(whereClause, sql`deleted_at IS NULL`))
    .groupBy(files.type, files.status);

  return stats;
}
