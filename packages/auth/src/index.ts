import { headers } from "next/headers";

import { auth } from "./config";

export const getSession = async () =>
  auth.api.getSession({
    headers: await headers(),
  });

export * from "./config";

// Components
export * from "./components/forms/auth/create-user-dialog";
export * from "./components/forms/auth/edit-user-dialog";
export * from "./components/forms/auth/create-role-dialog";
export * from "./components/forms/auth/generate-api-key-dialog";

// Navigation
export * from "./components/nav/nav-auth";

// Data Table
export * from "./components/data-table/auth/users/columns";

// App Pages
export * from "./app/dashboard/auth/page";
export * from "./app/dashboard/auth/layout";
export * from "./app/dashboard/auth/overview/page";
export * from "./app/dashboard/auth/users/page";
export * from "./app/dashboard/auth/roles/page";
export * from "./app/dashboard/auth/api-keys/page";

// Types
export type { User } from "./components/data-table/auth/users/columns";
