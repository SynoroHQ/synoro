import { Suspense } from "react";
import { AuthPage } from "@/features/auth/pages/auth-page";
import { AuthSkeleton } from "@/features/auth/components/auth-skeleton";

export default function AuthPageServer() {
  return (
    <Suspense fallback={<AuthSkeleton />}>
      <AuthPage />
    </Suspense>
  );
}
