"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Loader2, Mail } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { emailOtp } from "@synoro/auth/client";
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
} from "@synoro/ui";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@synoro/ui/components/form";

const verifySchema = z.object({
  otp: z.string().length(6, {
    message: "Код подтверждения должен содержать 6 символов.",
  }),
});

type VerifyFormValues = z.infer<typeof verifySchema>;

export default function VerifyPage() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email");

  const [countdown, setCountdown] = useState(0);
  const [error, setError] = useState("");

  const form = useForm<VerifyFormValues>({
    resolver: zodResolver(verifySchema),
    defaultValues: {
      otp: "",
    },
  });

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const onSubmit = async (values: VerifyFormValues) => {
    if (!email) return;

    setError("");

    try {
      const result = await emailOtp.verifyEmail({
        email,
        otp: values.otp,
      });

      if (result?.error) {
        setError(result.error.message || "Произошла ошибка при верификации");
      } else {
        // Успешная верификация - редирект на главную
        window.location.href = "/";
      }
    } catch (err) {
      setError("Произошла ошибка при верификации");
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
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">
            Ошибка верификации
          </h1>
          <p className="text-muted-foreground text-sm">
            Email адрес не найден в параметрах
          </p>
        </div>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-muted-foreground mb-4">
                Для верификации email необходим корректный адрес
              </p>
              <Link
                href="/auth/login"
                className="text-muted-foreground hover:text-foreground inline-flex items-center text-sm"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
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
          Верификация email
        </h1>
        <p className="text-muted-foreground text-sm">
          Код подтверждения отправлен на {email}
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
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="otp"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Код подтверждения</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Mail className="text-muted-foreground absolute top-3 left-3 h-4 w-4" />
                        <Input
                          placeholder="Введите 6-значный код"
                          className="pl-10 text-center text-lg tracking-widest"
                          maxLength={6}
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {error && (
                <div className="rounded-md bg-red-50 p-3 text-sm text-red-600">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                className="w-full"
                disabled={form.formState.isSubmitting}
              >
                {form.formState.isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Проверка...
                  </>
                ) : (
                  "Подтвердить"
                )}
              </Button>
            </form>
          </Form>

          <div className="mt-4 text-center">
            <p className="text-muted-foreground mb-2 text-sm">
              Не получили код?
            </p>
            <Button
              variant="link"
              onClick={handleResend}
              disabled={countdown > 0}
              className="h-auto p-0"
            >
              {countdown > 0
                ? `Отправить повторно через ${countdown}с`
                : "Отправить повторно"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="text-center">
        <Link
          href="/auth/login"
          className="text-muted-foreground hover:text-foreground inline-flex items-center text-sm"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Вернуться к входу
        </Link>
      </div>
    </div>
  );
}
