"use client";

import {
  Activity,
  Calendar,
  CheckCircle,
  Clock,
  FileText,
  MoreHorizontal,
  TrendingUp,
  Users,
} from "lucide-react";

import { Badge } from "@synoro/ui/components/badge";
import { Button } from "@synoro/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@synoro/ui/components/card";

export function ProfileActivity() {
  // Здесь будут реальные данные из API
  const activities = [
    {
      id: 1,
      type: "event_created",
      title: "Создано событие",
      description: "Встреча команды разработки",
      timestamp: "2 часа назад",
      icon: Calendar,
      color: "text-blue-600",
      bgColor: "bg-blue-100 dark:bg-blue-900/20",
    },
    {
      id: 2,
      type: "task_completed",
      title: "Задача выполнена",
      description: "Настройка CI/CD pipeline",
      timestamp: "4 часа назад",
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-100 dark:bg-green-900/20",
    },
    {
      id: 3,
      type: "document_uploaded",
      title: "Документ загружен",
      description: "Техническое задание проекта",
      timestamp: "1 день назад",
      icon: FileText,
      color: "text-orange-600",
      bgColor: "bg-orange-100 dark:bg-orange-900/20",
    },
    {
      id: 4,
      type: "connection_added",
      title: "Добавлен контакт",
      description: "Анна Петрова - Дизайнер",
      timestamp: "2 дня назад",
      icon: Users,
      color: "text-purple-600",
      bgColor: "bg-purple-100 dark:bg-purple-900/20",
    },
    {
      id: 5,
      type: "achievement_unlocked",
      title: "Достижение разблокировано",
      description: "Первые шаги - 50 очков",
      timestamp: "3 дня назад",
      icon: TrendingUp,
      color: "text-yellow-600",
      bgColor: "bg-yellow-100 dark:bg-yellow-900/20",
    },
  ];

  const getActivityIcon = (type: string) => {
    const iconMap: Record<string, any> = {
      event_created: Calendar,
      task_completed: CheckCircle,
      document_uploaded: FileText,
      connection_added: Users,
      achievement_unlocked: TrendingUp,
    };
    return iconMap[type] || Activity;
  };

  const getActivityColor = (type: string) => {
    const colorMap: Record<string, string> = {
      event_created: "text-blue-600",
      task_completed: "text-green-600",
      document_uploaded: "text-orange-600",
      connection_added: "text-purple-600",
      achievement_unlocked: "text-yellow-600",
    };
    return colorMap[type] || "text-gray-600";
  };

  const getActivityBgColor = (type: string) => {
    const bgColorMap: Record<string, string> = {
      event_created: "bg-blue-100 dark:bg-blue-900/20",
      task_completed: "bg-green-100 dark:bg-green-900/20",
      document_uploaded: "bg-orange-100 dark:bg-orange-900/20",
      connection_added: "bg-purple-100 dark:bg-purple-900/20",
      achievement_unlocked: "bg-yellow-100 dark:bg-yellow-900/20",
    };
    return bgColorMap[type] || "bg-gray-100 dark:bg-gray-900/20";
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Последняя активность
            </CardTitle>
            <CardDescription>Ваши недавние действия в системе</CardDescription>
          </div>
          <Button variant="outline" size="sm">
            <Clock className="mr-2 h-4 w-4" />
            Все действия
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          {activities.map((activity) => {
            const IconComponent = getActivityIcon(activity.type);
            const iconColor = getActivityColor(activity.type);
            const bgColor = getActivityBgColor(activity.type);

            return (
              <div
                key={activity.id}
                className="hover:bg-muted/30 flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors"
              >
                <div className={`rounded-lg p-2 ${bgColor}`}>
                  <IconComponent className={`h-4 w-4 ${iconColor}`} />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <h6 className="truncate text-sm font-medium">
                        {activity.title}
                      </h6>
                      <p className="text-muted-foreground truncate text-sm">
                        {activity.description}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 opacity-0 transition-opacity group-hover:opacity-100"
                    >
                      <MoreHorizontal className="h-3 w-3" />
                    </Button>
                  </div>

                  <div className="mt-2 flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {activity.timestamp}
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      {activity.type.replace("_", " ")}
                    </Badge>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Статистика активности */}
        <div className="border-t pt-4">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600">12</div>
              <div className="text-muted-foreground text-xs">Событий</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">28</div>
              <div className="text-muted-foreground text-xs">Задач</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600">8</div>
              <div className="text-muted-foreground text-xs">Контактов</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
