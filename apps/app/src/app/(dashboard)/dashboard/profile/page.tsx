import { Suspense } from "react";
import { ProfileSkeleton } from "@/features/profile/components/profile-skeleton";
import { ProfilePage } from "@/features/profile/pages/profile-page";

export const metadata = {
  title: "Профиль пользователя",
  description: "Управление личной информацией и настройками профиля в Synoro",
  robots: {
    index: false,
    follow: false,
  },
};

export default function ProfilePageServer() {
  return (
    <Suspense fallback={<ProfileSkeleton />}>
      <ProfilePage />
    </Suspense>
  );
}
