"use client";

import { useSession } from "@synoro/auth/client";

import { ProfileInfo } from "../components/profile-info";
import { ProfileSettings } from "../components/profile-settings";
import { ProfileStats } from "../components/profile-stats";

export function ProfilePage() {
  const { data: session } = useSession();

  if (!session?.user) {
    return (
      <div className="p-6">
        <p>Загрузка профиля...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Профиль пользователя</h1>
        <p className="text-muted-foreground">
          Управление личной информацией и настройками
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <ProfileInfo />
        <ProfileStats />
      </div>

      <ProfileSettings />
    </div>
  );
}
