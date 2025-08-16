import { Suspense } from "react";
import { DeleteUserPage } from "@/features/auth/pages/delete-user-page";
import { DeleteUserSkeleton } from "@/features/auth/components/delete-user-skeleton";

export default function DeleteUserPageServer() {
  return (
    <Suspense fallback={<DeleteUserSkeleton />}>
      <DeleteUserPage />
    </Suspense>
  );
}
