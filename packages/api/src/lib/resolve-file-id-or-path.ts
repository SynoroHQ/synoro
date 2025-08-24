import { TRPCError } from "@trpc/server";

import type { FileType } from "@synoro/db/schema";
import { files } from "@synoro/db/schema";

import type { TRPCContext } from "../trpc";

/**
 * Разрешает ID файла или путь к файлу, возвращая ID файла.
 * Если файл не найден - создает новую запись в таблице files.
 *
 * @param ctx - Контекст TRPC с базой данных
 * @param fileIdOrPath - ID файла или путь/URL к файлу
 * @param fileType - Тип файла согласно схеме FileType
 * @param uploadedBy - ID пользователя, который загрузил файл
 * @param meta - Дополнительные метаданные файла
 * @returns Promise<string> - ID файла
 */
export async function resolveFileIdOrPath({
  ctx,
  fileIdOrPath,
  fileType,
  uploadedBy,
  meta,
}: {
  ctx: TRPCContext;
  fileIdOrPath: string;
  fileType: FileType;
  uploadedBy: string;
  meta?: {
    name?: string;
    mimeType?: string;
    size?: number;
    extension?: string;
    width?: number;
    height?: number;
  };
}): Promise<string> {
  // Валидация входных параметров
  if (!fileIdOrPath.trim()) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "fileIdOrPath не может быть пустым",
    });
  }

  if (!uploadedBy.trim()) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "uploadedBy не может быть пустым",
    });
  }

  // Проверяем, является ли строка уже ID файла (CUID формат)
  if (
    /^[a-zA-Z0-9_-]{10,}$/.test(fileIdOrPath) &&
    !fileIdOrPath.includes("/") &&
    !fileIdOrPath.startsWith("http")
  ) {
    // Проверяем, существует ли файл с таким ID
    const existingFile = await ctx.db.query.files.findFirst({
      where: (fields, { eq }) => eq(fields.id, fileIdOrPath),
    });

    if (existingFile) {
      return fileIdOrPath;
    }
  }

  try {
    // 1) Пытаемся найти файл по новой системе (по storageKey или storageUrl)
    let file = await ctx.db.query.files.findFirst({
      where: (fields, { or, eq }) =>
        or(
          eq(fields.storageKey, fileIdOrPath),
          eq(fields.storageUrl, fileIdOrPath),
        ),
    });

    // 2) Если не нашли, пытаемся найти legacy-вложение по storageUrl
    if (!file) {
      const attachment = await ctx.db.query.attachments.findFirst({
        where: (fields, { eq }) => eq(fields.storageUrl, fileIdOrPath),
      });

      if (attachment?.fileId) {
        file = await ctx.db.query.files.findFirst({
          where: (f, { eq }) => eq(f.id, attachment.fileId!),
        });
      }
    }

    // 3) Если файл не найден - создаём новую запись
    if (!file) {
      const fileName = meta?.name ?? fileIdOrPath.split("/").pop() ?? "file";
      const fileExtension =
        meta?.extension ?? fileName.split(".").pop() ?? null;

      // Определяем storageKey и storageUrl
      const isUrl = fileIdOrPath.startsWith("http");
      const storageKey = isUrl
        ? (fileIdOrPath.split("/").pop() ?? fileIdOrPath)
        : fileIdOrPath;
      const storageUrl = isUrl ? fileIdOrPath : null;

      const newFileData = {
        name: fileName,
        type: fileType,
        mime: meta?.mimeType ?? null,
        size: meta?.size !== undefined ? BigInt(meta.size) : null,
        extension: fileExtension,
        storageKey,
        storageUrl,
        uploadedBy,
        // Добавляем метаданные для изображений
        meta:
          meta && (meta.width || meta.height)
            ? {
                width: meta.width,
                height: meta.height,
              }
            : null,
      };

      const insertResult = await ctx.db
        .insert(files)
        .values(newFileData)
        .returning();

      file = insertResult[0];
    }

    if (!file) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Не удалось создать или получить файл",
      });
    }

    return file.id;
  } catch (error: unknown) {
    // Логируем ошибку для отладки
    console.error("Ошибка в resolveFileIdOrPath:", error);

    if (error instanceof TRPCError) {
      throw error;
    }

    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Внутренняя ошибка при обработке файла",
    });
  }
}
