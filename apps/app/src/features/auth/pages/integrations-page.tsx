import { IntegrationsForm } from "../components/integrations-form";

export function IntegrationsPage() {
  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Интеграции</h1>
        <p className="text-muted-foreground">
          Подключите внешние сервисы для расширения функционала
        </p>
      </div>
      <IntegrationsForm />
    </div>
  );
}
