# Настройка аутентификации

## Обзор

Система аутентификации интегрирована с пакетом `@synoro/auth` и использует Better Auth для управления пользователями, сессиями и ролями.

## Компоненты

### 1. Страницы аутентификации

- **`/auth/login`** - Вход в систему (email/password + OTP)
- **`/auth/register`** - Регистрация нового пользователя
- **`/auth/verify`** - Верификация OTP кода
- **`/auth/forgot-password`** - Восстановление пароля

### 2. Защищенные маршруты

- **`/dashboard/**`\*\* - Все dashboard страницы требуют аутентификации
- **`/analytics/**`\*\* - Аналитика доступна только авторизованным пользователям
- **`/tasks/**`\*\* - Управление задачами

### 3. Компоненты

- **`AuthGuard`** - Компонент для защиты страниц
- **`UserMenu`** - Меню пользователя с информацией и выходом
- **`AuthProvider`** - Провайдер контекста аутентификации

## Настройка окружения

Создайте файл `.env.local` в корне `apps/app/`:

```env
# Better Auth
BETTER_AUTH_SECRET=your-secret-key-here
BETTER_AUTH_URL=http://localhost:3000

# Google OAuth (опционально)
AUTH_GOOGLE_CLIENT_ID=your-google-client-id
AUTH_GOOGLE_CLIENT_SECRET=your-google-client-secret

# Email (для OTP и уведомлений)
RESEND_API_KEY=your-resend-api-key

# Домен для cookies
AUTH_DOMAIN=localhost

# Порт приложения
PORT=3000
```

## Роли пользователей

Система поддерживает следующие роли:

- **`super_admin`** - Супер администратор (полный доступ)
- **`admin`** - Администратор
- **`moderator`** - Модератор
- **`editor`** - Редактор
- **`user`** - Обычный пользователь

## Использование

### Защита страниц

```tsx
import { AuthGuard } from "@/components/auth/auth-guard";

export default function ProtectedPage() {
  return (
    <AuthGuard requiredRole="admin">
      <div>Только для администраторов</div>
    </AuthGuard>
  );
}
```

### Получение данных сессии

```tsx
import { useSession } from "@synoro/auth/client";

export default function UserProfile() {
  const { data: session } = useSession();

  if (!session?.user) {
    return <div>Загрузка...</div>;
  }

  return <div>Привет, {session.user.name}!</div>;
}
```

### Выход из системы

```tsx
import { signOut } from "@synoro/auth/client";

const handleSignOut = async () => {
  await signOut({ redirect: false });
  // Редирект на страницу входа
};
```

## Middleware

Middleware автоматически защищает все dashboard маршруты и перенаправляет неавторизованных пользователей на страницу входа.

## API Routes

- **`/api/auth/[...better-auth]`** - Обработка аутентификации Better Auth

## Безопасность

- Все защищенные маршруты проверяют аутентификацию
- Поддержка ролей для контроля доступа
- Безопасные cookies с настройками домена
- Защита от CSRF атак

## Troubleshooting

### Ошибка "useSidebar must be used within a SidebarProvider"

Убедитесь, что все layout файлы обернуты в `SidebarProvider`:

```tsx
import { SidebarProvider } from "@synoro/ui/components/sidebar";

export default function Layout({ children }) {
  return <SidebarProvider>{children}</SidebarProvider>;
}
```

### Проблемы с аутентификацией

1. Проверьте переменные окружения
2. Убедитесь, что база данных доступна
3. Проверьте логи сервера на наличие ошибок

## Разработка

Для локальной разработки:

1. Запустите базу данных
2. Настройте переменные окружения
3. Запустите `npm run dev`
4. Откройте `http://localhost:3000`

## Дополнительные возможности

- **Google OAuth** - Вход через Google аккаунт
- **Email OTP** - Вход по коду подтверждения
- **Сброс пароля** - Восстановление доступа
- **Управление профилем** - Редактирование личной информации
- **Роли и разрешения** - Гибкая система доступа
