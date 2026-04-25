# Bulletin Admin UI + Supabase Backend — Design

**Date:** 2026-04-22
**Status:** Approved (pending spec review)
**Scope:** v1 — replace hardcoded bulletin data with Supabase-backed storage, add authenticated admin UI for creating/editing bulletins and site config

## Summary

The existing public bulletin feature (reader + PDF) runs against hardcoded arrays in `_data/bulletins.ts` and `_data/config.ts`. This feature swaps that storage layer for Supabase Postgres and adds a Next.js admin UI with live preview so non-technical church staff can author bulletins without touching code.

The public reader, PDF generator, routes, and view/PDF components stay untouched. The change is confined to the data accessor layer (implementation-only; signatures become async) plus new admin routes under `/admin/*`.

## Goals

- Non-technical admin can log in with Google, create/edit a bulletin for any date, preview it live (mobile + PDF), and publish it
- Published bulletins freeze their config snapshot so later config changes don't retroactively alter them
- Layout-code changes apply retroactively by default; versioned rendering components provide a manual override for breaking changes
- Evolving the data shape is supported via Zod schemas and a migration scaffold
- No visible change to the public `/bulletin*` surface; same URLs render from Supabase instead of hardcoded data

## Non-Goals (v1)

- Role-based access control (single admin role; everyone in the allowlist has full access)
- Sending an invite email when adding an admin (inviter does the human handoff)
- Audit log / revision history
- Autosave (explicit Save button)
- HTML snapshots for mobile-view archive fidelity (PDF is handled via versioned components)
- Calendar integration (upcomingEvents stay inline per-bulletin)
- Image/asset uploads
- Role/permission granularity in the admin form (e.g., editor vs viewer)

## Data Model Changes

### New types

```typescript
// Extension of existing BulletinConfig
export type BulletinConfigEnums = {
  // Key names match the field each enum validates.
  // BulletinConfigEnums.eventCategory validates UpcomingEvent.category.
  eventCategory: string[];
};

export type BulletinConfig = {
  church: { name: string; address: string; welcomeLine: string };
  missionStatement: string;
  worshipSteps: WorshipStepConfig[];
  midweekMinistries: MidweekDay[];
  enums: BulletinConfigEnums;        // NEW
};

// Storage-layer type. Wraps the existing Bulletin with snapshot metadata.
export type StoredBulletin = {
  bulletin: Bulletin;                // existing shape, unchanged
  configSnapshot?: BulletinConfig;   // frozen at publish time; absent on drafts
  schemaVersion: number;             // data-shape version
  renderVersion: number;             // rendering-components version
  publishedAt: string | null;
};

// Lightweight summary for list views (doesn't pull full JSONB).
export type BulletinSummary = {
  date: string;
  sermonTitle: string;
  scriptureReference: string;
  publishedAt: string | null;
};
```

### Supabase schema

```sql
-- Singleton: always exactly one row; the live site-wide config.
create table bulletin_config (
  id smallint primary key default 1 check (id = 1),
  data jsonb not null,
  schema_version smallint not null default 1,
  updated_at timestamptz not null default now()
);

-- One row per bulletin, keyed by date.
create table bulletins (
  date date primary key,
  -- JSONB shape: { bulletin: Bulletin, configSnapshot?: BulletinConfig }
  data jsonb not null,
  published_at timestamptz,
  schema_version smallint not null default 1,
  render_version smallint not null default 1,
  updated_at timestamptz not null default now()
);

create index bulletins_published_at_idx
  on bulletins(published_at)
  where published_at is not null;

-- Email-based admin allowlist. Managed via Supabase dashboard.
create table admin_allowlist (
  email text primary key
);
```

### Why merged JSONB (`data`) instead of separate columns

- Same lifecycle clarity — `data.configSnapshot IS NULL` reads cleanly as "draft"
- Single atomic write
- Maps to a single TypeScript type (`StoredBulletin`)
- Nested-path queries in Postgres work fine for migrations when needed

### Versioning strategy

Two integers on each row:

- `schema_version` — the shape of the JSONB blob. Bump when types change breakingly; write a migration in `_data/migrations.ts` that transforms old rows forward.
- `render_version` — the rendering components that should display this bulletin. Bump when `_pdf/` or `_view/` changes breakingly; copy current components to `_pdf_v{N}/` / `_view_v{N}/`, evolve the originals, stamp existing rows with the old version.

Both default to 1. 99% of changes are additive/stylistic and don't require a version bump — they flow to archives automatically.

### Enums

Enum-style values have three patterns:

1. **Closed in code** (e.g., `Weekday`) — `z.enum([...])` on read/write. Breaking changes trigger `schema_version` bump.
2. **Config-driven** (e.g., `upcomingEvent.category`) — value list lives in `BulletinConfig.enums.<fieldName>`. Admin form is a dropdown populated from config. Dynamic Zod validation at save time.
3. **Free-form strings** (e.g., assignment names) — no validation beyond non-empty.

The `enums` key on `BulletinConfig` is a typed bag. Each field name matches the bulletin field it validates: `enums.eventCategory` validates `upcomingEvent.category`. Adding a new config-driven enum is one field addition to `BulletinConfigEnums`.

## Authentication

**Google OAuth via Supabase Auth.**

Sign-in flow:
1. User visits `/admin` (or any `/admin/*` page without session)
2. Middleware redirects to `/admin/login?next=<original>`
3. User clicks "Sign in with Google" → Supabase OAuth redirect
4. Callback sets session cookie; redirect to `next` URL

Session: Supabase default (1-hour access token, 30-day refresh token). Handled by `@supabase/ssr`.

### Access control

Single admin role, enforced by an email allowlist with two layers of protection.

**Layer 1: Before User Created hook (prevents unauthorized account creation).**

A Postgres function rejects OAuth signups whose email isn't in `admin_allowlist`. Configured as the "Before User Created" auth hook in the Supabase dashboard. Without this, every random Google account that hits `/admin/login` would accumulate a row in `auth.users`.

```sql
create function check_user_allowlist(event jsonb)
returns jsonb
language plpgsql
security definer
as $$
declare
  user_email text;
  allowed boolean;
begin
  user_email := lower(event->'claims'->>'email');
  select exists(select 1 from admin_allowlist where lower(email) = user_email)
    into allowed;
  if not allowed then
    return jsonb_build_object(
      'decision', 'reject',
      'message', 'This email is not authorized.'
    );
  end if;
  return jsonb_build_object('decision', 'continue');
end;
$$;
```

The `/admin/login` callback handles the rejection error and shows a friendly "Ask the pastor for access" page.

**Layer 2: RLS policies (defense in depth on writes).**

```sql
-- Admin mutations: only rows whose user email is in admin_allowlist
create policy "allowlisted users can write bulletins"
  on bulletins for all
  using (lower(auth.jwt() ->> 'email') in (select lower(email) from admin_allowlist))
  with check (lower(auth.jwt() ->> 'email') in (select lower(email) from admin_allowlist));

create policy "allowlisted users can write config"
  on bulletin_config for all
  using (lower(auth.jwt() ->> 'email') in (select lower(email) from admin_allowlist))
  with check (lower(auth.jwt() ->> 'email') in (select lower(email) from admin_allowlist));

create policy "allowlisted users manage admin allowlist"
  on admin_allowlist for all
  using (lower(auth.jwt() ->> 'email') in (select lower(email) from admin_allowlist))
  with check (lower(auth.jwt() ->> 'email') in (select lower(email) from admin_allowlist));

-- Public reads on bulletins + config (public routes). App filters drafts.
create policy "public can read bulletins"
  on bulletins for select
  using (true);

create policy "public can read config"
  on bulletin_config for select
  using (true);
```

All comparisons are lowercased to avoid case-sensitivity bugs (`Pastor@example.com` should match `pastor@example.com`).

**Bootstrap.** The first admin email is added manually via Supabase SQL editor:
```sql
insert into admin_allowlist (email) values ('your-email@example.com');
```
After that, admins manage the allowlist through the in-app `/admin/users` page.

### Middleware gate

```typescript
// src/middleware.ts
export const config = { matcher: ["/admin/:path*"] };
```

Checks Supabase session cookie on every `/admin/*` request (except `/admin/login`). Missing/expired → redirect to login with `next` param.

## Routes

### Public (unchanged)

| Route | Rendering |
|---|---|
| `/bulletin` | Static/ISR |
| `/bulletin/[slug]` | Static/ISR via `generateStaticParams` |
| `/bulletin/[slug]/pdf` | Dynamic, streams PDF |
| `/bulletin/archive` | Static/ISR |

### Admin (new)

| Route | Purpose |
|---|---|
| `/admin/login` | Google sign-in button; handles the hook-rejection error with a friendly "ask for access" page |
| `/admin` | Redirects to `/admin/bulletins` |
| `/admin/bulletins` | List all bulletins (drafts + published), reverse-chronological |
| `/admin/bulletins/new` | Create new bulletin |
| `/admin/bulletins/[date]` | Edit existing bulletin |
| `/admin/config` | Edit site-wide config (singleton) |
| `/admin/users` | Manage admin allowlist — add/remove emails |

## File Structure

```
src/
  middleware.ts                       // session gate for /admin/*
  app/
    admin/
      layout.tsx                      // shared chrome (header, logout, nav links)
      login/page.tsx                  // Google sign-in UI
      bulletins/
        page.tsx                      // list
        new/page.tsx                  // create form
        [date]/page.tsx               // edit form
      config/page.tsx                 // config editor
      users/page.tsx                  // manage admin allowlist
      _components/
        AdminShell.tsx                // header + nav
        BulletinForm.tsx              // the form half of the split pane
        BulletinPreview.tsx           // wraps live BulletinView + PDFViewer with mobile/PDF toggle
        ConfigForm.tsx
        WorshipStepOverrideRow.tsx
        UpcomingEventRow.tsx
        EnumListEditor.tsx            // generic add/remove/reorder for config.enums.*
        AdminAllowlistTable.tsx       // /admin/users — table + add/remove form
        DirtyIndicator.tsx
      _actions/
        bulletins.ts                  // upsert, publish, unpublish, reSnapshot, delete
        config.ts                     // updateConfig
        users.ts                      // addAdmin, removeAdmin
        auth.ts                       // signOut
    bulletin/                         // existing public routes, unchanged
      _data/
        types.ts                      // adds StoredBulletin, BulletinSummary
        schemas.ts                    // NEW — Zod per schema_version
        migrations.ts                 // NEW — v1 → v2 transforms scaffold
        config.ts                     // NOW ASYNC — getConfig, updateConfig
        bulletins.ts                  // NOW ASYNC — see accessor API below
        resolve.ts                    // signature accepts liveConfig fallback
        events.ts, slug.ts, scripture.ts  // unchanged
      _view/                          // unchanged
      _pdf/                           // unchanged
  lib/
    supabase/
      server.ts                       // createServerClient (session cookie)
      client.ts                       // createBrowserClient
      auth.ts                         // requireAdmin helper
```

## Accessor API

All functions become async. Views + routes `await` them.

**Read (public path — filters drafts):**
- `getLatest(): Promise<StoredBulletin | null>`
- `getPublishedByDate(date): Promise<StoredBulletin | null>`
- `getPublishedBySlug(slug): Promise<StoredBulletin | null>`
- `listPublished(): Promise<BulletinSummary[]>`

**Read (admin path — includes drafts):**
- `adminGetByDate(date): Promise<StoredBulletin | null>`
- `adminListAll(): Promise<BulletinSummary[]>`

**Mutations (admin only, called from server actions):**
- `upsertBulletin(date: string, bulletin: Bulletin): Promise<void>`
- `publishBulletin(date): Promise<void>` — freezes `configSnapshot` = current `getConfig()`, sets `published_at`
- `unpublishBulletin(date): Promise<void>` — clears snapshot + published_at
- `reSnapshotConfig(date): Promise<void>` — overwrites snapshot on a published row with current live config
- `deleteBulletin(date): Promise<void>`

**Config:**
- `getConfig(): Promise<BulletinConfig>`
- `updateConfig(config: BulletinConfig): Promise<void>`

### Resolver change

```typescript
// Takes a StoredBulletin and a live-config fallback for drafts.
// Published bulletins resolve against their configSnapshot.
export function resolveBulletin(
  stored: StoredBulletin,
  liveConfig: BulletinConfig,
): ResolvedBulletin {
  const config = stored.configSnapshot ?? liveConfig;
  // existing merge logic, unchanged
}
```

A helper wraps the common pattern:

```typescript
// _data/resolve.ts
export async function resolveStoredBulletin(stored: StoredBulletin): Promise<ResolvedBulletin> {
  if (stored.configSnapshot) {
    return resolveBulletin(stored, stored.configSnapshot);
  }
  const liveConfig = await getConfig();
  return resolveBulletin(stored, liveConfig);
}
```

Consumers:

```typescript
const stored = await getPublishedBySlug(slug);
if (!stored) notFound();
const resolved = await resolveStoredBulletin(stored);
```

Admin previews use the same helper against their form's in-memory bulletin state.

### Render-version dispatch

```typescript
// _pdf/index.ts
import { BulletinDocument as V1Current } from "./BulletinDocument";
// import { BulletinDocument as V0 } from "./v0/BulletinDocument"; // uncomment on breaking change

export function getBulletinDocument(version: number) {
  switch (version) {
    // case 0: return V0;
    default: return V1Current;
  }
}
```

Same pattern for `_view/index.ts`. Route handlers pick the component by `stored.renderVersion`.

## Zod Schemas

```typescript
// _data/schemas.ts
export const BulletinSchemaV1 = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  sermon: z.object({
    title: z.string(),
    scriptureReference: z.string(),
    scripturePassage: z.string(),
  }),
  assignmentOverrides: z.record(z.string(), z.string()),
  isCommunion: z.boolean(),
  discovery: z.object({ mens: z.string(), womens: z.string() }),
  upcomingEvents: z.array(z.object({
    category: z.string(),
    date: z.string(),
    title: z.string(),
  })),
  publishedAt: z.string().nullable(),
});

export const BulletinConfigSchemaV1 = z.object({
  church: z.object({ name: z.string(), address: z.string(), welcomeLine: z.string() }),
  missionStatement: z.string(),
  worshipSteps: z.array(z.object({ id: z.string(), title: z.string(), defaultAssignment: z.string() })),
  midweekMinistries: z.array(z.object({
    day: z.enum(["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"]),
    meetings: z.array(z.object({ name: z.string(), location: z.string(), time: z.string() })),
  })),
  enums: z.object({
    eventCategory: z.array(z.string()),
  }),
});
```

Read path validates by `schema_version`. Write path always writes the current version's shape.

## Admin UX

### Form library

React Hook Form + `@hookform/resolvers/zod`. The Zod schemas from `_data/schemas.ts` are reused client-side for form validation — single source of truth for shape.

### Bulletin edit page layout (desktop ≥1024px)

Split pane, 50/50:

- **Left (form, scrollable):** date, sermon (title, reference, passage textarea), worship step overrides (8 rows — each shows default + ✎ button to override), communion checkbox, discovery (men's + women's location inputs), upcoming events (repeatable rows with category dropdown + date + title + remove button; add button below), save/publish/delete actions at bottom.
- **Right (preview):** tabs "Mobile" / "PDF". Renders either `<BulletinView resolved={...} />` or `<PDFViewer><BulletinDocument resolved={...} /></PDFViewer>`. Both fed by current form state via `useWatch()`.

The preview resolver pulls live config for drafts; for published bulletins it uses the record's `configSnapshot`.

Below 1024px the pane stacks vertically with a "Show preview" toggle defaulting to hidden.

### Actions on the edit page

| Button | Visible | Behavior |
|---|---|---|
| Save draft | always | `upsertBulletin` server action. Save-in-place semantics — drafts stay drafts; published stay published. |
| Publish | drafts only | `publishBulletin`: freeze `configSnapshot = getConfig()`, set `published_at = now()`, revalidate. |
| Unpublish | published only | `unpublishBulletin`: clear snapshot + timestamp, revalidate. |
| Re-snapshot | published only | `reSnapshotConfig`: overwrite existing snapshot with current live config, revalidate. |
| Delete | always | Confirm dialog; `deleteBulletin`. Warning if published (URL will 404). |

### Dirty state

`useFormState().isDirty` drives an "Unsaved changes" badge plus a `beforeunload` handler.

### Config page

Single-form edit of the singleton. Sections:

- Church info (3 fields)
- Mission statement (textarea)
- Worship steps (drag-to-reorder table of 8 rows: id, title, defaultAssignment)
- Midweek ministries (per-day sections, each with a list of meetings)
- Enums
  - Event category (string list with add/remove/reorder; rendered by generic `EnumListEditor` component)

One [Save] at the bottom. Config is always live — no publish state. Saving calls `updateConfig` + `revalidateTag("bulletins")` so draft previews pick up changes; published bulletins remain frozen.

### List page

Table: date | sermon title | status (Draft/Published) | updated time. Click row → edit page. "New bulletin" top-right prompts for a date and navigates to `/admin/bulletins/new?date=YYYY-MM-DD`.

### Users page (`/admin/users`)

Table of current admins (one row per email in `admin_allowlist`) with a "Remove" button per row. Below the table: an email input and an "Add admin" button.

**Add admin** — calls the `addAdmin(email)` server action which lowercases + trims the email, validates basic shape with Zod (`z.string().email()`), inserts into `admin_allowlist`, and revalidates the page. The added person can immediately sign in via Google OAuth (the `before_user_created` hook now allows them). The action is "add admin," not "invite admin" — no email is sent; the human inviter handles the handoff.

**Remove admin** — calls the `removeAdmin(email)` server action with two safety checks:
1. **Self-removal blocked.** If `email === currentUser.email`, the action throws "Cannot remove yourself" and the UI disables the Remove button on the current user's row.
2. **Last-admin blocked.** If removal would leave zero rows in `admin_allowlist`, the action throws "At least one admin must remain."

If you really need to nuke yourself, do it through the Supabase SQL editor.

**Existing sessions** for a removed admin remain valid until their access token expires (Supabase default 1 hour). For instant revocation, also revoke their session via Supabase dashboard. Documented in the setup guide.

## Publish / Revalidation Flow

Every mutation in `_actions/` calls, after the Supabase write:

```typescript
revalidateTag("bulletins");
revalidatePath("/bulletin");
revalidatePath(`/bulletin/${slug}`);
revalidatePath("/bulletin/archive");
```

Public reads are wrapped in `unstable_cache` with tag `bulletins` so the tag-based invalidation is sufficient. The explicit `revalidatePath` calls also flush statically generated pages.

Config mutations revalidate the same tags/paths — config affects every draft's rendered output.

Admin reads don't use the cache (fresh every request).

## Migration (one-time, local)

1. Create Supabase project; copy URL + anon key + service-role key into `.env.local`.
2. Apply SQL migration (`db/migrations/001_initial.sql`) — creates three tables + RLS policies.
3. Seed script (`scripts/seed.ts`):
   - Reads current `_data/config.ts` hardcoded object → inserts into `bulletin_config`
   - Reads current `_data/bulletins.ts` hardcoded array → inserts each row into `bulletins`, treating them as already published (publish_at populated, configSnapshot filled from config)
   - Adds the sample bulletin dated 2026-01-04
4. Insert admin email(s) into `admin_allowlist` via Supabase SQL editor.
5. Replace the accessor implementations in `_data/config.ts` and `_data/bulletins.ts` with Supabase queries. All consumers `await` them.
6. Smoke-test public routes render identically to before.
7. Build admin routes on top.

Steps 1–6 ship as a pre-feature refactor; nothing visible changes to site visitors. Step 7 is the admin feature.

## Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL=https://<project>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...              # server-only, for seed script & admin ops if needed
```

Committed to Vercel + `.env.local`. Never to git.

## Dependencies Added

- `@supabase/supabase-js`
- `@supabase/ssr`
- `react-hook-form`
- `@hookform/resolvers`
- `zod`

## Verification Approach

No automated tests (no harness in repo). Manual smoke checks:

- Sign-in flow end-to-end (Google OAuth → `/admin/bulletins` loads)
- Non-allowlisted user can sign in but all writes fail with RLS error
- Public `/bulletin*` routes render identically before and after the Supabase migration
- Edit-page preview re-renders on keystrokes (both mobile and PDF tabs)
- Publish freezes configSnapshot; edit config after publish and verify public bulletin is unchanged
- Re-snapshot pulls in new config values
- Unpublish returns bulletin to draft; removes from public `/bulletin`
- Delete removes from admin list and public archive
- Middleware redirects unauthenticated requests to `/admin/login`

## Open Questions / Future Work

- **Mobile-view archive fidelity** — layout-code changes affect archived bulletins on mobile. Acceptable for v1; revisit if users complain.
- **Revision history** — no record of what changed or when beyond `updated_at`. Add a revisions table later if needed.
- **Role-based access** — all allowlisted users have full edit. If we add editors who shouldn't touch config, add a role column.
- **Calendar integration** — upcomingEvents still inline. Still deferred.
- **Asset uploads** — if sermons ever need images, add Supabase Storage for those.
- **Preview with old config** — currently no way to preview a draft against a pre-edit config snapshot. Add a "preview in snapshot mode" toggle if it becomes useful.
