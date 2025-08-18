import {
  Bot,
  Calendar,
  CheckCircle,
  Clock,
  FileText,
  Smartphone,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";

import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@synoro/ui";

import { dashboardMetadata } from "./metadata";

export const metadata = dashboardMetadata;

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
      {/* Hero Section */}
      <div className="relative overflow-hidden border-b bg-white dark:bg-slate-900">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-6xl dark:text-white">
              Добро пожаловать в{" "}
              <span className="text-blue-600 dark:text-blue-400">Synoro</span>
            </h1>
            <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-slate-600 dark:text-slate-300">
              Ваш интеллектуальный ассистент для управления жизненными
              событиями, задачами и аналитики. Универсальный цифровой мозг для
              дома.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                <Bot className="mr-2 h-5 w-5" />
                Начать работу
              </Button>
              <Button variant="outline" size="lg">
                <FileText className="mr-2 h-5 w-5" />
                Документация
              </Button>
            </div>
          </div>
        </div>

        {/* Background decoration */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute top-0 left-[max(50%,25rem)] h-[64rem] w-[128rem] -translate-x-1/2 [mask-image:radial-gradient(64rem_64rem_at_top,white,transparent)] stroke-slate-200 dark:stroke-slate-700">
            <defs>
              <pattern
                id="hero-pattern"
                width="200"
                height="200"
                x="50%"
                y="-1"
                patternUnits="userSpaceOnUse"
              >
                <path d="M.5 200V.5H200" fill="none" />
              </pattern>
            </defs>
            <svg
              x="50%"
              y="-1"
              className="overflow-visible fill-slate-50 dark:fill-slate-900"
            >
              <path
                d="M-200 0h201v201h-201Z M600 0h201v201h-201Z M-400 600h201v201h-201Z M200 800h201v201h-201Z"
                strokeWidth="0"
              />
            </svg>
            <rect
              width="100%"
              height="100%"
              strokeWidth="0"
              fill="url(#hero-pattern)"
            />
          </div>
        </div>
      </div>

      {/* Main Dashboard Content */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Quick Stats */}
        <div className="mb-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card className="border-0 bg-white shadow-lg dark:bg-slate-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                Активные задачи
              </CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900 dark:text-white">
                12
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                +2 с прошлой недели
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 bg-white shadow-lg dark:bg-slate-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                Предстоящие события
              </CardTitle>
              <Calendar className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900 dark:text-white">
                8
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                На этой неделе
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 bg-white shadow-lg dark:bg-slate-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                Члены семьи
              </CardTitle>
              <Users className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900 dark:text-white">
                4
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Активные пользователи
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 bg-white shadow-lg dark:bg-slate-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                Продуктивность
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900 dark:text-white">
                87%
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                +5% с прошлого месяца
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Features Grid */}
        <div className="mb-12 grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Tasks Management */}
          <Card className="border-0 bg-white shadow-lg dark:bg-slate-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                Управление задачами
              </CardTitle>
              <CardDescription>
                Создавайте, отслеживайте и управляйте задачами для всей семьи
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between rounded-lg bg-slate-50 p-3 dark:bg-slate-700">
                  <span className="text-sm font-medium">Покупки</span>
                  <span className="text-xs text-slate-500">Сегодня</span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-slate-50 p-3 dark:bg-slate-700">
                  <span className="text-sm font-medium">Уборка</span>
                  <span className="text-xs text-slate-500">Завтра</span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-slate-50 p-3 dark:bg-slate-700">
                  <span className="text-sm font-medium">Оплата счетов</span>
                  <span className="text-xs text-slate-500">Через 3 дня</span>
                </div>
              </div>
              <Button className="mt-4 w-full" variant="outline">
                Посмотреть все задачи
              </Button>
            </CardContent>
          </Card>

          {/* Events Calendar */}
          <Card className="border-0 bg-white shadow-lg dark:bg-slate-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-blue-600" />
                Календарь событий
              </CardTitle>
              <CardDescription>
                Планируйте и организуйте важные события и встречи
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between rounded-lg bg-slate-50 p-3 dark:bg-slate-700">
                  <span className="text-sm font-medium">Встреча с врачом</span>
                  <span className="text-xs text-slate-500">15:00</span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-slate-50 p-3 dark:bg-slate-700">
                  <span className="text-sm font-medium">
                    День рождения мамы
                  </span>
                  <span className="text-xs text-slate-500">18:00</span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-slate-50 p-3 dark:bg-slate-700">
                  <span className="text-sm font-medium">
                    Родительское собрание
                  </span>
                  <span className="text-xs text-slate-500">19:30</span>
                </div>
              </div>
              <Button className="mt-4 w-full" variant="outline">
                Открыть календарь
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* AI Assistant Section */}
        <Card className="border-0 bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Bot className="h-6 w-6" />
              ИИ Ассистент Synoro
            </CardTitle>
            <CardDescription className="text-blue-100">
              Ваш персональный помощник для решения повседневных задач
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="rounded-lg bg-white/10 p-4 text-center">
                <Smartphone className="mx-auto mb-2 h-8 w-8" />
                <h4 className="font-semibold">Telegram Bot</h4>
                <p className="text-sm text-blue-100">
                  Управление через мессенджер
                </p>
              </div>
              <div className="rounded-lg bg-white/10 p-4 text-center">
                <Zap className="mx-auto mb-2 h-8 w-8" />
                <h4 className="font-semibold">Голосовые команды</h4>
                <p className="text-sm text-blue-100">
                  Быстрое управление голосом
                </p>
              </div>
              <div className="rounded-lg bg-white/10 p-4 text-center">
                <FileText className="mx-auto mb-2 h-8 w-8" />
                <h4 className="font-semibold">OCR документы</h4>
                <p className="text-sm text-blue-100">Автоматическое чтение</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="secondary" className="flex-1">
                Начать чат
              </Button>
              <Button
                variant="outline"
                className="flex-1 border-white text-white hover:bg-white hover:text-blue-600"
              >
                Узнать больше
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <div className="mt-12">
          <h2 className="mb-6 text-2xl font-bold text-slate-900 dark:text-white">
            Последняя активность
          </h2>
          <div className="space-y-4">
            {[
              {
                action: "Задача выполнена",
                details: "Покупки",
                time: "2 минуты назад",
                icon: CheckCircle,
                color: "text-green-600",
              },
              {
                action: "Новое событие",
                details: "Встреча с врачом",
                time: "1 час назад",
                icon: Calendar,
                color: "text-blue-600",
              },
              {
                action: "Добавлен член семьи",
                details: "Анна",
                time: "3 часа назад",
                icon: Users,
                color: "text-purple-600",
              },
              {
                action: "Получен чек",
                details: "Супермаркет",
                time: "5 часов назад",
                icon: FileText,
                color: "text-orange-600",
              },
            ].map((item, index) => (
              <div
                key={index}
                className="flex items-center gap-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800"
              >
                <div
                  className={`rounded-full bg-slate-100 p-2 dark:bg-slate-700`}
                >
                  <item.icon className={`h-5 w-5 ${item.color}`} />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-slate-900 dark:text-white">
                    {item.action}
                  </p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {item.details}
                  </p>
                </div>
                <span className="text-xs text-slate-500">{item.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
