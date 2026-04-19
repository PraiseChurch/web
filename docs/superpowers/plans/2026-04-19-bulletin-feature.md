# Weekly Bulletin Feature Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the public-facing weekly bulletin reader (mobile web view + downloadable PDF) against dummy data, with clean types so admin/storage can be added later without touching the view layer.

**Architecture:** Next.js App Router routes under `/bulletin`, three TypeScript types (`BulletinConfig`, `Bulletin`, `ResolvedBulletin`), a resolver that merges per-bulletin overrides with site-wide defaults, two renderers (Tailwind mobile view + `@react-pdf/renderer` PDF) both consuming `ResolvedBulletin`. Dummy data lives in `_data/` modules behind a tiny accessor API so future storage swaps cleanly.

**Tech Stack:** Next.js 15, React 19, TypeScript, Tailwind, `@react-pdf/renderer` 4.x.

**Testing:** No automated test harness in repo. Each task verifies via `pnpm build` and/or manual dev-server inspection.

**Brand color:** Approximate brand orange for PDF is `#EC7442`. For Tailwind components use the existing `bg-slide-orange` / `text-slide-orange` classes (defined as oklch in `tailwind.config.ts`).

**Sample bulletin reference:** Matches `/Users/gerrymi/Downloads/Praise Church/Weekly Bulletin Communion.pdf` — dated 2026-01-04, sermon "Doing Good Is From God" on 3 John 1:9-11, communion Sunday.

---

### Task 1: Install `@react-pdf/renderer`

**Files:**
- Modify: `package.json` (add dependency)
- Modify: `pnpm-lock.yaml` (regenerated)

- [ ] **Step 1: Add dependency**

```bash
pnpm add @react-pdf/renderer@^4.3.0
```

- [ ] **Step 2: Verify install**

```bash
pnpm list @react-pdf/renderer
```

Expected: shows `@react-pdf/renderer 4.x.x` as a direct dependency.

- [ ] **Step 3: Verify build still passes**

```bash
pnpm build
```

Expected: build succeeds.

- [ ] **Step 4: Commit**

```bash
git add package.json pnpm-lock.yaml
git commit -m "chore: add @react-pdf/renderer for bulletin PDF generation"
```

---

### Task 2: Create TypeScript types

**Files:**
- Create: `src/app/bulletin/types.ts`

- [ ] **Step 1: Create the types file**

Write the following to `src/app/bulletin/types.ts`:

```typescript
export type Weekday =
  | "Sunday"
  | "Monday"
  | "Tuesday"
  | "Wednesday"
  | "Thursday"
  | "Friday"
  | "Saturday";

export type WorshipStepConfig = {
  id: string;
  title: string;
  defaultAssignment: string;
};

export type MidweekMeeting = {
  name: string;
  location: string;
  time: string;
};

export type MidweekDay = {
  day: Weekday;
  meetings: MidweekMeeting[];
};

export type BulletinConfig = {
  church: {
    name: string;
    address: string;
    welcomeLine: string;
  };
  missionStatement: string;
  worshipSteps: WorshipStepConfig[];
  midweekMinistries: MidweekDay[];
};

export type UpcomingEvent = {
  category: string;
  date: string;
  title: string;
};

export type Sermon = {
  title: string;
  scriptureReference: string;
  scripturePassage: string;
};

export type Discovery = {
  mens: string;
  womens: string;
};

export type Bulletin = {
  date: string;
  sermon: Sermon;
  assignmentOverrides: Record<string, string>;
  isCommunion: boolean;
  discovery: Discovery;
  upcomingEvents: UpcomingEvent[];
  publishedAt: string | null;
};

export type ResolvedWorshipStep = {
  id: string;
  title: string;
  assignment: string;
};

export type ResolvedBulletin = {
  date: string;
  church: BulletinConfig["church"];
  missionStatement: string;
  isCommunion: boolean;
  worshipSteps: ResolvedWorshipStep[];
  sermon: Sermon & { preacher: string };
  discovery: Discovery;
  upcomingEvents: UpcomingEvent[];
  midweekMinistries: MidweekDay[];
};
```

- [ ] **Step 2: Verify typecheck passes**

```bash
pnpm build
```

Expected: build succeeds (file is not yet imported anywhere, so just checks syntax).

- [ ] **Step 3: Commit**

```bash
git add src/app/bulletin/types.ts
git commit -m "feat(bulletin): add core TypeScript types"
```

---

### Task 3: Slug + scripture helpers

**Files:**
- Create: `src/app/bulletin/_data/slug.ts`
- Create: `src/app/bulletin/_data/scripture.ts`

- [ ] **Step 1: Create `slug.ts`**

Write the following to `src/app/bulletin/_data/slug.ts`:

```typescript
const DATE_PREFIX = /^(\d{4}-\d{2}-\d{2})(?:-(.*))?$/;

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/['']/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function buildSlug(date: string, sermonTitle: string): string {
  const titleSlug = slugify(sermonTitle);
  return titleSlug ? `${date}-${titleSlug}` : date;
}

export function parseDateFromSlug(slug: string): string | null {
  const match = DATE_PREFIX.exec(slug);
  return match ? match[1] : null;
}
```

- [ ] **Step 2: Create `scripture.ts`**

Write the following to `src/app/bulletin/_data/scripture.ts`:

```typescript
export type ScriptureFragment =
  | { kind: "verse"; number: string }
  | { kind: "text"; content: string };

const VERSE_MARKER = /\{(\d+)\}/g;

export function parseScripturePassage(passage: string): ScriptureFragment[] {
  const fragments: ScriptureFragment[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = VERSE_MARKER.exec(passage)) !== null) {
    if (match.index > lastIndex) {
      fragments.push({ kind: "text", content: passage.slice(lastIndex, match.index) });
    }
    fragments.push({ kind: "verse", number: match[1] });
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < passage.length) {
    fragments.push({ kind: "text", content: passage.slice(lastIndex) });
  }

  return fragments;
}
```

- [ ] **Step 3: Verify typecheck**

```bash
pnpm build
```

Expected: build succeeds.

- [ ] **Step 4: Commit**

```bash
git add src/app/bulletin/_data/slug.ts src/app/bulletin/_data/scripture.ts
git commit -m "feat(bulletin): add slug and scripture-passage helpers"
```

---

### Task 4: Dummy config data

**Files:**
- Create: `src/app/bulletin/_data/config.ts`

- [ ] **Step 1: Create `config.ts`**

Write the following to `src/app/bulletin/_data/config.ts`:

```typescript
import type { BulletinConfig } from "../types";

const CONFIG: BulletinConfig = {
  church: {
    name: "Praise Church West Covina",
    address: "718 S Azusa Avenue, West Covina, CA, 91791",
    welcomeLine: "Welcome! We're glad you're here.",
  },
  missionStatement:
    "We treasure the glory of God to spread the glory of Christ empowered by the Spirit of God enabling us to hope in the Word of God.",
  worshipSteps: [
    { id: "worship-in-song", title: "Worship in Song", defaultAssignment: "Worship Team" },
    { id: "welcome", title: "Welcome", defaultAssignment: "Emil Cueto" },
    { id: "continuation-of-worship", title: "Continuation of Worship", defaultAssignment: "Worship Team" },
    { id: "scripture-reading", title: "Scripture Reading and Prayer", defaultAssignment: "Emil Cueto" },
    { id: "preaching", title: "Preaching of God's Word", defaultAssignment: "Joel Danganan" },
    { id: "lords-supper", title: "Ordinance of the Lord's Supper", defaultAssignment: "Elders" },
    { id: "worship-with-treasures", title: "Worship with our Treasures", defaultAssignment: "Deacons" },
    { id: "conclusion", title: "Conclusion", defaultAssignment: "Emil Cueto" },
  ],
  midweekMinistries: [
    {
      day: "Wednesday",
      meetings: [{ name: "Prayer Meeting", location: "Virtual", time: "7:30 PM" }],
    },
    {
      day: "Thursday",
      meetings: [
        { name: "Bible Study", location: "Virtual", time: "7:00 PM" },
        { name: "Bible Study", location: "Virtual", time: "7:30 PM" },
        { name: "Bible Study", location: "Virtual", time: "8:00 PM" },
      ],
    },
    {
      day: "Friday",
      meetings: [
        { name: "Bible Study", location: "Virtual", time: "7:00 PM" },
        { name: "Bible Study", location: "Virtual", time: "7:30 PM" },
        { name: "Bible Study", location: "Virtual", time: "8:00 PM" },
      ],
    },
  ],
};

export function getConfig(): BulletinConfig {
  return CONFIG;
}
```

- [ ] **Step 2: Verify typecheck**

```bash
pnpm build
```

Expected: build succeeds.

- [ ] **Step 3: Commit**

```bash
git add src/app/bulletin/_data/config.ts
git commit -m "feat(bulletin): add dummy site config with 8 worship steps"
```

---

### Task 5: Dummy bulletins data + accessor API

**Files:**
- Create: `src/app/bulletin/_data/bulletins.ts`

- [ ] **Step 1: Create `bulletins.ts`**

Write the following to `src/app/bulletin/_data/bulletins.ts`:

```typescript
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
      { category: "COUPLES", date: "2026-02-14", title: "Couple's Valentine's Dinner" },
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
```

- [ ] **Step 2: Verify typecheck**

```bash
pnpm build
```

Expected: build succeeds.

- [ ] **Step 3: Commit**

```bash
git add src/app/bulletin/_data/bulletins.ts
git commit -m "feat(bulletin): add dummy bulletins data and accessor API"
```

---

### Task 6: Events helpers

**Files:**
- Create: `src/app/bulletin/_data/events.ts`

- [ ] **Step 1: Create `events.ts`**

Write the following to `src/app/bulletin/_data/events.ts`:

```typescript
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
```

- [ ] **Step 2: Verify typecheck**

```bash
pnpm build
```

Expected: build succeeds.

- [ ] **Step 3: Commit**

```bash
git add src/app/bulletin/_data/events.ts
git commit -m "feat(bulletin): add event date-window filter"
```

---

### Task 7: Resolver

**Files:**
- Create: `src/app/bulletin/_data/resolve.ts`

- [ ] **Step 1: Create `resolve.ts`**

Write the following to `src/app/bulletin/_data/resolve.ts`:

```typescript
import type { Bulletin, BulletinConfig, ResolvedBulletin, ResolvedWorshipStep } from "../types";
import { eventsWithinDays } from "./events";

const EVENTS_WINDOW_DAYS = 30;
const PREACHING_STEP_ID = "preaching";

function resolveStep(step: BulletinConfig["worshipSteps"][number], overrides: Bulletin["assignmentOverrides"]): ResolvedWorshipStep {
  return {
    id: step.id,
    title: step.title,
    assignment: overrides[step.id] ?? step.defaultAssignment,
  };
}

export function resolveBulletin(bulletin: Bulletin, config: BulletinConfig): ResolvedBulletin {
  const worshipSteps = config.worshipSteps.map((step) => resolveStep(step, bulletin.assignmentOverrides));
  const preachingStep = worshipSteps.find((s) => s.id === PREACHING_STEP_ID);
  if (!preachingStep) {
    throw new Error(`BulletinConfig.worshipSteps must contain a step with id "${PREACHING_STEP_ID}"`);
  }

  return {
    date: bulletin.date,
    church: config.church,
    missionStatement: config.missionStatement,
    isCommunion: bulletin.isCommunion,
    worshipSteps,
    sermon: {
      ...bulletin.sermon,
      preacher: preachingStep.assignment,
    },
    discovery: bulletin.discovery,
    upcomingEvents: eventsWithinDays(bulletin.upcomingEvents, bulletin.date, EVENTS_WINDOW_DAYS),
    midweekMinistries: config.midweekMinistries,
  };
}
```

- [ ] **Step 2: Verify typecheck**

```bash
pnpm build
```

Expected: build succeeds.

- [ ] **Step 3: Commit**

```bash
git add src/app/bulletin/_data/resolve.ts
git commit -m "feat(bulletin): add resolver merging config defaults with per-bulletin overrides"
```

---

### Task 8: Mobile view — shared formatting helpers

**Files:**
- Create: `src/app/bulletin/_view/format.ts`

- [ ] **Step 1: Create `format.ts`**

Write the following to `src/app/bulletin/_view/format.ts`:

```typescript
const DATE_FMT: Intl.DateTimeFormatOptions = {
  weekday: "long",
  year: "numeric",
  month: "long",
  day: "numeric",
  timeZone: "UTC",
};

const SHORT_DATE_FMT: Intl.DateTimeFormatOptions = {
  month: "short",
  day: "numeric",
  timeZone: "UTC",
};

export function formatBulletinDate(isoDate: string): string {
  return new Date(`${isoDate}T00:00:00Z`).toLocaleDateString("en-US", DATE_FMT);
}

export function formatEventDate(isoDate: string): string {
  const weekday = new Date(`${isoDate}T00:00:00Z`).toLocaleDateString("en-US", {
    weekday: "long",
    timeZone: "UTC",
  });
  const rest = new Date(`${isoDate}T00:00:00Z`).toLocaleDateString("en-US", SHORT_DATE_FMT);
  return `${weekday}, ${rest}`;
}
```

- [ ] **Step 2: Verify typecheck**

```bash
pnpm build
```

Expected: build succeeds.

- [ ] **Step 3: Commit**

```bash
git add src/app/bulletin/_view/format.ts
git commit -m "feat(bulletin): add mobile-view date formatters"
```

---

### Task 9: Mobile view — section components

**Files:**
- Create: `src/app/bulletin/_view/sections/ViewHeader.tsx`
- Create: `src/app/bulletin/_view/sections/ViewSermon.tsx`
- Create: `src/app/bulletin/_view/sections/ViewOrderOfWorship.tsx`
- Create: `src/app/bulletin/_view/sections/ViewDiscovery.tsx`
- Create: `src/app/bulletin/_view/sections/ViewUpcomingEvents.tsx`
- Create: `src/app/bulletin/_view/sections/ViewMidweekMinistries.tsx`
- Create: `src/app/bulletin/_view/sections/ViewMissionFooter.tsx`
- Create: `src/app/bulletin/_view/sections/DownloadPdfLink.tsx`

- [ ] **Step 1: `ViewHeader.tsx`**

```typescript
import React from "react";
import type { ResolvedBulletin } from "../../types";
import { formatBulletinDate } from "../format";

type Props = { resolved: Pick<ResolvedBulletin, "date" | "church"> };

export const ViewHeader: React.FC<Props> = ({ resolved }) => (
  <header className="border-b border-gray-200 pb-6">
    <p className="text-slide-orange italic text-sm font-serif">{formatBulletinDate(resolved.date)}</p>
    <h1 className="mt-2 text-3xl font-serif font-bold text-black">{resolved.church.name}</h1>
    <p className="mt-3 text-slide-orange italic text-sm font-serif">{resolved.church.welcomeLine}</p>
    <p className="mt-1 text-sm text-gray-600 font-sans">{resolved.church.address}</p>
  </header>
);
```

- [ ] **Step 2: `ViewSermon.tsx`**

```typescript
import React from "react";
import type { ResolvedBulletin } from "../../types";
import { parseScripturePassage } from "../../_data/scripture";

type Props = { sermon: ResolvedBulletin["sermon"] };

export const ViewSermon: React.FC<Props> = ({ sermon }) => {
  const fragments = parseScripturePassage(sermon.scripturePassage);
  return (
    <section className="py-8">
      <h2 className="text-2xl font-serif font-bold tracking-wide text-black uppercase">{sermon.title}</h2>
      <p className="mt-1 text-sm text-gray-500 font-sans">Preaching by {sermon.preacher}</p>
      <p className="mt-6 text-slide-orange font-serif font-bold">{sermon.scriptureReference}</p>
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
```

- [ ] **Step 3: `ViewOrderOfWorship.tsx`**

```typescript
import React from "react";
import type { ResolvedBulletin } from "../../types";

type Props = {
  worshipSteps: ResolvedBulletin["worshipSteps"];
  isCommunion: boolean;
};

export const ViewOrderOfWorship: React.FC<Props> = ({ worshipSteps, isCommunion }) => (
  <section className="py-6 border-t border-gray-200">
    <h2 className="text-sm font-sans font-bold uppercase tracking-widest text-black">The Order of Our Worship</h2>
    <ol className="mt-4 divide-y divide-gray-100">
      {worshipSteps.map((step, idx) => {
        const isHighlight = isCommunion && step.id === "lords-supper";
        return (
          <li
            key={step.id}
            className={`flex items-baseline gap-4 py-3 ${isHighlight ? "bg-slide-orange text-white px-3 -mx-3 rounded" : ""}`}
          >
            <span className={`text-sm font-sans font-bold w-6 ${isHighlight ? "text-white" : "text-slide-orange"}`}>
              {String(idx + 1).padStart(2, "0")}.
            </span>
            <div className="flex-1">
              <p className={`font-serif font-bold ${isHighlight ? "text-white" : "text-black"}`}>{step.title}</p>
              <p className={`text-sm italic ${isHighlight ? "text-white/90" : "text-gray-500"}`}>{step.assignment}</p>
            </div>
          </li>
        );
      })}
    </ol>
  </section>
);
```

- [ ] **Step 4: `ViewDiscovery.tsx`**

```typescript
import React from "react";
import type { ResolvedBulletin } from "../../types";

type Props = { discovery: ResolvedBulletin["discovery"] };

export const ViewDiscovery: React.FC<Props> = ({ discovery }) => (
  <section className="py-6 border-t border-gray-200">
    <h2 className="text-sm font-sans font-bold uppercase tracking-widest text-black">Discovery</h2>
    <dl className="mt-4 grid grid-cols-2 gap-4">
      <div>
        <dt className="text-xs font-sans font-bold uppercase tracking-widest text-slide-orange">Men's Group Discussion</dt>
        <dd className="mt-1 font-serif text-black">{discovery.mens}</dd>
      </div>
      <div>
        <dt className="text-xs font-sans font-bold uppercase tracking-widest text-slide-orange">Women's Group Discussion</dt>
        <dd className="mt-1 font-serif text-black">{discovery.womens}</dd>
      </div>
    </dl>
  </section>
);
```

- [ ] **Step 5: `ViewUpcomingEvents.tsx`**

```typescript
import React from "react";
import type { ResolvedBulletin } from "../../types";
import { formatEventDate } from "../format";

type Props = { events: ResolvedBulletin["upcomingEvents"] };

export const ViewUpcomingEvents: React.FC<Props> = ({ events }) => {
  if (events.length === 0) return null;
  return (
    <section className="py-6 border-t border-gray-200">
      <h2 className="text-sm font-sans font-bold uppercase tracking-widest text-black">Upcoming Events</h2>
      <ul className="mt-4 space-y-4">
        {events.map((event, idx) => (
          <li key={`${event.date}-${idx}`} className="border-l-2 border-gray-300 pl-4">
            <p className="text-xs font-sans font-bold uppercase tracking-widest text-slide-orange">{event.category}</p>
            <p className="text-sm italic text-gray-600 font-sans">{formatEventDate(event.date)}</p>
            <p className="mt-1 font-serif font-bold text-black">{event.title}</p>
          </li>
        ))}
      </ul>
    </section>
  );
};
```

- [ ] **Step 6: `ViewMidweekMinistries.tsx`**

```typescript
import React from "react";
import type { ResolvedBulletin } from "../../types";

type Props = { midweek: ResolvedBulletin["midweekMinistries"] };

export const ViewMidweekMinistries: React.FC<Props> = ({ midweek }) => (
  <section className="py-6 border-t border-gray-200">
    <h2 className="text-sm font-sans font-bold uppercase tracking-widest text-black">Our Midweek Ministries</h2>
    <div className="mt-4 space-y-5">
      {midweek.map((day) => (
        <div key={day.day}>
          <h3 className="text-xs font-sans font-bold uppercase tracking-widest text-slide-orange">{day.day}</h3>
          <ul className="mt-2 space-y-1">
            {day.meetings.map((meeting, idx) => (
              <li key={idx} className="flex justify-between text-sm">
                <span className="font-serif font-bold text-black">{meeting.name}</span>
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
```

- [ ] **Step 7: `ViewMissionFooter.tsx`**

```typescript
import React from "react";

type Props = { missionStatement: string };

export const ViewMissionFooter: React.FC<Props> = ({ missionStatement }) => (
  <footer className="py-6 mt-6 border-t border-gray-200">
    <p className="text-xs font-sans font-bold uppercase tracking-widest text-black">Our Values and Our Drive</p>
    <p className="mt-2 text-sm text-gray-600 font-serif italic">{missionStatement}</p>
  </footer>
);
```

- [ ] **Step 8: `DownloadPdfLink.tsx`**

```typescript
import React from "react";
import Link from "next/link";
import { buildSlug } from "../../_data/slug";

type Props = { date: string; sermonTitle: string };

export const DownloadPdfLink: React.FC<Props> = ({ date, sermonTitle }) => {
  const slug = buildSlug(date, sermonTitle);
  return (
    <div className="py-6 border-t border-gray-200 text-center">
      <Link
        href={`/bulletin/${slug}/pdf`}
        className="inline-block text-sm font-sans font-bold uppercase tracking-widest text-slide-orange underline"
      >
        Download printable PDF
      </Link>
    </div>
  );
};
```

- [ ] **Step 9: Verify typecheck**

```bash
pnpm build
```

Expected: build succeeds (files typecheck even though not yet imported by any page).

- [ ] **Step 10: Commit**

```bash
git add src/app/bulletin/_view/sections/
git commit -m "feat(bulletin): add mobile-view section components"
```

---

### Task 10: Mobile view — orchestrator

**Files:**
- Create: `src/app/bulletin/_view/BulletinView.tsx`

- [ ] **Step 1: Create the orchestrator**

```typescript
import React from "react";
import type { ResolvedBulletin } from "../types";
import { ViewHeader } from "./sections/ViewHeader";
import { ViewSermon } from "./sections/ViewSermon";
import { ViewOrderOfWorship } from "./sections/ViewOrderOfWorship";
import { ViewDiscovery } from "./sections/ViewDiscovery";
import { ViewUpcomingEvents } from "./sections/ViewUpcomingEvents";
import { ViewMidweekMinistries } from "./sections/ViewMidweekMinistries";
import { ViewMissionFooter } from "./sections/ViewMissionFooter";
import { DownloadPdfLink } from "./sections/DownloadPdfLink";

type Props = { resolved: ResolvedBulletin };

export const BulletinView: React.FC<Props> = ({ resolved }) => (
  <main className="max-w-2xl mx-auto px-4 py-8">
    <ViewHeader resolved={resolved} />
    <ViewSermon sermon={resolved.sermon} />
    <ViewOrderOfWorship worshipSteps={resolved.worshipSteps} isCommunion={resolved.isCommunion} />
    <ViewDiscovery discovery={resolved.discovery} />
    <ViewUpcomingEvents events={resolved.upcomingEvents} />
    <ViewMidweekMinistries midweek={resolved.midweekMinistries} />
    <ViewMissionFooter missionStatement={resolved.missionStatement} />
    <DownloadPdfLink date={resolved.date} sermonTitle={resolved.sermon.title} />
  </main>
);
```

- [ ] **Step 2: Verify typecheck**

```bash
pnpm build
```

Expected: build succeeds.

- [ ] **Step 3: Commit**

```bash
git add src/app/bulletin/_view/BulletinView.tsx
git commit -m "feat(bulletin): add BulletinView mobile orchestrator"
```

---

### Task 11: Public routes — `/bulletin` (latest) and `/bulletin/[slug]`

**Files:**
- Create: `src/app/bulletin/page.tsx`
- Create: `src/app/bulletin/[slug]/page.tsx`
- Create: `src/app/bulletin/not-found.tsx`

- [ ] **Step 1: `page.tsx` (latest)**

```typescript
import React from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { BulletinView } from "./_view/BulletinView";
import { getLatest } from "./_data/bulletins";
import { getConfig } from "./_data/config";
import { resolveBulletin } from "./_data/resolve";

export const metadata: Metadata = {
  title: "Weekly Bulletin | Praise Church West Covina",
  description: "This week's bulletin at Praise Church West Covina.",
};

export default function LatestBulletinPage() {
  const latest = getLatest();
  if (!latest) notFound();
  const resolved = resolveBulletin(latest, getConfig());
  return <BulletinView resolved={resolved} />;
}
```

- [ ] **Step 2: `[slug]/page.tsx`**

```typescript
import React from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { BulletinView } from "../_view/BulletinView";
import { getBySlug, listPublished } from "../_data/bulletins";
import { getConfig } from "../_data/config";
import { resolveBulletin } from "../_data/resolve";
import { buildSlug } from "../_data/slug";

type PageProps = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return listPublished().map((b) => ({ slug: buildSlug(b.date, b.sermon.title) }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const bulletin = getBySlug(slug);
  if (!bulletin) return { title: "Bulletin Not Found" };
  return {
    title: `${bulletin.sermon.title} | Praise Church West Covina`,
    description: `Bulletin for ${bulletin.date}: ${bulletin.sermon.title} (${bulletin.sermon.scriptureReference})`,
  };
}

export default async function BulletinBySlugPage({ params }: PageProps) {
  const { slug } = await params;
  const bulletin = getBySlug(slug);
  if (!bulletin) notFound();
  const resolved = resolveBulletin(bulletin, getConfig());
  return <BulletinView resolved={resolved} />;
}
```

- [ ] **Step 3: `not-found.tsx`**

```typescript
import React from "react";
import Link from "next/link";

export default function BulletinNotFound() {
  return (
    <main className="max-w-2xl mx-auto px-4 py-16 text-center">
      <h1 className="text-3xl font-serif font-bold text-black">Bulletin Not Found</h1>
      <p className="mt-4 text-gray-600 font-sans">We couldn't find a bulletin for that date.</p>
      <Link href="/bulletin" className="mt-8 inline-block text-slide-orange underline font-sans">
        View the latest bulletin
      </Link>
    </main>
  );
}
```

- [ ] **Step 4: Build + manual verification**

```bash
pnpm build
```

Expected: build succeeds; logs show `/bulletin` and `/bulletin/[slug]` routes generated statically (1 slug: `2026-01-04-doing-good-is-from-god`).

Then run dev and visit the routes:

```bash
pnpm dev
```

Visit:
- `http://localhost:3000/bulletin` — should display the sample bulletin with sermon-first layout.
- `http://localhost:3000/bulletin/2026-01-04-doing-good-is-from-god` — same content.
- `http://localhost:3000/bulletin/2026-01-04-wrong-title` — should ALSO display the same bulletin (date prefix wins, slug suffix ignored).
- `http://localhost:3000/bulletin/2099-12-31-nothing` — should show the not-found page.

Stop the dev server after verification.

- [ ] **Step 5: Commit**

```bash
git add src/app/bulletin/page.tsx src/app/bulletin/[slug]/ src/app/bulletin/not-found.tsx
git commit -m "feat(bulletin): add /bulletin (latest) and /bulletin/[slug] routes"
```

---

### Task 12: Archive route

**Files:**
- Create: `src/app/bulletin/archive/page.tsx`

- [ ] **Step 1: Create `archive/page.tsx`**

```typescript
import React from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { listPublished } from "../_data/bulletins";
import { buildSlug } from "../_data/slug";
import { formatBulletinDate } from "../_view/format";

export const metadata: Metadata = {
  title: "Bulletin Archive | Praise Church West Covina",
  description: "Past weekly bulletins from Praise Church West Covina.",
};

export default function BulletinArchivePage() {
  const bulletins = listPublished();
  return (
    <main className="max-w-2xl mx-auto px-4 py-8">
      <header className="border-b border-gray-200 pb-4">
        <h1 className="text-3xl font-serif font-bold text-black">Bulletin Archive</h1>
        <p className="mt-2 text-sm text-gray-600 font-sans">
          Past bulletins, most recent first.
        </p>
      </header>
      {bulletins.length === 0 ? (
        <p className="mt-8 text-gray-600 font-sans">No bulletins published yet.</p>
      ) : (
        <ul className="mt-6 divide-y divide-gray-200">
          {bulletins.map((b) => {
            const slug = buildSlug(b.date, b.sermon.title);
            return (
              <li key={b.date} className="py-4">
                <Link href={`/bulletin/${slug}`} className="block hover:text-slide-orange transition">
                  <p className="text-xs font-sans uppercase tracking-widest text-slide-orange">
                    {formatBulletinDate(b.date)}
                  </p>
                  <p className="mt-1 font-serif font-bold text-black">{b.sermon.title}</p>
                  <p className="text-sm italic text-gray-600 font-sans">{b.sermon.scriptureReference}</p>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}
```

- [ ] **Step 2: Build + manual verification**

```bash
pnpm build
pnpm dev
```

Visit `http://localhost:3000/bulletin/archive` — should show the sample bulletin as a clickable list item. Clicking it should navigate to the bulletin page.

Stop the dev server after verification.

- [ ] **Step 3: Commit**

```bash
git add src/app/bulletin/archive/
git commit -m "feat(bulletin): add /bulletin/archive route"
```

---

### Task 13: PDF — shared styles

**Files:**
- Create: `src/app/bulletin/_pdf/styles.ts`

- [ ] **Step 1: Create `styles.ts`**

```typescript
import { StyleSheet } from "@react-pdf/renderer";

export const colors = {
  black: "#000000",
  orange: "#EC7442",
  gray: "#6B7280",
  lightGray: "#E5E7EB",
  white: "#FFFFFF",
};

export const styles = StyleSheet.create({
  page: {
    paddingTop: 28,
    paddingBottom: 28,
    paddingHorizontal: 40,
    fontSize: 10,
    color: colors.black,
    fontFamily: "Helvetica",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
    marginBottom: 20,
  },
  headerLeft: {
    flexDirection: "column",
  },
  headerRight: {
    flexDirection: "column",
    alignItems: "flex-end",
  },
  headerDate: {
    color: colors.orange,
    fontStyle: "italic",
    fontSize: 10,
  },
  headerChurch: {
    marginTop: 3,
    fontSize: 10,
    color: colors.black,
  },
  headerWelcome: {
    color: colors.orange,
    fontStyle: "italic",
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
  },
  headerAddress: {
    marginTop: 3,
    fontSize: 10,
    color: colors.black,
  },
  twoColumn: {
    flexDirection: "row",
    gap: 28,
  },
  column: {
    flex: 1,
  },
  sectionHeading: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    textTransform: "uppercase",
    letterSpacing: 1.5,
    marginBottom: 10,
  },
  orderGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  orderItem: {
    width: "25%",
    paddingRight: 8,
    marginBottom: 14,
  },
  orderItemCommunion: {
    backgroundColor: colors.orange,
    padding: 6,
    marginLeft: -6,
    marginRight: 2,
  },
  orderNumber: {
    color: colors.orange,
    fontFamily: "Helvetica-Bold",
    fontSize: 9,
    marginBottom: 4,
  },
  orderNumberCommunion: {
    color: colors.white,
  },
  orderTitle: {
    fontFamily: "Helvetica-Bold",
    fontSize: 10,
    marginBottom: 2,
  },
  orderTitleCommunion: {
    color: colors.white,
  },
  orderAssignment: {
    fontSize: 9,
    fontStyle: "italic",
    color: colors.gray,
  },
  orderAssignmentCommunion: {
    color: colors.white,
  },
  missionText: {
    fontSize: 9,
    color: colors.gray,
    lineHeight: 1.4,
  },
  discoveryRow: {
    flexDirection: "row",
    gap: 20,
  },
  discoveryItem: {
    flex: 1,
  },
  discoveryLabel: {
    color: colors.orange,
    fontFamily: "Helvetica-Bold",
    fontSize: 8,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 3,
  },
  discoveryValue: {
    fontSize: 11,
  },
  eventsRow: {
    flexDirection: "row",
    gap: 20,
  },
  eventItem: {
    flex: 1,
    paddingLeft: 8,
    borderLeftWidth: 2,
    borderLeftColor: colors.lightGray,
  },
  eventCategory: {
    color: colors.orange,
    fontFamily: "Helvetica-Bold",
    fontSize: 8,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 2,
  },
  eventDate: {
    fontSize: 9,
    fontStyle: "italic",
    color: colors.gray,
    marginBottom: 3,
  },
  eventTitle: {
    fontFamily: "Helvetica-Bold",
    fontSize: 10,
  },
  sermonTitle: {
    fontSize: 14,
    fontFamily: "Helvetica-Bold",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 4,
  },
  sermonReference: {
    color: colors.orange,
    fontFamily: "Helvetica-Bold",
    fontSize: 10,
    marginBottom: 6,
  },
  sermonPassage: {
    fontSize: 10,
    lineHeight: 1.5,
    textAlign: "justify",
  },
  verseSuperscript: {
    fontSize: 7,
    verticalAlign: "super",
  },
  notesLine: {
    marginTop: 14,
    borderBottomWidth: 0.5,
    borderBottomColor: colors.lightGray,
  },
  sectionDivider: {
    marginTop: 18,
    marginBottom: 14,
    borderTopWidth: 1,
    borderTopColor: colors.lightGray,
  },
  midweekDay: {
    marginBottom: 12,
  },
  midweekDayLabel: {
    color: colors.orange,
    fontFamily: "Helvetica-Bold",
    fontSize: 9,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 4,
  },
  midweekMeeting: {
    flexDirection: "row",
    fontSize: 10,
    marginBottom: 2,
  },
  midweekName: {
    fontFamily: "Helvetica-Bold",
    width: 120,
  },
  midweekLocation: {
    width: 120,
  },
  midweekTime: {
    color: colors.gray,
  },
  logoPlaceholder: {
    marginTop: 40,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.lightGray,
    borderStyle: "dashed",
    alignItems: "center",
  },
  logoPlaceholderText: {
    color: colors.gray,
    fontStyle: "italic",
    fontSize: 9,
  },
});
```

- [ ] **Step 2: Verify typecheck**

```bash
pnpm build
```

Expected: build succeeds.

- [ ] **Step 3: Commit**

```bash
git add src/app/bulletin/_pdf/styles.ts
git commit -m "feat(bulletin): add PDF StyleSheet with brand colors"
```

---

### Task 14: PDF — header component (shared across pages)

**Files:**
- Create: `src/app/bulletin/_pdf/components/Header.tsx`

- [ ] **Step 1: Create `Header.tsx`**

```typescript
import React from "react";
import { View, Text } from "@react-pdf/renderer";
import type { ResolvedBulletin } from "../../types";
import { formatBulletinDate } from "../../_view/format";
import { styles } from "../styles";

type Props = { resolved: Pick<ResolvedBulletin, "date" | "church"> };

export const Header: React.FC<Props> = ({ resolved }) => (
  <View style={styles.header}>
    <View style={styles.headerLeft}>
      <Text style={styles.headerDate}>{formatBulletinDate(resolved.date)}</Text>
      <Text style={styles.headerChurch}>{resolved.church.name}</Text>
    </View>
    <View style={styles.headerRight}>
      <Text style={styles.headerWelcome}>{resolved.church.welcomeLine}</Text>
      <Text style={styles.headerAddress}>{resolved.church.address}</Text>
    </View>
  </View>
);
```

- [ ] **Step 2: Verify typecheck**

```bash
pnpm build
```

Expected: build succeeds.

- [ ] **Step 3: Commit**

```bash
git add src/app/bulletin/_pdf/components/Header.tsx
git commit -m "feat(bulletin): add PDF shared Header component"
```

---

### Task 15: PDF — page-1 section components

**Files:**
- Create: `src/app/bulletin/_pdf/components/OrderOfWorship.tsx`
- Create: `src/app/bulletin/_pdf/components/MissionStatement.tsx`
- Create: `src/app/bulletin/_pdf/components/Discovery.tsx`
- Create: `src/app/bulletin/_pdf/components/UpcomingEvents.tsx`
- Create: `src/app/bulletin/_pdf/components/SermonSection.tsx`
- Create: `src/app/bulletin/_pdf/components/NotesLines.tsx`

- [ ] **Step 1: `OrderOfWorship.tsx`**

```typescript
import React from "react";
import { View, Text } from "@react-pdf/renderer";
import type { ResolvedBulletin } from "../../types";
import { styles } from "../styles";

type Props = {
  worshipSteps: ResolvedBulletin["worshipSteps"];
  isCommunion: boolean;
};

export const OrderOfWorship: React.FC<Props> = ({ worshipSteps, isCommunion }) => (
  <View>
    <Text style={styles.sectionHeading}>The Order of Our Worship</Text>
    <View style={styles.orderGrid}>
      {worshipSteps.map((step, idx) => {
        const isHighlight = isCommunion && step.id === "lords-supper";
        return (
          <View key={step.id} style={[styles.orderItem, isHighlight ? styles.orderItemCommunion : {}]}>
            <Text style={[styles.orderNumber, isHighlight ? styles.orderNumberCommunion : {}]}>
              {String(idx + 1).padStart(2, "0")}.
            </Text>
            <Text style={[styles.orderTitle, isHighlight ? styles.orderTitleCommunion : {}]}>{step.title}</Text>
            <Text style={[styles.orderAssignment, isHighlight ? styles.orderAssignmentCommunion : {}]}>
              {step.assignment}
            </Text>
          </View>
        );
      })}
    </View>
  </View>
);
```

- [ ] **Step 2: `MissionStatement.tsx`**

```typescript
import React from "react";
import { View, Text } from "@react-pdf/renderer";
import { styles } from "../styles";

type Props = { missionStatement: string };

export const MissionStatement: React.FC<Props> = ({ missionStatement }) => (
  <View>
    <Text style={styles.sectionHeading}>Our Values and Our Drive</Text>
    <Text style={styles.missionText}>{missionStatement}</Text>
  </View>
);
```

- [ ] **Step 3: `Discovery.tsx`**

```typescript
import React from "react";
import { View, Text } from "@react-pdf/renderer";
import type { ResolvedBulletin } from "../../types";
import { styles } from "../styles";

type Props = { discovery: ResolvedBulletin["discovery"] };

export const Discovery: React.FC<Props> = ({ discovery }) => (
  <View>
    <Text style={styles.sectionHeading}>Discovery</Text>
    <View style={styles.discoveryRow}>
      <View style={styles.discoveryItem}>
        <Text style={styles.discoveryLabel}>Men's Group Discussion</Text>
        <Text style={styles.discoveryValue}>{discovery.mens}</Text>
      </View>
      <View style={styles.discoveryItem}>
        <Text style={styles.discoveryLabel}>Women's Group Discussion</Text>
        <Text style={styles.discoveryValue}>{discovery.womens}</Text>
      </View>
    </View>
  </View>
);
```

- [ ] **Step 4: `UpcomingEvents.tsx`**

```typescript
import React from "react";
import { View, Text } from "@react-pdf/renderer";
import type { ResolvedBulletin } from "../../types";
import { formatEventDate } from "../../_view/format";
import { styles } from "../styles";

type Props = { events: ResolvedBulletin["upcomingEvents"] };

export const UpcomingEvents: React.FC<Props> = ({ events }) => {
  if (events.length === 0) return null;
  return (
    <View>
      <Text style={styles.sectionHeading}>Upcoming Events</Text>
      <View style={styles.eventsRow}>
        {events.map((event, idx) => (
          <View key={`${event.date}-${idx}`} style={styles.eventItem}>
            <Text style={styles.eventCategory}>{event.category}</Text>
            <Text style={styles.eventDate}>{formatEventDate(event.date)}</Text>
            <Text style={styles.eventTitle}>{event.title}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};
```

- [ ] **Step 5: `SermonSection.tsx`**

```typescript
import React from "react";
import { View, Text } from "@react-pdf/renderer";
import type { ResolvedBulletin } from "../../types";
import { parseScripturePassage } from "../../_data/scripture";
import { styles } from "../styles";

type Props = { sermon: ResolvedBulletin["sermon"] };

export const SermonSection: React.FC<Props> = ({ sermon }) => {
  const fragments = parseScripturePassage(sermon.scripturePassage);
  return (
    <View>
      <Text style={styles.sermonTitle}>{sermon.title}</Text>
      <Text style={styles.sermonReference}>{sermon.scriptureReference}</Text>
      <Text style={styles.sermonPassage}>
        {fragments.map((f, i) =>
          f.kind === "verse" ? (
            <Text key={i} style={styles.verseSuperscript}>
              {f.number}{" "}
            </Text>
          ) : (
            <Text key={i}>{f.content}</Text>
          ),
        )}
      </Text>
    </View>
  );
};
```

- [ ] **Step 6: `NotesLines.tsx`**

```typescript
import React from "react";
import { View } from "@react-pdf/renderer";
import { styles } from "../styles";

type Props = { lineCount?: number };

export const NotesLines: React.FC<Props> = ({ lineCount = 10 }) => (
  <View>
    {Array.from({ length: lineCount }).map((_, i) => (
      <View key={i} style={styles.notesLine} />
    ))}
  </View>
);
```

- [ ] **Step 7: Verify typecheck**

```bash
pnpm build
```

Expected: build succeeds.

- [ ] **Step 8: Commit**

```bash
git add src/app/bulletin/_pdf/components/
git commit -m "feat(bulletin): add PDF page-1 section components"
```

---

### Task 16: PDF — page-2 components + document + pages

**Files:**
- Create: `src/app/bulletin/_pdf/components/MidweekMinistries.tsx`
- Create: `src/app/bulletin/_pdf/components/Logo.tsx`
- Create: `src/app/bulletin/_pdf/PageOne.tsx`
- Create: `src/app/bulletin/_pdf/PageTwo.tsx`
- Create: `src/app/bulletin/_pdf/BulletinDocument.tsx`

- [ ] **Step 1: `MidweekMinistries.tsx`**

```typescript
import React from "react";
import { View, Text } from "@react-pdf/renderer";
import type { ResolvedBulletin } from "../../types";
import { styles } from "../styles";

type Props = { midweek: ResolvedBulletin["midweekMinistries"] };

export const MidweekMinistries: React.FC<Props> = ({ midweek }) => (
  <View>
    <Text style={styles.sectionHeading}>Our Midweek Ministries</Text>
    {midweek.map((day) => (
      <View key={day.day} style={styles.midweekDay}>
        <Text style={styles.midweekDayLabel}>{day.day}</Text>
        {day.meetings.map((meeting, idx) => (
          <View key={idx} style={styles.midweekMeeting}>
            <Text style={styles.midweekName}>{meeting.name}</Text>
            <Text style={styles.midweekLocation}>{meeting.location}</Text>
            <Text style={styles.midweekTime}>{meeting.time}</Text>
          </View>
        ))}
      </View>
    ))}
  </View>
);
```

- [ ] **Step 2: `Logo.tsx`**

```typescript
import React from "react";
import { View, Text } from "@react-pdf/renderer";
import { styles } from "../styles";

export const Logo: React.FC = () => (
  <View style={styles.logoPlaceholder}>
    <Text style={styles.logoPlaceholderText}>[Church logo placeholder]</Text>
  </View>
);
```

- [ ] **Step 3: `PageOne.tsx`**

```typescript
import React from "react";
import { Page, View } from "@react-pdf/renderer";
import type { ResolvedBulletin } from "../types";
import { Header } from "./components/Header";
import { OrderOfWorship } from "./components/OrderOfWorship";
import { MissionStatement } from "./components/MissionStatement";
import { Discovery } from "./components/Discovery";
import { UpcomingEvents } from "./components/UpcomingEvents";
import { SermonSection } from "./components/SermonSection";
import { NotesLines } from "./components/NotesLines";
import { styles } from "./styles";

type Props = { resolved: ResolvedBulletin };

export const PageOne: React.FC<Props> = ({ resolved }) => (
  <Page size="LETTER" orientation="landscape" style={styles.page}>
    <Header resolved={resolved} />
    <View style={styles.twoColumn}>
      <View style={styles.column}>
        <OrderOfWorship worshipSteps={resolved.worshipSteps} isCommunion={resolved.isCommunion} />
        <View style={styles.sectionDivider} />
        <MissionStatement missionStatement={resolved.missionStatement} />
        <View style={styles.sectionDivider} />
        <Discovery discovery={resolved.discovery} />
        <View style={styles.sectionDivider} />
        <UpcomingEvents events={resolved.upcomingEvents} />
      </View>
      <View style={styles.column}>
        <SermonSection sermon={resolved.sermon} />
        <View style={styles.sectionDivider} />
        <NotesLines lineCount={10} />
      </View>
    </View>
  </Page>
);
```

- [ ] **Step 4: `PageTwo.tsx`**

```typescript
import React from "react";
import { Page, View } from "@react-pdf/renderer";
import type { ResolvedBulletin } from "../types";
import { Header } from "./components/Header";
import { MidweekMinistries } from "./components/MidweekMinistries";
import { Logo } from "./components/Logo";
import { styles } from "./styles";

type Props = { resolved: ResolvedBulletin };

export const PageTwo: React.FC<Props> = ({ resolved }) => (
  <Page size="LETTER" orientation="landscape" style={styles.page}>
    <Header resolved={resolved} />
    <View style={styles.twoColumn}>
      <View style={styles.column}>
        <MidweekMinistries midweek={resolved.midweekMinistries} />
      </View>
      <View style={styles.column}>
        <Logo />
      </View>
    </View>
  </Page>
);
```

- [ ] **Step 5: `BulletinDocument.tsx`**

```typescript
import React from "react";
import { Document } from "@react-pdf/renderer";
import type { ResolvedBulletin } from "../types";
import { PageOne } from "./PageOne";
import { PageTwo } from "./PageTwo";

type Props = { resolved: ResolvedBulletin };

export const BulletinDocument: React.FC<Props> = ({ resolved }) => (
  <Document title={`Bulletin ${resolved.date} — ${resolved.sermon.title}`}>
    <PageOne resolved={resolved} />
    <PageTwo resolved={resolved} />
  </Document>
);
```

- [ ] **Step 6: Verify typecheck**

```bash
pnpm build
```

Expected: build succeeds.

- [ ] **Step 7: Commit**

```bash
git add src/app/bulletin/_pdf/
git commit -m "feat(bulletin): add PDF document, pages, and page-2 components"
```

---

### Task 17: PDF route handler

**Files:**
- Create: `src/app/bulletin/[slug]/pdf/route.ts`

- [ ] **Step 1: Create `route.ts`**

```typescript
import { NextResponse } from "next/server";
import { renderToStream } from "@react-pdf/renderer";
import React from "react";
import { getBySlug } from "../../_data/bulletins";
import { getConfig } from "../../_data/config";
import { resolveBulletin } from "../../_data/resolve";
import { BulletinDocument } from "../../_pdf/BulletinDocument";

export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ slug: string }> };

export async function GET(_request: Request, { params }: RouteContext) {
  const { slug } = await params;
  const bulletin = getBySlug(slug);
  if (!bulletin) {
    return new NextResponse("Not Found", { status: 404 });
  }
  const resolved = resolveBulletin(bulletin, getConfig());
  const stream = await renderToStream(React.createElement(BulletinDocument, { resolved }));

  // renderToStream returns a Node Readable; convert to Web ReadableStream for NextResponse.
  const webStream = new ReadableStream({
    start(controller) {
      stream.on("data", (chunk: Buffer) => controller.enqueue(new Uint8Array(chunk)));
      stream.on("end", () => controller.close());
      stream.on("error", (err) => controller.error(err));
    },
  });

  return new NextResponse(webStream, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="bulletin-${bulletin.date}.pdf"`,
      "Cache-Control": "no-store",
    },
  });
}
```

- [ ] **Step 2: Build + manual verification**

```bash
pnpm build
```

Expected: build succeeds. The PDF route should appear as a dynamic route `(Dynamic)` in the build output since it uses `force-dynamic`.

Then:

```bash
pnpm dev
```

Visit `http://localhost:3000/bulletin/2026-01-04-doing-good-is-from-god/pdf` — browser should download (or open in-browser viewer) a PDF named `bulletin-2026-01-04.pdf`. Open it and confirm:
- 2 landscape pages
- Page 1: header + 4×2 order of worship grid (step 06 highlighted in orange) + mission + discovery + events + sermon passage + notes lines
- Page 2: header + midweek ministries + logo placeholder

Also verify the download link on `/bulletin` works end-to-end by clicking it.

Stop the dev server after verification.

- [ ] **Step 3: Commit**

```bash
git add src/app/bulletin/[slug]/pdf/
git commit -m "feat(bulletin): add /bulletin/[slug]/pdf route handler"
```

---

### Task 18: End-to-end verification

- [ ] **Step 1: Clean build**

```bash
rm -rf .next
pnpm build
```

Expected: clean build succeeds. Confirm the build output lists:
- `/bulletin` — Static
- `/bulletin/[slug]` — Static (1 param)
- `/bulletin/[slug]/pdf` — Dynamic
- `/bulletin/archive` — Static

- [ ] **Step 2: Manual smoke test**

```bash
pnpm dev
```

Walk through the checklist:
- `/bulletin` renders the sample bulletin sermon-first, with communion step visually highlighted.
- `/bulletin/2026-01-04-doing-good-is-from-god` renders the same content.
- `/bulletin/2026-01-04-any-wrong-slug` also renders the same content (date prefix wins).
- `/bulletin/2099-01-01-nothing` shows the not-found page.
- `/bulletin/archive` lists the sample bulletin; clicking it navigates to the bulletin page.
- Clicking "Download printable PDF" downloads `bulletin-2026-01-04.pdf`; PDF is 2 landscape pages matching the reference.
- Toggle `isCommunion: false` in `src/app/bulletin/_data/bulletins.ts`, refresh `/bulletin`, confirm step 06 is no longer highlighted in either mobile view or PDF. Revert the change.
- Add an override `assignmentOverrides: { welcome: "Test Name" }` to the dummy bulletin. Refresh. Confirm step 02 (Welcome) shows "Test Name" in both mobile view and PDF. Revert the change.
- Open `/bulletin` on a phone (LAN IP from dev server or Vercel preview). Confirm layout is readable and sermon is at the top.

Stop the dev server after verification.

- [ ] **Step 3: Lint**

```bash
pnpm lint
```

Expected: no new warnings or errors from bulletin files. Pre-existing warnings in unrelated files are OK.

- [ ] **Step 4: Final commit (if anything was changed during verification)**

If the verification surfaced any tweaks (not expected if tasks 1-17 were done correctly), commit them. Otherwise, skip this step.

---

## Open follow-ups (not in this plan)

- Brand font registration (Merriweather + Inter) in `src/app/bulletin/_pdf/styles.ts` once `.ttf` files land in `public/fonts/`.
- Real church logo + mountain illustration asset, replacing `Logo.tsx` placeholder.
- Admin UI / authentication / persistent storage (swap out `_data/` modules).
- Google Calendar integration, replacing the dummy `upcomingEvents` array on each bulletin.
- Digital note-taking, share buttons, "add to calendar" on events for mobile view.
