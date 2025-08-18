import { Metadata } from "next";
import Link from "next/link";
import {
  BarChart3,
  Bot,
  Calendar,
  FileText,
  Receipt,
  Settings,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@synoro/ui";

export const metadata: Metadata = {
  title: "Панель управления",
  description: "Панель управления Synoro - ваш персональный цифровой ассистент для управления жизненными событиями, задачами и аналитики",
  keywords: [
    "Synoro",
    "панель управления",
    "дашборд",
    "события",
    "задачи",
    "аналитика",
    "личный кабинет"
  ],
  robots: {
    index: false,
    follow: false,
  },
};

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Панель управления Synoro</h1>
        <p className="text-muted-foreground">
          Добро пожаловать в ваш персональный цифровой ассистент
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* События */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              События сегодня
            </CardTitle>
            <FileText className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-muted-foreground text-xs">
              Новых событий за сегодня
            </p>
          </CardContent>
        </Card>

        {/* Задачи */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Активные задачи
            </CardTitle>
            <Calendar className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-muted-foreground text-xs">Задач в работе</p>
          </CardContent>
        </Card>

        {/* Аналитика */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Аналитика</CardTitle>
            <BarChart3 className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-muted-foreground text-xs">Отчетов готово</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Быстрые действия */}
        <Card>
          <CardHeader>
            <CardTitle>Быстрые действия</CardTitle>
            <CardDescription>
              Основные функции для работы с системой
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3">
              <Link
                href="/events/new"
                className="hover:bg-accent flex items-center space-x-3 rounded-lg border p-3 transition-colors"
              >
                <FileText className="h-5 w-5" />
                <div>
                  <p className="font-medium">Добавить событие</p>
                  <p className="text-muted-foreground text-sm">
                    Записать новое жизненное событие
                  </p>
                </div>
              </Link>

              <Link
                href="/tasks/new"
                className="hover:bg-accent flex items-center space-x-3 rounded-lg border p-3 transition-colors"
              >
                <Calendar className="h-5 w-5" />
                <div>
                  <p className="font-medium">Создать задачу</p>
                  <p className="text-muted-foreground text-sm">
                    Добавить новую задачу или напоминание
                  </p>
                </div>
              </Link>

              <Link
                href="/receipts/upload"
                className="hover:bg-accent flex items-center space-x-3 rounded-lg border p-3 transition-colors"
              >
                <Receipt className="h-5 w-5" />
                <div>
                  <p className="font-medium">Загрузить чек</p>
                  <p className="text-muted-foreground text-sm">
                    Обработать фото чека через OCR
                  </p>
                </div>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Статистика */}
        <Card>
          <CardHeader>
            <CardTitle>Статистика</CardTitle>
            <CardDescription>Обзор вашей активности в системе</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Всего событий</span>
                <span className="text-2xl font-bold">0</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Задач выполнено</span>
                <span className="text-2xl font-bold">0</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Дней в системе</span>
                <span className="text-2xl font-bold">0</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Интеграции */}
      <Card>
        <CardHeader>
          <CardTitle>Интеграции</CardTitle>
          <CardDescription>Подключенные сервисы и настройки</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex items-center space-x-3 rounded-lg border p-3">
              <Bot className="h-5 w-5 text-green-600" />
              <div>
                <p className="font-medium">Telegram Bot</p>
                <p className="text-muted-foreground text-sm">
                  Подключен и активен
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3 rounded-lg border p-3">
              <Settings className="h-5 w-5 text-blue-600" />
              <div>
                <p className="font-medium">Настройки</p>
                <p className="text-muted-foreground text-sm">
                  <Link
                    href="/settings"
                    className="text-blue-600 hover:underline"
                  >
                    Настроить профиль
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
