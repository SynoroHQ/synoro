"use client";

import { Avatar, AvatarFallback } from "@synoro/ui/components/avatar";
import { Card, CardContent, CardHeader } from "@synoro/ui/components/card";
import { Skeleton } from "@synoro/ui/components/skeleton";

export function ProfileSkeleton() {
  return (
    <div className="space-y-6">
      {/* Заголовок страницы */}
      <div className="flex items-center justify-between">
        <div>
          <Skeleton className="mb-2 h-9 w-80" />
          <Skeleton className="h-5 w-96" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-6 w-32" />
        </div>
      </div>

      {/* Основная информация */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          {/* Основная информация */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <Skeleton className="mb-2 h-6 w-40" />
                  <Skeleton className="h-4 w-64" />
                </div>
                <Skeleton className="h-9 w-28" />
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Аватар и основная информация */}
              <div className="flex items-start space-x-4">
                <div className="relative">
                  <Skeleton className="h-20 w-20 rounded-full" />
                  <Skeleton className="absolute -right-1 -bottom-1 h-8 w-8 rounded-full" />
                </div>
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-6 w-32" />
                    <Skeleton className="h-5 w-16" />
                  </div>
                  <Skeleton className="h-4 w-48" />
                  <div className="flex items-center gap-4">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-28" />
                  </div>
                </div>
              </div>

              <Skeleton className="h-px w-full" />

              {/* Контактная информация */}
              <div className="space-y-4">
                <Skeleton className="h-4 w-32" />
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="bg-muted/30 flex items-center gap-3 rounded-lg border p-3">
                    <Skeleton className="h-4 w-4" />
                    <div className="flex-1">
                      <Skeleton className="mb-1 h-4 w-16" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                    <Skeleton className="h-5 w-20" />
                  </div>
                  <div className="bg-muted/30 flex items-center gap-3 rounded-lg border p-3">
                    <Skeleton className="h-4 w-4" />
                    <div className="flex-1">
                      <Skeleton className="mb-1 h-4 w-20" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                    <Skeleton className="h-6 w-20" />
                  </div>
                </div>
              </div>

              <Skeleton className="h-px w-full" />

              {/* Дополнительная информация */}
              <div className="space-y-4">
                <Skeleton className="h-4 w-40" />
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="bg-muted/30 flex items-center gap-3 rounded-lg border p-3">
                    <Skeleton className="h-4 w-4" />
                    <div className="flex-1">
                      <Skeleton className="mb-1 h-4 w-24" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                    <Skeleton className="h-6 w-20" />
                  </div>
                  <div className="bg-muted/30 flex items-center gap-3 rounded-lg border p-3">
                    <Skeleton className="h-4 w-4" />
                    <div className="flex-1">
                      <Skeleton className="mb-1 h-4 w-20" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                    <Skeleton className="h-6 w-20" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          {/* Статистика */}
          <Card>
            <CardHeader>
              <Skeleton className="mb-2 h-6 w-40" />
              <Skeleton className="h-4 w-48" />
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Уровень и опыт */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-5 w-16" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Skeleton className="h-3 w-12" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                  <Skeleton className="h-2 w-full" />
                </div>
              </div>

              {/* Основная статистика */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-muted/50 rounded-lg border p-4 text-center">
                  <Skeleton className="mx-auto mb-2 h-8 w-8" />
                  <Skeleton className="mx-auto h-4 w-20" />
                </div>
                <div className="bg-muted/50 rounded-lg border p-4 text-center">
                  <Skeleton className="mx-auto mb-2 h-8 w-8" />
                  <Skeleton className="mx-auto h-4 w-16" />
                </div>
              </div>

              {/* Дополнительная статистика */}
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className="bg-muted/30 flex items-center justify-between rounded-lg border p-3"
                  >
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-4 w-4" />
                      <Skeleton className="h-4 w-20" />
                    </div>
                    <Skeleton className="h-4 w-8" />
                  </div>
                ))}
              </div>

              {/* Прогресс недели */}
              <div className="space-y-3">
                <Skeleton className="h-4 w-32" />
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Skeleton className="h-3 w-16" />
                    <Skeleton className="h-3 w-8" />
                  </div>
                  <Skeleton className="h-2 w-full" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Skeleton className="h-3 w-12" />
                    <Skeleton className="h-3 w-8" />
                  </div>
                  <Skeleton className="h-2 w-full" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Быстрые действия */}
          <Card>
            <CardHeader>
              <Skeleton className="mb-2 h-6 w-32" />
              <Skeleton className="h-4 w-48" />
            </CardHeader>
            <CardContent className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="hover:bg-muted/50 flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors"
                >
                  <Skeleton className="h-4 w-4" />
                  <div className="flex-1">
                    <Skeleton className="mb-1 h-4 w-20" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Дополнительные настройки */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <Skeleton className="mb-2 h-6 w-48" />
              <Skeleton className="h-4 w-72" />
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className="h-5 w-20" />
              <Skeleton className="h-5 w-16" />
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Двухфакторная аутентификация */}
          <div className="bg-muted/30 flex items-center justify-between rounded-lg border p-4">
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-lg" />
              <div>
                <Skeleton className="mb-1 h-5 w-48" />
                <Skeleton className="h-4 w-64" />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Skeleton className="h-6 w-12" />
              <Skeleton className="h-9 w-24" />
            </div>
          </div>

          <Skeleton className="h-px w-full" />

          {/* Уведомления */}
          <div className="space-y-4">
            <Skeleton className="h-4 w-24" />
            <div className="grid gap-4 md:grid-cols-2">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="bg-muted/30 flex items-center justify-between rounded-lg border p-4"
                >
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-10 w-10 rounded-lg" />
                    <div>
                      <Skeleton className="mb-1 h-5 w-32" />
                      <Skeleton className="h-4 w-40" />
                    </div>
                  </div>
                  <Skeleton className="h-6 w-12" />
                </div>
              ))}
            </div>
          </div>

          <Skeleton className="h-px w-full" />

          {/* Приватность и внешний вид */}
          <div className="space-y-4">
            <Skeleton className="h-4 w-40" />
            <div className="grid gap-4 md:grid-cols-2">
              {[...Array(2)].map((_, i) => (
                <div
                  key={i}
                  className="bg-muted/30 flex items-center justify-between rounded-lg border p-4"
                >
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-10 w-10 rounded-lg" />
                    <div>
                      <Skeleton className="mb-1 h-5 w-32" />
                      <Skeleton className="h-4 w-40" />
                    </div>
                  </div>
                  <Skeleton className="h-6 w-12" />
                </div>
              ))}
            </div>
          </div>

          <Skeleton className="h-px w-full" />

          {/* Дополнительные настройки */}
          <div className="space-y-4">
            <Skeleton className="h-4 w-44" />
            <div className="grid gap-4 md:grid-cols-2">
              {[...Array(2)].map((_, i) => (
                <div
                  key={i}
                  className="bg-muted/30 flex items-center justify-between rounded-lg border p-4"
                >
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-10 w-10 rounded-lg" />
                    <div>
                      <Skeleton className="mb-1 h-5 w-32" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                  </div>
                  <Skeleton className="h-9 w-24" />
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
