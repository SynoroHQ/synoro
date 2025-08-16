"use client";

import { useTRPC } from "@/trpc/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export function useAuth() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  // Get current user
  const userQueryOptions = trpc.auth.getProfile.queryOptions();
  const {
    data: user,
    isLoading: isLoadingUser,
    error: userError,
  } = useQuery(userQueryOptions);

  // Get users list
  const usersQueryOptions = trpc.auth.getUsers.queryOptions();
  const {
    data: users,
    isLoading: isLoadingUsers,
    error: usersError,
  } = useQuery(usersQueryOptions);

  // Create user mutation
  const createUserMutationOptions = trpc.auth.createUser.mutationOptions({
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: trpc.auth.getUsers.queryKey(),
      });
    },
  });
  const { mutate: createUser, isPending: isCreatingUser } = useMutation(
    createUserMutationOptions,
  );

  // Update user mutation
  const updateUserMutationOptions = trpc.auth.updateUser.mutationOptions({
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: trpc.auth.getUsers.queryKey(),
      });
      queryClient.invalidateQueries({
        queryKey: trpc.auth.getProfile.queryKey(),
      });
    },
  });
  const { mutate: updateUser, isPending: isUpdatingUser } = useMutation(
    updateUserMutationOptions,
  );

  // Delete user mutation
  const deleteUserMutationOptions = trpc.auth.deleteUser.mutationOptions({
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: trpc.auth.getUsers.queryKey(),
      });
    },
  });
  const { mutate: deleteUser, isPending: isDeletingUser } = useMutation(
    deleteUserMutationOptions,
  );

  return {
    // User data
    user,
    users,

    // Loading states
    isLoadingUser,
    isLoadingUsers,
    isCreatingUser,
    isUpdatingUser,
    isDeletingUser,

    // Errors
    userError,
    usersError,

    // Actions
    createUser,
    updateUser,
    deleteUser,
  };
}
