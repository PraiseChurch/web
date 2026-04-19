import React from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { BulletinView } from "./_view/BulletinView";
import { getLatest } from "./_data/bulletins";
import { getConfig } from "./_data/config";
import { resolveBulletin } from "./_data/resolve";

export const metadata: Metadata = {
  title: "Weekly Bulletin | Praise Church West Covina",
  description: "This week's bulletin at Praise Church West Covina.",
};

export default function LatestBulletinPage() {
  const latest = getLatest();
  if (!latest) notFound();
  const resolved = resolveBulletin(latest, getConfig());
  return <BulletinView resolved={resolved} />;
}
