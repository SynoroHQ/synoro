"use client";

import { Suspense } from "react";

import { EmptyUsers } from "../components/empty-users";
import { UsersError } from "../components/users-error";
import { UsersList } from "../components/users-list";
import { UsersSkeleton } from "../components/users-skeleton";
import { useAuth } from "../hooks/use-auth";

export function UsersPage() {
  const { users, isLoadingUsers, usersError } = useAuth();

  if (isLoadingUsers) return <UsersSkeleton />;
  if (usersError) return <UsersError error={usersError} />;
  if (!users?.length) return <EmptyUsers />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Users</h1>
        <div className="flex items-center gap-2">
          {/* Action buttons will go here */}
        </div>
      </div>

      <Suspense fallback={<UsersSkeleton />}>
        <UsersList users={users} />
      </Suspense>
    </div>
  );
}
