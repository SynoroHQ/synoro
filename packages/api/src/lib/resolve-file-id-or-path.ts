import { TRPCError } from "@trpc/server";

import { files } from "@synoro/db/schema";

import type { TRPCContext } from "../trpc";

export async function resolveFileIdOrPath({
  ctx,
  fileIdOrPath,
  fileType,
  uploadedBy,
  meta,
}: {
  ctx: TRPCContext;
  fileIdOrPath: string;
  fileType:
    | "avatar"
    | "brand"
    | "brand_logo"
    | "brand_banner"
    | "product_image"
    | "category_image"
    | "collection_image"
    | "banner"
    | "blog_image";
  uploadedBy: string;
  meta?: { name?: string; mimeType?: string; size?: number };
}): Promise<string> {
  if (
    /^[a-zA-Z0-9_-]{10,}$/.test(fileIdOrPath) &&
    !fileIdOrPath.includes("/")
  ) {
    return fileIdOrPath;
  }
  // 1) Пытаемся найти файл по новой системе
  let file =
    (await ctx.db.query.files.findFirst({
      where: (fields, { or, eq }) =>
        or(eq(fields.storageKey, fileIdOrPath), eq(fields.storageUrl, fileIdOrPath)),
    })) ??
    // 2) Пытаемся найти legacy-вложение по storageUrl и вернуть связанный fileId
    (await (async () => {
      const att = await ctx.db.query.attachments.findFirst({
        where: (fields, { eq }) => eq(fields.storageUrl, fileIdOrPath),
      });
      if (att?.fileId) {
        return ctx.db.query.files.findFirst({
          where: (f, { eq }) => eq(f.id, att.fileId!),
        });
      }
      return null;
    })());

  // 3) Если не нашли — создаём новую запись в files
  file ??= await ctx.db
    .insert(files)
    .values({
      name: meta?.name ?? fileIdOrPath.split("/").pop() ?? "file",
      type: fileType as any, // см. ниже рекомендацию по строгой типизации
      mime: meta?.mimeType ?? null,
      size: meta?.size !== undefined ? BigInt(meta.size) : null,
      storageKey: fileIdOrPath, // если это URL — допустимо продублировать в storageUrl
      storageUrl: fileIdOrPath.startsWith("http") ? fileIdOrPath : null,
      uploadedBy,
    })
    .returning()
    .then((r: (typeof files.$inferSelect)[]) => r[0]);
  file ??= await ctx.db
    .insert(files)
    .values({
      path: fileIdOrPath,
      name: meta?.name ?? fileIdOrPath.split("/").pop() ?? "file",
      mimeType: meta?.mimeType ?? "",
      size: meta?.size ?? 0,
      type: fileType,
      uploadedBy,
    })
    .returning()
    .then((r: (typeof files.$inferSelect)[]) => r[0]);
  if (!file) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Файл не найден или не удалось создать файл",
    });
  }
  return file.id;
}
