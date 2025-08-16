import { Suspense } from "react";
import { GetUsersPage } from "@/features/auth/pages/get-users-page";
import { GetUsersSkeleton } from "@/features/auth/components/get-users-skeleton";

export default function GetUsersPageServer() {
  return (
    <Suspense fallback={<GetUsersSkeleton />}>
      <GetUsersPage />
    </Suspense>
  );
}
