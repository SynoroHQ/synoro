# Настройка аутентификации с Better Auth

## Обзор

Система аутентификации интегрирована с пакетом `@synoro/auth` и использует [Better Auth](https://www.better-auth.com/) для управления пользователями, сессиями и ролями. Better Auth предоставляет современный, безопасный и гибкий подход к аутентификации.

## Компоненты

### 1. Страницы аутентификации

- **`/auth/login`** - Вход в систему (email/password + OTP)
- **`/auth/register`** - Регистрация нового пользователя
- **`/auth/verify`** - Верификация OTP кода
- **`/auth/forgot-password`** - Запрос на сброс пароля
- **`/auth/reset-password`** - Сброс пароля по токену

### 2. Защищенные маршруты

- **`/dashboard/**` - Все dashboard страницы требуют аутентификации
- **`/analytics/**` - Аналитика доступна только авторизованным пользователям
- **`/tasks/**` - Управление задачами

### 3. Компоненты

- **`AuthGuard`** - Компонент для защиты страниц
- **`UserMenu`** - Меню пользователя с информацией и выходом
- **`AuthProvider`** - Провайдер контекста аутентификации

## Better Auth API

### Вход в систему

```tsx
import { signIn } from "@synoro/auth/client";

// Вход по email и паролю
const result = await signIn.email({
  email: "user@example.com",
  password: "password123",
  rememberMe: true, // Опционально, по умолчанию true
});
```

### Регистрация

```tsx
import { signIn } from "@synoro/auth/client";

// Регистрация нового пользователя
const result = await signIn.email({
  name: "John Doe", // Обязательно
  email: "user@example.com", // Обязательно
  password: "password123", // Обязательно, минимум 8 символов
  image: "https://example.com/avatar.jpg", // Опционально
});
```

### Выход из системы

```tsx
import { signOut } from "@synoro/auth/client";

// Выход из системы
await signOut();

// С редиректом
await signOut({
  fetchOptions: {
    onSuccess: () => {
      router.push("/login");
    },
  },
});
```

### Email OTP аутентификация

```tsx
import { emailOtp } from "@synoro/auth/client";

// Отправка OTP кода
const result = await emailOtp.send({
  email: "user@example.com",
});

// Верификация OTP кода
const result = await emailOtp.verify({
  email: "user@example.com",
  otp: "123456",
});
```

### Сброс пароля

```tsx
import { requestPasswordReset, resetPassword } from "@synoro/auth/client";

// Запрос на сброс пароля
const result = await requestPasswordReset({
  email: "user@example.com",
  redirectTo: "/auth/reset-password",
});

// Сброс пароля по токену
const result = await resetPassword({
  newPassword: "newpassword123",
  token: "reset-token-from-url",
});
```

### Изменение пароля

```tsx
import { changePassword } from "@synoro/auth/client";

// Изменение пароля (требует текущий пароль)
const result = await changePassword({
  newPassword: "newpassword123",
  currentPassword: "oldpassword123",
  revokeOtherSessions: true, // Опционально
});
```

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

## Конфигурация Better Auth

### Основная конфигурация

```tsx
// packages/auth/src/config.ts
export const auth = betterAuth({
  // База данных
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      session: SessionSchema,
      account: account,
      user: user,
      verification: verification,
    },
  }),

  // Email и пароль
  emailAndPassword: {
    enabled: true,
    resetPassword: {
      enabled: true,
      redirectTo: "/auth/reset-password",
    },
  },

  // Сессии
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 дней
    updateAge: 60 * 60 * 24, // 1 день
    cookie: {
      domain: env.AUTH_DOMAIN || undefined,
      secure: env.NODE_ENV === "production",
      sameSite: "lax",
    },
  },

  // Секретный ключ
  secret: env.BETTER_AUTH_SECRET,

  // Социальные провайдеры
  socialProviders: {
    google: {
      clientId: env.AUTH_GOOGLE_CLIENT_ID,
      clientSecret: env.AUTH_GOOGLE_CLIENT_SECRET,
      disableSignUp: true,
    },
  },

  // Плагины
  plugins: [
    nextCookies(),
    admin({
      defaultRole: "user",
      adminRoles: ["super_admin", "admin", "moderator", "editor"],
    }),
  ],
});
```

### Email верификация

```tsx
export const auth = betterAuth({
  // ... остальные настройки
  
  emailVerification: {
    sendVerificationEmail: async ({ user, url, token }, request) => {
      await sendEmail({
        to: user.email,
        subject: "Подтвердите ваш email",
        text: `Для подтверждения email перейдите по ссылке: ${url}`,
      });
    },
  },
});
```

### Сброс пароля

```tsx
export const auth = betterAuth({
  // ... остальные настройки
  
  emailAndPassword: {
    enabled: true,
    sendResetPassword: async ({ user, url, token }, request) => {
      await sendEmail({
        to: user.email,
        subject: "Сброс пароля",
        text: `Для сброса пароля перейдите по ссылке: ${url}`,
      });
    },
    onPasswordReset: async ({ user }, request) => {
      console.log(`Пароль для пользователя ${user.email} был сброшен`);
    },
  },
});
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

```tsx
// apps/app/src/middleware.ts
export function middleware(req: NextRequest) {
  const publicRoutes = ["/auth/login", "/auth/register", "/auth/reset-password"];
  const isPublicRoute = publicRoutes.some((path) =>
    req.nextUrl.pathname.startsWith(path),
  );

  const sessionCookie = getSessionCookie(req);

  // Если это auth-страница и пользователь уже авторизован, перенаправляем на главную
  if (isPublicRoute && sessionCookie) {
    const dashboardUrl = new URL("/", req.url);
    return NextResponse.redirect(dashboardUrl);
  }

  // Если это не публичная страница и пользователь не авторизован, перенаправляем на логин
  if (!isPublicRoute && !sessionCookie) {
    const loginUrl = new URL("/auth/login", req.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}
```

## API Routes

- **`/api/auth/[...all]`** – Обработка аутентификации Better Auth

## Безопасность

- **Хеширование паролей**: Better Auth использует `scrypt` для хеширования паролей
- **Сессии**: Безопасные cookies с настройками домена и SameSite
- **Токены**: Временные токены для сброса пароля и верификации email
- **CSRF защита**: Встроенная защита от CSRF атак
- **Роли и разрешения**: Гибкая система контроля доступа

## Troubleshooting

### Ошибка "useSidebar must be used within a SidebarProvider"

Убедитесь, что все layout файлы обернуты в `SidebarProvider`:

```tsx
import { SidebarProvider } from "@synoro/ui/components/sidebar";

export default function Layout({ children }) {
  return (
    <SidebarProvider>
      {children}
    </SidebarProvider>
  );
}
```

### Проблемы с аутентификацией

1. **Проверьте переменные окружения** - убедитесь, что `BETTER_AUTH_SECRET` установлен
2. **База данных** - убедитесь, что база данных доступна и схемы созданы
3. **Логи сервера** - проверьте логи на наличие ошибок
4. **Cookies** - убедитесь, что cookies правильно настроены для вашего домена

### Ошибки валидации

- **Пароль**: Минимум 8 символов, максимум 128 символов
- **Email**: Должен быть валидным email адресом
- **Имя**: Обязательно для регистрации

## Разработка

Для локальной разработки:

1. **Запустите базу данных** - PostgreSQL с созданными схемами
2. **Настройте переменные окружения** - создайте `.env.local`
3. **Установите зависимости** - `npm install`
4. **Запустите приложение** - `npm run dev`
5. **Откройте** - `http://localhost:3000`

## Дополнительные возможности

- **Google OAuth** - Вход через Google аккаунт
- **Email OTP** - Вход по коду подтверждения
- **Сброс пароля** - Восстановление доступа через email
- **Верификация email** - Подтверждение email адреса
- **Управление профилем** - Редактирование личной информации
- **Роли и разрешения** - Гибкая система доступа
- **Административная панель** - Управление пользователями и ролями

## Ссылки

- [Better Auth Documentation](https://www.better-auth.com/docs)
- [Email & Password Authentication](https://www.better-auth.com/docs/authentication/email-password)
- [Better Auth GitHub](https://github.com/better-auth/better-auth)
