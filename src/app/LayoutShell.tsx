"use client";

import { usePathname } from "next/navigation";
import ProtectedLayout from "./ProtectedLayout";

export default function LayoutShell({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/login";

  return isLoginPage ? <>{children}</> : <ProtectedLayout>{children}</ProtectedLayout>;
}