import { Suspense } from "react";
import { ListUsersSkeleton } from "@/features/auth/components/list-users-skeleton";
import { ListUsersPage } from "@/features/auth/pages/list-users-page";

export default function ListUsersPageServer() {
  return (
    <Suspense fallback={<ListUsersSkeleton />}>
      <ListUsersPage />
    </Suspense>
  );
}
