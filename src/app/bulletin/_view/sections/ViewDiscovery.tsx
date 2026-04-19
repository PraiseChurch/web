import React from "react";
import type { ResolvedBulletin } from "../../types";

type Props = { discovery: ResolvedBulletin["discovery"] };

export const ViewDiscovery: React.FC<Props> = ({ discovery }) => (
  <section className="py-6 border-t border-gray-200">
    <h2 className="text-sm font-sans font-bold uppercase tracking-widest text-black">
      Discovery
    </h2>
    <dl className="mt-4 grid grid-cols-2 gap-4">
      <div>
        <dt className="text-xs font-sans font-bold uppercase tracking-widest text-slide-orange">
          Men&apos;s Group Discussion
        </dt>
        <dd className="mt-1 font-serif text-black">{discovery.mens}</dd>
      </div>
      <div>
        <dt className="text-xs font-sans font-bold uppercase tracking-widest text-slide-orange">
          Women&apos;s Group Discussion
        </dt>
        <dd className="mt-1 font-serif text-black">{discovery.womens}</dd>
      </div>
    </dl>
  </section>
);
