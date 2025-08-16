import { Suspense } from "react";
import { EmailChangeVerificationSkeleton } from "@/features/auth/components/email-change-verification-skeleton";
import { EmailChangeVerificationPage } from "@/features/auth/pages/email-change-verification-page";

export default function EmailChangeVerificationPageServer() {
  return (
    <Suspense fallback={<EmailChangeVerificationSkeleton />}>
      <EmailChangeVerificationPage />
    </Suspense>
  );
}
