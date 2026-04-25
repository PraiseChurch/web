import React from "react";
import type { ResolvedBulletin } from "../../types";
import { formatBulletinDate } from "../format";

type Props = { resolved: Pick<ResolvedBulletin, "date" | "church"> };

export const ViewHeader: React.FC<Props> = ({ resolved }) => (
  <header className="border-b border-gray-200 pb-6">
    <p className="text-slide-orange italic text-sm font-serif">
      {formatBulletinDate(resolved.date)}
    </p>
    <h1 className="mt-2 text-3xl font-serif font-bold text-black">
      {resolved.church.name}
    </h1>
    <p className="mt-3 text-slide-orange italic text-sm font-serif">
      {resolved.church.welcomeLine}
    </p>
    <p className="mt-1 text-sm text-gray-600 font-sans">
      {resolved.church.address}
    </p>
  </header>
);
