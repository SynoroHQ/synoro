import { Suspense } from "react";
import { ListPermissionsPage } from "@/features/auth/pages/list-permissions-page";
import { ListPermissionsSkeleton } from "@/features/auth/components/list-permissions-skeleton";

export default function ListPermissionsPageServer() {
  return (
    <Suspense fallback={<ListPermissionsSkeleton />}>
      <ListPermissionsPage />
    </Suspense>
  );
}
