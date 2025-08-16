import { Suspense } from "react";
import { CreateRoleSkeleton } from "@/features/auth/components/create-role-skeleton";
import { CreateRolePage } from "@/features/auth/pages/create-role-page";

export default function CreateRolePageServer() {
  return (
    <Suspense fallback={<CreateRoleSkeleton />}>
      <CreateRolePage />
    </Suspense>
  );
}
