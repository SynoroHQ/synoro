import { Suspense } from "react";
import { SecuritySkeleton } from "@/features/auth/components/security-skeleton";
import { SecurityPage } from "@/features/auth/pages/security-page";

export default function SecurityPageServer() {
  return (
    <div className="p-6">
      <h1 className="mb-4 text-2xl font-bold">Security Settings</h1>
      <p>Security settings functionality is under construction.</p>
    </div>
  );
}
