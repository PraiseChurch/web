# Bulletin Admin Setup

The bulletin feature reads from a Supabase Postgres project. Phase 2 adds an authenticated admin UI gated by Google OAuth + an email allowlist.

## First-time setup

### 1. Create the Supabase project

Create a free project at https://supabase.com.

### 2. Apply the SQL migrations

```bash
pnpm supabase login
pnpm supabase link --project-ref <your-project-ref>
pnpm supabase db push
```

This applies both `001_initial.sql` and `002_admin_access.sql`.

### 3. Configure Google OAuth

1. At https://console.cloud.google.com/apis/credentials, create an OAuth 2.0 Client ID (type: Web application).
2. Add the Supabase callback URL as an authorized redirect URI: copy it from Supabase dashboard → Authentication → Providers → Google.
3. In Supabase dashboard → Authentication → Providers → Google, paste the Google Client ID + Secret and toggle the provider on.
4. In Supabase dashboard → Authentication → URL Configuration, add `http://localhost:3000` and your production URL to "Site URL" and "Redirect URLs."

### 4. Register the Before User Created hook

In Supabase dashboard → Authentication → Hooks → "Before User Created":
- Toggle on
- Hook type: Postgres
- Function: `public.check_user_allowlist`
- Save

### 5. Bootstrap the first admin

In Supabase SQL Editor:

```sql
INSERT INTO admin_allowlist (email) VALUES ('your-email@example.com');
```

After this, you can sign in. Add additional admins via `/admin/users`.

### 6. Populate `.env.local`

Copy `.env.local.example` to `.env.local` and fill in:

- `NEXT_PUBLIC_SUPABASE_URL` — Project URL
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` — `sb_publishable_...` (safe to expose in browser)
- `SUPABASE_SECRET_KEY` — `sb_secret_...` (server-only, never commit)

### 7. Seed initial bulletin data

```bash
pnpm seed
```

## What's in the database

- `bulletin_config` — singleton row holding site-wide config.
- `bulletins` — one row per date.
- `admin_allowlist` — emails authorized to access the admin UI.

## Admin routes

- `/admin/login` — Google sign-in
- `/admin/bulletins` — list, edit, create bulletins
- `/admin/config` — site-wide config
- `/admin/users` — manage admin allowlist

## Supabase clients

- `src/lib/supabase/public.ts` — `createSupabasePublicClient()`: cookie-free, used by cached public reads.
- `src/lib/supabase/server.ts` — `createSupabaseServerClient()`: cookie-aware SSR client for authenticated routes.
- `src/lib/supabase/middleware.ts` — `updateSession()`: session refresh helper called from `src/middleware.ts`.
- `src/lib/supabase/client.ts` — `createSupabaseBrowserClient()`: browser client for OAuth sign-in.
- `src/lib/supabase/auth.ts` — `requireAdmin()` / `getCurrentAdmin()`: session-based admin assertions.

## Removing an admin

In `/admin/users`, click "Remove" next to their email. The user's session remains valid up to 1 hour (Supabase default access-token TTL); for instant revocation, also revoke their session via Supabase dashboard → Authentication → Users → the user → "Sign out user."

## When the data shape changes

- Additive optional field: add to Zod schema with `.optional()` or default; old rows parse.
- Breaking change: bump `CURRENT_SCHEMA_VERSION` in `src/app/bulletin/_data/schemas.ts`, write a migration in `migrations.ts`, and run a SQL migration that rewrites existing rows.

## When the rendering changes

- Non-breaking tweak: just change code; archives re-render with the new look.
- Breaking change: bump `CURRENT_RENDER_VERSION`, copy current `_pdf/` and `_view/` to versioned folders (`_pdf/v1/`), update the dispatch in `_pdf/index.ts` and `_view/index.ts`, and stamp existing rows with the old version number.
