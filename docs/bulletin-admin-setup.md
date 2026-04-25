# Bulletin Supabase Setup

The bulletin feature reads from a Supabase Postgres project. To run locally or provision a new environment:

## First-time setup

1. Create a Supabase project at https://supabase.com (free tier is sufficient).
2. Apply the SQL schema using the Supabase CLI:

   ```bash
   pnpm supabase login
   pnpm supabase link --project-ref <your-project-ref>
   pnpm supabase db push
   ```

   This applies `supabase/migrations/001_initial.sql` to the linked project.

3. Copy values from **Project Settings → API** into `.env.local` (use `.env.local.example` as a template):

   - `NEXT_PUBLIC_SUPABASE_URL` — Project URL
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` — `sb_publishable_...` (safe to expose in browser)
   - `SUPABASE_SECRET_KEY` — `sb_secret_...` (server-only, never commit)

4. Seed initial data: `pnpm seed`. This writes the sample bulletin and the site-wide config.

## What's in the database

- `bulletin_config` — singleton row (id = 1) holding site-wide config (church info, worship steps, midweek schedule, enums).
- `bulletins` — one row per date; stores the full bulletin payload and (when published) a frozen snapshot of config.
- `admin_allowlist` — emails authorized to edit via the admin UI (Phase 2; not yet wired up).

## Supabase clients

Three helpers in `src/lib/supabase/`:

- `public.ts` — `createSupabasePublicClient()`: cookie-free, used by cached public reads (`unstable_cache`-safe).
- `server.ts` — `createSupabaseServerClient()`: cookie-aware SSR client for authenticated routes (Phase 2 admin UI).
- `client.ts` — `createSupabaseBrowserClient()`: browser-side client.

## When the data shape changes

- Additive, optional field: just add it to the Zod schema with `.optional()` or a default; existing rows will parse.
- Breaking change: bump `CURRENT_SCHEMA_VERSION` in `src/app/bulletin/_data/schemas.ts`, write a migration in `migrations.ts`, and run a SQL migration that rewrites existing rows.

## When the rendering changes

- Non-breaking tweak (spacing, colors, fonts, typos): just change code; archives re-render with the new look.
- Breaking change: bump `CURRENT_RENDER_VERSION`, copy current `_pdf/` and `_view/` to versioned folders (`_pdf/v1/`), update the dispatch in `_pdf/index.ts` and `_view/index.ts`, and stamp existing rows with the old version number.
