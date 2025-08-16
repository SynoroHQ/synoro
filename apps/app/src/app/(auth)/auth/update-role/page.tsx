import { Suspense } from "react";
import { UpdateRolePage } from "@/features/auth/pages/update-role-page";
import { UpdateRoleSkeleton } from "@/features/auth/components/update-role-skeleton";

export default function UpdateRolePageServer() {
  return (
    <Suspense fallback={<UpdateRoleSkeleton />}>
      <UpdateRolePage />
    </Suspense>
  );
}
