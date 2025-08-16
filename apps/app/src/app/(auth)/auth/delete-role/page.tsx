import { Suspense } from "react";
import { DeleteRolePage } from "@/features/auth/pages/delete-role-page";
import { DeleteRoleSkeleton } from "@/features/auth/components/delete-role-skeleton";

export default function DeleteRolePageServer() {
  return (
    <Suspense fallback={<DeleteRoleSkeleton />}>
      <DeleteRolePage />
    </Suspense>
  );
}
