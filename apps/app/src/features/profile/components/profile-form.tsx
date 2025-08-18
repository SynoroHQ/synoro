"use client";

import { useEffect, useState } from "react";
import {
  Calendar,
  Loader2,
  Mail,
  MapPin,
  Phone,
  Save,
  User,
  X,
} from "lucide-react";

import { useSession } from "@synoro/auth/client";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@synoro/ui/components/avatar";
import { Button } from "@synoro/ui/components/button";
import { Input } from "@synoro/ui/components/input";
import { Label } from "@synoro/ui/components/label";
import { Separator } from "@synoro/ui/components/separator";
import { Textarea } from "@synoro/ui/components/textarea";

interface ProfileFormProps {
  onCancel?: () => void;
}

export function ProfileForm({ onCancel }: ProfileFormProps) {
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: session?.user?.name || "",
    email: session?.user?.email || "",
    phone: "",
    location: "",
    bio: "",
    fullName: "",
  });

  // Синхронизация полей с актуальными данными сессии
  useEffect(() => {
    if (session?.user) {
      setFormData({
        name: session.user.name ?? "",
        email: session.user.email ?? "",
        phone: "",
        location: "",
        bio: "",
        fullName: "",
      });
    }
  }, [session?.user]);

  if (!session?.user) {
    return null;
  }

  const handleSave = async () => {
    setIsLoading(true);
    try {
      // Здесь будет обновление профиля через @synoro/auth
      await new Promise((resolve) => setTimeout(resolve, 1000));
      if (onCancel) onCancel();
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
    <div className="space-y-6">
      {/* Аватар и основная информация */}
      <div className="flex items-center space-x-4">
        <Avatar className="h-20 w-20">
          <AvatarImage
            src={session.user.image || ""}
            alt={session.user.name || ""}
          />
          <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-2xl text-white">
            {session.user.name ? (
              getUserInitials(session.user.name)
            ) : (
              <User className="h-10 w-10" />
            )}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <h3 className="text-xl font-semibold">
            {session.user.name || "Пользователь"}
          </h3>
          <p className="text-muted-foreground">{session.user.email}</p>
        </div>
      </div>

      <Separator />

      {/* Основные поля */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="fullName">Полное имя</Label>
          <div className="relative">
            <User className="text-muted-foreground absolute top-3 left-3 h-4 w-4" />
            <Input
              id="fullName"
              value={formData.fullName}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  fullName: e.target.value,
                }))
              }
              className="pl-10"
              placeholder="Введите полное имя"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="name">Имя пользователя</Label>
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
              placeholder="Введите имя пользователя"
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
              placeholder="Введите email"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Телефон</Label>
          <div className="relative">
            <Phone className="text-muted-foreground absolute top-3 left-3 h-4 w-4" />
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  phone: e.target.value,
                }))
              }
              className="pl-10"
              placeholder="+7 (999) 123-45-67"
            />
          </div>
        </div>
      </div>

      {/* Дополнительные поля */}
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="location">Местоположение</Label>
          <div className="relative">
            <MapPin className="text-muted-foreground absolute top-3 left-3 h-4 w-4" />
            <Input
              id="location"
              value={formData.location}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  location: e.target.value,
                }))
              }
              className="pl-10"
              placeholder="Город, страна"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="bio">О себе</Label>
          <Textarea
            id="bio"
            value={formData.bio}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                bio: e.target.value,
              }))
            }
            placeholder="Расскажите немного о себе..."
            rows={3}
          />
        </div>
      </div>

      <Separator />

      {/* Кнопки действий */}
      <div className="flex justify-end space-x-2">
        <Button variant="outline" onClick={onCancel}>
          <X className="mr-2 h-4 w-4" />
          Отмена
        </Button>
        <Button onClick={handleSave} disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Сохранение...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Сохранить изменения
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
