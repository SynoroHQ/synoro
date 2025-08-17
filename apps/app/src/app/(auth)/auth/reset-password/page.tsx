"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowLeft, Eye, EyeOff, Loader2, Lock } from "lucide-react";

import { resetPassword } from "@synoro/auth";
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

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    newPassword: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
      setError("Токен для сброса пароля не найден");
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    // Валидация
    if (formData.newPassword !== formData.confirmPassword) {
      setError("Пароли не совпадают");
      return;
    }

    if (formData.newPassword.length < 6) {
      setError("Пароль должен содержать минимум 6 символов");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const result = await resetPassword({
        newPassword: formData.newPassword,
        token,
      });

      if (result?.error) {
        setError(result.error.message || "Произошла ошибка при сбросе пароля");
      } else {
        setSuccess(true);
        setError("");
      }
    } catch (err) {
      setError("Произошла ошибка при сбросе пароля");
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[400px]">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-red-600">Токен для сброса пароля не найден</p>
              <Link href="/auth/login" className="text-primary hover:underline">
                Вернуться к входу
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (success) {
    return (
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[400px]">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">
            Пароль успешно изменен
          </h1>
          <p className="text-muted-foreground text-sm">
            Теперь вы можете войти в систему с новым паролем
          </p>
        </div>

        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                <Lock className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-medium">Пароль обновлен</h3>
                <p className="text-muted-foreground mt-2 text-sm">
                  Ваш пароль был успешно изменен. Теперь вы можете войти в
                  систему.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="text-center">
          <Link
            href="/auth/login"
            className="text-muted-foreground hover:text-primary inline-flex items-center text-sm"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Войти в систему
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[400px]">
      <div className="flex flex-col space-y-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Сброс пароля</h1>
        <p className="text-muted-foreground text-sm">
          Введите новый пароль для вашего аккаунта
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Новый пароль</CardTitle>
          <CardDescription>
            Создайте новый надежный пароль для входа в систему
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="newPassword">Новый пароль</Label>
              <div className="relative">
                <Lock className="text-muted-foreground absolute top-3 left-3 h-4 w-4" />
                <Input
                  id="newPassword"
                  type={showPassword ? "text" : "password"}
                  placeholder="Введите новый пароль"
                  value={formData.newPassword}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      newPassword: e.target.value,
                    }))
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
                  placeholder="Повторите новый пароль"
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      confirmPassword: e.target.value,
                    }))
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

            {error && (
              <div className="rounded-md bg-red-50 p-3 text-sm text-red-600">
                {error}
              </div>
            )}

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Сброс пароля...
                </>
              ) : (
                "Сбросить пароль"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="text-center">
        <Link
          href="/auth/login"
          className="text-muted-foreground hover:text-primary inline-flex items-center text-sm"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Вернуться к входу
        </Link>
      </div>
    </div>
  );
}
