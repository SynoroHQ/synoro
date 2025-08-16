import { Suspense } from "react";
import { DeleteUserSkeleton } from "@/features/auth/components/delete-user-skeleton";
import { DeleteUserPage } from "@/features/auth/pages/delete-user-page";

export default function DeleteUserPageServer() {
  return (
    <Suspense fallback={<DeleteUserSkeleton />}>
      <DeleteUserPage />
    </Suspense>
  );
}
