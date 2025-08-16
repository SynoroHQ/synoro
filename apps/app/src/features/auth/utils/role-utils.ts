// Role utility functions

export const ROLE_HIERARCHY = {
  super_admin: 5,
  admin: 4,
  moderator: 3,
  editor: 2,
  user: 1,
} as const;

export type UserRole = keyof typeof ROLE_HIERARCHY;

export function hasPermission(
  userRole: UserRole,
  requiredRole: UserRole,
): boolean {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole];
}

export function getRoleDisplayName(role: UserRole): string {
  const displayNames: Record<UserRole, string> = {
    super_admin: "Super Admin",
    admin: "Admin",
    moderator: "Moderator",
    editor: "Editor",
    user: "User",
  };

  return displayNames[role];
}

export function getRoleColor(role: UserRole): string {
  const colors: Record<UserRole, string> = {
    super_admin: "text-red-600 bg-red-50",
    admin: "text-purple-600 bg-purple-50",
    moderator: "text-blue-600 bg-blue-50",
    editor: "text-green-600 bg-green-50",
    user: "text-gray-600 bg-gray-50",
  };

  return colors[role];
}

export function canManageRole(
  userRole: UserRole,
  targetRole: UserRole,
): boolean {
  // Users can only manage roles lower than their own
  return ROLE_HIERARCHY[userRole] > ROLE_HIERARCHY[targetRole];
}
