import {
  Section,
  SectionDescription,
  SectionGroup,
  SectionHeader,
  SectionTitle,
} from "@/components/content/section";
import { columns } from "@/components/data-table/auth/users/columns";
import { CreateUserDialog } from "@/components/forms/auth/create-user-dialog";
import { Button } from "@synoro/ui/components/button";
import { DataTable } from "@synoro/ui/components/data-table/data-table";
import { Plus, Search } from "lucide-react";

// Mock data for users
const users = [
  {
    id: "1",
    name: "Admin User",
    email: "admin@example.com",
    role: "super_admin",
    status: "active",
    lastLogin: "2024-01-15T10:30:00Z",
    createdAt: "2024-01-01T00:00:00Z",
  },
  {
    id: "2",
    name: "Moderator User",
    email: "moderator@example.com",
    role: "moderator",
    status: "active",
    lastLogin: "2024-01-14T15:45:00Z",
    createdAt: "2024-01-05T00:00:00Z",
  },
  {
    id: "3",
    name: "Editor User",
    email: "editor@example.com",
    role: "editor",
    status: "inactive",
    lastLogin: "2024-01-10T09:20:00Z",
    createdAt: "2024-01-10T00:00:00Z",
  },
];

export default function UsersPage() {
  return (
    <SectionGroup>
      <Section>
        <SectionHeader>
          <SectionTitle>Users</SectionTitle>
          <SectionDescription>
            Manage user accounts, roles, and access permissions.
          </SectionDescription>
        </SectionHeader>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Search className="text-muted-foreground absolute top-2.5 left-2 h-4 w-4" />
              <input
                placeholder="Search users..."
                className="w-64 rounded-md border py-2 pr-4 pl-8"
              />
            </div>
          </div>

          <CreateUserDialog>
            <Button size="sm" className="gap-2">
              <Plus className="h-4 w-4" />
              Add User
            </Button>
          </CreateUserDialog>
        </div>

        <DataTable columns={columns} data={users} />
      </Section>
    </SectionGroup>
  );
}
