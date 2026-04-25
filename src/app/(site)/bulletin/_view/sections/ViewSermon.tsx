import React from "react";
import type { ResolvedBulletin } from "../../types";
import { parseScripturePassage } from "../../_data/scripture";

type Props = { sermon: ResolvedBulletin["sermon"] };

export const ViewSermon: React.FC<Props> = ({ sermon }) => {
  const fragments = parseScripturePassage(sermon.scripturePassage);
  return (
    <section className="py-8">
      <h2 className="text-2xl font-serif font-bold tracking-wide text-black uppercase">
        {sermon.title}
      </h2>
      <p className="mt-1 text-sm text-gray-500 font-sans">
        Preaching by {sermon.preacher}
      </p>
      <p className="mt-6 text-slide-orange font-serif font-bold">
        {sermon.scriptureReference}
      </p>
      <p className="mt-3 text-lg leading-relaxed font-serif text-black">
        {fragments.map((f, i) =>
          f.kind === "verse" ? (
            <sup key={i} className="mr-0.5 text-xs font-sans">
              {f.number}
            </sup>
          ) : (
            <React.Fragment key={i}>{f.content}</React.Fragment>
          ),
        )}
      </p>
    </section>
  );
};
