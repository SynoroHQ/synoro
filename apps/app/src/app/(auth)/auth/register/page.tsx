import { Metadata } from "next";
import { AuthLogo } from "@/components/auth/auth-logo";
import { RegisterForm } from "@/features/auth/components/register-form";

export const metadata: Metadata = {
  title: "Регистрация",
  description: "Создайте аккаунт в Synoro и начните управлять своими жизненными событиями, задачами и аналитикой",
  keywords: [
    "Synoro",
    "регистрация",
    "создать аккаунт",
    "умный дом",
    "управление задачами",
    "аналитика",
    "планирование"
  ],
  robots: {
    index: false,
    follow: false,
  },
};

export default function RegisterPage() {
  return (
    <>
      <AuthLogo />
      <RegisterForm />
    </>
  );
}
