import React from "react";
import type { ResolvedBulletin } from "../../types";
import { formatEventDate } from "../format";

type Props = { events: ResolvedBulletin["upcomingEvents"] };

export const ViewUpcomingEvents: React.FC<Props> = ({ events }) => {
  if (events.length === 0) return null;
  return (
    <section className="py-6 border-t border-gray-200">
      <h2 className="text-sm font-sans font-bold uppercase tracking-widest text-black">
        Upcoming Events
      </h2>
      <ul className="mt-4 space-y-4">
        {events.map((event, idx) => (
          <li
            key={`${event.date}-${idx}`}
            className="border-l-2 border-gray-300 pl-4"
          >
            <p className="text-xs font-sans font-bold uppercase tracking-widest text-slide-orange">
              {event.category}
            </p>
            <p className="text-sm italic text-gray-600 font-sans">
              {formatEventDate(event.date)}
            </p>
            <p className="mt-1 font-serif font-bold text-black">
              {event.title}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
};
