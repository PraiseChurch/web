"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/supabase/auth";
import {
  BulletinConfigSchemaV1,
  CURRENT_SCHEMA_VERSION,
} from "@/app/(site)/bulletin/_data/schemas";

export async function updateConfig(raw: unknown): Promise<void> {
  await requireAdmin();
  const config = BulletinConfigSchemaV1.parse(raw);

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("bulletin_config").upsert(
    {
      id: 1,
      data: config,
      schema_version: CURRENT_SCHEMA_VERSION,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "id" },
  );
  if (error) throw new Error(`updateConfig failed: ${error.message}`);

  revalidateTag("bulletins");
  revalidatePath("/bulletin");
  revalidatePath("/bulletin/archive");
  revalidatePath("/admin/config");
}
