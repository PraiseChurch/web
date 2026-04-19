import type { Bulletin } from "../types";
import { parseDateFromSlug } from "./slug";

const BULLETINS: Bulletin[] = [
  {
    date: "2026-01-04",
    sermon: {
      title: "Doing Good Is From God",
      scriptureReference: "3 John 1:9-11",
      scripturePassage:
        "{9} I wrote something to the church (yet the church did not receive the letter) because Diotrephes does not accept us since loves to place himself first. {10} Because of this, I will remind him of his works when I come; namely, he works by talking about us with evil words and he does not accept the brothers. Not satisfied with these things, he hinders those who wish to come and casts them out of the church. {11} Beloved, imitate not evil, but imitate good. The one doing good is from God and the one doing evil does not see God.",
    },
    assignmentOverrides: {},
    isCommunion: true,
    discovery: {
      mens: "Parlor",
      womens: "Sunday School Room",
    },
    upcomingEvents: [
      { category: "WOMEN", date: "2026-01-10", title: "Women's Fellowship" },
      {
        category: "COUPLES",
        date: "2026-02-14",
        title: "Couple's Valentine's Dinner",
      },
    ],
    publishedAt: "2026-01-01T12:00:00Z",
  },
];

function sortByDateDesc(a: Bulletin, b: Bulletin): number {
  return b.date.localeCompare(a.date);
}

function isPublishedOnOrBefore(bulletin: Bulletin, isoDate: string): boolean {
  return bulletin.publishedAt !== null && bulletin.date <= isoDate;
}

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

export function listBulletins(): Bulletin[] {
  return [...BULLETINS].sort(sortByDateDesc);
}

export function listPublished(): Bulletin[] {
  const today = todayIso();
  return listBulletins().filter((b) => isPublishedOnOrBefore(b, today));
}

export function getLatest(): Bulletin | null {
  return listPublished()[0] ?? null;
}

export function getByDate(date: string): Bulletin | null {
  return BULLETINS.find((b) => b.date === date) ?? null;
}

export function getBySlug(slug: string): Bulletin | null {
  const date = parseDateFromSlug(slug);
  return date ? getByDate(date) : null;
}
