"use client";

import { useState } from "react";
import {
  Bot,
  Calendar,
  CheckCircle,
  Mail,
  Settings,
  Telegram,
  XCircle,
} from "lucide-react";

import { Badge } from "@synoro/ui/components/badge";
import { Button } from "@synoro/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@synoro/ui/components/card";
import { Input } from "@synoro/ui/components/input";
import { Label } from "@synoro/ui/components/label";
import { Separator } from "@synoro/ui/components/separator";
import { Switch } from "@synoro/ui/components/switch";

export function IntegrationsForm() {
  const [telegramEnabled, setTelegramEnabled] = useState(true);
  const [googleCalendarEnabled, setGoogleCalendarEnabled] = useState(false);
  const [emailEnabled, setEmailEnabled] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    setIsLoading(true);
    // TODO: Implement save logic
    setTimeout(() => setIsLoading(false), 1000);
  };

  return (
    <div className="space-y-6">
      {/* Telegram Integration */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="rounded-lg bg-blue-100 p-2">
                <Telegram className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <CardTitle className="flex items-center space-x-2">
                  Telegram Bot
                  <Badge variant={telegramEnabled ? "default" : "secondary"}>
                    {telegramEnabled ? "Подключено" : "Отключено"}
                  </Badge>
                </CardTitle>
                <CardDescription>
                  Получайте уведомления и управляйте задачами через Telegram
                </CardDescription>
              </div>
            </div>
            <Switch
              checked={telegramEnabled}
              onCheckedChange={setTelegramEnabled}
            />
          </div>
        </CardHeader>
        {telegramEnabled && (
          <CardContent className="space-y-4">
            <Separator />
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="telegram-bot">Bot Token</Label>
                <div className="flex space-x-2">
                  <Input
                    id="telegram-bot"
                    type="password"
                    placeholder="1234567890:ABCdefGHIjklMNOpqrsTUVwxyz"
                    defaultValue="1234567890:ABCdefGHIjklMNOpqrsTUVwxyz"
                  />
                  <Button variant="outline" size="sm">
                    <Settings className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="telegram-chat">Chat ID</Label>
                <Input
                  id="telegram-chat"
                  placeholder="123456789"
                  defaultValue="123456789"
                />
              </div>
            </div>
            <div className="flex items-center space-x-2 text-sm text-green-600">
              <CheckCircle className="h-4 w-4" />
              <span>Бот успешно подключен и работает</span>
            </div>
            <div className="text-muted-foreground text-sm">
              <p>• Автоматический импорт сообщений из Telegram</p>
              <p>• Уведомления о задачах и напоминаниях</p>
              <p>• Быстрое добавление задач через бота</p>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Google Calendar Integration */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="rounded-lg bg-red-100 p-2">
                <Calendar className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <CardTitle className="flex items-center space-x-2">
                  Google Calendar
                  <Badge
                    variant={googleCalendarEnabled ? "default" : "secondary"}
                  >
                    {googleCalendarEnabled ? "Подключено" : "Отключено"}
                  </Badge>
                </CardTitle>
                <CardDescription>
                  Синхронизируйте задачи с Google Calendar
                </CardDescription>
              </div>
            </div>
            <Switch
              checked={googleCalendarEnabled}
              onCheckedChange={setGoogleCalendarEnabled}
            />
          </div>
        </CardHeader>
        {googleCalendarEnabled && (
          <CardContent className="space-y-4">
            <Separator />
            <div className="space-y-4">
              <div className="flex items-center space-x-2 text-sm text-blue-600">
                <Bot className="h-4 w-4" />
                <span>
                  Для подключения Google Calendar необходимо авторизоваться
                </span>
              </div>
              <Button className="w-full">Подключить Google Calendar</Button>
            </div>
          </CardContent>
        )}
        {!googleCalendarEnabled && (
          <CardContent>
            <div className="text-muted-foreground text-sm">
              <p>• Синхронизация задач с календарем</p>
              <p>• Автоматическое создание событий</p>
              <p>• Управление расписанием</p>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Email Integration */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="rounded-lg bg-green-100 p-2">
                <Mail className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <CardTitle className="flex items-center space-x-2">
                  Email уведомления
                  <Badge variant={emailEnabled ? "default" : "secondary"}>
                    {emailEnabled ? "Включено" : "Отключено"}
                  </Badge>
                </CardTitle>
                <CardDescription>
                  Получайте уведомления на email
                </CardDescription>
              </div>
            </div>
            <Switch checked={emailEnabled} onCheckedChange={setEmailEnabled} />
          </div>
        </CardHeader>
        {emailEnabled && (
          <CardContent className="space-y-4">
            <Separator />
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Email для уведомлений</Label>
                  <div className="flex items-center space-x-2">
                    <Input value="ivan@example.com" disabled />
                    <Badge variant="default">Основной</Badge>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Частота уведомлений</Label>
                  <select className="border-input w-full rounded-md border px-3 py-2">
                    <option>Ежедневно</option>
                    <option>Еженедельно</option>
                    <option>Только важные</option>
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Типы уведомлений</Label>
                <div className="space-y-2">
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" defaultChecked />
                    <span className="text-sm">Напоминания о задачах</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" defaultChecked />
                    <span className="text-sm">Еженедельные отчеты</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" />
                    <span className="text-sm">Новости и обновления</span>
                  </label>
                </div>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={isLoading}>
          {isLoading ? "Сохранение..." : "Сохранить настройки"}
        </Button>
      </div>
    </div>
  );
}
