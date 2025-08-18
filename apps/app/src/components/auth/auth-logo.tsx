import Link from "next/link";
import { GalleryVerticalEnd } from "lucide-react";

export function AuthLogo() {
  return (
    <Link href="/" className="flex items-center gap-2 self-center font-medium">
      <div className="bg-primary text-primary-foreground flex h-6 w-6 items-center justify-center rounded-md">
        <GalleryVerticalEnd className="size-4" />
      </div>
      Synoro
    </Link>
  );
}
