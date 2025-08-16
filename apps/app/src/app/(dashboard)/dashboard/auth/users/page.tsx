import { Suspense } from "react";
import { UsersSkeleton } from "@/features/auth/components/users-skeleton";
import { UsersPage } from "@/features/auth/pages/users-page";

export default function UsersPageServer() {
  return (
    <Suspense fallback={<UsersSkeleton />}>
      <UsersPage />
    </Suspense>
  );
}
