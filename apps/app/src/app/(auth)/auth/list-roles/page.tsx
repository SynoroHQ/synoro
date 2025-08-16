import { Suspense } from "react";
import { ListRolesPage } from "@/features/auth/pages/list-roles-page";
import { ListRolesSkeleton } from "@/features/auth/components/list-roles-skeleton";

export default function ListRolesPageServer() {
  return (
    <Suspense fallback={<ListRolesSkeleton />}>
      <ListRolesPage />
    </Suspense>
  );
}
