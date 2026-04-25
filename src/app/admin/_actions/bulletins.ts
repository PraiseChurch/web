"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/supabase/auth";
import { getConfig } from "@/app/bulletin/_data/config";
import { adminGetByDate } from "@/app/bulletin/_data/bulletins";
import { buildSlug } from "@/app/bulletin/_data/slug";
import {
  BulletinSchemaV1,
  CURRENT_SCHEMA_VERSION,
  CURRENT_RENDER_VERSION,
} from "@/app/bulletin/_data/schemas";
import type { Bulletin } from "@/app/bulletin/types";

function revalidateBulletinSurface(date: string, sermonTitle: string) {
  const slug = buildSlug(date, sermonTitle);
  revalidateTag("bulletins");
  revalidatePath("/bulletin");
  revalidatePath(`/bulletin/${slug}`);
  revalidatePath("/bulletin/archive");
  revalidatePath("/admin/bulletins");
  revalidatePath(`/admin/bulletins/${date}`);
}

export async function upsertBulletin(
  date: string,
  raw: unknown,
): Promise<void> {
  await requireAdmin();
  const bulletin: Bulletin = BulletinSchemaV1.parse(raw);

  const supabase = await createSupabaseServerClient();
  const existing = await adminGetByDate(date);
  const data = existing
    ? { bulletin, configSnapshot: existing.configSnapshot }
    : { bulletin };

  const { error } = await supabase.from("bulletins").upsert(
    {
      date,
      data,
      published_at: existing?.publishedAt ?? null,
      schema_version: CURRENT_SCHEMA_VERSION,
      render_version: CURRENT_RENDER_VERSION,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "date" },
  );
  if (error) throw new Error(`upsertBulletin failed: ${error.message}`);

  revalidateBulletinSurface(date, bulletin.sermon.title);
}

export async function publishBulletin(date: string): Promise<void> {
  await requireAdmin();
  const [bulletin, config] = await Promise.all([
    adminGetByDate(date),
    getConfig(),
  ]);
  if (!bulletin) throw new Error("Bulletin not found");

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("bulletins")
    .update({
      data: { bulletin: bulletin.bulletin, configSnapshot: config },
      published_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("date", date);
  if (error) throw new Error(`publishBulletin failed: ${error.message}`);

  revalidateBulletinSurface(date, bulletin.bulletin.sermon.title);
}

export async function unpublishBulletin(date: string): Promise<void> {
  await requireAdmin();
  const existing = await adminGetByDate(date);
  if (!existing) throw new Error("Bulletin not found");

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("bulletins")
    .update({
      data: { bulletin: existing.bulletin },
      published_at: null,
      updated_at: new Date().toISOString(),
    })
    .eq("date", date);
  if (error) throw new Error(`unpublishBulletin failed: ${error.message}`);

  revalidateBulletinSurface(date, existing.bulletin.sermon.title);
}

export async function reSnapshotConfig(date: string): Promise<void> {
  await requireAdmin();
  const [existing, config] = await Promise.all([
    adminGetByDate(date),
    getConfig(),
  ]);
  if (!existing) throw new Error("Bulletin not found");
  if (!existing.publishedAt) throw new Error("Cannot re-snapshot a draft");

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("bulletins")
    .update({
      data: { bulletin: existing.bulletin, configSnapshot: config },
      updated_at: new Date().toISOString(),
    })
    .eq("date", date);
  if (error) throw new Error(`reSnapshotConfig failed: ${error.message}`);

  revalidateBulletinSurface(date, existing.bulletin.sermon.title);
}

export async function deleteBulletin(date: string): Promise<void> {
  await requireAdmin();
  const existing = await adminGetByDate(date);
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("bulletins").delete().eq("date", date);
  if (error) throw new Error(`deleteBulletin failed: ${error.message}`);

  if (existing) {
    revalidateBulletinSurface(date, existing.bulletin.sermon.title);
  } else {
    revalidateTag("bulletins");
    revalidatePath("/bulletin");
    revalidatePath("/bulletin/archive");
    revalidatePath("/admin/bulletins");
  }
}
