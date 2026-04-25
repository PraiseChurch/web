import React from "react";
import { redirect } from "next/navigation";
import { BulletinForm } from "../../_components/BulletinForm";
import { getConfig } from "@/app/bulletin/_data/config";
import { adminGetByDate } from "@/app/bulletin/_data/bulletins";
import type { Bulletin } from "@/app/bulletin/types";

export const dynamic = "force-dynamic";

type SearchParams = Promise<{ date?: string }>;

function todayIsoLA(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Los_Angeles",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

function emptyBulletin(date: string): Bulletin {
  return {
    date,
    sermon: { title: "", scriptureReference: "", scripturePassage: "" },
    assignmentOverrides: {},
    isCommunion: false,
    discovery: { mens: "", womens: "" },
    upcomingEvents: [],
    publishedAt: null,
  };
}

export default async function NewBulletinPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { date } = await searchParams;
  const targetDate = date ?? todayIsoLA();

  // If a bulletin already exists for this date, redirect to its edit page
  const existing = await adminGetByDate(targetDate);
  if (existing) {
    redirect(`/admin/bulletins/${targetDate}`);
  }

  const config = await getConfig();

  return (
    <BulletinForm
      initialBulletin={emptyBulletin(targetDate)}
      config={config}
      isPublished={false}
      isNew={true}
    />
  );
}
