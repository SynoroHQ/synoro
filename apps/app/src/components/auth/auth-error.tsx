"use client";

import { AlertTriangle, X } from "lucide-react";

import { Alert, AlertDescription } from "@synoro/ui/components/alert";
import { Button } from "@synoro/ui/components/button";

interface AuthErrorProps {
  error: string;
  onClose?: () => void;
  showCloseButton?: boolean;
}

export function AuthError({
  error,
  onClose,
  showCloseButton = false,
}: AuthErrorProps) {
  if (!error) return null;

  return (
    <Alert variant="destructive" className="mb-4">
      <AlertTriangle className="h-4 w-4" />
      <AlertDescription className="flex items-center justify-between">
        <span>{error}</span>
        {showCloseButton && onClose && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-destructive hover:bg-destructive/10 h-auto p-1"
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </AlertDescription>
    </Alert>
  );
}
