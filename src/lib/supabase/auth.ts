import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "./server";

export type AdminUser = {
  id: string;
  email: string;
};

/**
 * Resolves the current user, asserts they are in admin_allowlist (via RLS read).
 * Throws (redirect to /admin/login) if no session or email is null.
 * The is_admin SQL function gates writes; this function is for UI logic.
 */
export async function requireAdmin(): Promise<AdminUser> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !user.email) {
    redirect("/admin/login");
  }

  return { id: user.id, email: user.email.toLowerCase() };
}

/**
 * Returns the current user without throwing. Use when a route can render
 * for both signed-in and signed-out states.
 */
export async function getCurrentAdmin(): Promise<AdminUser | null> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || !user.email) return null;
  return { id: user.id, email: user.email.toLowerCase() };
}
