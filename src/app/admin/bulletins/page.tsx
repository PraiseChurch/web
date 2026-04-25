import React from "react";
import Link from "next/link";
import { adminListAll } from "@/app/(site)/bulletin/_data/bulletins";
import { formatBulletinDate } from "@/app/(site)/bulletin/_view/format";

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
      {bulletins.length === 0 ? (
        <p className="text-gray-600 font-sans">
          No bulletins yet. Create one to get started.
        </p>
      ) : (
        <div className="bg-white border border-gray-200 rounded overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left p-3 font-sans font-bold text-xs uppercase tracking-widest">
                  Date
                </th>
                <th className="text-left p-3 font-sans font-bold text-xs uppercase tracking-widest">
                  Sermon
                </th>
                <th className="text-left p-3 font-sans font-bold text-xs uppercase tracking-widest">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {bulletins.map((b) => (
                <tr key={b.date} className="hover:bg-gray-50">
                  <td className="p-3">
                    <Link
                      href={`/admin/bulletins/${b.date}`}
                      className="font-sans hover:text-slide-orange"
                    >
                      {formatBulletinDate(b.date)}
                    </Link>
                  </td>
                  <td className="p-3 font-serif">{b.sermonTitle}</td>
                  <td className="p-3">
                    <span
                      className={`inline-block text-xs font-sans uppercase tracking-widest px-2 py-1 rounded ${
                        b.publishedAt
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {b.publishedAt ? "Published" : "Draft"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
