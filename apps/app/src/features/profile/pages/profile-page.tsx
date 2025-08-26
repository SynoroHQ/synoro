"use client";

import { Activity, Calendar, Mail, Settings, Shield } from "lucide-react";

import { useSession } from "@synoro/auth/client";
import { Badge } from "@synoro/ui/components/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@synoro/ui/components/card";

import { ProfileAchievements } from "../components/profile-achievements";
import { ProfileActivity } from "../components/profile-activity";
import { ProfileInfo } from "../components/profile-info";
import { ProfileSettings } from "../components/profile-settings";
import { ProfileStats } from "../components/profile-stats";

export function ProfilePage() {
  const { data: session } = useSession();

  if (!session?.user) {
    return (
      <div className="p-6">
        <p>Загрузка профиля...</p>
      </div>
    );
  }

  const user = session.user;
  const isVerified = user.emailVerified;
  const memberSince = new Date().toLocaleDateString("ru-RU", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="space-y-6">
      {/* Заголовок страницы */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Профиль пользователя
          </h1>
          <p className="text-muted-foreground mt-2">
            Управление личной информацией, настройками и безопасностью аккаунта
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={isVerified ? "default" : "secondary"}>
            {isVerified ? "Подтвержден" : "Не подтвержден"}
          </Badge>
          <Badge variant="outline">
            <Calendar className="mr-1 h-3 w-3" />
            {memberSince}
          </Badge>
        </div>
      </div>

      {/* Основная информация */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <ProfileInfo />
          <ProfileActivity />
        </div>
        <div className="space-y-6">
          <ProfileStats />

          {/* Быстрые действия */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Быстрые действия
              </CardTitle>
              <CardDescription>
                Часто используемые функции профиля
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="hover:bg-muted/50 flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors">
                <Shield className="h-4 w-4 text-blue-600" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Безопасность</p>
                  <p className="text-muted-foreground text-xs">
                    Настройки пароля и 2FA
                  </p>
                </div>
              </div>
              <div className="hover:bg-muted/50 flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors">
                <Mail className="h-4 w-4 text-green-600" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Уведомления</p>
                  <p className="text-muted-foreground text-xs">
                    Настройка email и push
                  </p>
                </div>
              </div>
              <div className="hover:bg-muted/50 flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors">
                <Settings className="h-4 w-4 text-purple-600" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Предпочтения</p>
                  <p className="text-muted-foreground text-xs">Язык и тема</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Достижения */}
          <ProfileAchievements />
        </div>
      </div>

      {/* Дополнительные настройки */}
      <ProfileSettings />
    </div>
  );
}
