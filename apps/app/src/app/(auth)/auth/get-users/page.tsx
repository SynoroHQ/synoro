import { Suspense } from "react";
import { GetUsersSkeleton } from "@/features/auth/components/get-users-skeleton";
import { GetUsersPage } from "@/features/auth/pages/get-users-page";

export default function GetUsersPageServer() {
  return (
    <Suspense fallback={<GetUsersSkeleton />}>
      <GetUsersPage />
    </Suspense>
  );
}
