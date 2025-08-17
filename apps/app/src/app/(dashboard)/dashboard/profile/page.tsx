"use client";

import { useEffect, useState } from "react";
import { Loader2, Mail, Save, Shield, User } from "lucide-react";

import { useSession } from "@synoro/auth/client";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Label,
} from "@synoro/ui";

export default function ProfilePage() {
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: session?.user?.name || "",
    email: session?.user?.email || "",
  });

  // Синхронизация полей с актуальными данными сессии (если не редактируем вручную)
  useEffect(() => {
    if (session?.user && !isEditing) {
      setFormData({
        name: session.user.name ?? "",
        email: session.user.email ?? "",
      });
    }
  }, [session?.user?.name, session?.user?.email, isEditing]);
  if (!session?.user) {
    return (
      <div className="p-6">
        <p>Загрузка профиля...</p>
      </div>
    );
  }

  const handleSave = async () => {
    setIsLoading(true);
    try {
      // Здесь будет обновление профиля через @synoro/auth
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setIsEditing(false);
    } catch (error) {
      console.error("Ошибка при обновлении профиля:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getRoleLabel = (role: string) => {
    const roleLabels: Record<string, string> = {
      super_admin: "Супер администратор",
      admin: "Администратор",
      moderator: "Модератор",
      editor: "Редактор",
      user: "Пользователь",
    };
    return roleLabels[role] || role;
  };

  const getUserInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Профиль пользователя</h1>
        <p className="text-muted-foreground">
          Управление личной информацией и настройками
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Основная информация */}
        <Card>
          <CardHeader>
            <CardTitle>Основная информация</CardTitle>
            <CardDescription>
              Ваши личные данные и контактная информация
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-4">
              <Avatar className="h-16 w-16">
                <AvatarImage
                  src={session.user.image || ""}
                  alt={session.user.name || ""}
                />
                <AvatarFallback className="text-lg">
                  {session.user.name ? (
                    getUserInitials(session.user.name)
                  ) : (
                    <User className="h-8 w-8" />
                  )}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="text-lg font-medium">
                  {session.user.name || "Пользователь"}
                </h3>
                <p className="text-muted-foreground text-sm">
                  {session.user.email}
                </p>
                <div className="mt-1 flex items-center space-x-1">
                  <Shield className="text-muted-foreground h-3 w-3" />
                  <span className="text-muted-foreground text-xs">
                    {getRoleLabel(session.user.role || "user")}
                  </span>
                </div>
              </div>
            </div>

            {isEditing ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Имя</Label>
                  <div className="relative">
                    <User className="text-muted-foreground absolute top-3 left-3 h-4 w-4" />
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          name: e.target.value,
                        }))
                      }
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="text-muted-foreground absolute top-3 left-3 h-4 w-4" />
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          email: e.target.value,
                        }))
                      }
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="flex space-x-2">
                  <Button onClick={handleSave} disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Сохранение...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Сохранить
                      </>
                    )}
                  </Button>
                  <Button variant="outline" onClick={() => setIsEditing(false)}>
                    Отмена
                  </Button>
                </div>
              </div>
            ) : (
              <Button onClick={() => setIsEditing(true)} variant="outline">
                Редактировать профиль
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Статистика */}
        <Card>
          <CardHeader>
            <CardTitle>Статистика аккаунта</CardTitle>
            <CardDescription>Информация о вашей активности</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-muted rounded-lg p-4 text-center">
                <div className="text-2xl font-bold">0</div>
                <div className="text-muted-foreground text-sm">
                  Задач создано
                </div>
              </div>
              <div className="bg-muted rounded-lg p-4 text-center">
                <div className="text-2xl font-bold">0</div>
                <div className="text-muted-foreground text-sm">
                  Задач выполнено
                </div>
              </div>
            </div>

            <div className="bg-muted rounded-lg p-4 text-center">
              <div className="text-2xl font-bold">0</div>
              <div className="text-muted-foreground text-sm">
                Дней в системе
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Дополнительные настройки */}
      <Card>
        <CardHeader>
          <CardTitle>Дополнительные настройки</CardTitle>
          <CardDescription>
            Управление безопасностью и уведомлениями
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Двухфакторная аутентификация</h4>
              <p className="text-muted-foreground text-sm">
                Дополнительная защита вашего аккаунта
              </p>
            </div>
            <Button variant="outline" size="sm">
              Настроить
            </Button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Email уведомления</h4>
              <p className="text-muted-foreground text-sm">
                Получать уведомления о важных событиях
              </p>
            </div>
            <Button variant="outline" size="sm">
              Настроить
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
