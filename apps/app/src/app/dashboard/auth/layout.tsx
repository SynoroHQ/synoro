import { NavAuth } from "@/components/nav/nav-auth";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-6">
      <NavAuth />
      {children}
    </div>
  );
}
