import type { UpcomingEvent } from "../types";

export function eventsWithinDays(
  events: UpcomingEvent[],
  fromIsoDate: string,
  windowDays: number,
): UpcomingEvent[] {
  const from = new Date(`${fromIsoDate}T00:00:00Z`).getTime();
  const to = from + windowDays * 24 * 60 * 60 * 1000;
  return events
    .filter((event) => {
      const eventTime = new Date(`${event.date}T00:00:00Z`).getTime();
      return eventTime >= from && eventTime <= to;
    })
    .sort((a, b) => a.date.localeCompare(b.date));
}
