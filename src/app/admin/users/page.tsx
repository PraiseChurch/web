import React from "react";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/supabase/auth";
import { AdminAllowlistTable } from "../_components/AdminAllowlistTable";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const me = await requireAdmin();
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("admin_allowlist")
    .select("email")
    .order("email", { ascending: true });

  if (error)
    throw new Error(`Failed to load admin_allowlist: ${error.message}`);

  return (
    <AdminAllowlistTable
      initialEmails={(data ?? []).map((r) => r.email.toLowerCase())}
      currentEmail={me.email}
    />
  );
}
