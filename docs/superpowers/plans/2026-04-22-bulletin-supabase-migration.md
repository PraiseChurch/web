# Bulletin Supabase Migration — Implementation Plan (Phase 1 of 2)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the hardcoded `_data/bulletins.ts` and `_data/config.ts` arrays with Supabase Postgres storage. The public bulletin surface (`/bulletin*` routes, PDF, mobile view) renders identically; only the storage backend changes.

**Architecture:** Supabase Postgres holds two tables (`bulletin_config` singleton + `bulletins`) with merged JSONB payloads. Accessor functions in `_data/` become async and delegate to Supabase queries. Zod schemas validate on read/write. `schema_version` and `render_version` columns scaffold future breaking changes; both default to 1 in v1. No admin UI in this plan — Phase 2 builds that on top.

**Tech Stack:** Next.js 15 App Router, Supabase (`@supabase/supabase-js`, `@supabase/ssr`), Zod 3, TypeScript 5.

**Testing:** No automated harness in repo. Each task verifies via `pnpm build` + manual `curl` checks against dev server.

**Prerequisites the user must do manually (flagged per task):**
- Create a Supabase project at supabase.com (free tier)
- Apply the SQL migration file in Supabase SQL editor
- Run the seed script locally (task 9)
- Populate `.env.local` with Supabase URL + anon key

---

### Task 1: Install dependencies

**Files:**
- Modify: `package.json`
- Modify: `pnpm-lock.yaml`

- [ ] **Step 1: Install runtime deps**

```bash
pnpm add @supabase/supabase-js @supabase/ssr zod
```

- [ ] **Step 2: Verify versions installed**

```bash
pnpm list @supabase/supabase-js @supabase/ssr zod
```

Expected: all three listed as direct dependencies.

- [ ] **Step 3: Verify build still passes**

```bash
pnpm build
```

Expected: build succeeds (no code uses the new deps yet).

- [ ] **Step 4: Commit**

```bash
git add package.json pnpm-lock.yaml
git commit -m "chore: add supabase and zod for bulletin storage"
```

---

### Task 2: Extend BulletinConfig type with enums key

**Files:**
- Modify: `src/app/bulletin/types.ts`

- [ ] **Step 1: Add `BulletinConfigEnums` type and update `BulletinConfig`**

Edit `src/app/bulletin/types.ts`. After `MidweekDay` and before `BulletinConfig`, add:

```typescript
export type BulletinConfigEnums = {
  // Key names match the bulletin field each enum validates.
  // BulletinConfigEnums.eventCategory validates UpcomingEvent.category.
  eventCategory: string[];
};
```

Update the `BulletinConfig` type to include `enums`:

```typescript
export type BulletinConfig = {
  church: {
    name: string;
    address: string;
    welcomeLine: string;
  };
  missionStatement: string;
  worshipSteps: WorshipStepConfig[];
  midweekMinistries: MidweekDay[];
  enums: BulletinConfigEnums;
};
```

Also add storage-layer types at the bottom of the file:

```typescript
export type StoredBulletin = {
  bulletin: Bulletin;
  configSnapshot?: BulletinConfig;
  schemaVersion: number;
  renderVersion: number;
  publishedAt: string | null;
};

export type BulletinSummary = {
  date: string;
  sermonTitle: string;
  scriptureReference: string;
  publishedAt: string | null;
};
```

- [ ] **Step 2: Populate `enums.eventCategory` in hardcoded config**

Edit `src/app/bulletin/_data/config.ts` — add the `enums` field to the `CONFIG` object after `midweekMinistries`:

```typescript
  enums: {
    eventCategory: ["WOMEN", "MEN", "COUPLES", "YOUTH", "GENERAL"],
  },
```

- [ ] **Step 3: Verify build**

```bash
pnpm build
```

Expected: build succeeds with no type errors.

- [ ] **Step 4: Commit**

```bash
git add src/app/bulletin/types.ts src/app/bulletin/_data/config.ts
git commit -m "feat(bulletin): add BulletinConfigEnums with eventCategory and storage types"
```

---

### Task 3: Add Zod schemas and migration scaffold

**Files:**
- Create: `src/app/bulletin/_data/schemas.ts`
- Create: `src/app/bulletin/_data/migrations.ts`

- [ ] **Step 1: Write `schemas.ts`**

Create `src/app/bulletin/_data/schemas.ts`:

```typescript
import { z } from "zod";

export const WeekdaySchema = z.enum([
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
]);

export const WorshipStepConfigSchemaV1 = z.object({
  id: z.string(),
  title: z.string(),
  defaultAssignment: z.string(),
});

export const MidweekMeetingSchemaV1 = z.object({
  name: z.string(),
  location: z.string(),
  time: z.string(),
});

export const MidweekDaySchemaV1 = z.object({
  day: WeekdaySchema,
  meetings: z.array(MidweekMeetingSchemaV1),
});

export const BulletinConfigEnumsSchemaV1 = z.object({
  eventCategory: z.array(z.string()),
});

export const BulletinConfigSchemaV1 = z.object({
  church: z.object({
    name: z.string(),
    address: z.string(),
    welcomeLine: z.string(),
  }),
  missionStatement: z.string(),
  worshipSteps: z.array(WorshipStepConfigSchemaV1),
  midweekMinistries: z.array(MidweekDaySchemaV1),
  enums: BulletinConfigEnumsSchemaV1,
});

export const UpcomingEventSchemaV1 = z.object({
  category: z.string(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  title: z.string(),
});

export const SermonSchemaV1 = z.object({
  title: z.string(),
  scriptureReference: z.string(),
  scripturePassage: z.string(),
});

export const DiscoverySchemaV1 = z.object({
  mens: z.string(),
  womens: z.string(),
});

export const BulletinSchemaV1 = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  sermon: SermonSchemaV1,
  assignmentOverrides: z.record(z.string(), z.string()),
  isCommunion: z.boolean(),
  discovery: DiscoverySchemaV1,
  upcomingEvents: z.array(UpcomingEventSchemaV1),
  publishedAt: z.string().nullable(),
});

// Stored JSONB shape for the `data` column on the bulletins table
export const StoredBulletinDataSchemaV1 = z.object({
  bulletin: BulletinSchemaV1,
  configSnapshot: BulletinConfigSchemaV1.optional(),
});

// Current versions — bump when breaking changes land
export const CURRENT_SCHEMA_VERSION = 1;
export const CURRENT_RENDER_VERSION = 1;
```

- [ ] **Step 2: Write `migrations.ts` scaffold**

Create `src/app/bulletin/_data/migrations.ts`:

```typescript
// Data-shape migrations run when a stored row's schema_version is below
// CURRENT_SCHEMA_VERSION. Each migration is a pure function from the old
// shape to the new one. When we ship a breaking change, add a migration here
// and run it against all rows in a SQL migration script at deploy time.

// import type { BulletinConfig, Bulletin } from "../types";

// Example for future reference:
// export function migrateBulletinV1ToV2(v1: BulletinV1): BulletinV2 {
//   return { ...v1, newField: "default" };
// }

export {}; // keep the module valid until we have real migrations
```

- [ ] **Step 3: Verify build**

```bash
pnpm build
```

Expected: build succeeds.

- [ ] **Step 4: Commit**

```bash
git add src/app/bulletin/_data/schemas.ts src/app/bulletin/_data/migrations.ts
git commit -m "feat(bulletin): add zod v1 schemas and migrations scaffold"
```

---

### Task 4: Update resolver signature + add helper

**Files:**
- Modify: `src/app/bulletin/_data/resolve.ts`

- [ ] **Step 1: Read current resolve.ts for context**

Current file exports `resolveBulletin(bulletin: Bulletin, config: BulletinConfig): ResolvedBulletin`.

- [ ] **Step 2: Replace contents of `src/app/bulletin/_data/resolve.ts`**

```typescript
import type {
  Bulletin,
  BulletinConfig,
  ResolvedBulletin,
  ResolvedWorshipStep,
  StoredBulletin,
} from "../types";
import { eventsWithinDays } from "./events";
import { getConfig } from "./config";

const EVENTS_WINDOW_DAYS = 30;
const PREACHING_STEP_ID = "preaching";

function resolveStep(
  step: BulletinConfig["worshipSteps"][number],
  overrides: Bulletin["assignmentOverrides"],
): ResolvedWorshipStep {
  return {
    id: step.id,
    title: step.title,
    assignment: overrides[step.id] ?? step.defaultAssignment,
  };
}

export function resolveBulletin(
  bulletin: Bulletin,
  config: BulletinConfig,
): ResolvedBulletin {
  const worshipSteps = config.worshipSteps.map((step) =>
    resolveStep(step, bulletin.assignmentOverrides),
  );
  const preachingStep = worshipSteps.find((s) => s.id === PREACHING_STEP_ID);
  if (!preachingStep) {
    throw new Error(
      `BulletinConfig.worshipSteps must contain a step with id "${PREACHING_STEP_ID}"`,
    );
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
    upcomingEvents: eventsWithinDays(
      bulletin.upcomingEvents,
      bulletin.date,
      EVENTS_WINDOW_DAYS,
    ),
    midweekMinistries: config.midweekMinistries,
  };
}

// Helper: resolves a StoredBulletin using its snapshot for published
// bulletins, falling back to live config for drafts. Wraps the common
// call pattern so consumers don't have to handle both cases manually.
export async function resolveStoredBulletin(
  stored: StoredBulletin,
): Promise<ResolvedBulletin> {
  if (stored.configSnapshot) {
    return resolveBulletin(stored.bulletin, stored.configSnapshot);
  }
  const liveConfig = await getConfig();
  return resolveBulletin(stored.bulletin, liveConfig);
}
```

- [ ] **Step 3: Verify build**

```bash
pnpm build
```

Expected: build succeeds. `getConfig` is already exported from `config.ts`; we'll change its implementation in a later task but the signature is compatible.

- [ ] **Step 4: Commit**

```bash
git add src/app/bulletin/_data/resolve.ts
git commit -m "feat(bulletin): add resolveStoredBulletin helper for snapshot/live config fallback"
```

---

### Task 5: Add render-version and schema-version dispatch scaffolds

**Files:**
- Create: `src/app/bulletin/_pdf/index.ts`
- Create: `src/app/bulletin/_view/index.ts`

- [ ] **Step 1: Create `_pdf/index.ts`**

```typescript
import { BulletinDocument as V1 } from "./BulletinDocument";

// Add case branches here when a breaking render change ships. Copy the
// old _pdf/ tree to _pdf/v1/, import it here, and route to the new one
// by default. Existing rows stamped with the old version still render
// with the archived components.
export function getBulletinDocument(_renderVersion: number) {
  return V1;
}
```

- [ ] **Step 2: Create `_view/index.ts`**

```typescript
import { BulletinView as V1 } from "./BulletinView";

export function getBulletinView(_renderVersion: number) {
  return V1;
}
```

- [ ] **Step 3: Verify build**

```bash
pnpm build
```

Expected: build succeeds.

- [ ] **Step 4: Commit**

```bash
git add src/app/bulletin/_pdf/index.ts src/app/bulletin/_view/index.ts
git commit -m "feat(bulletin): add render-version dispatch scaffolds for pdf and view"
```

---

### Task 6: Make accessor functions async (still reading from hardcoded data)

**Files:**
- Modify: `src/app/bulletin/_data/config.ts`
- Modify: `src/app/bulletin/_data/bulletins.ts`

This task introduces the async signatures without changing the data source. Consumers will be updated to `await` in Task 7. Supabase replaces the implementation in Task 11.

- [ ] **Step 1: Replace `src/app/bulletin/_data/config.ts`**

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
    {
      id: "worship-in-song",
      title: "Worship in Song",
      defaultAssignment: "Worship Team",
    },
    { id: "welcome", title: "Welcome", defaultAssignment: "Emil Cueto" },
    {
      id: "continuation-of-worship",
      title: "Continuation of Worship",
      defaultAssignment: "Worship Team",
    },
    {
      id: "scripture-reading",
      title: "Scripture Reading and Prayer",
      defaultAssignment: "Emil Cueto",
    },
    {
      id: "preaching",
      title: "Preaching of God's Word",
      defaultAssignment: "Joel Danganan",
    },
    {
      id: "lords-supper",
      title: "Ordinance of the Lord's Supper",
      defaultAssignment: "Elders",
    },
    {
      id: "worship-with-treasures",
      title: "Worship with our Treasures",
      defaultAssignment: "Deacons",
    },
    { id: "conclusion", title: "Conclusion", defaultAssignment: "Emil Cueto" },
  ],
  midweekMinistries: [
    {
      day: "Wednesday",
      meetings: [
        { name: "Prayer Meeting", location: "Virtual", time: "7:30 PM" },
      ],
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
  enums: {
    eventCategory: ["WOMEN", "MEN", "COUPLES", "YOUTH", "GENERAL"],
  },
};

export async function getConfig(): Promise<BulletinConfig> {
  return CONFIG;
}
```

- [ ] **Step 2: Replace `src/app/bulletin/_data/bulletins.ts`**

```typescript
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
```

- [ ] **Step 3: Verify build**

```bash
pnpm build
```

Expected: build fails with errors in consumers that haven't been updated to await yet. That's expected — next task fixes consumers. Don't commit yet.

- [ ] **Step 4: Inspect the errors (don't fix yet)**

Expected errors are in `src/app/bulletin/page.tsx`, `src/app/bulletin/[slug]/page.tsx`, `src/app/bulletin/[slug]/pdf/route.ts`, `src/app/bulletin/archive/page.tsx` — all calling sync accessor functions that are now Promises.

Do NOT commit — proceed to Task 7.

---

### Task 7: Update consumers to await accessors

**Files:**
- Modify: `src/app/bulletin/page.tsx`
- Modify: `src/app/bulletin/[slug]/page.tsx`
- Modify: `src/app/bulletin/[slug]/pdf/route.ts`
- Modify: `src/app/bulletin/archive/page.tsx`

- [ ] **Step 1: Replace `src/app/bulletin/page.tsx`**

```typescript
import React from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { BulletinView } from "./_view/BulletinView";
import { getLatest } from "./_data/bulletins";
import { resolveStoredBulletin } from "./_data/resolve";

export const metadata: Metadata = {
  title: "Weekly Bulletin | Praise Church West Covina",
  description: "This week's bulletin at Praise Church West Covina.",
};

export default async function LatestBulletinPage() {
  const latest = await getLatest();
  if (!latest) notFound();
  const resolved = await resolveStoredBulletin(latest);
  return <BulletinView resolved={resolved} />;
}
```

- [ ] **Step 2: Replace `src/app/bulletin/[slug]/page.tsx`**

```typescript
import React from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { BulletinView } from "../_view/BulletinView";
import { getPublishedBySlug, listPublished } from "../_data/bulletins";
import { resolveStoredBulletin } from "../_data/resolve";
import { buildSlug } from "../_data/slug";

type PageProps = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const published = await listPublished();
  return published.map((b) => ({ slug: buildSlug(b.date, b.sermonTitle) }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const stored = await getPublishedBySlug(slug);
  if (!stored) return { title: "Bulletin Not Found" };
  return {
    title: `${stored.bulletin.sermon.title} | Praise Church West Covina`,
    description: `Bulletin for ${stored.bulletin.date}: ${stored.bulletin.sermon.title} (${stored.bulletin.sermon.scriptureReference})`,
  };
}

export default async function BulletinBySlugPage({ params }: PageProps) {
  const { slug } = await params;
  const stored = await getPublishedBySlug(slug);
  if (!stored) notFound();
  const resolved = await resolveStoredBulletin(stored);
  return <BulletinView resolved={resolved} />;
}
```

- [ ] **Step 3: Replace `src/app/bulletin/[slug]/pdf/route.ts`**

```typescript
import { NextResponse } from "next/server";
import { renderToStream, type DocumentProps } from "@react-pdf/renderer";
import React from "react";
import { getPublishedBySlug } from "../../_data/bulletins";
import { resolveStoredBulletin } from "../../_data/resolve";
import { BulletinDocument } from "../../_pdf/BulletinDocument";

export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ slug: string }> };

export async function GET(_request: Request, { params }: RouteContext) {
  const { slug } = await params;
  const stored = await getPublishedBySlug(slug);
  if (!stored) {
    return new NextResponse("Not Found", { status: 404 });
  }
  const resolved = await resolveStoredBulletin(stored);
  const stream = await renderToStream(
    React.createElement(BulletinDocument, {
      resolved,
    }) as React.ReactElement<DocumentProps>,
  );

  const webStream = new ReadableStream({
    start(controller) {
      stream.on("data", (chunk: Buffer) =>
        controller.enqueue(new Uint8Array(chunk)),
      );
      stream.on("end", () => controller.close());
      stream.on("error", (err) => controller.error(err));
    },
  });

  return new NextResponse(webStream, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="bulletin-${stored.bulletin.date}.pdf"`,
      "Cache-Control": "no-store",
    },
  });
}
```

- [ ] **Step 4: Replace `src/app/bulletin/archive/page.tsx`**

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

export default async function BulletinArchivePage() {
  const bulletins = await listPublished();
  return (
    <main className="max-w-2xl mx-auto px-4 py-8">
      <header className="border-b border-gray-200 pb-4">
        <h1 className="text-3xl font-serif font-bold text-black">
          Bulletin Archive
        </h1>
        <p className="mt-2 text-sm text-gray-600 font-sans">
          Past bulletins, most recent first.
        </p>
      </header>
      {bulletins.length === 0 ? (
        <p className="mt-8 text-gray-600 font-sans">
          No bulletins published yet.
        </p>
      ) : (
        <ul className="mt-6 divide-y divide-gray-200">
          {bulletins.map((b) => {
            const slug = buildSlug(b.date, b.sermonTitle);
            return (
              <li key={b.date} className="py-4">
                <Link
                  href={`/bulletin/${slug}`}
                  className="block hover:text-slide-orange transition"
                >
                  <p className="text-xs font-sans uppercase tracking-widest text-slide-orange">
                    {formatBulletinDate(b.date)}
                  </p>
                  <p className="mt-1 font-serif font-bold text-black">
                    {b.sermonTitle}
                  </p>
                  <p className="text-sm italic text-gray-600 font-sans">
                    {b.scriptureReference}
                  </p>
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

- [ ] **Step 5: Run build + verify public routes still render**

```bash
pnpm build
```

Expected: build succeeds. All 4 bulletin routes present (`/bulletin`, `/bulletin/[slug]`, `/bulletin/[slug]/pdf`, `/bulletin/archive`).

```bash
lsof -ti:3000 | xargs kill 2>/dev/null; sleep 1
pnpm dev > /tmp/pcwc-dev.log 2>&1 &
sleep 4
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/bulletin
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/bulletin/2026-01-04-doing-good-is-from-god
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/bulletin/archive
curl -s -o /tmp/bulletin.pdf -w "%{http_code}\n" http://localhost:3000/bulletin/2026-01-04-doing-good-is-from-god/pdf
kill %1 2>/dev/null; wait 2>/dev/null
```

Expected: all four return `200`. `/tmp/bulletin.pdf` is a valid PDF (`file /tmp/bulletin.pdf` reports "PDF document").

- [ ] **Step 6: Commit tasks 6 + 7 together**

```bash
git add src/app/bulletin/_data/config.ts \
        src/app/bulletin/_data/bulletins.ts \
        src/app/bulletin/page.tsx \
        src/app/bulletin/[slug]/page.tsx \
        src/app/bulletin/[slug]/pdf/route.ts \
        src/app/bulletin/archive/page.tsx
git commit -m "refactor(bulletin): make data accessors async in preparation for supabase"
```

---

### Task 8: Add Supabase helpers

**Files:**
- Create: `src/lib/supabase/server.ts`
- Create: `src/lib/supabase/client.ts`

- [ ] **Step 1: Create `src/lib/supabase/server.ts`**

```typescript
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createSupabaseServerClient() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Called from a Server Component — cookies are read-only.
            // The session will refresh on the next response that can set
            // cookies (route handlers, server actions).
          }
        },
      },
    },
  );
}
```

- [ ] **Step 2: Create `src/lib/supabase/client.ts`**

```typescript
import { createBrowserClient } from "@supabase/ssr";

export function createSupabaseBrowserClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
```

- [ ] **Step 3: Verify build**

```bash
pnpm build
```

Expected: build succeeds (nothing imports these yet; they're just valid TypeScript).

- [ ] **Step 4: Commit**

```bash
git add src/lib/supabase/
git commit -m "feat(supabase): add server and browser client helpers"
```

---

### Task 9: SQL migration file + seed script

**Files:**
- Create: `supabase/migrations/001_initial.sql`
- Create: `scripts/seed.ts`
- Create: `.env.local.example`

- [ ] **Step 1: Create `supabase/migrations/001_initial.sql`**

```sql
-- Singleton: always exactly one row (id = 1), the live site-wide config.
create table bulletin_config (
  id smallint primary key default 1 check (id = 1),
  data jsonb not null,
  schema_version smallint not null default 1,
  updated_at timestamptz not null default now()
);

-- One row per bulletin, keyed by date.
create table bulletins (
  date date primary key,
  data jsonb not null,
  published_at timestamptz,
  schema_version smallint not null default 1,
  render_version smallint not null default 1,
  updated_at timestamptz not null default now()
);

create index bulletins_published_at_idx
  on bulletins(published_at)
  where published_at is not null;

-- Email-based admin allowlist; populated manually in Phase 2.
create table admin_allowlist (
  email text primary key
);

-- RLS: public reads; writes gated by allowlist (enforced in Phase 2).
alter table bulletin_config enable row level security;
alter table bulletins enable row level security;
alter table admin_allowlist enable row level security;

create policy "public can read config"
  on bulletin_config for select using (true);

create policy "public can read bulletins"
  on bulletins for select using (true);

-- Writes are blocked for anonymous users in Phase 1 (no write policies).
-- Phase 2 adds policies tied to admin_allowlist.
```

- [ ] **Step 2: Create `.env.local.example`**

```
# Supabase — create a project at https://supabase.com, then copy the
# URL and anon key from Project Settings → API.
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

- [ ] **Step 3: Create `scripts/seed.ts`**

```typescript
// Seeds Supabase with the current hardcoded bulletin + config data.
// Run with: pnpm tsx scripts/seed.ts
//
// Requires SUPABASE_SERVICE_ROLE_KEY in .env.local — the service role key
// bypasses RLS so we can insert without an authenticated user.

import { createClient } from "@supabase/supabase-js";
import { config as loadEnv } from "dotenv";
import path from "path";

loadEnv({ path: path.join(process.cwd(), ".env.local") });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local",
  );
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

const CONFIG = {
  church: {
    name: "Praise Church West Covina",
    address: "718 S Azusa Avenue, West Covina, CA, 91791",
    welcomeLine: "Welcome! We're glad you're here.",
  },
  missionStatement:
    "We treasure the glory of God to spread the glory of Christ empowered by the Spirit of God enabling us to hope in the Word of God.",
  worshipSteps: [
    {
      id: "worship-in-song",
      title: "Worship in Song",
      defaultAssignment: "Worship Team",
    },
    { id: "welcome", title: "Welcome", defaultAssignment: "Emil Cueto" },
    {
      id: "continuation-of-worship",
      title: "Continuation of Worship",
      defaultAssignment: "Worship Team",
    },
    {
      id: "scripture-reading",
      title: "Scripture Reading and Prayer",
      defaultAssignment: "Emil Cueto",
    },
    {
      id: "preaching",
      title: "Preaching of God's Word",
      defaultAssignment: "Joel Danganan",
    },
    {
      id: "lords-supper",
      title: "Ordinance of the Lord's Supper",
      defaultAssignment: "Elders",
    },
    {
      id: "worship-with-treasures",
      title: "Worship with our Treasures",
      defaultAssignment: "Deacons",
    },
    { id: "conclusion", title: "Conclusion", defaultAssignment: "Emil Cueto" },
  ],
  midweekMinistries: [
    {
      day: "Wednesday",
      meetings: [
        { name: "Prayer Meeting", location: "Virtual", time: "7:30 PM" },
      ],
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
  enums: {
    eventCategory: ["WOMEN", "MEN", "COUPLES", "YOUTH", "GENERAL"],
  },
};

const SAMPLE_BULLETIN = {
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
};

async function seed() {
  console.log("Seeding bulletin_config…");
  const { error: configErr } = await supabase
    .from("bulletin_config")
    .upsert({ id: 1, data: CONFIG, schema_version: 1 });
  if (configErr) {
    console.error("Config upsert failed:", configErr);
    process.exit(1);
  }

  console.log("Seeding bulletins…");
  const { error: bulletinErr } = await supabase.from("bulletins").upsert({
    date: SAMPLE_BULLETIN.date,
    data: {
      bulletin: SAMPLE_BULLETIN,
      configSnapshot: CONFIG,
    },
    published_at: SAMPLE_BULLETIN.publishedAt,
    schema_version: 1,
    render_version: 1,
  });
  if (bulletinErr) {
    console.error("Bulletin upsert failed:", bulletinErr);
    process.exit(1);
  }

  console.log("Seed complete.");
}

seed();
```

- [ ] **Step 4: Install `tsx` and `dotenv` for running the seed**

```bash
pnpm add -D tsx dotenv
```

- [ ] **Step 5: Add seed script to package.json**

Edit `package.json` — add to the `scripts` block:

```json
    "seed": "tsx scripts/seed.ts"
```

- [ ] **Step 6: Verify build**

```bash
pnpm build
```

Expected: build succeeds. Seed script is not referenced by any page.

- [ ] **Step 7: Commit**

```bash
git add supabase/migrations/001_initial.sql \
        scripts/seed.ts \
        .env.local.example \
        package.json \
        pnpm-lock.yaml
git commit -m "feat(supabase): add sql migration, seed script, and env template"
```

- [ ] **Step 8: USER ACTION — provision Supabase and run the migration**

**This step requires the user. Halt and prompt them to complete it before continuing.**

User does:

1. Go to https://supabase.com, create a free project (pick a region close to West Covina — `us-west-1`).
2. Wait ~2 minutes for provisioning.
3. In the project dashboard → SQL Editor → paste the contents of `supabase/migrations/001_initial.sql` → run.
4. In Project Settings → API, copy:
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon` `public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` `secret` key → `SUPABASE_SERVICE_ROLE_KEY`
5. Populate `.env.local` (copy from `.env.local.example` and fill in).

After completing, user confirms by running:
```bash
pnpm seed
```

Expected output: `Seeding bulletin_config… Seeding bulletins… Seed complete.`

Verify the rows exist in Supabase dashboard → Table Editor → `bulletin_config` (1 row) and `bulletins` (1 row).

---

### Task 10: Replace `_data/config.ts` with Supabase-backed implementation

**Files:**
- Modify: `src/app/bulletin/_data/config.ts`

- [ ] **Step 1: Replace the contents of `src/app/bulletin/_data/config.ts`**

```typescript
import { unstable_cache } from "next/cache";
import type { BulletinConfig } from "../types";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { BulletinConfigSchemaV1 } from "./schemas";

async function fetchConfig(): Promise<BulletinConfig> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("bulletin_config")
    .select("data, schema_version")
    .eq("id", 1)
    .single();

  if (error) {
    throw new Error(`Failed to load bulletin_config: ${error.message}`);
  }
  if (data.schema_version !== 1) {
    throw new Error(
      `bulletin_config has schema_version ${data.schema_version}; deploy newer code`,
    );
  }
  return BulletinConfigSchemaV1.parse(data.data);
}

export const getConfig = unstable_cache(fetchConfig, ["bulletin-config"], {
  tags: ["bulletins"],
});
```

- [ ] **Step 2: Verify build**

```bash
pnpm build
```

Expected: build succeeds. Public routes still work because bulletins.ts still uses the hardcoded array; config now comes from Supabase.

- [ ] **Step 3: Verify dev server**

```bash
lsof -ti:3000 | xargs kill 2>/dev/null; sleep 1
pnpm dev > /tmp/pcwc-dev.log 2>&1 &
sleep 4
curl -s http://localhost:3000/bulletin | grep -c "Praise Church West Covina"
kill %1 2>/dev/null; wait 2>/dev/null
```

Expected: grep count ≥ 1 (page rendered, config loaded from Supabase).

- [ ] **Step 4: Commit**

```bash
git add src/app/bulletin/_data/config.ts
git commit -m "feat(bulletin): load BulletinConfig from supabase"
```

---

### Task 11: Replace `_data/bulletins.ts` with Supabase-backed implementation

**Files:**
- Modify: `src/app/bulletin/_data/bulletins.ts`

- [ ] **Step 1: Replace the contents of `src/app/bulletin/_data/bulletins.ts`**

```typescript
import { unstable_cache } from "next/cache";
import type { BulletinSummary, StoredBulletin } from "../types";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { parseDateFromSlug } from "./slug";
import { StoredBulletinDataSchemaV1 } from "./schemas";

const CHURCH_TZ = "America/Los_Angeles";

function todayIso(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: CHURCH_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

type DbRow = {
  date: string;
  data: unknown;
  published_at: string | null;
  schema_version: number;
  render_version: number;
};

function parseRow(row: DbRow): StoredBulletin {
  if (row.schema_version !== 1) {
    throw new Error(
      `bulletin row ${row.date} has schema_version ${row.schema_version}; deploy newer code`,
    );
  }
  const parsed = StoredBulletinDataSchemaV1.parse(row.data);
  return {
    bulletin: parsed.bulletin,
    configSnapshot: parsed.configSnapshot,
    schemaVersion: row.schema_version,
    renderVersion: row.render_version,
    publishedAt: row.published_at,
  };
}

async function fetchPublishedSummaries(): Promise<BulletinSummary[]> {
  const today = todayIso();
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("bulletins")
    .select("date, data, published_at")
    .not("published_at", "is", null)
    .lte("date", today)
    .order("date", { ascending: false });

  if (error) throw new Error(`listPublished failed: ${error.message}`);
  return (data ?? []).map((row) => {
    const parsed = StoredBulletinDataSchemaV1.parse(row.data);
    return {
      date: row.date,
      sermonTitle: parsed.bulletin.sermon.title,
      scriptureReference: parsed.bulletin.sermon.scriptureReference,
      publishedAt: row.published_at,
    };
  });
}

async function fetchLatest(): Promise<StoredBulletin | null> {
  const today = todayIso();
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("bulletins")
    .select("date, data, published_at, schema_version, render_version")
    .not("published_at", "is", null)
    .lte("date", today)
    .order("date", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw new Error(`getLatest failed: ${error.message}`);
  return data ? parseRow(data as DbRow) : null;
}

async function fetchPublishedByDate(
  date: string,
): Promise<StoredBulletin | null> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("bulletins")
    .select("date, data, published_at, schema_version, render_version")
    .eq("date", date)
    .not("published_at", "is", null)
    .maybeSingle();

  if (error) throw new Error(`getPublishedByDate failed: ${error.message}`);
  return data ? parseRow(data as DbRow) : null;
}

export const listPublished = unstable_cache(
  fetchPublishedSummaries,
  ["bulletin-list-published"],
  { tags: ["bulletins"] },
);

export const getLatest = unstable_cache(fetchLatest, ["bulletin-latest"], {
  tags: ["bulletins"],
});

// Not cached — per-slug variance would blow up the cache key space.
// Single row reads are fast enough to hit Supabase directly.
export async function getPublishedByDate(
  date: string,
): Promise<StoredBulletin | null> {
  return fetchPublishedByDate(date);
}

export async function getPublishedBySlug(
  slug: string,
): Promise<StoredBulletin | null> {
  const date = parseDateFromSlug(slug);
  return date ? fetchPublishedByDate(date) : null;
}
```

- [ ] **Step 2: Verify build**

```bash
pnpm build
```

Expected: build succeeds. `/bulletin/[slug]` with prerendered slug `2026-01-04-doing-good-is-from-god` appears in output (pulled from Supabase during prerender).

- [ ] **Step 3: Verify all routes via dev server**

```bash
lsof -ti:3000 | xargs kill 2>/dev/null; sleep 1
pnpm dev > /tmp/pcwc-dev.log 2>&1 &
sleep 4
echo "=== /bulletin ==="
curl -s -o /tmp/b1.html -w "HTTP %{http_code}\n" http://localhost:3000/bulletin
grep -c "Doing Good Is From God" /tmp/b1.html

echo "=== /bulletin/[slug] ==="
curl -s -o /tmp/b2.html -w "HTTP %{http_code}\n" http://localhost:3000/bulletin/2026-01-04-doing-good-is-from-god
grep -c "Doing Good Is From God" /tmp/b2.html

echo "=== /bulletin/archive ==="
curl -s -o /tmp/b3.html -w "HTTP %{http_code}\n" http://localhost:3000/bulletin/archive
grep -c "Doing Good Is From God" /tmp/b3.html

echo "=== /bulletin/.../pdf ==="
curl -s -o /tmp/b.pdf -w "HTTP %{http_code}\n" http://localhost:3000/bulletin/2026-01-04-doing-good-is-from-god/pdf
file /tmp/b.pdf

echo "=== /bulletin/2099-12-31-nothing (should 404) ==="
curl -s -o /dev/null -w "HTTP %{http_code}\n" http://localhost:3000/bulletin/2099-12-31-nothing

kill %1 2>/dev/null; wait 2>/dev/null
```

Expected:
- All real routes return `HTTP 200`.
- Each grep returns ≥ 1 (content loaded from Supabase).
- PDF file reports "PDF document, version 1.3, 2 pages".
- Unknown slug returns `HTTP 404`.

- [ ] **Step 4: Commit**

```bash
git add src/app/bulletin/_data/bulletins.ts
git commit -m "feat(bulletin): load bulletins from supabase with zod validation"
```

---

### Task 12: Final verification + docs

**Files:**
- Modify: `package.json` (confirm `seed` script is present)
- Create: `docs/bulletin-admin-setup.md`

- [ ] **Step 1: Create setup doc**

`docs/bulletin-admin-setup.md`:

```markdown
# Bulletin Supabase Setup

The bulletin feature reads from a Supabase Postgres project. To run locally or provision a new environment:

## First-time setup

1. Create a Supabase project at https://supabase.com (free tier is sufficient).
2. Copy values from **Project Settings → API** into `.env.local` (use `.env.local.example` as a template):
   - `NEXT_PUBLIC_SUPABASE_URL` — Project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` — `anon` public key
   - `SUPABASE_SERVICE_ROLE_KEY` — `service_role` secret key (server-only, never commit)
3. Apply the SQL schema: open **SQL Editor** in Supabase, paste the contents of `supabase/migrations/001_initial.sql`, and run.
4. Seed initial data: `pnpm seed`. This writes the sample bulletin and the site-wide config.

## What's in the database

- `bulletin_config` — singleton row (id = 1) holding site-wide config (church info, worship steps, midweek schedule, enums).
- `bulletins` — one row per date; stores the full bulletin payload and (when published) a frozen snapshot of config.
- `admin_allowlist` — emails authorized to edit via the admin UI (Phase 2).

## When the data shape changes

- Additive, optional field: just add it to the Zod schema with `.optional()` or a default; existing rows will parse.
- Breaking change: bump `CURRENT_SCHEMA_VERSION` in `src/app/bulletin/_data/schemas.ts`, write a migration in `migrations.ts`, and run a SQL migration that rewrites existing rows.

## When the rendering changes

- Non-breaking tweak (spacing, colors, fonts, typos): just change code; archives re-render with the new look.
- Breaking change: bump `CURRENT_RENDER_VERSION`, copy current `_pdf/` and `_view/` to versioned folders (`_pdf/v1/`), update the dispatch in `_pdf/index.ts` and `_view/index.ts`, and stamp existing rows with the old version number.
```

- [ ] **Step 2: Clean build + full smoke test**

```bash
rm -rf .next
pnpm build
```

Expected output includes:
- `○ /bulletin` (Static)
- `● /bulletin/[slug]` with prerendered `2026-01-04-doing-good-is-from-god`
- `ƒ /bulletin/[slug]/pdf` (Dynamic)
- `○ /bulletin/archive`

Then:

```bash
lsof -ti:3000 | xargs kill 2>/dev/null; sleep 1
pnpm dev > /tmp/pcwc-dev.log 2>&1 &
sleep 4

# Golden path
curl -sI http://localhost:3000/bulletin | head -3
curl -sI http://localhost:3000/bulletin/2026-01-04-doing-good-is-from-god | head -3
curl -sI http://localhost:3000/bulletin/archive | head -3
curl -sI http://localhost:3000/bulletin/2026-01-04-doing-good-is-from-god/pdf | head -3

# 404 path
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/bulletin/2099-01-01-nothing

kill %1 2>/dev/null; wait 2>/dev/null
```

Expected: all valid routes return `200`; unknown slug returns `404`.

- [ ] **Step 3: Lint**

```bash
pnpm lint
```

Expected: only pre-existing warnings in `Navbar.tsx` and `page.tsx` (unrelated to bulletin work).

- [ ] **Step 4: Commit docs**

```bash
git add docs/bulletin-admin-setup.md
git commit -m "docs: add bulletin supabase setup guide"
```

---

## Phase 2 preview (separate plan, written after Phase 1 ships)

Phase 2 builds the admin UI on top of this data layer:

- Supabase Google OAuth + email allowlist + middleware gate on `/admin/*`
- Admin routes: `/admin/login`, `/admin/bulletins`, `/admin/bulletins/new`, `/admin/bulletins/[date]`, `/admin/config`
- Split-pane live preview (mobile + PDF) via React Hook Form + `@react-pdf/renderer`'s `PDFViewer`
- Server actions for upsert/publish/unpublish/re-snapshot/delete with `revalidatePath` + `revalidateTag("bulletins")`
- RLS policies extending the Phase 1 migration to gate writes on `admin_allowlist` membership
- Config edit page with enum list editor

Plan 2 will be drafted after Phase 1 is verified in production.
