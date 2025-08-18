import { VerifyPage } from "@/features/auth/pages/verify-page";

export const metadata = {
  title: "Верификация email",
  description: "Подтвердите ваш email адрес для активации аккаунта Synoro",
  robots: {
    index: false,
    follow: false,
  },
};

export default function VerifyPageServer() {
  return <VerifyPage />;
}
