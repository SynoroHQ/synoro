-- Migration: 0005_improve_monetary_fields
-- Description: Улучшаем денежные поля: varchar(3) для валюты и CHECK constraints

-- Изменяем тип колонки currency с text на varchar(3)
ALTER TABLE events 
ALTER COLUMN currency TYPE varchar(3) USING currency::varchar(3);

-- Делаем currency NOT NULL
ALTER TABLE events 
ALTER COLUMN currency SET NOT NULL;

-- Устанавливаем значение по умолчанию для currency
ALTER TABLE events 
ALTER COLUMN currency SET DEFAULT 'RUB';

-- Добавляем CHECK constraint для неотрицательных сумм
ALTER TABLE events 
ADD CONSTRAINT amount_non_negative CHECK (amount >= 0);

-- Добавляем CHECK constraint для валидации формата валюты (ISO-4217)
ALTER TABLE events 
ADD CONSTRAINT currency_iso_format CHECK (currency ~ '^[A-Z]{3}$');

-- Добавляем комментарии к колонкам
COMMENT ON COLUMN events.amount IS 'Денежная сумма события. Должна быть неотрицательной';
COMMENT ON COLUMN events.currency IS 'Код валюты в формате ISO-4217 (3 заглавные буквы, например RUB, USD, EUR)';
