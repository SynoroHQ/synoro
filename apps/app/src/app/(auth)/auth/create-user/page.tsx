import { Suspense } from "react";
import { CreateUserPage } from "@/features/auth/pages/create-user-page";
import { CreateUserSkeleton } from "@/features/auth/components/create-user-skeleton";

export default function CreateUserPageServer() {
  return (
    <Suspense fallback={<CreateUserSkeleton />}>
      <CreateUserPage />
    </Suspense>
  );
}
