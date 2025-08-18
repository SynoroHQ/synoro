import { ResetPasswordPage } from "@/features/auth/pages/reset-password-page";

export const metadata = {
  title: "Сброс пароля",
  description: "Создайте новый пароль для вашего аккаунта Synoro",
  robots: {
    index: false,
    follow: false,
  },
};

export default function ResetPasswordPageServer() {
  return <ResetPasswordPage />;
}
