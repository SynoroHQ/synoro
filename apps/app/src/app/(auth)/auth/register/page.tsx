"use client";

import { useState } from "react";
import Link from "next/link";
import { Eye, EyeOff, Loader2, Lock, Mail, User } from "lucide-react";

import { signUp } from "@synoro/auth";
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

export default function RegisterPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    acceptTerms: false,
  });
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    // Валидация
    if (formData.password !== formData.confirmPassword) {
      setError("Пароли не совпадают");
      setIsLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError("Пароль должен содержать минимум 6 символов");
      setIsLoading(false);
      return;
    }

    if (!formData.acceptTerms) {
      setError("Необходимо принять условия использования");
      setIsLoading(false);
      return;
    }

    try {
      const result = await signUp.email({
        name: formData.name,
        email: formData.email,
        password: formData.password,
      });

      if (result?.error) {
        setError(result.error.message || "Произошла ошибка при регистрации");
      } else {
        // Успешная регистрация - редирект на главную
        window.location.href = "/";
      }
    } catch (err) {
      setError("Произошла ошибка при регистрации");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[400px]">
      <div className="flex flex-col space-y-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">
          Создать аккаунт
        </h1>
        <p className="text-muted-foreground text-sm">
          Заполните форму для регистрации
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Регистрация</CardTitle>
          <CardDescription>
            Создайте новый аккаунт для доступа к системе
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Имя</Label>
              <div className="relative">
                <User className="text-muted-foreground absolute top-3 left-3 h-4 w-4" />
                <Input
                  id="name"
                  type="text"
                  placeholder="Ваше имя"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  className="pl-10"
                  required
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
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Пароль</Label>
              <div className="relative">
                <Lock className="text-muted-foreground absolute top-3 left-3 h-4 w-4" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Создайте пароль"
                  value={formData.password}
                  onChange={(e) =>
                    handleInputChange("password", e.target.value)
                  }
                  className="pr-10 pl-10"
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute top-0 right-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Подтвердите пароль</Label>
              <div className="relative">
                <Lock className="text-muted-foreground absolute top-3 left-3 h-4 w-4" />
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Повторите пароль"
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    handleInputChange("confirmPassword", e.target.value)
                  }
                  className="pr-10 pl-10"
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute top-0 right-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="acceptTerms"
                checked={formData.acceptTerms}
                onChange={(e) =>
                  handleInputChange("acceptTerms", e.target.checked)
                }
                className="text-primary focus:ring-primary h-4 w-4 rounded border-gray-300"
              />
              <Label htmlFor="acceptTerms" className="text-sm">
                Я принимаю{" "}
                <Link href="/terms" className="text-primary hover:underline">
                  условия использования
                </Link>{" "}
                и{" "}
                <Link href="/privacy" className="text-primary hover:underline">
                  политику конфиденциальности
                </Link>
              </Label>
            </div>

            {error && (
              <div className="rounded-md bg-red-50 p-3 text-sm text-red-600">
                {error}
              </div>
            )}

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Регистрация...
                </>
              ) : (
                "Создать аккаунт"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="text-center text-sm">
        <span className="text-muted-foreground">Уже есть аккаунт? </span>
        <Link
          href="/auth/login"
          className="hover:text-primary underline underline-offset-4"
        >
          Войти
        </Link>
      </div>
    </div>
  );
}
