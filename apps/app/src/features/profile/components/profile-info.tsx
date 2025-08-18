"use client";

import { useState } from "react";
import {
  Calendar,
  Camera,
  CheckCircle,
  Edit,
  Mail,
  MapPin,
  Phone,
  Shield,
  User,
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
import { Separator } from "@synoro/ui/components/separator";

import { ProfileForm } from "./profile-form";

export function ProfileInfo() {
  const [isEditing, setIsEditing] = useState(false);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Основная информация
            </CardTitle>
            <CardDescription>
              Ваши личные данные и контактная информация
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEditing(!isEditing)}
          >
            <Edit className="mr-2 h-4 w-4" />
            {isEditing ? "Отмена" : "Редактировать"}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isEditing ? (
          <ProfileForm onCancel={() => setIsEditing(false)} />
        ) : (
          <div className="space-y-6">
            {/* Аватар и основная информация */}
            <div className="flex items-start space-x-4">
              <div className="relative">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-2xl font-bold text-white">
                  S
                </div>
                <Button
                  size="sm"
                  variant="secondary"
                  className="absolute -right-1 -bottom-1 h-8 w-8 rounded-full p-0"
                >
                  <Camera className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-semibold">Synoro User</h3>
                  <Badge variant="outline" className="text-xs">
                    <CheckCircle className="mr-1 h-3 w-3 text-green-600" />
                    Активен
                  </Badge>
                </div>
                <p className="text-muted-foreground">
                  Пользователь платформы Synoro
                </p>
                <div className="text-muted-foreground flex items-center gap-4 text-sm">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    Присоединился в 2024
                  </span>
                  <span className="flex items-center gap-1">
                    <Shield className="h-3 w-3" />
                    Стандартный аккаунт
                  </span>
                </div>
              </div>
            </div>

            <Separator />

            {/* Контактная информация */}
            <div className="space-y-4">
              <h4 className="text-muted-foreground text-sm font-medium tracking-wide uppercase">
                Контактная информация
              </h4>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="bg-muted/30 flex items-center gap-3 rounded-lg border p-3">
                  <Mail className="h-4 w-4 text-blue-600" />
                  <div>
                    <p className="text-sm font-medium">Email</p>
                    <p className="text-muted-foreground text-sm">
                      user@synoro.dev
                    </p>
                  </div>
                  <Badge variant="secondary" className="ml-auto text-xs">
                    Подтвержден
                  </Badge>
                </div>
                <div className="bg-muted/30 flex items-center gap-3 rounded-lg border p-3">
                  <Phone className="h-4 w-4 text-green-600" />
                  <div>
                    <p className="text-sm font-medium">Телефон</p>
                    <p className="text-muted-foreground text-sm">Не указан</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="ml-auto h-6 px-2 text-xs"
                  >
                    Добавить
                  </Button>
                </div>
              </div>
            </div>

            <Separator />

            {/* Дополнительная информация */}
            <div className="space-y-4">
              <h4 className="text-muted-foreground text-sm font-medium tracking-wide uppercase">
                Дополнительная информация
              </h4>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="bg-muted/30 flex items-center gap-3 rounded-lg border p-3">
                  <MapPin className="h-4 w-4 text-purple-600" />
                  <div>
                    <p className="text-sm font-medium">Местоположение</p>
                    <p className="text-muted-foreground text-sm">Не указано</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="ml-auto h-6 px-2 text-xs"
                  >
                    Добавить
                  </Button>
                </div>
                <div className="bg-muted/30 flex items-center gap-3 rounded-lg border p-3">
                  <User className="h-4 w-4 text-orange-600" />
                  <div>
                    <p className="text-sm font-medium">Полное имя</p>
                    <p className="text-muted-foreground text-sm">Не указано</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="ml-auto h-6 px-2 text-xs"
                  >
                    Добавить
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
