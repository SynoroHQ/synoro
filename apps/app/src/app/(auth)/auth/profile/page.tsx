import { Suspense } from "react";
import { ProfileSkeleton } from "@/features/auth/components/profile-skeleton";
import { ProfilePage } from "@/features/auth/pages/profile-page";

export default function ProfilePageServer() {
  return (
    <Suspense fallback={<ProfileSkeleton />}>
      <ProfilePage />
    </Suspense>
  );
}
