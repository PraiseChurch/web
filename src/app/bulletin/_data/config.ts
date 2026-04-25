import { unstable_cache } from "next/cache";
import type { BulletinConfig } from "../types";
import { createSupabasePublicClient } from "@/lib/supabase/public";
import { BulletinConfigSchemaV1 } from "./schemas";

async function fetchConfig(): Promise<BulletinConfig> {
  const supabase = createSupabasePublicClient();
  const { data, error } = await supabase
    .from("bulletin_config")
    .select("data, schema_version")
    .eq("id", 1)
    .single();

  if (error) {
    throw new Error(`Failed to load bulletin_config: ${error.message}`);
  }
  if (data.schema_version !== 1) {
    throw new Error(
      `bulletin_config has schema_version ${data.schema_version}; deploy newer code`,
    );
  }
  return BulletinConfigSchemaV1.parse(data.data);
}

export const getConfig = unstable_cache(fetchConfig, ["bulletin-config"], {
  tags: ["bulletins"],
});
