import { unstable_cache } from "next/cache";
import type { BulletinSummary, StoredBulletin } from "../types";
import { createSupabasePublicClient } from "@/lib/supabase/public";
import { parseDateFromSlug } from "./slug";
import { StoredBulletinDataSchemaV1 } from "./schemas";

const CHURCH_TZ = "America/Los_Angeles";

function todayIso(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: CHURCH_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

type DbRow = {
  date: string;
  data: unknown;
  published_at: string | null;
  schema_version: number;
  render_version: number;
};

function parseRow(row: DbRow): StoredBulletin {
  if (row.schema_version !== 1) {
    throw new Error(
      `bulletin row ${row.date} has schema_version ${row.schema_version}; deploy newer code`,
    );
  }
  const parsed = StoredBulletinDataSchemaV1.parse(row.data);
  return {
    bulletin: parsed.bulletin,
    configSnapshot: parsed.configSnapshot,
    schemaVersion: row.schema_version,
    renderVersion: row.render_version,
    publishedAt: row.published_at,
  };
}

async function fetchPublishedSummaries(): Promise<BulletinSummary[]> {
  const today = todayIso();
  const supabase = createSupabasePublicClient();
  const { data, error } = await supabase
    .from("bulletins")
    .select("date, data, published_at")
    .not("published_at", "is", null)
    .lte("date", today)
    .order("date", { ascending: false });

  if (error) throw new Error(`listPublished failed: ${error.message}`);
  return (data ?? []).map((row) => {
    const parsed = StoredBulletinDataSchemaV1.parse(row.data);
    return {
      date: row.date,
      sermonTitle: parsed.bulletin.sermon.title,
      scriptureReference: parsed.bulletin.sermon.scriptureReference,
      publishedAt: row.published_at,
    };
  });
}

async function fetchLatest(): Promise<StoredBulletin | null> {
  const today = todayIso();
  const supabase = createSupabasePublicClient();
  const { data, error } = await supabase
    .from("bulletins")
    .select("date, data, published_at, schema_version, render_version")
    .not("published_at", "is", null)
    .lte("date", today)
    .order("date", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw new Error(`getLatest failed: ${error.message}`);
  return data ? parseRow(data as DbRow) : null;
}

async function fetchPublishedByDate(
  date: string,
): Promise<StoredBulletin | null> {
  const supabase = createSupabasePublicClient();
  const { data, error } = await supabase
    .from("bulletins")
    .select("date, data, published_at, schema_version, render_version")
    .eq("date", date)
    .not("published_at", "is", null)
    .maybeSingle();

  if (error) throw new Error(`getPublishedByDate failed: ${error.message}`);
  return data ? parseRow(data as DbRow) : null;
}

export const listPublished = unstable_cache(
  fetchPublishedSummaries,
  ["bulletin-list-published"],
  { tags: ["bulletins"] },
);

export const getLatest = unstable_cache(fetchLatest, ["bulletin-latest"], {
  tags: ["bulletins"],
});

export async function getPublishedByDate(
  date: string,
): Promise<StoredBulletin | null> {
  return fetchPublishedByDate(date);
}

export async function getPublishedBySlug(
  slug: string,
): Promise<StoredBulletin | null> {
  const date = parseDateFromSlug(slug);
  return date ? fetchPublishedByDate(date) : null;
}

import { createSupabaseServerClient } from "@/lib/supabase/server";

/**
 * Admin read path — uses the cookie-based server client so RLS sees the
 * authenticated user. Returns drafts as well as published bulletins.
 */
export async function adminListAll(): Promise<BulletinSummary[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("bulletins")
    .select("date, data, published_at")
    .order("date", { ascending: false });

  if (error) throw new Error(`adminListAll failed: ${error.message}`);
  return (data ?? []).map((row) => {
    const parsed = StoredBulletinDataSchemaV1.parse(row.data);
    return {
      date: row.date,
      sermonTitle: parsed.bulletin.sermon.title,
      scriptureReference: parsed.bulletin.sermon.scriptureReference,
      publishedAt: row.published_at,
    };
  });
}

export async function adminGetByDate(
  date: string,
): Promise<StoredBulletin | null> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("bulletins")
    .select("date, data, published_at, schema_version, render_version")
    .eq("date", date)
    .maybeSingle();

  if (error) throw new Error(`adminGetByDate failed: ${error.message}`);
  return data ? parseRow(data as DbRow) : null;
}
