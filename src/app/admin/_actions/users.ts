"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/supabase/auth";

const EmailSchema = z.string().trim().toLowerCase().email();

export async function addAdmin(rawEmail: string): Promise<void> {
  await requireAdmin();
  const email = EmailSchema.parse(rawEmail);

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("admin_allowlist").insert({ email });
  if (error) {
    if (error.code === "23505") {
      throw new Error("Email is already an admin");
    }
    throw new Error(`addAdmin failed: ${error.message}`);
  }

  revalidatePath("/admin/users");
}

export async function removeAdmin(rawEmail: string): Promise<void> {
  const currentAdmin = await requireAdmin();
  const email = EmailSchema.parse(rawEmail);

  if (email === currentAdmin.email) {
    throw new Error("Cannot remove yourself");
  }

  const supabase = await createSupabaseServerClient();
  const { count, error: countError } = await supabase
    .from("admin_allowlist")
    .select("*", { count: "exact", head: true });
  if (countError)
    throw new Error(`removeAdmin count failed: ${countError.message}`);
  if ((count ?? 0) <= 1) {
    throw new Error("At least one admin must remain");
  }

  const { error } = await supabase
    .from("admin_allowlist")
    .delete()
    .eq("email", email);
  if (error) throw new Error(`removeAdmin failed: ${error.message}`);

  revalidatePath("/admin/users");
}
