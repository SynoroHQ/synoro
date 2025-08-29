import Link from "next/link";
import {
  Bot,
  MessageCircle,
  Settings,
  Smartphone,
  Webhook,
} from "lucide-react";

import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@synoro/ui";

export default function TelegramPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Telegram Bot</h1>
          <p className="text-muted-foreground">
            Управление интеграцией с Telegram для удобного ввода событий
          </p>
        </div>
        <Button>
          <Settings className="mr-2 h-4 w-4" />
          Настройки
        </Button>
      </div>

      {/* Статус бота */}
      <Card>
        <CardHeader>
          <CardTitle>Статус бота</CardTitle>
          <CardDescription>
            Текущее состояние интеграции с Telegram
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="h-3 w-3 rounded-full bg-green-500" />
              <span className="text-sm font-medium">Бот активен</span>
            </div>
            <span className="text-muted-foreground text-sm">
              Последняя активность: 2 минуты назад
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Основные возможности */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Текстовые сообщения</CardTitle>
            <CardDescription>
              Обработка текстовых команд и событий
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-3">
              <MessageCircle className="h-5 w-5 text-blue-600" />
              <div>
                <p className="font-medium">Команды</p>
                <p className="text-muted-foreground text-sm">
                  /start, /help, /status
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <MessageCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="font-medium">События</p>
                <p className="text-muted-foreground text-sm">
                  "Купил хлеб за 50₽"
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <MessageCircle className="h-5 w-5 text-purple-600" />
              <div>
                <p className="font-medium">Задачи</p>
                <p className="text-muted-foreground text-sm">
                  "Завтра сходить в магазин"
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Голосовые сообщения</CardTitle>
            <CardDescription>
              Автоматическая транскрипция и обработка
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-3">
              <Smartphone className="h-5 w-5 text-blue-600" />
              <div>
                <p className="font-medium">Запись</p>
                <p className="text-muted-foreground text-sm">
                  Отправьте голосовое сообщение
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Smartphone className="h-5 w-5 text-green-600" />
              <div>
                <p className="font-medium">Транскрипция</p>
                <p className="text-muted-foreground text-sm">
                  Автоматический перевод в текст
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Smartphone className="h-5 w-5 text-purple-600" />
              <div>
                <p className="font-medium">Обработка</p>
                <p className="text-muted-foreground text-sm">
                  Создание события из транскрипции
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Статистика использования */}
      <Card>
        <CardHeader>
          <CardTitle>Статистика использования</CardTitle>
          <CardDescription>
            Анализ активности бота за последние 30 дней
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-4">
            <div className="text-center">
              <div className="text-2xl font-bold">0</div>
              <p className="text-muted-foreground text-sm">Сообщений</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">0</div>
              <p className="text-muted-foreground text-sm">Событий создано</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">0</div>
              <p className="text-muted-foreground text-sm">Задач добавлено</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">0</div>
              <p className="text-muted-foreground text-sm">Голосовых</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Настройки и интеграция */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Настройки бота</CardTitle>
            <CardDescription>Конфигурация и персонализация</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm">Уведомления</span>
              <Button variant="outline" size="sm">
                Настроить
              </Button>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Автоответы</span>
              <Button variant="outline" size="sm">
                Настроить
              </Button>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Язык</span>
              <Button variant="outline" size="sm">
                Русский
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Webhook настройки</CardTitle>
            <CardDescription>
              Конфигурация для получения обновлений
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-3">
              <Webhook className="h-5 w-5 text-blue-600" />
              <div>
                <p className="font-medium">URL</p>
                <p className="text-muted-foreground text-sm">
                  https://api.synoro.dev/webhook/telegram
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Webhook className="h-5 w-5 text-green-600" />
              <div>
                <p className="font-medium">Статус</p>
                <p className="text-muted-foreground text-sm">Активен</p>
              </div>
            </div>
            <Button variant="outline" size="sm" className="w-full">
              <Webhook className="mr-2 h-4 w-4" />
              Обновить webhook
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Инструкции по использованию */}
      <Card>
        <CardHeader>
          <CardTitle>Как использовать бота</CardTitle>
          <CardDescription>
            Краткое руководство по основным командам
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <h4 className="font-medium">Основные команды</h4>
                <ul className="text-muted-foreground space-y-1 text-sm">
                  <li>
                    • <code>/start</code> - Начать работу с ботом
                  </li>
                  <li>
                    • <code>/help</code> - Показать справку
                  </li>
                  <li>
                    • <code>/status</code> - Статус системы
                  </li>
                  <li>
                    • <code>/events</code> - Последние события
                  </li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium">Примеры событий</h4>
                <ul className="text-muted-foreground space-y-1 text-sm">
                  <li>• "Купил хлеб за 50₽"</li>
                  <li>• "Завтра встреча в 15:00"</li>
                  <li>• "Полил цветы"</li>
                  <li>• "Заплатил за интернет 1000₽"</li>
                </ul>
              </div>
            </div>
            <div className="border-t pt-4">
              <p className="text-muted-foreground text-sm">
                <strong>Совет:</strong> Отправляйте голосовые сообщения для
                быстрого добавления событий. Бот автоматически переведет их в
                текст и создаст записи.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
