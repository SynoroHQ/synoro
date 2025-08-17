"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@synoro/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@synoro/ui/components/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@synoro/ui/components/form";
import { Input } from "@synoro/ui/components/input";
import { Textarea } from "@synoro/ui/components/textarea";
import { Checkbox } from "@synoro/ui/components/checkbox";
import { toast } from "sonner";
import { Plus, Shield } from "lucide-react";

const createRoleSchema = z.object({
  name: z.string().min(2, "Role name must be at least 2 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  permissions: z.array(z.string()).min(1, "Select at least one permission"),
});

type CreateRoleFormValues = z.infer<typeof createRoleSchema>;

interface CreateRoleDialogProps {
  children: React.ReactNode;
}

const availablePermissions = [
  {
    category: "User Management",
    permissions: [
      { id: "view_users", label: "View Users" },
      { id: "create_users", label: "Create Users" },
      { id: "edit_users", label: "Edit Users" },
      { id: "delete_users", label: "Delete Users" },
      { id: "manage_roles", label: "Manage Roles" },
    ],
  },
  {
    category: "Content Management",
    permissions: [
      { id: "view_content", label: "View Content" },
      { id: "create_content", label: "Create Content" },
      { id: "edit_content", label: "Edit Content" },
      { id: "delete_content", label: "Delete Content" },
      { id: "publish_content", label: "Publish Content" },
    ],
  },
  {
    category: "System Settings",
    permissions: [
      { id: "view_settings", label: "View Settings" },
      { id: "edit_settings", label: "Edit Settings" },
      { id: "system_configuration", label: "System Configuration" },
    ],
  },
  {
    category: "Security",
    permissions: [
      { id: "view_logs", label: "View Logs" },
      { id: "security_audit", label: "Security Audit" },
      { id: "access_control", label: "Access Control" },
    ],
  },
];

export function CreateRoleDialog({ children }: CreateRoleDialogProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<CreateRoleFormValues>({
    resolver: zodResolver(createRoleSchema),
    defaultValues: {
      name: "",
      description: "",
      permissions: [],
    },
  });

  const onSubmit = async (values: CreateRoleFormValues) => {
    setIsLoading(true);
    try {
      // TODO: Implement actual role creation logic
      console.log("Creating role:", values);
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate API call
      
      toast.success("Role created successfully");
      setOpen(false);
      form.reset();
    } catch (error) {
      toast.error("Failed to create role");
      console.error("Error creating role:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePermissionChange = (permissionId: string, checked: boolean) => {
    const currentPermissions = form.getValues("permissions");
    if (checked) {
      form.setValue("permissions", [...currentPermissions, permissionId]);
    } else {
      form.setValue("permissions", currentPermissions.filter(id => id !== permissionId));
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Create New Role
          </DialogTitle>
          <DialogDescription>
            Create a new role with specific permissions and access levels.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Content Moderator" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Describe the role's purpose and responsibilities"
                        className="resize-none"
                        rows={3}
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div>
              <FormLabel className="text-base font-medium">Permissions</FormLabel>
              <div className="mt-3 space-y-4">
                {availablePermissions.map((category) => (
                  <div key={category.category} className="border rounded-lg p-4">
                    <h4 className="font-medium mb-3 text-sm text-muted-foreground uppercase tracking-wide">
                      {category.category}
                    </h4>
                    <div className="grid grid-cols-2 gap-3">
                      {category.permissions.map((permission) => (
                        <div key={permission.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={permission.id}
                            checked={form.watch("permissions").includes(permission.id)}
                            onCheckedChange={(checked) => 
                              handlePermissionChange(permission.id, checked as boolean)
                            }
                          />
                          <label
                            htmlFor={permission.id}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            {permission.label}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              {form.formState.errors.permissions && (
                <p className="text-sm text-destructive mt-2">
                  {form.formState.errors.permissions.message}
                </p>
              )}
            </div>
            
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Creating..." : "Create Role"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
