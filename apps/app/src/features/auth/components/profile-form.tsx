"use client";

import { useState } from "react";
import { Camera, Clock, Globe, Mail, User } from "lucide-react";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@synoro/ui/components/avatar";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@synoro/ui/components/select";

export function ProfileForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [avatar, setAvatar] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // TODO: Implement profile update logic
    setTimeout(() => setIsLoading(false), 1000);
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setAvatar(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Профиль пользователя</CardTitle>
        <CardDescription>
          Обновите информацию о себе и настройки аккаунта
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Avatar Section */}
          <div className="flex items-center space-x-6">
            <div className="relative">
              <Avatar className="h-20 w-20">
                <AvatarImage src={avatar || undefined} alt="Profile" />
                <AvatarFallback className="text-lg">СИ</AvatarFallback>
              </Avatar>
              <label
                htmlFor="avatar-upload"
                className="absolute right-0 bottom-0 cursor-pointer"
              >
                <div className="rounded-full bg-blue-600 p-1 text-white hover:bg-blue-700">
                  <Camera className="h-4 w-4" />
                </div>
                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarChange}
                />
              </label>
            </div>
            <div>
              <h3 className="text-lg font-medium">Фото профиля</h3>
              <p className="text-muted-foreground text-sm">
                Загрузите изображение в формате JPG, PNG или GIF
              </p>
            </div>
          </div>

          {/* Personal Information */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="firstName">Имя</Label>
              <div className="relative">
                <User className="text-muted-foreground absolute top-3 left-3 h-4 w-4" />
                <Input
                  id="firstName"
                  type="text"
                  placeholder="Ваше имя"
                  className="pl-10"
                  defaultValue="Иван"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastName">Фамилия</Label>
              <div className="relative">
                <User className="text-muted-foreground absolute top-3 left-3 h-4 w-4" />
                <Input
                  id="lastName"
                  type="text"
                  placeholder="Ваша фамилия"
                  className="pl-10"
                  defaultValue="Иванов"
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
                  placeholder="your@email.com"
                  className="pl-10"
                  defaultValue="ivan@example.com"
                  disabled
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Телефон</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+7 (999) 123-45-67"
                defaultValue="+7 (999) 123-45-67"
              />
            </div>
          </div>

          {/* Preferences */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="language">Язык интерфейса</Label>
              <Select defaultValue="ru">
                <SelectTrigger>
                  <SelectValue placeholder="Выберите язык" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ru">Русский</SelectItem>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="de">Deutsch</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="timezone">Часовой пояс</Label>
              <Select defaultValue="Europe/Moscow">
                <SelectTrigger>
                  <SelectValue placeholder="Выберите часовой пояс" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Europe/Moscow">Москва (UTC+3)</SelectItem>
                  <SelectItem value="Europe/London">Лондон (UTC+0)</SelectItem>
                  <SelectItem value="America/New_York">
                    Нью-Йорк (UTC-5)
                  </SelectItem>
                  <SelectItem value="Asia/Tokyo">Токио (UTC+9)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Bio */}
          <div className="space-y-2">
            <Label htmlFor="bio">О себе</Label>
            <textarea
              id="bio"
              className="border-input focus:ring-ring min-h-[100px] w-full resize-none rounded-md border px-3 py-2 focus:ring-2 focus:ring-offset-2 focus:outline-none"
              placeholder="Расскажите немного о себе..."
              defaultValue="Люблю планировать и организовывать свою жизнь с помощью умных инструментов."
            />
          </div>

          <div className="flex justify-end space-x-4">
            <Button type="button" variant="outline">
              Отмена
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Сохранение..." : "Сохранить изменения"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
