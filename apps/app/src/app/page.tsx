"use client";

import Link from "next/link";
import { Button } from "@synoro/ui";
import { useSession } from "@synoro/auth/client";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
                  Synoro
                </h1>
                <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400">
                  Интеллектуальный ассистент для управления жизненными событиями, задачами и аналитики
                </p>
              </div>
              <div className="space-x-4">
                <Link href="/auth/register">
                  <Button size="lg">Начать бесплатно</Button>
                </Link>
                <Link href="/auth/login">
                  <Button variant="outline" size="lg">
                    Войти в систему
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="w-full py-12 md:py-24 lg:py-32 bg-gray-100 dark:bg-gray-800">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12">
              <div className="space-y-4">
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">
                  Что такое Synoro?
                </h2>
                <p className="text-gray-500 md:text-xl dark:text-gray-400">
                  Synoro - это универсальный цифровой мозг для дома, который помогает:
                </p>
                <ul className="space-y-2 text-gray-500 dark:text-gray-400">
                  <li>• Логировать все важные жизненные события</li>
                  <li>• Анализировать данные и выявлять паттерны</li>
                  <li>• Помогать принимать обоснованные решения</li>
                  <li>• Управлять задачами и напоминаниями</li>
                  <li>• Отслеживать финансы и расходы</li>
                </ul>
              </div>
              <div className="space-y-4">
                <h3 className="text-2xl font-bold tracking-tighter">
                  Основные возможности
                </h3>
                <div className="grid gap-4">
                  <div className="space-y-2">
                    <h4 className="font-semibold">📱 Telegram Bot</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Голосовые и текстовые сообщения, обработка фото чеков
                    </p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-semibold">🌐 Веб-интерфейс</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Удобное управление через браузер
                    </p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-semibold">📊 Аналитика</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Визуализация данных и умные рекомендации
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
