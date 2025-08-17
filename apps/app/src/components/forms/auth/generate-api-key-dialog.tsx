"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
  Textarea,
  Checkbox,
  Calendar,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@synoro/ui";
import { CalendarIcon, Key } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const generateApiKeySchema = z.object({
  name: z.string().min(2, "Key name must be at least 2 characters"),
  description: z.string().optional(),
  permissions: z.array(z.string()).min(1, "Select at least one permission"),
  expiresAt: z.date().optional(),
});

type GenerateApiKeyFormValues = z.infer<typeof generateApiKeySchema>;

interface GenerateApiKeyDialogProps {
  children: React.ReactNode;
}

const availableApiPermissions = [
  {
    category: "Read Access",
    permissions: [
      { id: "read:users", label: "Read Users" },
      { id: "read:content", label: "Read Content" },
      { id: "read:analytics", label: "Read Analytics" },
      { id: "read:logs", label: "Read Logs" },
    ],
  },
  {
    category: "Write Access",
    permissions: [
      { id: "write:users", label: "Write Users" },
      { id: "write:content", label: "Write Content" },
      { id: "write:settings", label: "Write Settings" },
    ],
  },
  {
    category: "Admin Access",
    permissions: [
      { id: "admin:system", label: "System Administration" },
      { id: "admin:users", label: "User Administration" },
      { id: "admin:security", label: "Security Administration" },
    ],
  },
];

export function GenerateApiKeyDialog({ children }: GenerateApiKeyDialogProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [generatedKey, setGeneratedKey] = useState<string | null>(null);

  const form = useForm<GenerateApiKeyFormValues>({
    resolver: zodResolver(generateApiKeySchema),
    defaultValues: {
      name: "",
      description: "",
      permissions: [],
      expiresAt: undefined,
    },
  });

  const onSubmit = async (values: GenerateApiKeyFormValues) => {
    setIsLoading(true);
    try {
      // TODO: Implement actual API key generation logic
      console.log("Generating API key:", values);
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate API call
      
      // Simulate generated key
      const mockKey = `sk_${Math.random().toString(36).substring(2, 15)}_${Math.random().toString(36).substring(2, 15)}`;
      setGeneratedKey(mockKey);
      
      toast.success("API key generated successfully");
    } catch (error) {
      toast.error("Failed to generate API key");
      console.error("Error generating API key:", error);
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

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("API key copied to clipboard");
  };

  const handleClose = () => {
    setOpen(false);
    setGeneratedKey(null);
    form.reset();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            Generate New API Key
          </DialogTitle>
          <DialogDescription>
            Create a new API key with specific permissions and expiration date.
          </DialogDescription>
        </DialogHeader>
        
        {!generatedKey ? (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Key Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Production API Key" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="expiresAt"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Expiration Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) => date < new Date()}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description (Optional)</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Describe the purpose of this API key"
                        className="resize-none"
                        rows={2}
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div>
                <FormLabel className="text-base font-medium">Permissions</FormLabel>
                <div className="mt-3 space-y-4">
                  {availableApiPermissions.map((category) => (
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
                  onClick={handleClose}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Generating..." : "Generate Key"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        ) : (
          <div className="space-y-4">
            <div className="bg-muted p-4 rounded-lg">
              <h4 className="font-medium mb-2">Your API Key</h4>
              <p className="text-sm text-muted-foreground mb-3">
                Copy this key now. You won't be able to see it again.
              </p>
              <div className="flex items-center gap-2">
                <code className="bg-background px-3 py-2 rounded text-sm font-mono flex-1">
                  {generatedKey}
                </code>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(generatedKey)}
                >
                  Copy
                </Button>
              </div>
            </div>
            
            <div className="flex justify-end">
              <Button onClick={handleClose}>
                Done
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
