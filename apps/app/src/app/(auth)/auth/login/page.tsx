import type { Metadata } from "next";
import { AuthLogo } from "@/components/auth/auth-logo";
import { LoginForm } from "@/features/auth/components/login-form";

export const metadata: Metadata = {
  title: "Вход в систему",
  description:
    "Войдите в свой аккаунт Synoro для управления жизненными событиями, задачами и аналитики",
  keywords: [
    "Synoro",
    "вход",
    "авторизация",
    "личный кабинет",
    "управление задачами",
    "аналитика",
  ],
  robots: {
    index: false,
    follow: false,
  },
};

export default function LoginPage() {
  return (
    <>
      <AuthLogo />
      <LoginForm />
    </>
  );
}
