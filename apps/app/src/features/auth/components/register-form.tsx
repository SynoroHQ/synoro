"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AuthError } from "@/components/auth/auth-error";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import type { RegisterFormValues } from "@synoro/validators";
import { signUp } from "@synoro/auth/client";
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
import { registerSchema } from "@synoro/validators";

export function RegisterForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: RegisterFormValues) => {
    try {
      setError("");
      const result = await signUp.email({
        email: values.email,
        password: values.password,
        name: `${values.firstName} ${values.lastName}`,
      });

      if (result?.error?.code) {
        if (result.error.code === "EMAIL_ALREADY_EXISTS") {
          setError("Пользователь с таким email уже существует");
        } else {
          setError("Ошибка при регистрации. Попробуйте еще раз.");
        }
        return;
      }

      if (result?.data?.user) {
        toast.success(
          "Регистрация успешна! Проверьте email для подтверждения.",
        );
        router.push("/auth/verify?email=" + encodeURIComponent(values.email));
      }
    } catch (err) {
      console.error("Registration error:", err);
      setError("Произошла ошибка при регистрации");
    }
  };

  const handleGoogleSignUp = async () => {
    try {
      setError("");
      // TODO: Реализовать регистрацию через Google OAuth
      toast.info("Регистрация через Google будет доступна в ближайшее время");
    } catch (err) {
      console.error("Google signup error:", err);
      setError("Ошибка при регистрации через Google");
    }
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
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Имя</FormLabel>
                    <FormControl>
                      <Input placeholder="Иван" {...field} />
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
                      <Input placeholder="Иванов" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="m@example.com"
                      type="email"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Пароль</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        placeholder="Создайте пароль"
                        type={showPassword ? "text" : "password"}
                        className="pr-10"
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
            <AuthError error={error} />
            <Button
              type="submit"
              className="w-full"
              disabled={form.formState.isSubmitting}
            >
              {form.formState.isSubmitting
                ? "Создание аккаунта..."
                : "Создать аккаунт"}
            </Button>
            <Button
              variant="outline"
              className="w-full"
              onClick={handleGoogleSignUp}
              disabled={form.formState.isSubmitting}
            >
              Зарегистрироваться через Google
            </Button>
          </form>
        </Form>
        <div className="mt-4 text-center text-sm">
          Уже есть аккаунт?{" "}
          <a href="/auth/login" className="underline">
            Войти
          </a>
        </div>
      </CardContent>
    </Card>
  );
}
