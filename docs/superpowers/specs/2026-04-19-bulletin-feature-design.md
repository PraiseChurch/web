# Weekly Bulletin Feature — Design

**Date:** 2026-04-19
**Status:** Approved (pending spec review)
**Scope:** v1 — public-facing reader + PDF download, dummy data only

## Summary

Add a weekly bulletin feature to the Praise Church West Covina site. Admin users will eventually create a bulletin for any given date (not constrained to Sunday) and input per-week details. Two outputs: a printable PDF matching the existing folded-booklet layout, and a mobile-optimized web view for phone viewing via QR scan.

v1 focuses on the public-facing layer: TypeScript data model, data-driven mobile view, PDF generation, and routing. Admin UI, authentication, persistent storage, and calendar integration are explicitly deferred — the data-model contract becomes the stable interface, and storage/admin choices are made later once the real shape is validated.

## Goals

- Public users scan a (church-generated) QR code pointing to `/bulletin` and see the current week's bulletin on their phone.
- Direct links to specific past bulletins resolve via date-prefixed slug URLs.
- A printable PDF, matching the existing booklet format, downloads from each bulletin's page.
- Clean data model that any future storage backend (CMS, DB, git) can slot into without touching the view layer.

## Non-Goals (v1)

- Admin UI / authentication / authorization
- Persistent storage (DB, CMS, or git-based content)
- Live Google Calendar integration for `upcomingEvents`
- In-app QR code generation (handled externally)
- Brand-matched fonts and the logo/mountain illustration asset (placeholder in v1)
- Digital note-taking on mobile, share buttons, "add to calendar" on events
- Automated tests (no test harness currently in repo; separate task)

## Data Model

Three TypeScript types in `src/app/bulletin/types.ts`:

```typescript
// Site-wide configuration — single object, not per-bulletin.
// "Static but editable in config" bucket.
export type BulletinConfig = {
  church: {
    name: string;
    address: string;
    welcomeLine: string;
  };
  missionStatement: string;
  // Exactly 8 entries, order matters.
  worshipSteps: Array<{
    id: string;              // "welcome", "preaching", "lords-supper", ...
    title: string;           // "Welcome", "Preaching of God's Word"
    defaultAssignment: string; // default person/team, overridable per-bulletin
  }>;
  // Grouped by weekday. Static but editable.
  midweekMinistries: Array<{
    day: "Sunday" | "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday" | "Saturday";
    meetings: Array<{ name: string; location: string; time: string }>;
  }>;
};

// One bulletin per publish-date.
export type Bulletin = {
  date: string;              // "YYYY-MM-DD", ISO date, sortable
  sermon: {
    title: string;
    scriptureReference: string; // "3 John 1:9-11"
    scripturePassage: string;   // full passage text with {N} verse markers
    // No separate preacher field — the preacher IS the resolved assignment for the
    // worshipStep with id === "preaching". ResolvedBulletin.preacher surfaces it as a
    // convenience, always derived, never stored separately on Bulletin.
  };
  // Sparse map: only steps whose assignment differs from the config default.
  // Key = worshipStep.id.
  assignmentOverrides: Record<string, string>;
  // Highlights step 06 (Lord's Supper) in the print layout. Explicit so holidays/special
  // communion dates can diverge from the "first Sunday of month" convention.
  isCommunion: boolean;
  discovery: {
    mens: string;              // "Parlor"
    womens: string;            // "Sunday School Room"
  };
  // Shape anticipates future calendar integration. v1 uses dummy entries.
  // Category is extracted from "[WOMEN] Event Name" convention in event titles.
  upcomingEvents: Array<UpcomingEvent>;
  // null = draft; set to ISO timestamp when published.
  publishedAt: string | null;
};

export type UpcomingEvent = {
  category: string;  // "WOMEN", "MEN", "COUPLES", etc.
  date: string;      // "YYYY-MM-DD"
  title: string;     // "Women's Fellowship"
};

// Derived type used by view + PDF renderers. Flat shape with defaults already merged.
export type ResolvedBulletin = {
  date: string;
  church: BulletinConfig["church"];
  welcomeLine: string;
  missionStatement: string;
  isCommunion: boolean;
  worshipSteps: Array<{ id: string; title: string; assignment: string }>;
  // preacher is derived from the resolved assignment of the worshipStep whose id === "preaching".
  // Resolver asserts that step exists; it's part of the fixed 8-step config contract.
  sermon: Bulletin["sermon"] & { preacher: string };
  discovery: Bulletin["discovery"];
  upcomingEvents: UpcomingEvent[];
  midweekMinistries: BulletinConfig["midweekMinistries"];
};
```

**Key decisions:**

- `assignmentOverrides` is sparse — only stores what differs from config defaults, matching the "80% same" edit pattern. Resolver fills in defaults for absent keys.
- `isCommunion` is explicit, not auto-derived from date. Safer for edge cases; admin UI can default it to `true` for first-Sunday dates later.
- Slug is **derived**, not stored, from `date + slugify(sermon.title)`. Broken archive links from renamed titles are acceptable (user explicitly OK'd this).
- `ResolvedBulletin` is the single shape both renderers consume. Neither the mobile view nor the PDF component knows about the defaults/overrides split.

## Routes

All under Next.js App Router:

| Route | Purpose | Rendering |
|---|---|---|
| `/bulletin` | Latest published bulletin (most recent `publishedAt !== null && date <= today`) | SSG |
| `/bulletin/[slug]` | Specific bulletin; `[slug]` is `YYYY-MM-DD-anything`. Parse date prefix, ignore suffix | SSG via `generateStaticParams` |
| `/bulletin/[slug]/pdf` | Streams PDF. Route handler (`route.ts`) returns `Content-Type: application/pdf` | Dynamic |
| `/bulletin/archive` | Reverse-chronological list of published bulletins | SSG |

**Slug resolution.** URL format `YYYY-MM-DD-kebab-sermon-title`. Route handler extracts the `YYYY-MM-DD` prefix via regex, looks up by date, ignores the slug suffix. A URL with a stale sermon-title slug still resolves to the current bulletin for that date — friendly for old links.

**"Latest" resolution.** Filter `publishedAt !== null && date <= today`, sort by `date` desc, take first. Drafts (`publishedAt === null`) never surface.

## Data Flow

Dummy data + small accessor module. Same API that a real backend later will implement.

```
src/app/bulletin/_data/
  config.ts      // getConfig(): BulletinConfig
  bulletins.ts   // getLatest(), getByDate(date), listBulletins()
  resolve.ts     // resolveBulletin(bulletin, config): ResolvedBulletin
  events.ts      // parseCategory("[WOMEN] Foo") → {category, title},
                 // filterEventsWithinDays(events, date, days)
```

**One resolver, two renderers.** Both the mobile `BulletinView` and the PDF `BulletinDocument` consume `ResolvedBulletin`. This keeps the defaults-merging logic in exactly one place.

## PDF Generation (`@react-pdf/renderer`)

**Page dimensions.** Letter landscape (11" × 8.5"). Two pages, duplex-printed, folded vertically → 5.5" × 8.5" booklet (standard church bulletin size).

**Component tree:**

```
src/app/bulletin/_pdf/
  BulletinDocument.tsx      // <Document> root
  PageOne.tsx               // header + left column (order/mission/discovery/events) + right column (sermon + notes)
  PageTwo.tsx               // header + midweek + logo
  components/
    Header.tsx              // date | welcome line + address
    OrderOfWorship.tsx      // 4×2 numbered grid; highlights communion step
    MissionStatement.tsx
    Discovery.tsx
    UpcomingEvents.tsx
    SermonSection.tsx       // title + scripture ref + passage with verse superscripts
    NotesLines.tsx          // ruled blank lines (print-only)
    MidweekMinistries.tsx
    Logo.tsx                // placeholder in v1
  styles.ts                 // StyleSheet.create() — shared typography, colors, spacing
```

**Fonts.** v1 uses `@react-pdf/renderer`'s default Helvetica. When brand fonts are ready (Merriweather + Inter from the existing site), register via `Font.register()` from self-hosted `.ttf` files in `public/fonts/`. Runtime CDN fetches are too slow/fragile for PDF generation.

**Communion highlight.** `isCommunion: true` → step 06 (`id: "lords-supper"`) renders with the brand orange background + white text. `false` → renders identically to the other seven steps. No structural difference in the layout.

**Scripture passage verse markers.** Input format: `{9} I wrote something to the church... {10} Because of this, I will remind him...`. Parser splits on `{N}` and renders N as a superscript span, remainder as body text. Parser lives in `_data/scripture.ts` (or inline helper in `SermonSection.tsx` if it stays small).

**Logo asset.** Placeholder in v1 — either an empty `<View>` with a TODO comment or a simple text "Praise Church West Covina" glyph. Replace with the real PNG/SVG seal later.

**Download flow.** `/bulletin/[slug]/pdf` route handler calls `renderToStream(<BulletinDocument resolved={...} />)` and pipes the result as the response body with `Content-Disposition: attachment; filename="bulletin-YYYY-MM-DD.pdf"`.

## Mobile View

Single scrollable column at `/bulletin` and `/bulletin/[slug]`. Tailwind + the existing `Typography` primitives for consistency with the rest of the site.

**Section order (sermon-first):**

1. **Header** — date, welcome line, church name + address
2. **Sermon** — title, scripture reference, passage with verse superscripts. Larger/comfortable reading typography; this is the primary "follow along" content during service.
3. **Order of Worship** — vertical list (not grid). Number badge + title + assignment per step. Communion step gets accent treatment when `isCommunion`.
4. **Discovery + Upcoming Events** — stacked. Events sorted by date ascending.
5. **Midweek Ministries** — grouped by day.
6. **Mission Statement** — small footer treatment.
7. **"Download printable PDF"** — link to `/bulletin/[slug]/pdf`.

**Dropped from mobile:** the notes ruled lines (useless on phone) and the page-2 logo/mountain illustration (print decoration).

**Component tree:**

```
src/app/bulletin/_view/
  BulletinView.tsx          // top-level orchestrator
  sections/
    ViewHeader.tsx
    ViewSermon.tsx
    ViewOrderOfWorship.tsx
    ViewDiscovery.tsx
    ViewUpcomingEvents.tsx
    ViewMidweekMinistries.tsx
    ViewMissionFooter.tsx
    DownloadPdfLink.tsx
```

## File Structure Summary

```
src/app/bulletin/
  page.tsx                        // /bulletin (latest)
  [slug]/
    page.tsx                      // /bulletin/[slug]
    pdf/route.ts                  // /bulletin/[slug]/pdf
  archive/page.tsx                // /bulletin/archive
  types.ts
  _data/
    config.ts
    bulletins.ts
    resolve.ts
    events.ts
  _view/
    BulletinView.tsx
    sections/
  _pdf/
    BulletinDocument.tsx
    PageOne.tsx
    PageTwo.tsx
    styles.ts
    components/
```

Underscore-prefixed folders (`_data`, `_view`, `_pdf`) are [App Router private folders](https://nextjs.org/docs/app/building-your-application/routing/colocation#private-folders) — not treated as routes.

## Dependencies

**New:** `@react-pdf/renderer`.
**Dev deps:** none.

## Verification Approach

No automated tests in v1 (no test harness in repo). Manual verification:

- `pnpm build` succeeds; all four routes statically generate.
- Click through `/bulletin`, `/bulletin/[slug]`, `/bulletin/archive` in dev.
- Download PDF from a bulletin page; open in a PDF reader; verify landscape 2-page layout matches the reference.
- Open `/bulletin` on a phone (via dev server on LAN or Vercel preview); verify mobile section order and readability.
- Toggle `isCommunion` on the dummy bulletin; verify highlight appears/disappears in both mobile view and PDF.
- Confirm per-step overrides merge correctly: set `assignmentOverrides` for some steps, leave others absent; verify resolver uses override where present and default where absent.

## Open Questions / Future Work

- **Brand fonts + logo asset** — waiting on source files.
- **Admin UI + storage** — revisit once the dummy-data build lands and the data model is validated.
- **Calendar integration** — Google Calendar API or iCal feed, with `[CATEGORY]` title-prefix convention. Requires deciding auth model (API key vs. public iCal).
- **QR code** — generated externally by admin, pointing to `/bulletin`. Nothing to build in-app.
- **Digital notes, share, add-to-calendar** — nice-to-haves flagged for future iteration.
