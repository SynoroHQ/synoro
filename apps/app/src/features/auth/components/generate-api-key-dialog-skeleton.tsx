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

export function GenerateApiKeyDialogSkeleton() {
  return (
    <Dialog open={false}>
      <DialogContent className="max-h-[80vh] overflow-y-auto sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Skeleton className="h-5 w-5" />
            <Skeleton className="h-6 w-40" />
          </DialogTitle>
          <DialogDescription>
            <Skeleton className="h-4 w-72" />
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Name and Expiration Date fields skeleton */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-9 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-9 w-full" />
            </div>
          </div>

          {/* Description field skeleton */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-16 w-full" />
          </div>

          {/* Permissions skeleton */}
          <div>
            <Skeleton className="mb-3 h-5 w-24" />
            <div className="space-y-4">
              {[1, 2, 3].map((category) => (
                <div key={category} className="rounded-lg border p-4">
                  <Skeleton className="mb-3 h-4 w-32" />
                  <div className="grid grid-cols-2 gap-3">
                    {[1, 2, 3, 4].map((permission) => (
                      <div
                        key={permission}
                        className="flex items-center space-x-2"
                      >
                        <Skeleton className="h-4 w-4" />
                        <Skeleton className="h-4 w-24" />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
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
