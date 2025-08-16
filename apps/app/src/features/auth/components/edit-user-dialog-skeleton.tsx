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

export function EditUserDialogSkeleton() {
  return (
    <Dialog open={false}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Skeleton className="h-5 w-5" />
            <Skeleton className="h-6 w-24" />
          </DialogTitle>
          <DialogDescription>
            <Skeleton className="h-4 w-48" />
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

          {/* Role and Status fields skeleton */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Skeleton className="h-4 w-12" />
              <Skeleton className="h-9 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-9 w-full" />
            </div>
          </div>

          {/* Change Password switch skeleton */}
          <div className="flex items-center space-x-2">
            <Skeleton className="h-6 w-6" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>

        <DialogFooter>
          <Skeleton className="h-10 w-20" />
          <Skeleton className="h-10 w-28" />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
