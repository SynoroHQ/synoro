import { Suspense } from "react";
import { ListRolesSkeleton } from "@/features/auth/components/list-roles-skeleton";
import { ListRolesPage } from "@/features/auth/pages/list-roles-page";

export default function ListRolesPageServer() {
  return (
    <Suspense fallback={<ListRolesSkeleton />}>
      <ListRolesPage />
    </Suspense>
  );
}
