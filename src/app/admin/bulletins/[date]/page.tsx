import React from "react";
import { notFound } from "next/navigation";
import { BulletinForm } from "../../_components/BulletinForm";
import { getConfig } from "@/app/(site)/bulletin/_data/config";
import { adminGetByDate } from "@/app/(site)/bulletin/_data/bulletins";

export const dynamic = "force-dynamic";

type PageProps = { params: Promise<{ date: string }> };

export default async function EditBulletinPage({ params }: PageProps) {
  const { date } = await params;
  const stored = await adminGetByDate(date);
  if (!stored) notFound();

  const config = await getConfig();
  return (
    <BulletinForm
      initialBulletin={stored.bulletin}
      config={config}
      isPublished={stored.publishedAt !== null}
      isNew={false}
    />
  );
}
