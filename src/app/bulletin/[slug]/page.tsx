import React from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { BulletinView } from "../_view/BulletinView";
import { getPublishedBySlug, listPublished } from "../_data/bulletins";
import { resolveStoredBulletin } from "../_data/resolve";
import { buildSlug } from "../_data/slug";

type PageProps = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const published = await listPublished();
  return published.map((b) => ({ slug: buildSlug(b.date, b.sermonTitle) }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const stored = await getPublishedBySlug(slug);
  if (!stored) return { title: "Bulletin Not Found" };
  return {
    title: `${stored.bulletin.sermon.title} | Praise Church West Covina`,
    description: `Bulletin for ${stored.bulletin.date}: ${stored.bulletin.sermon.title} (${stored.bulletin.sermon.scriptureReference})`,
  };
}

export default async function BulletinBySlugPage({ params }: PageProps) {
  const { slug } = await params;
  const stored = await getPublishedBySlug(slug);
  if (!stored) notFound();
  const resolved = await resolveStoredBulletin(stored);
  return <BulletinView resolved={resolved} />;
}
