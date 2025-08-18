# 🚀 Быстрый запуск аутентификации

## ✅ Что готово

- **Система аутентификации** полностью интегрирована с `@synoro/auth`
- **Формы** используют `react-hook-form` + `zod` валидацию
- **Защита маршрутов** через middleware и компоненты
- **UI компоненты** в стиле shadcn/ui
- **API роуты** настроены и работают

## 🔧 Настройка

### 1. Переменные окружения

Создайте `.env.local` в папке `apps/app/`:

```bash
# Обязательно
BETTER_AUTH_SECRET=your-secret-key-here
BETTER_AUTH_URL=http://localhost:3000

# Опционально
AUTH_GOOGLE_CLIENT_ID=your-google-client-id
AUTH_GOOGLE_CLIENT_SECRET=your-google-client-secret
AUTH_DOMAIN=localhost
RESEND_API_KEY=your-resend-api-key
DATABASE_URL=postgresql://username:password@localhost:5432/synoro
```

### 2. Генерация секретного ключа

```bash
openssl rand -base64 32
```

## 🚀 Запуск

### Разработка

```bash
bun run dev
```

### Продакшен сборка

```bash
bun run build
bun run start
```

## 🧪 Тестирование

1. **Главная страница**: `http://localhost:3000`
2. **Регистрация**: `http://localhost:3000/auth/register`
3. **Вход**: `http://localhost:3000/auth/login`
4. **Dashboard**: `http://localhost:3000/dashboard` (требует авторизации)

## 📁 Структура

```
src/
├── app/
│   ├── (auth)/auth/           # Страницы аутентификации
│   ├── api/auth/[...auth]/    # API роут аутентификации
│   ├── dashboard/             # Защищенная страница
│   └── layout.tsx             # С AuthProvider
├── components/auth/            # UI компоненты
├── features/auth/              # Формы и логика
├── hooks/use-auth.ts          # Хук аутентификации
├── providers/auth-provider.tsx # Провайдер
└── middleware.ts               # Защита маршрутов
```

## 🎯 Основные функции

- ✅ **Регистрация** - создание аккаунта
- ✅ **Вход** - аутентификация
- ✅ **Верификация email** - через OTP
- ✅ **Восстановление пароля** - сброс через email
- ✅ **Смена пароля** - для авторизованных
- ✅ **Выход** - завершение сессии
- ✅ **Защита маршрутов** - middleware + компоненты
- ✅ **Управление ролями** - система разрешений

## 🔐 Использование в коде

### Защита страниц

```tsx
import { ProtectedRoute } from "@/components/auth/protected-route";

export default function MyPage() {
  return (
    <ProtectedRoute>
      <MyContent />
    </ProtectedRoute>
  );
}
```

### Хук аутентификации

```tsx
import { useAuth } from "@/hooks/use-auth";

function MyComponent() {
  const { user, isAuthenticated, logout } = useAuth();

  if (!isAuthenticated) return <div>Войдите в систему</div>;

  return <div>Привет, {user?.firstName}!</div>;
}
```

## 🎉 Готово к использованию!

Система аутентификации полностью настроена и готова к работе.
Все формы интегрированы с `@synoro/auth`, используют современные технологии
и следуют лучшим практикам безопасности.
