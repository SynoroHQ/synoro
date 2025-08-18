"use client";

import {
  Award,
  Calendar,
  CheckCircle,
  Clock,
  FileText,
  Target,
  TrendingUp,
  Users,
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

export function ProfileStats() {
  // Здесь будут реальные данные из API
  const stats = {
    eventsCreated: 12,
    tasksCompleted: 28,
    daysInSystem: 45,
    completionRate: 85,
    level: 3,
    experience: 1250,
    nextLevelExp: 2000,
    achievements: 5,
    connections: 8,
    documents: 15,
  };

  const getLevelProgress = () => {
    return (stats.experience / stats.nextLevelExp) * 100;
  };

  const getLevelTitle = (level: number) => {
    if (level < 5) return "Новичок";
    if (level < 10) return "Активист";
    if (level < 20) return "Эксперт";
    if (level < 50) return "Мастер";
    return "Легенда";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Статистика аккаунта
        </CardTitle>
        <CardDescription>
          Информация о вашей активности и достижениях
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Уровень и опыт */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Award className="h-4 w-4 text-yellow-600" />
              <span className="text-sm font-medium">Уровень {stats.level}</span>
            </div>
            <Badge variant="outline" className="text-xs">
              {getLevelTitle(stats.level)}
            </Badge>
          </div>
          <div className="space-y-2">
            <div className="text-muted-foreground flex justify-between text-xs">
              <span>{stats.experience} XP</span>
              <span>{stats.nextLevelExp} XP</span>
            </div>
            <Progress value={getLevelProgress()} className="h-2" />
          </div>
        </div>

        {/* Основная статистика */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-muted/50 rounded-lg border p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">
              {stats.eventsCreated}
            </div>
            <div className="text-muted-foreground flex items-center justify-center gap-1 text-sm">
              <Calendar className="h-3 w-3" />
              Событий
            </div>
          </div>
          <div className="bg-muted/50 rounded-lg border p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              {stats.tasksCompleted}
            </div>
            <div className="text-muted-foreground flex items-center justify-center gap-1 text-sm">
              <CheckCircle className="h-3 w-3" />
              Задач
            </div>
          </div>
        </div>

        {/* Дополнительная статистика */}
        <div className="space-y-3">
          <div className="bg-muted/30 flex items-center justify-between rounded-lg border p-3">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-purple-600" />
              <span className="text-sm">Дней в системе</span>
            </div>
            <span className="font-semibold">{stats.daysInSystem}</span>
          </div>

          <div className="bg-muted/30 flex items-center justify-between rounded-lg border p-3">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-orange-600" />
              <span className="text-sm">Процент выполнения</span>
            </div>
            <span className="font-semibold">{stats.completionRate}%</span>
          </div>

          <div className="bg-muted/30 flex items-center justify-between rounded-lg border p-3">
            <div className="flex items-center gap-2">
              <Award className="h-4 w-4 text-yellow-600" />
              <span className="text-sm">Достижения</span>
            </div>
            <span className="font-semibold">{stats.achievements}</span>
          </div>

          <div className="bg-muted/30 flex items-center justify-between rounded-lg border p-3">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-blue-600" />
              <span className="text-sm">Контакты</span>
            </div>
            <span className="font-semibold">{stats.connections}</span>
          </div>

          <div className="bg-muted/30 flex items-center justify-between rounded-lg border p-3">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-green-600" />
              <span className="text-sm">Документы</span>
            </div>
            <span className="font-semibold">{stats.documents}</span>
          </div>
        </div>

        {/* Прогресс недели */}
        <div className="space-y-3">
          <h4 className="text-muted-foreground text-sm font-medium">
            Прогресс этой недели
          </h4>
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span>События</span>
              <span>3/5</span>
            </div>
            <Progress value={60} className="h-2" />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span>Задачи</span>
              <span>7/10</span>
            </div>
            <Progress value={70} className="h-2" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
