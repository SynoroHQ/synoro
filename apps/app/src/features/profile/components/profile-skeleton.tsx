"use client";

import { Avatar, AvatarFallback } from "@synoro/ui/components/avatar";
import { Card, CardContent, CardHeader } from "@synoro/ui/components/card";
import { Skeleton } from "@synoro/ui/components/skeleton";

export function ProfileSkeleton() {
  return (
    <div className="space-y-6">
      <div>
        <Skeleton className="mb-2 h-8 w-64" />
        <Skeleton className="h-4 w-96" />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Основная информация */}
        <Card>
          <CardHeader>
            <Skeleton className="mb-2 h-6 w-32" />
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-4">
              <Avatar className="h-16 w-16">
                <AvatarFallback>
                  <Skeleton className="h-8 w-8 rounded-full" />
                </AvatarFallback>
              </Avatar>
              <div className="space-y-2">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-4 w-40" />
              </div>
            </div>
            <Skeleton className="h-10 w-32" />
          </CardContent>
        </Card>

        {/* Статистика */}
        <Card>
          <CardHeader>
            <Skeleton className="mb-2 h-6 w-40" />
            <Skeleton className="h-4 w-48" />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-muted rounded-lg p-4 text-center">
                <Skeleton className="mx-auto mb-2 h-8 w-8" />
                <Skeleton className="mx-auto h-4 w-24" />
              </div>
              <div className="bg-muted rounded-lg p-4 text-center">
                <Skeleton className="mx-auto mb-2 h-8 w-8" />
                <Skeleton className="mx-auto h-4 w-28" />
              </div>
            </div>
            <div className="bg-muted rounded-lg p-4 text-center">
              <Skeleton className="mx-auto mb-2 h-8 w-8" />
              <Skeleton className="mx-auto h-4 w-32" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Дополнительные настройки */}
      <Card>
        <CardHeader>
          <Skeleton className="mb-2 h-6 w-48" />
          <Skeleton className="h-4 w-72" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <Skeleton className="h-5 w-48" />
              <Skeleton className="h-4 w-64" />
            </div>
            <Skeleton className="h-9 w-24" />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <Skeleton className="h-5 w-36" />
              <Skeleton className="h-4 w-56" />
            </div>
            <Skeleton className="h-9 w-24" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
