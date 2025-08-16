"use client";

import { useState } from "react";
import {
  AlertTriangle,
  Eye,
  EyeOff,
  Key,
  Lock,
  Shield,
  Smartphone,
} from "lucide-react";

import { Alert, AlertDescription } from "@synoro/ui/components/alert";
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

export function SecurityForm() {
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // TODO: Implement password change logic
    setTimeout(() => setIsLoading(false), 1000);
  };

  return (
    <div className="space-y-6">
      {/* Password Change */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-3">
            <div className="rounded-lg bg-blue-100 p-2">
              <Lock className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <CardTitle>Смена пароля</CardTitle>
              <CardDescription>
                Обновите пароль для повышения безопасности аккаунта
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Текущий пароль</Label>
              <div className="relative">
                <Lock className="text-muted-foreground absolute top-3 left-3 h-4 w-4" />
                <Input
                  id="currentPassword"
                  type={showCurrentPassword ? "text" : "password"}
                  placeholder="Введите текущий пароль"
                  className="pr-10 pl-10"
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute top-0 right-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                >
                  {showCurrentPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="newPassword">Новый пароль</Label>
              <div className="relative">
                <Lock className="text-muted-foreground absolute top-3 left-3 h-4 w-4" />
                <Input
                  id="newPassword"
                  type={showNewPassword ? "text" : "password"}
                  placeholder="Создайте новый пароль"
                  className="pr-10 pl-10"
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute top-0 right-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                >
                  {showNewPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <p className="text-muted-foreground text-xs">
                Пароль должен содержать минимум 8 символов, включая буквы и
                цифры
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Подтвердите новый пароль</Label>
              <div className="relative">
                <Lock className="text-muted-foreground absolute top-3 left-3 h-4 w-4" />
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Повторите новый пароль"
                  className="pr-10 pl-10"
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute top-0 right-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Смена пароля..." : "Сменить пароль"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Two-Factor Authentication */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="rounded-lg bg-green-100 p-2">
                <Smartphone className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <CardTitle className="flex items-center space-x-2">
                  Двухфакторная аутентификация
                  <Badge variant={twoFactorEnabled ? "default" : "secondary"}>
                    {twoFactorEnabled ? "Включена" : "Отключена"}
                  </Badge>
                </CardTitle>
                <CardDescription>
                  Дополнительная защита вашего аккаунта
                </CardDescription>
              </div>
            </div>
            <Switch
              checked={twoFactorEnabled}
              onCheckedChange={setTwoFactorEnabled}
            />
          </div>
        </CardHeader>
        {twoFactorEnabled && (
          <CardContent className="space-y-4">
            <Separator />
            <div className="space-y-4">
              <div className="flex items-center space-x-2 text-sm text-green-600">
                <Shield className="h-4 w-4" />
                <span>2FA активна для вашего аккаунта</span>
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Резервные коды</Label>
                  <div className="text-muted-foreground text-sm">
                    <p>
                      Осталось кодов: <strong>8</strong>
                    </p>
                    <p>
                      Последнее использование: <strong>2 дня назад</strong>
                    </p>
                  </div>
                  <Button variant="outline" size="sm">
                    Сгенерировать новые коды
                  </Button>
                </div>
                <div className="space-y-2">
                  <Label>Устройства</Label>
                  <div className="text-muted-foreground text-sm">
                    <p>
                      Активные устройства: <strong>2</strong>
                    </p>
                    <p>
                      Последний вход: <strong>Сегодня, 14:30</strong>
                    </p>
                  </div>
                  <Button variant="outline" size="sm">
                    Управление устройствами
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        )}
        {!twoFactorEnabled && (
          <CardContent>
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Рекомендуем включить двухфакторную аутентификацию для повышения
                безопасности.
              </AlertDescription>
            </Alert>
            <div className="text-muted-foreground mt-4 text-sm">
              <p>• Получайте код подтверждения в Telegram</p>
              <p>• Используйте резервные коды для восстановления</p>
              <p>• Защита от несанкционированного доступа</p>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Session Management */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-3">
            <div className="rounded-lg bg-orange-100 p-2">
              <Key className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <CardTitle>Управление сессиями</CardTitle>
              <CardDescription>
                Просмотр и управление активными сессиями
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between rounded-lg border p-3">
                <div className="flex items-center space-x-3">
                  <div className="h-3 w-3 rounded-full bg-green-500"></div>
                  <div>
                    <p className="font-medium">Текущая сессия</p>
                    <p className="text-muted-foreground text-sm">
                      Windows 11 • Chrome • Москва, Россия
                    </p>
                  </div>
                </div>
                <Badge variant="default">Активна</Badge>
              </div>

              <div className="flex items-center justify-between rounded-lg border p-3">
                <div className="flex items-center space-x-3">
                  <div className="h-3 w-3 rounded-full bg-blue-500"></div>
                  <div>
                    <p className="font-medium">iPhone 13</p>
                    <p className="text-muted-foreground text-sm">
                      iOS 17 • Safari • Москва, Россия
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="secondary">Активна</Badge>
                  <Button variant="outline" size="sm">
                    Завершить
                  </Button>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <Button variant="outline">Завершить все сессии</Button>
              <Button variant="outline">Обновить список</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Security Recommendations */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-3">
            <div className="rounded-lg bg-purple-100 p-2">
              <Shield className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <CardTitle>Рекомендации по безопасности</CardTitle>
              <CardDescription>
                Советы для повышения защиты вашего аккаунта
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-start space-x-3 rounded-lg bg-green-50 p-3">
              <Shield className="mt-0.5 h-5 w-5 text-green-600" />
              <div>
                <p className="font-medium text-green-800">
                  Используйте уникальный пароль
                </p>
                <p className="text-sm text-green-700">
                  Не используйте один пароль для нескольких сервисов
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3 rounded-lg bg-blue-50 p-3">
              <Smartphone className="mt-0.5 h-5 w-5 text-blue-600" />
              <div>
                <p className="font-medium text-blue-800">
                  Включите двухфакторную аутентификацию
                </p>
                <p className="text-sm text-blue-700">
                  Дополнительный уровень защиты для вашего аккаунта
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3 rounded-lg bg-yellow-50 p-3">
              <AlertTriangle className="mt-0.5 h-5 w-5 text-yellow-600" />
              <div>
                <p className="font-medium text-yellow-800">
                  Регулярно проверяйте активность
                </p>
                <p className="text-sm text-yellow-700">
                  Следите за подозрительной активностью в аккаунте
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
