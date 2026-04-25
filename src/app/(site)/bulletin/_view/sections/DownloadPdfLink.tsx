import React from "react";
import Link from "next/link";
import { buildSlug } from "../../_data/slug";

type Props = { date: string; sermonTitle: string };

export const DownloadPdfLink: React.FC<Props> = ({ date, sermonTitle }) => {
  const slug = buildSlug(date, sermonTitle);
  return (
    <div className="py-6 border-t border-gray-200 text-center">
      <Link
        href={`/bulletin/${slug}/pdf`}
        target="_blank"
        rel="noopener"
        className="inline-block text-sm font-sans font-bold uppercase tracking-widest text-slide-orange underline"
      >
        View printable PDF
      </Link>
    </div>
  );
};
