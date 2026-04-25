import React from "react";
import Link from "next/link";
import { adminListAll } from "@/app/(site)/bulletin/_data/bulletins";
import { BulletinsListClient } from "../_components/BulletinsListClient";

export const dynamic = "force-dynamic";

export default async function AdminBulletinsListPage() {
  const bulletins = await adminListAll();
  return (
    <main className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-serif font-bold">Bulletins</h1>
        <Link
          href="/admin/bulletins/new"
          className="px-4 py-2 bg-black text-white rounded text-sm font-sans font-bold"
        >
          + New bulletin
        </Link>
      </div>
      <BulletinsListClient bulletins={bulletins} />
    </main>
  );
}
