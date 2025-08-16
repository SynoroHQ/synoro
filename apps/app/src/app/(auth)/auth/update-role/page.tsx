import { Suspense } from "react";
import { UpdateRoleSkeleton } from "@/features/auth/components/update-role-skeleton";
import { UpdateRolePage } from "@/features/auth/pages/update-role-page";

export default function UpdateRolePageServer() {
  return (
    <Suspense fallback={<UpdateRoleSkeleton />}>
      <UpdateRolePage />
    </Suspense>
  );
}
