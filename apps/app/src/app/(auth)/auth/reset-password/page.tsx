"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Eye, EyeOff, Loader2, Lock } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { resetPassword } from "@synoro/auth/client";
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

const resetPasswordSchema = z
  .object({
    newPassword: z.string().min(6, {
      message: "Пароль должен содержать минимум 6 символов.",
    }),
    confirmPassword: z.string().min(6, {
      message: "Пароль должен содержать минимум 6 символов.",
    }),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Пароли не совпадают.",
    path: ["confirmPassword"],
  });

type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const form = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      newPassword: "",
      confirmPassword: "",
    },
  });

  useEffect(() => {
    if (!token) {
      setError("Токен для сброса пароля не найден");
    }
  }, [token]);

  const onSubmit = async (values: ResetPasswordFormValues) => {
    if (!token) return;

    try {
      setError("");
      const result = await resetPassword({
        token,
        newPassword: values.newPassword,
      });

      if (result?.error?.code) {
        if (result.error.code === "INVALID_TOKEN") {
          setError("Недействительный токен для сброса пароля");
        } else if (result.error.code === "TOKEN_EXPIRED") {
          setError("Токен для сброса пароля истек");
        } else {
          setError("Ошибка при сбросе пароля");
        }
        return;
      }

      if (result?.data?.status) {
        setSuccess(true);
        toast.success("Пароль успешно изменен!");
      }
    } catch (err) {
      console.error("Password reset error:", err);
      setError("Произошла ошибка при сбросе пароля");
    }
  };

  if (!token) {
    return (
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[400px]">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">
            Ошибка сброса пароля
          </h1>
          <p className="text-muted-foreground text-sm">
            Токен для сброса пароля не найден
          </p>
        </div>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-muted-foreground mb-4">
                Для сброса пароля необходим корректный токен
              </p>
              <Link
                href="/auth/forgot-password"
                className="text-muted-foreground hover:text-foreground inline-flex items-center text-sm"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Запросить сброс пароля
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
            Пароль изменен
          </h1>
          <p className="text-muted-foreground text-sm">
            Теперь вы можете войти с новым паролем
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
                <p className="text-muted-foreground text-sm">
                  Ваш пароль был успешно изменен. Теперь вы можете войти в
                  систему.
                </p>
              </div>
              <Link
                href="/auth/login"
                className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium"
              >
                Войти в систему
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
        <h1 className="text-2xl font-semibold tracking-tight">Сброс пароля</h1>
        <p className="text-muted-foreground text-sm">
          Создайте новый пароль для вашего аккаунта
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Новый пароль</CardTitle>
          <CardDescription>
            Введите новый пароль для вашего аккаунта
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="newPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Новый пароль</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Lock className="text-muted-foreground absolute top-3 left-3 h-4 w-4" />
                        <Input
                          placeholder="Введите новый пароль"
                          type={showPassword ? "text" : "password"}
                          className="pr-10 pl-10"
                          {...field}
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
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Подтвердите пароль</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Lock className="text-muted-foreground absolute top-3 left-3 h-4 w-4" />
                        <Input
                          placeholder="Повторите новый пароль"
                          type={showConfirmPassword ? "text" : "password"}
                          className="pr-10 pl-10"
                          {...field}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute top-0 right-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() =>
                            setShowConfirmPassword(!showConfirmPassword)
                          }
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
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
                    Сброс пароля...
                  </>
                ) : (
                  "Сбросить пароль"
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
      <p className="text-muted-foreground mt-4 text-center text-sm">
        <Link
          href="/auth/login"
          className="text-muted-foreground hover:text-foreground inline-flex items-center text-sm"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Вернуться к входу
        </Link>
      </p>
    </div>
  );
}
