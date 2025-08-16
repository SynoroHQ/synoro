import { Suspense } from "react";
import { LogoutSkeleton } from "@/features/auth/components/logout-skeleton";
import { LogoutPage } from "@/features/auth/pages/logout-page";

export default function LogoutPageServer() {
  return (
    <Suspense fallback={<LogoutSkeleton />}>
      <LogoutPage />
    </Suspense>
  );
}
