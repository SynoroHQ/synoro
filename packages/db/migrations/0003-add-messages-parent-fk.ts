import { sql } from "drizzle-orm";

export const up = sql`
-- Добавляем self-referential foreign key для parent_id в таблице messages
-- Это обеспечивает ссылочную целостность для иерархии сообщений
ALTER TABLE messages 
ADD CONSTRAINT messages_parent_id_fkey 
FOREIGN KEY (parent_id) REFERENCES messages(id) ON DELETE SET NULL;

-- Добавляем комментарий к колонке для документации
COMMENT ON COLUMN messages.parent_id IS 'Ссылка на родительское сообщение для создания цепочки ответов. При удалении родителя дочерние сообщения становятся корневыми (SET NULL).';
`;

export const down = sql`
-- Удаляем foreign key constraint
ALTER TABLE messages DROP CONSTRAINT IF EXISTS messages_parent_id_fkey;

-- Удаляем комментарий
COMMENT ON COLUMN messages.parent_id IS NULL;
`;
