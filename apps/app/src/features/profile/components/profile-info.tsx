"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@synoro/ui/components/card";

import { ProfileForm } from "./profile-form";

export function ProfileInfo() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Основная информация</CardTitle>
        <CardDescription>
          Ваши личные данные и контактная информация
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ProfileForm />
      </CardContent>
    </Card>
  );
}
