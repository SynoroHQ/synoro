-- Создание дефолтного домашнего хозяйства для анонимных пользователей
INSERT INTO households (id, name, description, settings, status, created_at, updated_at)
VALUES (
  'default',
  'Домашнее хозяйство по умолчанию',
  'Домашнее хозяйство по умолчанию для анонимных пользователей',
  '{"timezone": "Europe/Moscow", "currency": "RUB", "language": "ru", "features": ["events", "reminders"]}',
  'active',
  NOW(),
  NOW()
)
ON CONFLICT (id) DO NOTHING;
