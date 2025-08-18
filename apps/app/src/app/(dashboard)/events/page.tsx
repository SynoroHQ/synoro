import { Metadata } from "next";
import Link from "next/link";
import { FileText, Plus, Search } from "lucide-react";

import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@synoro/ui";

export const metadata: Metadata = {
  title: "События",
  description: "Управление жизненными событиями и записями в Synoro. Отслеживайте важные моменты жизни и анализируйте паттерны.",
  keywords: [
    "Synoro",
    "события",
    "жизненные события",
    "записи",
    "аналитика",
    "паттерны",
    "управление"
  ],
  robots: {
    index: false,
    follow: false,
  },
};

export default function EventsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">События</h1>
          <p className="text-muted-foreground">
            Управление жизненными событиями и записями
          </p>
        </div>
        <Button asChild>
          <Link href="/events/new">
            <Plus className="mr-2 h-4 w-4" />
            Добавить событие
          </Link>
        </Button>
      </div>

      {/* Поиск и фильтры */}
      <Card>
        <CardHeader>
          <CardTitle>Поиск событий</CardTitle>
          <CardDescription>
            Найдите нужные события по ключевым словам, дате или категории
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-4">
            <div className="relative flex-1">
              <Search className="text-muted-foreground absolute top-3 left-3 h-4 w-4" />
              <input
                type="text"
                placeholder="Поиск по событиям..."
                className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring w-full rounded-md border px-10 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
            <Button variant="outline">Фильтры</Button>
          </div>
        </CardContent>
      </Card>

      {/* Список событий */}
      <Card>
        <CardHeader>
          <CardTitle>Последние события</CardTitle>
          <CardDescription>
            Ваши недавно добавленные жизненные события
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="py-12 text-center">
            <FileText className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
            <h3 className="mb-2 text-lg font-medium">Событий пока нет</h3>
            <p className="text-muted-foreground mb-4">
              Начните добавлять события, чтобы отслеживать важные моменты жизни
            </p>
            <Button asChild>
              <Link href="/events/new">
                <Plus className="mr-2 h-4 w-4" />
                Добавить первое событие
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Статистика */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Всего событий</CardTitle>
            <FileText className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-muted-foreground text-xs">За все время</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Событий сегодня
            </CardTitle>
            <FileText className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-muted-foreground text-xs">За сегодня</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Категорий</CardTitle>
            <FileText className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-muted-foreground text-xs">Активных категорий</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
