import { Suspense } from "react";
import { ListUsersPage } from "@/features/auth/pages/list-users-page";
import { ListUsersSkeleton } from "@/features/auth/components/list-users-skeleton";

export default function ListUsersPageServer() {
  return (
    <Suspense fallback={<ListUsersSkeleton />}>
      <ListUsersPage />
    </Suspense>
  );
}
