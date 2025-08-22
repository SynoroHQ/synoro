import { sql } from "drizzle-orm";

export const up = sql`
-- Создаем enum типы для source и type
CREATE TYPE event_source AS ENUM ('telegram', 'web', 'mobile', 'api');
CREATE TYPE event_type AS ENUM ('expense', 'task', 'maintenance', 'other');

-- Изменяем тип колонки source с text на event_source
ALTER TABLE events 
ALTER COLUMN source TYPE event_source USING source::event_source;

-- Изменяем тип колонки type с text на event_type
ALTER TABLE events 
ALTER COLUMN type TYPE event_type USING type::event_type;

-- Добавляем комментарии к колонкам
COMMENT ON COLUMN events.source IS 'Источник события: telegram, web, mobile, api';
COMMENT ON COLUMN events.type IS 'Тип события: expense, task, maintenance, other';
`;

export const down = sql`
-- Возвращаем колонки к типу text
ALTER TABLE events 
ALTER COLUMN source TYPE text USING source::text;

ALTER TABLE events 
ALTER COLUMN type TYPE text USING type::text;

-- Удаляем enum типы
DROP TYPE IF EXISTS event_source;
DROP TYPE IF EXISTS event_type;

-- Удаляем комментарии
COMMENT ON COLUMN events.source IS NULL;
COMMENT ON COLUMN events.type IS NULL;
`;
