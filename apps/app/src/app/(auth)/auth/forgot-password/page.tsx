import { Suspense } from "react";
import { ForgotPasswordSkeleton } from "@/features/auth/components/forgot-password-skeleton";
import { ForgotPasswordPage } from "@/features/auth/pages/forgot-password-page";

export default function ForgotPasswordPageServer() {
  return (
    <Suspense fallback={<ForgotPasswordSkeleton />}>
      <ForgotPasswordPage />
    </Suspense>
  );
}
