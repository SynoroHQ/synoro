import type { Metadata } from "next";
import Link from "next/link";
import { Calendar, CheckSquare, Plus, Search } from "lucide-react";

import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@synoro/ui";

export const metadata: Metadata = {
  title: "Задачи",
  description:
    "Управление задачами, напоминаниями и планами в Synoro. Организуйте свою работу и отслеживайте прогресс.",
  keywords: [
    "Synoro",
    "задачи",
    "планирование",
    "напоминания",
    "управление проектами",
    "трекинг",
    "продуктивность",
  ],
  robots: {
    index: false,
    follow: false,
  },
};

export default function TasksPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Задачи</h1>
          <p className="text-muted-foreground">
            Управление задачами, напоминаниями и планами
          </p>
        </div>
        <Button asChild>
          <Link href="/tasks/new">
            <Plus className="mr-2 h-4 w-4" />
            Создать задачу
          </Link>
        </Button>
      </div>

      {/* Поиск и фильтры */}
      <Card>
        <CardHeader>
          <CardTitle>Поиск задач</CardTitle>
          <CardDescription>
            Найдите нужные задачи по названию, статусу или приоритету
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-4">
            <div className="relative flex-1">
              <Search className="text-muted-foreground absolute top-3 left-3 h-4 w-4" />
              <input
                type="text"
                placeholder="Поиск по задачам..."
                className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring w-full rounded-md border px-10 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
            <Button variant="outline">Фильтры</Button>
          </div>
        </CardContent>
      </Card>

      {/* Статус задач */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Всего задач</CardTitle>
            <CheckSquare className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-muted-foreground text-xs">Всего создано</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">В работе</CardTitle>
            <CheckSquare className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">0</div>
            <p className="text-muted-foreground text-xs">Активных задач</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Выполнено</CardTitle>
            <CheckSquare className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">0</div>
            <p className="text-muted-foreground text-xs">Завершенных</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Просрочено</CardTitle>
            <CheckSquare className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">0</div>
            <p className="text-muted-foreground text-xs">Просроченных</p>
          </CardContent>
        </Card>
      </div>

      {/* Список задач */}
      <Card>
        <CardHeader>
          <CardTitle>Активные задачи</CardTitle>
          <CardDescription>Ваши текущие задачи и напоминания</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="py-12 text-center">
            <CheckSquare className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
            <h3 className="mb-2 text-lg font-medium">Задач пока нет</h3>
            <p className="text-muted-foreground mb-4">
              Создайте первую задачу, чтобы начать планировать свои дела
            </p>
            <Button asChild>
              <Link href="/tasks/new">
                <Plus className="mr-2 h-4 w-4" />
                Создать первую задачу
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Календарь задач */}
      <Card>
        <CardHeader>
          <CardTitle>Календарь задач</CardTitle>
          <CardDescription>
            Планирование задач по дням и неделям
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="py-12 text-center">
            <Calendar className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
            <h3 className="mb-2 text-lg font-medium">Календарь пуст</h3>
            <p className="text-muted-foreground mb-4">
              Добавьте задачи с датами, чтобы увидеть их в календаре
            </p>
            <Button asChild>
              <Link href="/tasks/new">
                <Plus className="mr-2 h-4 w-4" />
                Добавить задачу
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
