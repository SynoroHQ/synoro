import { Suspense } from "react";
import { RolesSkeleton } from "@/features/auth/components/roles-skeleton";
import { RolesPage } from "@/features/auth/pages/roles-page";

export default function RolesPageServer() {
  return (
    <Suspense fallback={<RolesSkeleton />}>
      <RolesPage />
    </Suspense>
  );
}
