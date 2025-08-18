"use client";

import { Button } from "@synoro/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@synoro/ui/components/card";

export function ProfileSettings() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Дополнительные настройки</CardTitle>
        <CardDescription>
          Управление безопасностью и уведомлениями
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium">Двухфакторная аутентификация</h4>
            <p className="text-muted-foreground text-sm">
              Дополнительная защита вашего аккаунта
            </p>
          </div>
          <Button variant="outline" size="sm">
            Настроить
          </Button>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium">Email уведомления</h4>
            <p className="text-muted-foreground text-sm">
              Получать уведомления о важных событиях
            </p>
          </div>
          <Button variant="outline" size="sm">
            Настроить
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
