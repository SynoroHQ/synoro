import { relations } from "drizzle-orm";

import { user } from "../auth/schema";
import { fileRelations } from "./file-relations";
import { files } from "./files";
import { households } from "./household";

// Relations for files
export const filesRelations = relations(files, ({ one, many }) => ({
  // Связь с пользователем, который загрузил файл
  uploadedByUser: one(user, {
    fields: [files.uploadedBy],
    references: [user.id],
  }),

  // Связь с домохозяйством
  household: one(households, {
    fields: [files.householdId],
    references: [households.id],
  }),

  // Связи с сущностями через fileRelations
  fileRelations: many(fileRelations),
}));

// Relations for fileRelations
export const fileRelationsRelations = relations(fileRelations, ({ one }) => ({
  // Связь с файлом
  file: one(files, {
    fields: [fileRelations.fileId],
    references: [files.id],
  }),
}));
