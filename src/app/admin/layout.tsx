import React from "react";
import { getCurrentAdmin } from "@/lib/supabase/auth";
import { AdminShell } from "./_components/AdminShell";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const admin = await getCurrentAdmin();

  // The middleware redirects unauthenticated users away from /admin/* except
  // /admin/login. So if there's no session here, we're rendering the login
  // page — show it bare without the shell.
  if (!admin) {
    return <>{children}</>;
  }

  return <AdminShell email={admin.email}>{children}</AdminShell>;
}
