import { Suspense } from "react";
import { LoginSkeleton } from "@/features/auth/components/login-skeleton";
import { LoginPage } from "@/features/auth/pages/login-page";

export default function LoginPageServer() {
  return (
    <Suspense fallback={<LoginSkeleton />}>
      <LoginPage />
    </Suspense>
  );
}
