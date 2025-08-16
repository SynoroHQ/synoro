import { Suspense } from "react";
import { UsersPage } from "@/features/auth/pages/users-page";
import { UsersSkeleton } from "@/features/auth/components/users-skeleton";

export default function UsersPageServer() {
  return (
    <Suspense fallback={<UsersSkeleton />}>
      <UsersPage />
    </Suspense>
  );
}
