"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Camera, Clock, Globe, Mail, User } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";

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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@synoro/ui/components/form";
import { Input } from "@synoro/ui/components/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@synoro/ui/components/select";
import { Textarea } from "@synoro/ui/components/textarea";

const profileSchema = z.object({
  firstName: z.string().min(2, {
    message: "Имя должно содержать минимум 2 символа.",
  }),
  lastName: z.string().min(2, {
    message: "Фамилия должна содержать минимум 2 символа.",
  }),
  email: z.string().email({
    message: "Введите корректный email адрес.",
  }),
  phone: z.string().min(10, {
    message: "Введите корректный номер телефона.",
  }),
  language: z.string().min(1, {
    message: "Выберите язык интерфейса.",
  }),
  timezone: z.string().min(1, {
    message: "Выберите часовой пояс.",
  }),
  bio: z.string().max(500, {
    message: "Описание не должно превышать 500 символов.",
  }),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export function ProfileForm() {
  const [avatar, setAvatar] = useState<string | null>(null);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: "Иван",
      lastName: "Иванов",
      email: "ivan@example.com",
      phone: "+7 (999) 123-45-67",
      language: "ru",
      timezone: "Europe/Moscow",
      bio: "Люблю планировать и организовывать свою жизнь с помощью умных инструментов.",
    },
  });

  const onSubmit = async (values: ProfileFormValues) => {
    // TODO: Implement profile update logic
    console.log(values);
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
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Avatar Section */}
            <div className="flex items-center space-x-6">
              <div className="relative">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={avatar || undefined} alt="Profile" />
                  <AvatarFallback className="text-lg">
                    {form.watch("firstName")[0]?.toUpperCase() || ""}
                    {form.watch("lastName")[0]?.toUpperCase() || ""}
                  </AvatarFallback>
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
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Имя</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <User className="text-muted-foreground absolute top-3 left-3 h-4 w-4" />
                        <Input
                          placeholder="Ваше имя"
                          className="pl-10"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Фамилия</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <User className="text-muted-foreground absolute top-3 left-3 h-4 w-4" />
                        <Input
                          placeholder="Ваша фамилия"
                          className="pl-10"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Mail className="text-muted-foreground absolute top-3 left-3 h-4 w-4" />
                        <Input
                          placeholder="your@email.com"
                          type="email"
                          className="pl-10"
                          disabled
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Телефон</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="+7 (999) 123-45-67"
                        type="tel"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Preferences */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="language"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Язык интерфейса</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Выберите язык" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="ru">Русский</SelectItem>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="de">Deutsch</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="timezone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Часовой пояс</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Выберите часовой пояс" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Europe/Moscow">
                          Москва (UTC+3)
                        </SelectItem>
                        <SelectItem value="Europe/London">
                          Лондон (UTC+0)
                        </SelectItem>
                        <SelectItem value="America/New_York">
                          Нью-Йорк (UTC-5)
                        </SelectItem>
                        <SelectItem value="Asia/Tokyo">
                          Токио (UTC+9)
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Bio */}
            <FormField
              control={form.control}
              name="bio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>О себе</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Расскажите немного о себе..."
                      className="min-h-[100px] resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-4">
              <Button type="button" variant="outline">
                Отмена
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting
                  ? "Сохранение..."
                  : "Сохранить изменения"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
