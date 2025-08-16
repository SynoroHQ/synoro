import { Suspense } from "react";
import { VerifyEmailSkeleton } from "@/features/auth/components/verify-email-skeleton";
import { VerifyEmailPage } from "@/features/auth/pages/verify-email-page";

export default function VerifyEmailPageServer() {
  return (
    <Suspense fallback={<VerifyEmailSkeleton />}>
      <VerifyEmailPage />
    </Suspense>
  );
}
