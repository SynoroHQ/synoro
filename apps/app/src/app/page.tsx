"use client";

import Link from "next/link";
import { AuthStatus } from "@/components/auth/auth-status";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { useAuth } from "@/hooks/use-auth";

import { Button } from "@synoro/ui/components/button";

export default function HomePage() {
  const { isAuthenticated, isPending } = useAuth();

  // Если пользователь авторизован, показываем dashboard
  if (isAuthenticated && !isPending) {
    return (
      <ProtectedRoute>
        <DashboardContent />
      </ProtectedRoute>
    );
  }

  // Если пользователь не авторизован, показываем лендинг
  return <LandingPage />;
}

function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center space-x-2">
            <div className="bg-primary text-primary-foreground flex h-8 w-8 items-center justify-center rounded-md">
              <span className="text-lg font-bold">S</span>
            </div>
            <span className="text-xl font-bold">Synoro</span>
          </div>
          <AuthStatus />
        </div>
      </header>

      {/* Main Content */}
      <main className="flex flex-1 flex-col items-center justify-center px-4 py-20">
        <div className="max-w-4xl text-center">
          <h1 className="text-4xl font-bold text-gray-900 sm:text-6xl">
            Добро пожаловать в <span className="text-blue-600">Synoro</span>
          </h1>
          <p className="mt-6 text-lg text-gray-600 sm:text-xl">
            Мониторинг и статус страницы для ваших сервисов. Отслеживайте
            доступность, получайте уведомления и держите пользователей в курсе
            состояния ваших сервисов.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button asChild size="lg">
              <Link href="/auth/register">Начать бесплатно</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/auth/login">Войти</Link>
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}

function DashboardContent() {
  const { user } = useAuth();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Добро пожаловать в панель управления
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="bg-card rounded-lg border p-6">
          <h3 className="text-lg font-semibold">Профиль</h3>
          <p className="text-muted-foreground mt-2">Имя: {user?.name}</p>
          <p className="text-muted-foreground">Email: {user?.email}</p>
        </div>

        <div className="bg-card rounded-lg border p-6">
          <h3 className="text-lg font-semibold">Статистика</h3>
          <p className="text-muted-foreground mt-2">Мониторы: 0</p>
          <p className="text-muted-foreground">Статус страницы: 0</p>
        </div>

        <div className="bg-card rounded-lg border p-6">
          <h3 className="text-lg font-semibold">Быстрые действия</h3>
          <div className="mt-4 space-y-2">
            <a
              href="/monitors/new"
              className="bg-primary text-primary-foreground hover:bg-primary/90 block rounded-md px-3 py-2 text-sm"
            >
              Создать монитор
            </a>
            <a
              href="/status-pages/new"
              className="bg-secondary text-secondary-foreground hover:bg-secondary/80 block rounded-md px-3 py-2 text-sm"
            >
              Создать статус страницу
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
