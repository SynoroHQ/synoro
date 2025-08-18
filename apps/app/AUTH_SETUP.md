# Настройка аутентификации

## Переменные окружения

Создайте файл `.env.local` в папке `apps/app/` со следующими переменными:

```bash
# Аутентификация
BETTER_AUTH_SECRET=your-secret-key-here
BETTER_AUTH_URL=http://localhost:3000

# Google OAuth (опционально)
AUTH_GOOGLE_CLIENT_ID=your-google-client-id
AUTH_GOOGLE_CLIENT_SECRET=your-google-client-secret

# Домен для cookies (опционально)
AUTH_DOMAIN=localhost

# Email провайдер (опционально)
RESEND_API_KEY=your-resend-api-key

# База данных
DATABASE_URL=postgresql://username:password@localhost:5432/synoro
```

## Генерация секретного ключа

Для генерации `BETTER_AUTH_SECRET` используйте команду:

```bash
openssl rand -base64 32
```

## Настройка Google OAuth

1. Перейдите в [Google Cloud Console](https://console.cloud.google.com/)
2. Создайте новый проект или выберите существующий
3. Включите Google+ API
4. Создайте OAuth 2.0 credentials
5. Добавьте разрешенные redirect URIs:
   - `http://localhost:3000/api/auth/callback/google`
   - `http://localhost:3000/auth/callback/google`

## Настройка базы данных

1. Убедитесь, что PostgreSQL запущен
2. Создайте базу данных `synoro`
3. Обновите `DATABASE_URL` в `.env.local`
4. Запустите миграции базы данных

## Запуск приложения

1. Установите зависимости:

   ```bash
   npm install
   ```

2. Запустите базу данных и миграции

3. Запустите приложение:
   ```bash
   npm run dev
   ```

## Тестирование

1. Откройте `http://localhost:3000/auth/register`
2. Создайте новый аккаунт
3. Подтвердите email (в dev режиме код выводится в консоль)
4. Войдите в систему
5. Проверьте доступ к `/dashboard`

## Структура аутентификации

- **Формы**: `src/features/auth/components/`
- **Страницы**: `src/app/(auth)/auth/`
- **Хуки**: `src/hooks/use-auth.ts`
- **Провайдеры**: `src/providers/auth-provider.tsx`
- **Middleware**: `src/middleware.ts`
- **API роуты**: `src/app/api/auth/[...better-auth]/route.ts`

## Функции

- ✅ Регистрация с email/password
- ✅ Вход с email/password
- ✅ Верификация email через OTP
- ✅ Восстановление пароля
- ✅ Смена пароля
- ✅ Google OAuth (опционально)
- ✅ Защита маршрутов
- ✅ Middleware для проверки сессий
- ✅ Управление ролями пользователей
