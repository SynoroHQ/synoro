import { Suspense } from "react";
import { UpdateUserSkeleton } from "@/features/auth/components/update-user-skeleton";
import { UpdateUserPage } from "@/features/auth/pages/update-user-page";

export default function UpdateUserPageServer() {
  return (
    <Suspense fallback={<UpdateUserSkeleton />}>
      <UpdateUserPage />
    </Suspense>
  );
}
