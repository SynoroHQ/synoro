"use client";

import { useState } from "react";
import {
  AlertTriangle,
  Bell,
  CheckCircle,
  Clock,
  Eye,
  Globe,
  Lock,
  Mail,
  Palette,
  Shield,
  Smartphone,
  XCircle,
  Zap,
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
import { Separator } from "@synoro/ui/components/separator";
import { Switch } from "@synoro/ui/components/switch";

export function ProfileSettings() {
  const [settings, setSettings] = useState({
    twoFactor: false,
    emailNotifications: true,
    pushNotifications: false,
    smsNotifications: false,
    publicProfile: false,
    darkMode: true,
    language: "ru",
    timezone: "Europe/Moscow",
  });

  const handleSettingChange = (
    key: keyof typeof settings,
    value: boolean | string,
  ) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const getSecurityScore = () => {
    let score = 0;
    if (settings.twoFactor) score += 40;
    if (settings.emailNotifications) score += 20;
    if (settings.pushNotifications) score += 20;
    if (settings.smsNotifications) score += 20;
    return Math.min(score, 100);
  };

  const getSecurityStatus = (score: number) => {
    if (score >= 80)
      return {
        text: "Отлично",
        variant: "default" as const,
        icon: CheckCircle,
      };
    if (score >= 60)
      return {
        text: "Хорошо",
        variant: "secondary" as const,
        icon: CheckCircle,
      };
    if (score >= 40)
      return {
        text: "Средне",
        variant: "outline" as const,
        icon: AlertTriangle,
      };
    return {
      text: "Требует внимания",
      variant: "destructive" as const,
      icon: XCircle,
    };
  };

  const securityScore = getSecurityScore();
  const securityStatus = getSecurityStatus(securityScore);

  return (
    <div className="space-y-6">
      {/* Безопасность */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Безопасность аккаунта
              </CardTitle>
              <CardDescription>
                Настройки безопасности и защиты вашего аккаунта
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge
                variant={securityStatus.variant}
                className="flex items-center gap-1"
              >
                <securityStatus.icon className="h-3 w-3" />
                {securityStatus.text}
              </Badge>
              <Badge variant="outline">{securityScore}/100</Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Двухфакторная аутентификация */}
          <div className="bg-muted/30 flex items-center justify-between rounded-lg border p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-blue-100 p-2 dark:bg-blue-900/20">
                <Lock className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h4 className="font-medium">Двухфакторная аутентификация</h4>
                <p className="text-muted-foreground text-sm">
                  Дополнительная защита вашего аккаунта с помощью кода из
                  приложения
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Switch
                checked={settings.twoFactor}
                onCheckedChange={(checked) =>
                  handleSettingChange("twoFactor", checked)
                }
              />
              <Button variant="outline" size="sm">
                Настроить
              </Button>
            </div>
          </div>

          <Separator />

          {/* Уведомления */}
          <div className="space-y-4">
            <h4 className="text-muted-foreground text-sm font-medium tracking-wide uppercase">
              Уведомления
            </h4>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="bg-muted/30 flex items-center justify-between rounded-lg border p-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-green-100 p-2 dark:bg-green-900/20">
                    <Mail className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <h5 className="font-medium">Email уведомления</h5>
                    <p className="text-muted-foreground text-sm">
                      Важные события и обновления
                    </p>
                  </div>
                </div>
                <Switch
                  checked={settings.emailNotifications}
                  onCheckedChange={(checked) =>
                    handleSettingChange("emailNotifications", checked)
                  }
                />
              </div>

              <div className="bg-muted/30 flex items-center justify-between rounded-lg border p-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-purple-100 p-2 dark:bg-purple-900/20">
                    <Bell className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <h5 className="font-medium">Push уведомления</h5>
                    <p className="text-muted-foreground text-sm">
                      Уведомления в браузере
                    </p>
                  </div>
                </div>
                <Switch
                  checked={settings.pushNotifications}
                  onCheckedChange={(checked) =>
                    handleSettingChange("pushNotifications", checked)
                  }
                />
              </div>

              <div className="bg-muted/30 flex items-center justify-between rounded-lg border p-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-orange-100 p-2 dark:bg-orange-900/20">
                    <Smartphone className="h-5 w-5 text-orange-600" />
                  </div>
                  <div>
                    <h5 className="font-medium">SMS уведомления</h5>
                    <p className="text-muted-foreground text-sm">
                      Критические уведомления
                    </p>
                  </div>
                </div>
                <Switch
                  checked={settings.smsNotifications}
                  onCheckedChange={(checked) =>
                    handleSettingChange("smsNotifications", checked)
                  }
                />
              </div>

              <div className="bg-muted/30 flex items-center justify-between rounded-lg border p-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-red-100 p-2 dark:bg-red-900/20">
                    <Zap className="h-5 w-5 text-red-600" />
                  </div>
                  <div>
                    <h5 className="font-medium">Экстренные уведомления</h5>
                    <p className="text-muted-foreground text-sm">
                      Безопасность и доступ
                    </p>
                  </div>
                </div>
                <Switch checked={true} disabled />
              </div>
            </div>
          </div>

          <Separator />

          {/* Приватность и внешний вид */}
          <div className="space-y-4">
            <h4 className="text-muted-foreground text-sm font-medium tracking-wide uppercase">
              Приватность и внешний вид
            </h4>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="bg-muted/30 flex items-center justify-between rounded-lg border p-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-blue-100 p-2 dark:bg-blue-900/20">
                    <Eye className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h5 className="font-medium">Публичный профиль</h5>
                    <p className="text-muted-foreground text-sm">
                      Видимость для других пользователей
                    </p>
                  </div>
                </div>
                <Switch
                  checked={settings.publicProfile}
                  onCheckedChange={(checked) =>
                    handleSettingChange("publicProfile", checked)
                  }
                />
              </div>

              <div className="bg-muted/30 flex items-center justify-between rounded-lg border p-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-purple-100 p-2 dark:bg-purple-900/20">
                    <Palette className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <h5 className="font-medium">Темная тема</h5>
                    <p className="text-muted-foreground text-sm">
                      Автоматическое переключение
                    </p>
                  </div>
                </div>
                <Switch
                  checked={settings.darkMode}
                  onCheckedChange={(checked) =>
                    handleSettingChange("darkMode", checked)
                  }
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Дополнительные настройки */}
          <div className="space-y-4">
            <h4 className="text-muted-foreground text-sm font-medium tracking-wide uppercase">
              Дополнительные настройки
            </h4>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="bg-muted/30 flex items-center justify-between rounded-lg border p-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-green-100 p-2 dark:bg-green-900/20">
                    <Globe className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <h5 className="font-medium">Язык интерфейса</h5>
                    <p className="text-muted-foreground text-sm">Русский</p>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  Изменить
                </Button>
              </div>

              <div className="bg-muted/30 flex items-center justify-between rounded-lg border p-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-orange-100 p-2 dark:bg-orange-900/20">
                    <Clock className="h-5 w-5 text-orange-600" />
                  </div>
                  <div>
                    <h5 className="font-medium">Часовой пояс</h5>
                    <p className="text-muted-foreground text-sm">
                      Москва (UTC+3)
                    </p>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  Изменить
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
