"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowLeft, Loader2, Mail } from "lucide-react";

import { emailOtp } from "@synoro/auth";
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

export default function VerifyPage() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email");

  const [isLoading, setIsLoading] = useState(false);
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !otp) return;

    setIsLoading(true);
    setError("");

    try {
      const result = await emailOtp.verify({
        email,
        otp,
      });

      if (result?.error) {
        setError(result.error.message || "Произошла ошибка при верификации");
      } else {
        // Успешная верификация - редирект на главную
        window.location.href = "/";
      }
    } catch (err) {
      setError("Произошла ошибка при верификации");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email) return;
    // Временно отключаем отправку OTP
    setError("Функция повторной отправки временно недоступна.");
  };

  if (!email) {
    return (
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[400px]">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-red-600">Email не указан</p>
              <Link href="/auth/login" className="text-primary hover:underline">
                Вернуться к входу
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[400px]">
      <div className="flex flex-col space-y-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">
          Подтверждение входа
        </h1>
        <p className="text-muted-foreground text-sm">
          Введите код, отправленный на {email}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Верификация OTP</CardTitle>
          <CardDescription>
            Код подтверждения отправлен на ваш email
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleVerify} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="otp">Код подтверждения</Label>
              <div className="relative">
                <Mail className="text-muted-foreground absolute top-3 left-3 h-4 w-4" />
                <Input
                  id="otp"
                  type="text"
                  placeholder="Введите 6-значный код"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="pl-10 text-center text-lg tracking-widest"
                  maxLength={6}
                  required
                />
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
                  Проверка...
                </>
              ) : (
                "Подтвердить"
              )}
            </Button>
          </form>

          <div className="mt-4 text-center">
            <Button
              variant="outline"
              onClick={handleResend}
              disabled={countdown > 0 || isLoading}
              className="w-full"
            >
              {countdown > 0
                ? `Отправить повторно через ${countdown}с`
                : "Отправить код повторно"}
            </Button>
          </div>
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
