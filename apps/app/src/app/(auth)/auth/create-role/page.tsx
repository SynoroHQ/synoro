import { Suspense } from "react";
import { CreateRolePage } from "@/features/auth/pages/create-role-page";
import { CreateRoleSkeleton } from "@/features/auth/components/create-role-skeleton";

export default function CreateRolePageServer() {
  return (
    <Suspense fallback={<CreateRoleSkeleton />}>
      <CreateRolePage />
    </Suspense>
  );
}
