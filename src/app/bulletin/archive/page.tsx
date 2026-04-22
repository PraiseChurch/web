import React from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { listPublished } from "../_data/bulletins";
import { buildSlug } from "../_data/slug";
import { formatBulletinDate } from "../_view/format";

export const metadata: Metadata = {
  title: "Bulletin Archive | Praise Church West Covina",
  description: "Past weekly bulletins from Praise Church West Covina.",
};

export default async function BulletinArchivePage() {
  const bulletins = await listPublished();
  return (
    <main className="max-w-2xl mx-auto px-4 py-8">
      <header className="border-b border-gray-200 pb-4">
        <h1 className="text-3xl font-serif font-bold text-black">
          Bulletin Archive
        </h1>
        <p className="mt-2 text-sm text-gray-600 font-sans">
          Past bulletins, most recent first.
        </p>
      </header>
      {bulletins.length === 0 ? (
        <p className="mt-8 text-gray-600 font-sans">
          No bulletins published yet.
        </p>
      ) : (
        <ul className="mt-6 divide-y divide-gray-200">
          {bulletins.map((b) => {
            const slug = buildSlug(b.date, b.sermonTitle);
            return (
              <li key={b.date} className="py-4">
                <Link
                  href={`/bulletin/${slug}`}
                  className="block hover:text-slide-orange transition"
                >
                  <p className="text-xs font-sans uppercase tracking-widest text-slide-orange">
                    {formatBulletinDate(b.date)}
                  </p>
                  <p className="mt-1 font-serif font-bold text-black">
                    {b.sermonTitle}
                  </p>
                  <p className="text-sm italic text-gray-600 font-sans">
                    {b.scriptureReference}
                  </p>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}
