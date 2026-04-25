"use client";

import React, { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import type { BulletinSummary } from "@/app/(site)/bulletin/types";
import { formatBulletinDate } from "@/app/(site)/bulletin/_view/format";
import { deleteBulletin, deleteManyBulletins } from "../_actions/bulletins";

type Props = { bulletins: BulletinSummary[] };

export const BulletinsListClient: React.FC<Props> = ({ bulletins }) => {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const allSelected = useMemo(
    () => bulletins.length > 0 && selected.size === bulletins.length,
    [bulletins.length, selected.size],
  );

  const toggleAll = () => {
    if (allSelected) {
      setSelected(new Set());
    } else {
      setSelected(new Set(bulletins.map((b) => b.date)));
    }
  };

  const toggleOne = (date: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(date)) next.delete(date);
      else next.add(date);
      return next;
    });
  };

  const onDeleteOne = (date: string, sermonTitle: string) => {
    if (!confirm(`Delete the bulletin "${sermonTitle}" (${date})?`)) return;
    setError(null);
    startTransition(async () => {
      try {
        await deleteBulletin(date);
        setSelected((prev) => {
          const next = new Set(prev);
          next.delete(date);
          return next;
        });
      } catch (e) {
        setError(e instanceof Error ? e.message : String(e));
      }
    });
  };

  const onDeleteSelected = () => {
    const dates = Array.from(selected);
    if (dates.length === 0) return;
    if (
      !confirm(
        `Delete ${dates.length} bulletin${dates.length === 1 ? "" : "s"}?`,
      )
    )
      return;
    setError(null);
    startTransition(async () => {
      try {
        await deleteManyBulletins(dates);
        setSelected(new Set());
      } catch (e) {
        setError(e instanceof Error ? e.message : String(e));
      }
    });
  };

  if (bulletins.length === 0) {
    return (
      <p className="text-gray-600 font-sans">
        No bulletins yet. Create one to get started.
      </p>
    );
  }

  return (
    <>
      {selected.size > 0 && (
        <div className="bg-gray-900 text-white rounded p-3 mb-3 flex items-center justify-between text-sm">
          <span className="font-sans">{selected.size} selected</span>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSelected(new Set())}
              className="text-sm font-sans text-gray-300 hover:text-white"
            >
              Clear
            </button>
            <button
              type="button"
              onClick={onDeleteSelected}
              disabled={pending}
              className="px-3 py-1 bg-red-600 rounded text-sm font-sans font-bold disabled:opacity-50"
            >
              Delete selected
            </button>
          </div>
        </div>
      )}

      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2 mb-3">
          {error}
        </p>
      )}

      <div className="bg-white border border-gray-200 rounded overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="p-3 w-10">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={toggleAll}
                  aria-label="Select all"
                />
              </th>
              <th className="text-left p-3 font-sans font-bold text-xs uppercase tracking-widest">
                Date
              </th>
              <th className="text-left p-3 font-sans font-bold text-xs uppercase tracking-widest">
                Sermon
              </th>
              <th className="text-left p-3 font-sans font-bold text-xs uppercase tracking-widest">
                Status
              </th>
              <th className="p-3 w-20"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {bulletins.map((b) => (
              <tr key={b.date} className="hover:bg-gray-50">
                <td className="p-3">
                  <input
                    type="checkbox"
                    checked={selected.has(b.date)}
                    onChange={() => toggleOne(b.date)}
                    aria-label={`Select ${b.sermonTitle}`}
                  />
                </td>
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
                <td className="p-3 text-right">
                  <button
                    type="button"
                    onClick={() => onDeleteOne(b.date, b.sermonTitle)}
                    disabled={pending}
                    className="text-sm text-red-600 hover:underline disabled:text-gray-400"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
};
