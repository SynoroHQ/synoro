import {
  Section,
  SectionDescription,
  SectionGroup,
  SectionHeader,
  SectionTitle,
} from "@/components/content/section";
import { Button } from "@/components/ui/button";
import { Plus, Shield, Users, Settings } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CreateRoleDialog } from "@/components/forms/auth/create-role-dialog";

const roles = [
  {
    id: "super_admin",
    name: "Super Admin",
    description: "Full system access and control",
    permissions: ["all"],
    userCount: 1,
    color: "destructive",
  },
  {
    id: "admin",
    name: "Admin",
    description: "Administrative access to most features",
    permissions: ["user_management", "system_settings", "content_management"],
    userCount: 3,
    color: "default",
  },
  {
    id: "moderator",
    name: "Moderator",
    description: "Content moderation and user support",
    permissions: ["content_moderation", "user_support", "reports"],
    userCount: 5,
    color: "secondary",
  },
  {
    id: "editor",
    name: "Editor",
    description: "Content creation and editing",
    permissions: ["content_creation", "content_editing", "drafts"],
    userCount: 8,
    color: "outline",
  },
  {
    id: "user",
    name: "User",
    description: "Basic user access",
    permissions: ["view_content", "create_content"],
    userCount: 25,
    color: "outline",
  },
];

const permissionCategories = [
  {
    name: "User Management",
    permissions: ["view_users", "create_users", "edit_users", "delete_users", "manage_roles"],
  },
  {
    name: "Content Management",
    permissions: ["view_content", "create_content", "edit_content", "delete_content", "publish_content"],
  },
  {
    name: "System Settings",
    permissions: ["view_settings", "edit_settings", "system_configuration"],
  },
  {
    name: "Security",
    permissions: ["view_logs", "security_audit", "access_control"],
  },
];

export default function RolesPage() {
  return (
    <SectionGroup>
      <Section>
        <SectionHeader>
          <SectionTitle>Roles & Permissions</SectionTitle>
          <SectionDescription>
            Configure user roles and access control permissions.
          </SectionDescription>
        </SectionHeader>

        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-medium">System Roles</h3>
          <CreateRoleDialog>
            <Button size="sm" className="gap-2">
              <Plus className="h-4 w-4" />
              Create Role
            </Button>
          </CreateRoleDialog>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {roles.map((role) => (
            <Card key={role.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">{role.name}</CardTitle>
                  <Badge variant={role.color as any}>{role.userCount} users</Badge>
                </div>
                <CardDescription>{role.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Shield className="h-4 w-4" />
                    <span>Permissions: {role.permissions.length}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Users className="h-4 w-4" />
                    <span>Active users</span>
                  </div>
                </div>
                <div className="mt-4 flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    Edit
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    Permissions
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </Section>

      <Section>
        <SectionHeader>
          <SectionTitle>Permission Categories</SectionTitle>
          <SectionDescription>
            Overview of available permissions organized by category.
          </SectionDescription>
        </SectionHeader>

        <div className="grid gap-4 md:grid-cols-2">
          {permissionCategories.map((category) => (
            <Card key={category.name}>
              <CardHeader>
                <CardTitle className="text-base">{category.name}</CardTitle>
                <CardDescription>
                  {category.permissions.length} permissions available
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {category.permissions.map((permission) => (
                    <Badge key={permission} variant="outline" className="text-xs">
                      {permission}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </Section>
    </SectionGroup>
  );
}
