import React from "react";
import type { ResolvedBulletin } from "../../types";

type Props = { midweek: ResolvedBulletin["midweekMinistries"] };

export const ViewMidweekMinistries: React.FC<Props> = ({ midweek }) => (
  <section className="py-6 border-t border-gray-200">
    <h2 className="text-sm font-sans font-bold uppercase tracking-widest text-black">
      Our Midweek Ministries
    </h2>
    <div className="mt-4 space-y-5">
      {midweek.map((day) => (
        <div key={day.day}>
          <h3 className="text-xs font-sans font-bold uppercase tracking-widest text-slide-orange">
            {day.day}
          </h3>
          <ul className="mt-2 space-y-1">
            {day.meetings.map((meeting, idx) => (
              <li key={idx} className="flex justify-between text-sm">
                <span className="font-serif font-bold text-black">
                  {meeting.name}
                </span>
                <span className="text-gray-600 font-sans">
                  {meeting.location} · {meeting.time}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  </section>
);
