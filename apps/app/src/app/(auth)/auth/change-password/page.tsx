import { Suspense } from "react";
import { ChangePasswordSkeleton } from "@/features/auth/components/change-password-skeleton";
import { ChangePasswordPage } from "@/features/auth/pages/change-password-page";

export default function ChangePasswordPageServer() {
  return (
    <Suspense fallback={<ChangePasswordSkeleton />}>
      <ChangePasswordPage />
    </Suspense>
  );
}
