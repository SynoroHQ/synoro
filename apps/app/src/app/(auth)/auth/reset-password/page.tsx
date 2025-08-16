import { Suspense } from "react";
import { ResetPasswordSkeleton } from "@/features/auth/components/reset-password-skeleton";
import { ResetPasswordPage } from "@/features/auth/pages/reset-password-page";

export default function ResetPasswordPageServer() {
  return (
    <Suspense fallback={<ResetPasswordSkeleton />}>
      <ResetPasswordPage />
    </Suspense>
  );
}
