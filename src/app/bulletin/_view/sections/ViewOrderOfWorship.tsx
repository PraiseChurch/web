import React from "react";
import type { ResolvedBulletin } from "../../types";

type Props = {
  worshipSteps: ResolvedBulletin["worshipSteps"];
  isCommunion: boolean;
};

export const ViewOrderOfWorship: React.FC<Props> = ({
  worshipSteps,
  isCommunion,
}) => (
  <section className="py-6 border-t border-gray-200">
    <h2 className="text-sm font-sans font-bold uppercase tracking-widest text-black">
      The Order of Our Worship
    </h2>
    <ol className="mt-4 divide-y divide-gray-100">
      {worshipSteps.map((step, idx) => {
        const isHighlight = isCommunion && step.id === "lords-supper";
        return (
          <li
            key={step.id}
            className={`flex items-baseline gap-4 py-3 ${isHighlight ? "bg-slide-orange text-white px-3 -mx-3 rounded" : ""}`}
          >
            <span
              className={`text-sm font-sans font-bold w-6 ${isHighlight ? "text-white" : "text-slide-orange"}`}
            >
              {String(idx + 1).padStart(2, "0")}.
            </span>
            <div className="flex-1">
              <p
                className={`font-serif font-bold ${isHighlight ? "text-white" : "text-black"}`}
              >
                {step.title}
              </p>
              <p
                className={`text-sm italic ${isHighlight ? "text-white/90" : "text-gray-500"}`}
              >
                {step.assignment}
              </p>
            </div>
          </li>
        );
      })}
    </ol>
  </section>
);
