import { Suspense } from "react";
import { DeleteRoleSkeleton } from "@/features/auth/components/delete-role-skeleton";
import { DeleteRolePage } from "@/features/auth/pages/delete-role-page";

export default function DeleteRolePageServer() {
  return (
    <Suspense fallback={<DeleteRoleSkeleton />}>
      <DeleteRolePage />
    </Suspense>
  );
}
