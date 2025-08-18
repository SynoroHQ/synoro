import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@synoro/ui";
import { Button } from "@synoro/ui";
import { BarChart3, TrendingUp, Calendar, Download, Filter } from "lucide-react";
import Link from "next/link";

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Аналитика</h1>
          <p className="text-muted-foreground">
            Анализ данных и получение инсайтов о вашей жизни
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <Filter className="mr-2 h-4 w-4" />
            Фильтры
          </Button>
          <Button>
            <Download className="mr-2 h-4 w-4" />
            Экспорт
          </Button>
        </div>
      </div>

      {/* Общая статистика */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Всего событий</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">
              За все время
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Активность</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">0%</div>
            <p className="text-xs text-muted-foreground">
              По сравнению с прошлым месяцем
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Среднее в день</CardTitle>
            <Calendar className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">0</div>
            <p className="text-xs text-muted-foreground">
              Событий в день
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Категорий</CardTitle>
            <BarChart3 className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">0</div>
            <p className="text-xs text-muted-foreground">
              Активных категорий
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Основные графики */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Активность по дням</CardTitle>
            <CardDescription>
              График активности за последние 30 дней
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12">
              <BarChart3 className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">Данных пока нет</h3>
              <p className="text-muted-foreground mb-4">
                Добавьте события, чтобы увидеть график активности
              </p>
              <Button asChild>
                <Link href="/events/new">
                  Добавить событие
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Распределение по категориям</CardTitle>
            <CardDescription>
              Круговая диаграмма категорий событий
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12">
              <BarChart3 className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">Категорий нет</h3>
              <p className="text-muted-foreground mb-4">
                Создайте события с категориями для анализа
              </p>
              <Button asChild>
                <Link href="/events/new">
                  Добавить событие
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Финансовая аналитика */}
      <Card>
        <CardHeader>
          <CardTitle>Финансовая аналитика</CardTitle>
          <CardDescription>
            Анализ расходов и доходов по месяцам
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <BarChart3 className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Финансовых данных нет</h3>
            <p className="text-muted-foreground mb-4">
              Добавьте чеки и финансовые события для анализа расходов
            </p>
            <div className="flex justify-center space-x-2">
              <Button asChild>
                <Link href="/receipts/upload">
                  Загрузить чек
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/events/new">
                  Добавить событие
                </Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Инсайты и рекомендации */}
      <Card>
        <CardHeader>
          <CardTitle>Умные инсайты</CardTitle>
          <CardDescription>
            Автоматически сгенерированные рекомендации на основе ваших данных
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <TrendingUp className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Инсайтов пока нет</h3>
            <p className="text-muted-foreground mb-4">
              Система будет генерировать рекомендации после накопления данных
            </p>
            <Button asChild>
              <Link href="/events/new">
                Начать сбор данных
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
