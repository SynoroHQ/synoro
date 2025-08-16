"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@synoro/ui/components/dialog";
import { Skeleton } from "@synoro/ui/components/skeleton";

export function CreateUserDialogSkeleton() {
  return (
    <Dialog open={false}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            <Skeleton className="h-6 w-32" />
          </DialogTitle>
          <DialogDescription>
            <Skeleton className="h-4 w-64" />
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Name field skeleton */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-9 w-full" />
          </div>

          {/* Email field skeleton */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-9 w-full" />
          </div>

          {/* Role field skeleton */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-12" />
            <Skeleton className="h-9 w-full" />
          </div>

          {/* Password field skeleton */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-9 w-full" />
          </div>
        </div>

        <DialogFooter>
          <Skeleton className="h-10 w-20" />
          <Skeleton className="h-10 w-24" />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
