-- Migration: 0004_add_event_enums
-- Description: Добавляем enum типы для source и type в таблице events

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
