import { ProtectedRoute } from "@/components/auth/protected-route";
import { useAuth } from "@/hooks/use-auth";

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}

function DashboardContent() {
  const { user } = useAuth();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Добро пожаловать в панель управления
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="bg-card rounded-lg border p-6">
          <h3 className="text-lg font-semibold">Профиль</h3>
          <p className="text-muted-foreground mt-2">
            Имя: {user?.firstName} {user?.lastName}
          </p>
          <p className="text-muted-foreground">Email: {user?.email}</p>
          <p className="text-muted-foreground">Роль: {user?.role}</p>
        </div>

        <div className="bg-card rounded-lg border p-6">
          <h3 className="text-lg font-semibold">Статистика</h3>
          <p className="text-muted-foreground mt-2">Мониторы: 0</p>
          <p className="text-muted-foreground">Статус страницы: 0</p>
        </div>

        <div className="bg-card rounded-lg border p-6">
          <h3 className="text-lg font-semibold">Быстрые действия</h3>
          <div className="mt-4 space-y-2">
            <a
              href="/dashboard/monitors/new"
              className="bg-primary text-primary-foreground hover:bg-primary/90 block rounded-md px-3 py-2 text-sm"
            >
              Создать монитор
            </a>
            <a
              href="/dashboard/status-pages/new"
              className="bg-secondary text-secondary-foreground hover:bg-secondary/80 block rounded-md px-3 py-2 text-sm"
            >
              Создать статус страницу
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
