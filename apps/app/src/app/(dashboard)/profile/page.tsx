import type { Metadata } from "next";
import { ProfilePage } from "@/features/profile/pages/profile-page";

export const metadata: Metadata = {
  title: "Профиль",
  description: "Профиль пользователя",
};

export default function Profile() {
  return <ProfilePage />;
}
