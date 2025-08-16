import { Suspense } from "react";
import { ListPermissionsSkeleton } from "@/features/auth/components/list-permissions-skeleton";
import { ListPermissionsPage } from "@/features/auth/pages/list-permissions-page";

export default function ListPermissionsPageServer() {
  return (
    <Suspense fallback={<ListPermissionsSkeleton />}>
      <ListPermissionsPage />
    </Suspense>
  );
}
