import { Suspense } from "react";
import { UpdateUserPage } from "@/features/auth/pages/update-user-page";
import { UpdateUserSkeleton } from "@/features/auth/components/update-user-skeleton";

export default function UpdateUserPageServer() {
  return (
    <Suspense fallback={<UpdateUserSkeleton />}>
      <UpdateUserPage />
    </Suspense>
  );
}
