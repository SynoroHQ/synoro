import { Suspense } from "react";
import { RegisterSkeleton } from "@/features/auth/components/register-skeleton";
import { RegisterPage } from "@/features/auth/pages/register-page";

export default function RegisterPageServer() {
  return (
    <Suspense fallback={<RegisterSkeleton />}>
      <RegisterPage />
    </Suspense>
  );
}
