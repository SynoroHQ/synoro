import { Suspense } from "react";
import { OtpSkeleton } from "@/features/auth/components/otp-skeleton";
import { OtpPage } from "@/features/auth/pages/otp-page";

export default function OtpPageServer() {
  return (
    <Suspense fallback={<OtpSkeleton />}>
      <OtpPage />
    </Suspense>
  );
}
