import { Suspense } from "react";
import { SecuritySkeleton } from "@/features/auth/components/security-skeleton";
import { SecurityPage } from "@/features/auth/pages/security-page";

export default function SecurityPageServer() {
  return (
    <Suspense fallback={<SecuritySkeleton />}>
      <SecurityPage />
    </Suspense>
  );
}
