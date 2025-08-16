import { Suspense } from "react";
import { EmailChangeSkeleton } from "@/features/auth/components/email-change-skeleton";
import { EmailChangePage } from "@/features/auth/pages/email-change-page";

export default function EmailChangePageServer() {
  return (
    <Suspense fallback={<EmailChangeSkeleton />}>
      <EmailChangePage />
    </Suspense>
  );
}
