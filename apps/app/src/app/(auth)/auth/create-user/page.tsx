import { Suspense } from "react";
import { CreateUserSkeleton } from "@/features/auth/components/create-user-skeleton";
import { CreateUserPage } from "@/features/auth/pages/create-user-page";

export default function CreateUserPageServer() {
  return (
    <Suspense fallback={<CreateUserSkeleton />}>
      <CreateUserPage />
    </Suspense>
  );
}
