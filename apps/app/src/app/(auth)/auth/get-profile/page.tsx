import { Suspense } from "react";
import { GetProfileSkeleton } from "@/features/auth/components/get-profile-skeleton";
import { GetProfilePage } from "@/features/auth/pages/get-profile-page";

export default function GetProfilePageServer() {
  return (
    <Suspense fallback={<GetProfileSkeleton />}>
      <GetProfilePage />
    </Suspense>
  );
}
