"use client";

import { useState } from "react";
import Link from "next/link";

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

export function RegisterForm() {
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // TODO: Implement registration logic
    setTimeout(() => setIsLoading(false), 1000);
  };

  return (
    <Card className="mx-auto w-full max-w-sm">
      <CardHeader>
        <CardTitle className="text-2xl">Регистрация</CardTitle>
        <CardDescription>
          Создайте новый аккаунт для входа в систему
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="grid gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="first-name">Имя</Label>
              <Input id="first-name" placeholder="Иван" required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="last-name">Фамилия</Label>
              <Input id="last-name" placeholder="Иванов" required />
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="m@example.com"
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">Пароль</Label>
            <Input id="password" type="password" required />
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Создание аккаунта..." : "Создать аккаунт"}
          </Button>
          <Button variant="outline" className="w-full">
            Зарегистрироваться через Google
          </Button>
        </form>
        <div className="mt-4 text-center text-sm">
          Уже есть аккаунт?{" "}
          <Link href="/auth/login" className="underline">
            Войти
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
