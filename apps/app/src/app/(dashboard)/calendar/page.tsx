import { Metadata } from "next";
import Link from "next/link";
import { Calendar, Download, Filter, Plus } from "lucide-react";

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
  title: "Календарь",
  description:
    "Планирование и просмотр событий по дням, неделям и месяцам в Synoro. Организуйте свое время эффективно.",
  keywords: [
    "Synoro",
    "календарь",
    "планирование",
    "события",
    "задачи",
    "расписание",
    "временное управление",
    "организация",
  ],
  robots: {
    index: false,
    follow: false,
  },
};

export default function CalendarPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            Календарь
            <Badge className="from-primary via-accent to-primary text-primary-foreground border-primary-foreground/20 ml-3 inline-flex items-center rounded-full border-2 bg-gradient-to-r px-2 py-1 text-xs font-medium shadow-sm backdrop-blur-sm">
              Beta
            </Badge>
          </h1>
          <p className="text-muted-foreground">
            Планирование и просмотр событий по дням, неделям и месяцам
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <Filter className="mr-2 h-4 w-4" />
            Фильтры
          </Button>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Добавить событие
          </Button>
        </div>
      </div>

      {/* Вид календаря */}
      <div className="flex space-x-2">
        <Button variant="outline" className="flex-1">
          День
        </Button>
        <Button variant="outline" className="flex-1">
          Неделя
        </Button>
        <Button className="flex-1">Месяц</Button>
        <Button variant="outline" className="flex-1">
          Год
        </Button>
      </div>

      {/* Основной календарь */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Декабрь 2024</CardTitle>
              <CardDescription>Календарь событий и задач</CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm">
                <Calendar className="mr-2 h-4 w-4" />
                Сегодня
              </Button>
              <Button variant="outline" size="sm">
                <Download className="mr-2 h-4 w-4" />
                Экспорт
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="py-12 text-center">
            <Calendar className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
            <h3 className="mb-2 text-lg font-medium">Календарь пуст</h3>
            <p className="text-muted-foreground mb-4">
              Добавьте события с датами, чтобы увидеть их в календаре
            </p>
            <div className="flex justify-center space-x-2">
              <Button asChild>
                <Link href="/events/new">
                  <Plus className="mr-2 h-4 w-4" />
                  Добавить событие
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/tasks/new">
                  <Plus className="mr-2 h-4 w-4" />
                  Создать задачу
                </Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Ближайшие события */}
      <Card>
        <CardHeader>
          <CardTitle>Ближайшие события</CardTitle>
          <CardDescription>События и задачи на ближайшие дни</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="py-12 text-center">
            <Calendar className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
            <h3 className="mb-2 text-lg font-medium">Событий нет</h3>
            <p className="text-muted-foreground mb-4">
              Запланируйте события, чтобы увидеть их здесь
            </p>
            <Button asChild>
              <Link href="/events/new">
                <Plus className="mr-2 h-4 w-4" />
                Добавить событие
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Статистика календаря */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Событий в этом месяце
            </CardTitle>
            <Calendar className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-muted-foreground text-xs">Запланировано</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Задач на этой неделе
            </CardTitle>
            <Calendar className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">0</div>
            <p className="text-muted-foreground text-xs">К выполнению</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Напоминаний</CardTitle>
            <Calendar className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">0</div>
            <p className="text-muted-foreground text-xs">Активных</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
