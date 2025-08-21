import Link from "next/link";
import { GalleryVerticalEnd } from "lucide-react";

import { Badge } from "@synoro/ui/components/badge";

export function AuthLogo() {
  return (
    <Link href="/" className="flex items-center gap-2 self-center font-medium">
      <div className="bg-primary text-primary-foreground flex h-6 w-6 items-center justify-center rounded-md">
        <GalleryVerticalEnd className="size-4" />
      </div>
      Synoro
      <Badge className="from-primary via-accent to-primary text-primary-foreground border-primary-foreground/20 ml-2 inline-flex items-center rounded-full border-2 bg-gradient-to-r px-1.5 py-0.5 text-xs font-medium shadow-sm backdrop-blur-sm">
        Beta
      </Badge>
    </Link>
  );
}
