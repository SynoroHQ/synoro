import { Suspense } from "react";
import { AuthSkeleton } from "@/features/auth/components/auth-skeleton";
import { AuthPage } from "@/features/auth/pages/auth-page";

export default function AuthPageServer() {
  return (
    <Suspense fallback={<AuthSkeleton />}>
      <AuthPage />
    </Suspense>
  );
}
