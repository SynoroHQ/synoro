"use client";

import { useEffect, useState } from "react";
import { Loader2, Mail, Save, User } from "lucide-react";

import { useSession } from "@synoro/auth/client";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@synoro/ui/components/avatar";
import { Button } from "@synoro/ui/components/button";
import { Input } from "@synoro/ui/components/input";
import { Label } from "@synoro/ui/components/label";

export function ProfileForm() {
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: session?.user?.name || "",
    email: session?.user?.email || "",
  });

  // Синхронизация полей с актуальными данными сессии
  useEffect(() => {
    if (session?.user && !isEditing) {
      setFormData({
        name: session.user.name ?? "",
        email: session.user.email ?? "",
      });
    }
  }, [session?.user?.name, session?.user?.email, isEditing]);

  if (!session?.user) {
    return null;
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

  const getUserInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="space-y-4">
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
          <p className="text-muted-foreground text-sm">{session.user.email}</p>
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
    </div>
  );
}
