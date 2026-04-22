import type { Bulletin, BulletinSummary, StoredBulletin } from "../types";
import { parseDateFromSlug } from "./slug";
import { getConfig } from "./config";

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

const CHURCH_TZ = "America/Los_Angeles";

function todayIso(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: CHURCH_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

function isPublishedAndDateReached(
  bulletin: Bulletin,
  isoDate: string,
): boolean {
  return bulletin.publishedAt !== null && bulletin.date <= isoDate;
}

async function toStoredBulletin(b: Bulletin): Promise<StoredBulletin> {
  const config = await getConfig();
  return {
    bulletin: b,
    configSnapshot: b.publishedAt !== null ? config : undefined,
    schemaVersion: 1,
    renderVersion: 1,
    publishedAt: b.publishedAt,
  };
}

function toSummary(b: Bulletin): BulletinSummary {
  return {
    date: b.date,
    sermonTitle: b.sermon.title,
    scriptureReference: b.sermon.scriptureReference,
    publishedAt: b.publishedAt,
  };
}

export async function listPublished(): Promise<BulletinSummary[]> {
  const today = todayIso();
  return [...BULLETINS]
    .filter((b) => isPublishedAndDateReached(b, today))
    .sort((a, b) => b.date.localeCompare(a.date))
    .map(toSummary);
}

export async function getLatest(): Promise<StoredBulletin | null> {
  const today = todayIso();
  const latest = [...BULLETINS]
    .filter((b) => isPublishedAndDateReached(b, today))
    .sort((a, b) => b.date.localeCompare(a.date))[0];
  return latest ? toStoredBulletin(latest) : null;
}

export async function getPublishedByDate(
  date: string,
): Promise<StoredBulletin | null> {
  const match = BULLETINS.find(
    (b) => b.date === date && b.publishedAt !== null,
  );
  return match ? toStoredBulletin(match) : null;
}

export async function getPublishedBySlug(
  slug: string,
): Promise<StoredBulletin | null> {
  const date = parseDateFromSlug(slug);
  return date ? getPublishedByDate(date) : null;
}
