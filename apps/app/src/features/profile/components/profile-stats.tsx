"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@synoro/ui/components/card";

export function ProfileStats() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Статистика аккаунта</CardTitle>
        <CardDescription>Информация о вашей активности</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-muted rounded-lg p-4 text-center">
            <div className="text-2xl font-bold">0</div>
            <div className="text-muted-foreground text-sm">Событий создано</div>
          </div>
          <div className="bg-muted rounded-lg p-4 text-center">
            <div className="text-2xl font-bold">0</div>
            <div className="text-muted-foreground text-sm">Задач выполнено</div>
          </div>
        </div>

        <div className="bg-muted rounded-lg p-4 text-center">
          <div className="text-2xl font-bold">0</div>
          <div className="text-muted-foreground text-sm">Дней в системе</div>
        </div>
      </CardContent>
    </Card>
  );
}
