import { Suspense } from "react";
import { EmailVerificationSkeleton } from "@/features/auth/components/email-verification-skeleton";
import { EmailVerificationPage } from "@/features/auth/pages/email-verification-page";

export default function EmailVerificationPageServer() {
  return (
    <Suspense fallback={<EmailVerificationSkeleton />}>
      <EmailVerificationPage />
    </Suspense>
  );
}
