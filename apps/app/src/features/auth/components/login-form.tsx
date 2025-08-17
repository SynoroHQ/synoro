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

export function LoginForm() {
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // TODO: Implement login logic
    setTimeout(() => setIsLoading(false), 1000);
  };

  return (
    <Card className="mx-auto w-full max-w-sm">
      <CardHeader>
        <CardTitle className="text-2xl">Вход</CardTitle>
        <CardDescription>Введите ваш email для входа в аккаунт</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="grid gap-4">
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
            <div className="flex items-center">
              <Label htmlFor="password">Пароль</Label>
              <Link href="#" className="ml-auto inline-block text-sm underline">
                Забыли пароль?
              </Link>
            </div>
            <Input id="password" type="password" required />
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Вход..." : "Войти"}
          </Button>
          <Button variant="outline" className="w-full">
            Войти через Google
          </Button>
        </form>
        <div className="mt-4 text-center text-sm">
          Нет аккаунта?{" "}
          <Link href="/auth/register" className="underline">
            Зарегистрироваться
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
