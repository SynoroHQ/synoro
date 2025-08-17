import { ProfileForm } from "../components/profile-form";

export function ProfilePage() {
  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Профиль</h1>
        <p className="text-muted-foreground">
          Управляйте информацией о себе и настройками аккаунта
        </p>
      </div>
      <ProfileForm />
    </div>
  );
}
