import { ForgotPasswordPage } from "@/features/auth/pages/forgot-password-page";

export const metadata = {
  title: "Восстановление пароля",
  description: "Восстановите доступ к вашему аккаунту Synoro",
  robots: {
    index: false,
    follow: false,
  },
};

export default function ForgotPasswordPageServer() {
  return <ForgotPasswordPage />;
}
