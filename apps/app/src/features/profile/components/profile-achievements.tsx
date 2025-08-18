"use client";

import {
  Award,
  Calendar,
  CheckCircle,
  FileText,
  Heart,
  Star,
  Target,
  Trophy,
  Users,
  Zap,
} from "lucide-react";

import { Badge } from "@synoro/ui/components/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@synoro/ui/components/card";
import { Progress } from "@synoro/ui/components/progress";

export function ProfileAchievements() {
  // Здесь будут реальные данные из API
  const achievements = [
    {
      id: 1,
      name: "Первые шаги",
      description: "Создайте первое событие",
      icon: Star,
      progress: 100,
      completed: true,
      points: 50,
      category: "События",
    },
    {
      id: 2,
      name: "Организатор",
      description: "Создайте 10 событий",
      icon: Calendar,
      progress: 60,
      completed: false,
      points: 100,
      category: "События",
    },
    {
      id: 3,
      name: "Трудолюбивый",
      description: "Выполните 25 задач",
      icon: CheckCircle,
      progress: 100,
      completed: true,
      points: 75,
      category: "Задачи",
    },
    {
      id: 4,
      name: "Социальный",
      description: "Добавьте 5 контактов",
      icon: Users,
      progress: 80,
      completed: false,
      points: 60,
      category: "Социальность",
    },
    {
      id: 5,
      name: "Документалист",
      description: "Загрузите 20 документов",
      icon: FileText,
      progress: 35,
      completed: false,
      points: 120,
      category: "Документы",
    },
    {
      id: 6,
      name: "Скоростной",
      description: "Выполните 5 задач за день",
      icon: Zap,
      progress: 100,
      completed: true,
      points: 80,
      category: "Продуктивность",
    },
  ];

  const completedAchievements = achievements.filter((a) => a.completed);
  const totalPoints = completedAchievements.reduce(
    (sum, a) => sum + a.points,
    0,
  );
  const completionRate =
    (completedAchievements.length / achievements.length) * 100;

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      События:
        "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300",
      Задачи:
        "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300",
      Социальность:
        "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300",
      Документы:
        "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300",
      Продуктивность:
        "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300",
    };
    return (
      colors[category] ||
      "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300"
    );
  };

  const getIconColor = (category: string) => {
    const colors: Record<string, string> = {
      События: "text-blue-600",
      Задачи: "text-green-600",
      Социальность: "text-purple-600",
      Документы: "text-orange-600",
      Продуктивность: "text-red-600",
    };
    return colors[category] || "text-gray-600";
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5" />
              Достижения
            </CardTitle>
            <CardDescription>
              Отслеживайте свой прогресс и получайте награды
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline">
              {completedAchievements.length}/{achievements.length}
            </Badge>
            <Badge variant="default">{totalPoints} очков</Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Общий прогресс */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Общий прогресс</span>
            <span className="text-muted-foreground text-sm">
              {completionRate.toFixed(0)}%
            </span>
          </div>
          <Progress value={completionRate} className="h-2" />
        </div>

        {/* Список достижений */}
        <div className="space-y-4">
          <h4 className="text-muted-foreground text-sm font-medium tracking-wide uppercase">
            Доступные достижения
          </h4>

          <div className="grid gap-3">
            {achievements.map((achievement) => {
              const IconComponent = achievement.icon;
              return (
                <div
                  key={achievement.id}
                  className={`rounded-lg border p-4 transition-all ${
                    achievement.completed
                      ? "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/10"
                      : "bg-muted/30 border-border hover:bg-muted/50"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`rounded-lg p-2 ${
                        achievement.completed
                          ? "bg-green-100 dark:bg-green-900/20"
                          : "bg-muted"
                      }`}
                    >
                      <IconComponent
                        className={`h-5 w-5 ${
                          achievement.completed
                            ? "text-green-600"
                            : getIconColor(achievement.category)
                        }`}
                      />
                    </div>

                    <div className="flex-1 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <h5
                            className={`font-medium ${
                              achievement.completed
                                ? "text-green-800 dark:text-green-200"
                                : ""
                            }`}
                          >
                            {achievement.name}
                          </h5>
                          {achievement.completed && (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant="outline"
                            className={`text-xs ${getCategoryColor(achievement.category)}`}
                          >
                            {achievement.category}
                          </Badge>
                          <Badge variant="secondary" className="text-xs">
                            {achievement.points} очков
                          </Badge>
                        </div>
                      </div>

                      <p className="text-muted-foreground text-sm">
                        {achievement.description}
                      </p>

                      {!achievement.completed && (
                        <div className="space-y-1">
                          <div className="text-muted-foreground flex justify-between text-xs">
                            <span>Прогресс</span>
                            <span>{achievement.progress}%</span>
                          </div>
                          <Progress
                            value={achievement.progress}
                            className="h-1"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Следующие цели */}
        <div className="space-y-3">
          <h4 className="text-muted-foreground text-sm font-medium tracking-wide uppercase">
            Следующие цели
          </h4>

          <div className="grid gap-3">
            {achievements
              .filter((a) => !a.completed)
              .slice(0, 3)
              .map((achievement) => {
                const IconComponent = achievement.icon;
                return (
                  <div
                    key={achievement.id}
                    className="bg-muted/30 hover:bg-muted/50 cursor-pointer rounded-lg border p-3 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="bg-muted rounded-lg p-2">
                        <IconComponent
                          className={`h-4 w-4 ${getIconColor(achievement.category)}`}
                        />
                      </div>
                      <div className="flex-1">
                        <h6 className="text-sm font-medium">
                          {achievement.name}
                        </h6>
                        <p className="text-muted-foreground text-xs">
                          {achievement.description}
                        </p>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {achievement.progress}%
                      </Badge>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
