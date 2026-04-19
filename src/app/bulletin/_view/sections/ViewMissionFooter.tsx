import React from "react";

type Props = { missionStatement: string };

export const ViewMissionFooter: React.FC<Props> = ({ missionStatement }) => (
  <footer className="py-6 mt-6 border-t border-gray-200">
    <p className="text-xs font-sans font-bold uppercase tracking-widest text-black">
      Our Values and Our Drive
    </p>
    <p className="mt-2 text-sm text-gray-600 font-serif italic">
      {missionStatement}
    </p>
  </footer>
);
