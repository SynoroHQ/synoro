"use client";

import type { ColumnDef } from "@tanstack/react-table";
import type { User } from "lucide-react";
import { EditUserDialog } from "@/components/forms/auth/edit-user-dialog";
import { formatDistanceToNow } from "date-fns";
import { Edit, MoreHorizontal, Trash2 } from "lucide-react";

import { Badge } from "@synoro/ui/components/badge";
import { Button } from "@synoro/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@synoro/ui/components/dropdown-menu";

export interface User {
  id: string;
  name: string;
  email: string;
  status: "active" | "inactive" | "banned";
  lastLogin: string;
  createdAt: string;
}

const statusColors = {
  active: "default",
  inactive: "secondary",
  banned: "destructive",
} as const;

export const columns: ColumnDef<User>[] = [
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => {
      const user = row.original;
      return (
        <div className="flex items-center space-x-2">
          <div className="bg-muted flex h-8 w-8 items-center justify-center rounded-full">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="font-medium">{user.name}</div>
            <div className="text-muted-foreground text-sm">{user.email}</div>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status");
      return (
        <Badge variant={statusColors[status as keyof typeof statusColors]}>
          {status}
        </Badge>
      );
    },
  },
  {
    accessorKey: "lastLogin",
    header: "Last Login",
    cell: ({ row }) => {
      const date = new Date(row.getValue("lastLogin"));
      return (
        <div className="text-muted-foreground text-sm">
          {formatDistanceToNow(date, { addSuffix: true })}
        </div>
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: "Created",
    cell: ({ row }) => {
      const date = new Date(row.getValue("createdAt"));
      return (
        <div className="text-muted-foreground text-sm">
          {formatDistanceToNow(date, { addSuffix: true })}
        </div>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const user = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <EditUserDialog user={user}>
              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                <Edit className="mr-2 h-4 w-4" />
                Edit User
              </DropdownMenuItem>
            </EditUserDialog>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive">
              <Trash2 className="mr-2 h-4 w-4" />
              Delete User
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
