"use client";

import type { z } from "zod";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Loader2, Mail } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { emailOtp } from "@synoro/auth/client";
import { Button } from "@synoro/ui/components/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@synoro/ui/components/form";
import { Input } from "@synoro/ui/components/input";
import { verifyOtpSchema } from "@synoro/validators";

type VerifyFormValues = z.infer<typeof verifyOtpSchema>;

export function VerifyForm() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email");
  const router = useRouter();

  const [countdown, setCountdown] = useState(0);
  const [error, setError] = useState("");

  const form = useForm<VerifyFormValues>({
    resolver: zodResolver(verifyOtpSchema),
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

    try {
      setError("");
      const result = await emailOtp.verifyEmail({
        email,
        otp: values.otp,
      });

      if (result?.error?.code) {
        if (result.error.code === "INVALID_OTP") {
          setError("Неверный код подтверждения");
        } else if (result.error.code === "OTP_EXPIRED") {
          setError("Код подтверждения истек");
        } else {
          setError("Ошибка верификации");
        }
        return;
      }

      if (result?.data?.user) {
        toast.success("Email успешно подтвержден!");
        router.push("/auth/login");
      }
    } catch (err) {
      console.error("Verification error:", err);
      setError("Произошла ошибка при верификации");
    }
  };

  const handleResend = async () => {
    if (!email) return;

    try {
      const result = await emailOtp.sendVerificationOtp({
        email,
        type: "email-verification",
      });

      if (result?.error) {
        setError("Ошибка при отправке кода");
        return;
      }

      if (result?.data?.success) {
        toast.success("Код подтверждения отправлен повторно");
        setCountdown(60);
      }
    } catch (err) {
      console.error("Resend error:", err);
      setError("Ошибка при повторной отправке");
    }
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

      <div className="space-y-4">
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

        <div className="text-center">
          <p className="text-muted-foreground mb-2 text-sm">Не получили код?</p>
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
      </div>

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
