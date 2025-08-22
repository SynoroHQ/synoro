#!/usr/bin/env bun
import { eq, isNull, sql } from "drizzle-orm";

import { db } from "../client";
import { messageAttachments } from "../schemas/chat/schema";
import { fileRelations } from "../schemas/core/file-relations";
import { files } from "../schemas/core/files";
import { attachments } from "../schemas/events/attachment";

/**
 * Скрипт миграции существующих данных в новую систему файлов
 *
 * Этот скрипт:
 * 1. Мигрирует данные из attachments в files + fileRelations
 * 2. Мигрирует данные из messageAttachments в files + fileRelations
 * 3. Обновляет флаги миграции в старых таблицах
 */

async function migrateAttachments() {
  console.log("🔄 Миграция attachments...");

  const allAttachments = await db
    .select()
    .from(attachments)
    .where(eq(attachments.migratedToFiles, "false"));

  console.log(`📁 Найдено ${allAttachments.length} attachments для миграции`);

  let migrated = 0;
  let errors = 0;

  for (const attachment of allAttachments) {
    try {
      // Создаем запись в files
      const [file] = await db
        .insert(files)
        .values({
          name: attachment.filename || `attachment_${attachment.id}`,
          type: attachment.type,
          mime: attachment.mime,
          size: attachment.size,
          extension: attachment.filename?.split(".").pop() || null,
          storageKey: attachment.storageUrl, // временно используем URL как ключ
          storageUrl: attachment.storageUrl,
          thumbnailUrl: attachment.thumbnailUrl,
          uploadedBy: attachment.householdId, // временно, нужно будет исправить
          householdId: attachment.householdId,
          meta: {
            ...attachment.meta,
            originalAttachmentId: attachment.id,
            migrationSource: "attachments",
          },
        })
        .returning();

      // Создаем связь с событием
      if (attachment.eventId && file) {
        await db.insert(fileRelations).values({
          fileId: file.id,
          entityType: "event",
          entityId: attachment.eventId,
          role: "attachment",
          meta: JSON.stringify({
            originalAttachmentId: attachment.id,
            migrationSource: "attachments",
          }),
        });
      }

      // Обновляем флаг миграции
      if (file) {
        await db
          .update(attachments)
          .set({
            fileId: file.id,
            migratedToFiles: "true",
            updatedAt: new Date(),
          })
          .where(eq(attachments.id, attachment.id));
      }

      migrated++;

      if (migrated % 100 === 0) {
        console.log(`✅ Мигрировано ${migrated} attachments`);
      }
    } catch (error) {
      console.error(`❌ Ошибка миграции attachment ${attachment.id}:`, error);
      errors++;
    }
  }

  console.log(
    `✅ Миграция attachments завершена: ${migrated} успешно, ${errors} ошибок`,
  );
  return { migrated, errors };
}

async function migrateMessageAttachments() {
  console.log("🔄 Миграция messageAttachments...");

  const allMessageAttachments = await db
    .select()
    .from(messageAttachments)
    .where(eq(messageAttachments.migratedToFiles, "false"));

  console.log(
    `📁 Найдено ${allMessageAttachments.length} messageAttachments для миграции`,
  );

  let migrated = 0;
  let errors = 0;

  for (const msgAttachment of allMessageAttachments) {
    try {
      // Создаем запись в files
      const [file] = await db
        .insert(files)
        .values({
          name: `message_attachment_${msgAttachment.id}`,
          type: "raw", // по умолчанию
          mime: msgAttachment.mime,
          size: msgAttachment.size ? BigInt(msgAttachment.size) : null,
          storageKey: msgAttachment.key,
          uploadedBy: "system", // временно, нужно будет исправить
          meta: {
            originalMessageAttachmentId: msgAttachment.id,
            migrationSource: "messageAttachments",
          },
        })
        .returning();

      // Создаем связь с сообщением
      if (file) {
        await db.insert(fileRelations).values({
          fileId: file.id,
          entityType: "message",
          entityId: msgAttachment.messageId,
          role: "attachment",
          meta: JSON.stringify({
            originalMessageAttachmentId: msgAttachment.id,
            migrationSource: "messageAttachments",
          }),
        });

        // Обновляем флаг миграции
        await db
          .update(messageAttachments)
          .set({
            fileId: file.id,
            migratedToFiles: "true",
            updatedAt: new Date(),
          })
          .where(eq(messageAttachments.id, msgAttachment.id));
      }

      migrated++;

      if (migrated % 100 === 0) {
        console.log(`✅ Мигрировано ${migrated} messageAttachments`);
      }
    } catch (error) {
      console.error(
        `❌ Ошибка миграции messageAttachment ${msgAttachment.id}:`,
        error,
      );
      errors++;
    }
  }

  console.log(
    `✅ Миграция messageAttachments завершена: ${migrated} успешно, ${errors} ошибок`,
  );
  return { migrated, errors };
}

async function validateMigration() {
  console.log("🔍 Валидация миграции...");

  // Проверяем attachments
  const notMigratedAttachments = await db
    .select({ count: sql<number>`count(*)` })
    .from(attachments)
    .where(eq(attachments.migratedToFiles, "false"));

  const migratedAttachments = await db
    .select({ count: sql<number>`count(*)` })
    .from(attachments)
    .where(eq(attachments.migratedToFiles, "true"));

  // Проверяем messageAttachments
  const notMigratedMsgAttachments = await db
    .select({ count: sql<number>`count(*)` })
    .from(messageAttachments)
    .where(eq(messageAttachments.migratedToFiles, "false"));

  const migratedMsgAttachments = await db
    .select({ count: sql<number>`count(*)` })
    .from(messageAttachments)
    .where(eq(messageAttachments.migratedToFiles, "true"));

  // Проверяем общее количество файлов
  const totalFiles = await db
    .select({ count: sql<number>`count(*)` })
    .from(files);

  const totalFileRelations = await db
    .select({ count: sql<number>`count(*)` })
    .from(fileRelations);

  console.log("📊 Результаты миграции:");
  console.log(
    `  Attachments: ${migratedAttachments[0]?.count || 0} мигрировано, ${notMigratedAttachments[0]?.count || 0} не мигрировано`,
  );
  console.log(
    `  MessageAttachments: ${migratedMsgAttachments[0]?.count || 0} мигрировано, ${notMigratedMsgAttachments[0]?.count || 0} не мигрировано`,
  );
  console.log(`  Всего файлов: ${totalFiles[0]?.count || 0}`);
  console.log(`  Всего связей: ${totalFileRelations[0]?.count || 0}`);

  return {
    attachments: {
      migrated: migratedAttachments[0]?.count || 0,
      notMigrated: notMigratedAttachments[0]?.count || 0,
    },
    messageAttachments: {
      migrated: migratedMsgAttachments[0]?.count || 0,
      notMigrated: notMigratedMsgAttachments[0]?.count || 0,
    },
    files: totalFiles[0]?.count || 0,
    fileRelations: totalFileRelations[0]?.count || 0,
  };
}

async function main() {
  console.log("🚀 Запуск миграции в новую систему файлов...");

  try {
    // Мигрируем attachments
    const attachmentsResult = await migrateAttachments();

    // Мигрируем messageAttachments
    const messageAttachmentsResult = await migrateMessageAttachments();

    // Валидируем результаты
    const validation = await validateMigration();

    console.log("\n🎉 Миграция завершена успешно!");
    console.log(
      `📁 Всего мигрировано файлов: ${attachmentsResult.migrated + messageAttachmentsResult.migrated}`,
    );

    if (attachmentsResult.errors > 0 || messageAttachmentsResult.errors > 0) {
      console.log(
        `⚠️  Внимание: ${attachmentsResult.errors + messageAttachmentsResult.errors} ошибок при миграции`,
      );
      console.log("   Проверьте логи выше для деталей");
    }
  } catch (error) {
    console.error("💥 Критическая ошибка при миграции:", error);
    process.exit(1);
  }
}

if (import.meta.main) {
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error("💥 Неожиданная ошибка:", error);
      process.exit(1);
    });
}
