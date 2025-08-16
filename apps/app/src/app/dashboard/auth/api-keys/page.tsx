"use client";

import {
  Section,
  SectionDescription,
  SectionGroup,
  SectionHeader,
  SectionTitle,
} from "@/components/content/section";
import { Button } from "@synoro/ui/components/button";
import { Plus, Key, Copy, Eye, EyeOff, Trash2 } from "lucide-react";
import { Badge } from "@synoro/ui/components/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@synoro/ui/components/card";
import { useState } from "react";
import { toast } from "sonner";
import { GenerateApiKeyDialog } from "@/components/forms/auth/generate-api-key-dialog";

// Mock data for API keys
const apiKeys = [
  {
    id: "1",
    name: "Production API Key",
    key: "sk_prod_1234567890abcdef",
    permissions: ["read", "write"],
    status: "active",
    lastUsed: "2024-01-15T10:30:00Z",
    createdAt: "2024-01-01T00:00:00Z",
    expiresAt: "2025-01-01T00:00:00Z",
  },
  {
    id: "2",
    name: "Development API Key",
    key: "sk_dev_abcdef1234567890",
    permissions: ["read"],
    status: "active",
    lastUsed: "2024-01-14T15:45:00Z",
    createdAt: "2024-01-05T00:00:00Z",
    expiresAt: "2024-07-01T00:00:00Z",
  },
  {
    id: "3",
    name: "Testing API Key",
    key: "sk_test_7890abcdef123456",
    permissions: ["read"],
    status: "inactive",
    lastUsed: "2024-01-10T09:20:00Z",
    createdAt: "2024-01-10T00:00:00Z",
    expiresAt: "2024-02-01T00:00:00Z",
  },
];

export default function ApiKeysPage() {
  const [visibleKeys, setVisibleKeys] = useState<Set<string>>(new Set());

  const toggleKeyVisibility = (keyId: string) => {
    const newVisibleKeys = new Set(visibleKeys);
    if (newVisibleKeys.has(keyId)) {
      newVisibleKeys.delete(keyId);
    } else {
      newVisibleKeys.add(keyId);
    }
    setVisibleKeys(newVisibleKeys);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("API key copied to clipboard");
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "default";
      case "inactive":
        return "secondary";
      case "expired":
        return "destructive";
      default:
        return "outline";
    }
  };

  return (
    <SectionGroup>
      <Section>
        <SectionHeader>
          <SectionTitle>API Keys</SectionTitle>
          <SectionDescription>
            Manage API keys for external integrations and services.
          </SectionDescription>
        </SectionHeader>

        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-medium">Active API Keys</h3>
          <GenerateApiKeyDialog>
            <Button size="sm" className="gap-2">
              <Plus className="h-4 w-4" />
              Generate New Key
            </Button>
          </GenerateApiKeyDialog>
        </div>

        <div className="grid gap-4">
          {apiKeys.map((apiKey) => (
            <Card key={apiKey.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base">{apiKey.name}</CardTitle>
                    <CardDescription>
                      Created {formatDate(apiKey.createdAt)} • Expires {formatDate(apiKey.expiresAt)}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={getStatusColor(apiKey.status)}>
                      {apiKey.status}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleKeyVisibility(apiKey.id)}
                    >
                      {visibleKeys.has(apiKey.id) ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">API Key</label>
                    <div className="flex items-center gap-2 mt-1">
                      <code className="bg-muted px-2 py-1 rounded text-sm font-mono">
                        {visibleKeys.has(apiKey.id) ? apiKey.key : "••••••••••••••••••••"}
                      </code>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(apiKey.key)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div>
                        <span className="text-sm text-muted-foreground">Permissions:</span>
                        <div className="flex gap-1 mt-1">
                          {apiKey.permissions.map((permission) => (
                            <Badge key={permission} variant="outline" className="text-xs">
                              {permission}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div>
                        <span className="text-sm text-muted-foreground">Last Used:</span>
                        <div className="text-sm mt-1">
                          {formatDate(apiKey.lastUsed)}
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        Edit
                      </Button>
                      <Button variant="outline" size="sm">
                        Regenerate
                      </Button>
                      <Button variant="outline" size="sm" className="text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </Section>

      <Section>
        <SectionHeader>
          <SectionTitle>API Key Guidelines</SectionTitle>
          <SectionDescription>
            Best practices for managing API keys securely.
          </SectionDescription>
        </SectionHeader>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Key className="h-5 w-5" />
                Security Best Practices
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>• Never share API keys in public repositories</p>
              <p>• Use environment variables for key storage</p>
              <p>• Regularly rotate keys and monitor usage</p>
              <p>• Set appropriate expiration dates</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Key className="h-5 w-5" />
                Key Permissions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>• Read: Access to view data and resources</p>
              <p>• Write: Ability to create and modify data</p>
              <p>• Admin: Full administrative access</p>
              <p>• Custom: Specific feature permissions</p>
            </CardContent>
          </Card>
        </div>
      </Section>
    </SectionGroup>
  );
}
