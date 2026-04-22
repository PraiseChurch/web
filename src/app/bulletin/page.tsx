import React from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { BulletinView } from "./_view/BulletinView";
import { getLatest } from "./_data/bulletins";
import { resolveStoredBulletin } from "./_data/resolve";

export const metadata: Metadata = {
  title: "Weekly Bulletin | Praise Church West Covina",
  description: "This week's bulletin at Praise Church West Covina.",
};

export default async function LatestBulletinPage() {
  const latest = await getLatest();
  if (!latest) notFound();
  const resolved = await resolveStoredBulletin(latest);
  return <BulletinView resolved={resolved} />;
}
