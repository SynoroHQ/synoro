import { sql } from "drizzle-orm";
import { migrate } from "drizzle-orm/postgres-js";

export const up = sql`
-- Добавляем self-referential foreign key для parent_id в таблице tags
-- Это обеспечивает ссылочную целостность для иерархии тегов
ALTER TABLE tags 
ADD CONSTRAINT tags_parent_id_fkey 
FOREIGN KEY (parent_id) REFERENCES tags(id) ON DELETE SET NULL;

-- Добавляем комментарий к колонке для документации
COMMENT ON COLUMN tags.parent_id IS 'Ссылка на родительский тег для создания иерархии. При удалении родителя дочерние теги становятся корневыми (SET NULL).';
`;

export const down = sql`
-- Удаляем foreign key constraint
ALTER TABLE tags DROP CONSTRAINT IF EXISTS tags_parent_id_fkey;

-- Удаляем комментарий
COMMENT ON COLUMN tags.parent_id IS NULL;
`;
