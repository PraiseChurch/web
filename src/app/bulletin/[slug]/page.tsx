import React from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { BulletinView } from "../_view/BulletinView";
import { getBySlug, listPublished } from "../_data/bulletins";
import { getConfig } from "../_data/config";
import { resolveBulletin } from "../_data/resolve";
import { buildSlug } from "../_data/slug";

type PageProps = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return listPublished().map((b) => ({
    slug: buildSlug(b.date, b.sermon.title),
  }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const bulletin = getBySlug(slug);
  if (!bulletin) return { title: "Bulletin Not Found" };
  return {
    title: `${bulletin.sermon.title} | Praise Church West Covina`,
    description: `Bulletin for ${bulletin.date}: ${bulletin.sermon.title} (${bulletin.sermon.scriptureReference})`,
  };
}

export default async function BulletinBySlugPage({ params }: PageProps) {
  const { slug } = await params;
  const bulletin = getBySlug(slug);
  if (!bulletin) notFound();
  const resolved = resolveBulletin(bulletin, getConfig());
  return <BulletinView resolved={resolved} />;
}
