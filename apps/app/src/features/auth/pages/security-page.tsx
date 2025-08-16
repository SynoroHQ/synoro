import { SecurityForm } from "../components/security-form";

export function SecurityPage() {
  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Безопасность</h1>
        <p className="text-muted-foreground">
          Настройте параметры безопасности вашего аккаунта
        </p>
      </div>
      <SecurityForm />
    </div>
  );
}
