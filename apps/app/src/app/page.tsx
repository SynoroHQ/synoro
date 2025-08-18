import Link from "next/link";
import { AuthStatus } from "@/components/auth/auth-status";

import { Button } from "@synoro/ui/components/button";

export default function HomePage() {
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
          <div className="mt-8">
            <Link
              href="/dashboard"
              className="text-blue-600 hover:text-blue-800 hover:underline"
            >
              Перейти к Dashboard →
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
