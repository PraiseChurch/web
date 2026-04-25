# Bulletin Admin UI — Implementation Plan (Phase 2 of 2)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the authenticated admin UI on top of the Supabase-backed data layer (Phase 1) — Google-OAuth-gated routes for managing bulletins, site config, and the admin allowlist, with split-pane live preview (mobile + PDF) on the bulletin editor.

**Architecture:** Next.js middleware gates `/admin/*` to allowlisted users. Auth uses Supabase + Google OAuth + a Postgres "Before User Created" hook that rejects non-allowlisted signups so `auth.users` stays clean. Server actions handle all mutations and call `revalidatePath` + `revalidateTag("bulletins")` after writes. The bulletin editor is a React Hook Form bound to the `Bulletin` type with two preview modes (`<BulletinView>` for mobile, `<PDFViewer><BulletinDocument/></PDFViewer>` for PDF) — both consume the live form state via `useWatch`. Fonts get split into server-side (Node, base64-from-file) and client-side (HTTP URLs) registration to support both render paths.

**Tech Stack:** Next.js 15, React 19, React Hook Form 7, `@hookform/resolvers/zod`, Zod 4, `@supabase/ssr`, `@supabase/supabase-js`, `@react-pdf/renderer` 4 (with its client-side `PDFViewer`).

**Testing:** No automated harness in repo. Each task verifies via `pnpm build` plus manual `curl` / browser checks against the dev server.

**Prerequisites the user must do manually (flagged per task):**
- Apply the new SQL migration via `pnpm supabase db push`
- Bootstrap their email into `admin_allowlist`
- Configure Google OAuth provider in Supabase dashboard (Authentication → Providers → Google)
- Register the `check_user_allowlist` function as the Before User Created hook (Authentication → Hooks)

---

### Task 1: Install React Hook Form + Zod resolver

**Files:**
- Modify: `package.json`, `pnpm-lock.yaml`

- [ ] **Step 1: Install runtime deps**

```bash
pnpm add react-hook-form @hookform/resolvers
```

- [ ] **Step 2: Verify build**

```bash
pnpm build
```

Expected: build succeeds (no code uses these yet).

- [ ] **Step 3: Commit**

```bash
git add package.json pnpm-lock.yaml
git commit -m "chore: add react-hook-form and zod resolver for admin forms"
```

---

### Task 2: SQL migration — RLS write policies + auth hook function

**Files:**
- Create: `supabase/migrations/002_admin_access.sql`

- [ ] **Step 1: Write the migration SQL**

```sql
-- Helper to check current user's email against admin_allowlist (case-insensitive).
create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
as $$
  select exists(
    select 1
    from public.admin_allowlist
    where lower(email) = lower(auth.jwt() ->> 'email')
  );
$$;

-- Write policies on bulletins.
create policy "allowlisted users can write bulletins"
  on public.bulletins for insert
  with check (public.is_admin());

create policy "allowlisted users can update bulletins"
  on public.bulletins for update
  using (public.is_admin())
  with check (public.is_admin());

create policy "allowlisted users can delete bulletins"
  on public.bulletins for delete
  using (public.is_admin());

-- Write policies on bulletin_config.
create policy "allowlisted users can write bulletin_config"
  on public.bulletin_config for insert
  with check (public.is_admin());

create policy "allowlisted users can update bulletin_config"
  on public.bulletin_config for update
  using (public.is_admin())
  with check (public.is_admin());

-- Allowlist management policies.
create policy "allowlisted users can read admin_allowlist"
  on public.admin_allowlist for select
  using (public.is_admin());

create policy "allowlisted users can add to admin_allowlist"
  on public.admin_allowlist for insert
  with check (public.is_admin());

create policy "allowlisted users can remove from admin_allowlist"
  on public.admin_allowlist for delete
  using (public.is_admin());

-- Before User Created hook function — rejects OAuth signups whose email
-- isn't in admin_allowlist. Returns Supabase's standard hook envelope.
create or replace function public.check_user_allowlist(event jsonb)
returns jsonb
language plpgsql
security definer
as $$
declare
  user_email text;
  is_allowed boolean;
begin
  user_email := lower(event->'claims'->>'email');
  if user_email is null then
    return jsonb_build_object(
      'decision', 'reject',
      'message', 'No email claim present on signup.'
    );
  end if;
  select exists(
    select 1 from public.admin_allowlist where lower(email) = user_email
  ) into is_allowed;
  if not is_allowed then
    return jsonb_build_object(
      'decision', 'reject',
      'message', 'This email is not authorized to access the admin.'
    );
  end if;
  return jsonb_build_object('decision', 'continue');
end;
$$;

-- Grant the auth admin role permission to call the hook.
grant execute on function public.check_user_allowlist(jsonb) to supabase_auth_admin;
revoke execute on function public.check_user_allowlist(jsonb) from authenticated, anon, public;
```

- [ ] **Step 2: Verify file is well-formed (no apply yet)**

```bash
cat supabase/migrations/002_admin_access.sql | head -20
```

Expected: shows the SQL header.

- [ ] **Step 3: Commit**

```bash
git add supabase/migrations/002_admin_access.sql
git commit -m "feat(supabase): add admin RLS policies and Before User Created hook function"
```

- [ ] **Step 4: USER ACTION — apply the migration and bootstrap the first admin**

**Halt here. The user must:**

```bash
# Apply the new migration
pnpm supabase db push

# Bootstrap the first admin email — replace with your actual email
# Run this in Supabase SQL Editor or via psql:
#   INSERT INTO admin_allowlist (email) VALUES ('your-email@gmail.com');
```

User confirms by checking the row exists in `admin_allowlist` via Supabase Table Editor.

---

### Task 3: USER ACTION — configure Google OAuth and the auth hook in Supabase dashboard

This task is purely manual configuration in the Supabase dashboard. **Halt before this task and prompt the user.**

**Steps the user performs:**

1. **Set up a Google OAuth client** at https://console.cloud.google.com/apis/credentials:
   - Create OAuth 2.0 Client ID, type "Web application"
   - Add authorized redirect URI: `https://<project-ref>.supabase.co/auth/v1/callback` (find the exact URL in Supabase dashboard → Authentication → Providers → Google)
   - Copy the Client ID and Client Secret

2. **Enable Google provider in Supabase:**
   - Supabase dashboard → Authentication → Providers → Google → toggle on
   - Paste Client ID + Client Secret
   - Save

3. **Register the Before User Created hook:**
   - Supabase dashboard → Authentication → Hooks → "Before User Created" → toggle on
   - Hook type: Postgres
   - Function: `public.check_user_allowlist`
   - Save

4. **Add localhost callback URL for local dev:**
   - Supabase dashboard → Authentication → URL Configuration → Site URL: `http://localhost:3000`
   - Add `http://localhost:3000/**` to "Redirect URLs"
   - In production, add the production URL too (e.g., `https://praisechurchwc.com`)

User confirms by attempting to sign in with their Google account at the Supabase dashboard's auth test page. Allowlisted email should succeed; non-allowlisted should be rejected with the hook's message.

---

### Task 4: Auth helpers — middleware + requireAdmin

**Files:**
- Create: `src/middleware.ts`
- Create: `src/lib/supabase/middleware.ts`
- Create: `src/lib/supabase/auth.ts`

- [ ] **Step 1: Create `src/lib/supabase/middleware.ts`** — session-refreshing helper for middleware

```typescript
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // Refresh session if needed
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return { response, user };
}
```

- [ ] **Step 2: Create `src/middleware.ts`**

```typescript
import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export const config = {
  matcher: ["/admin/:path*"],
};

export async function middleware(request: NextRequest) {
  const { response, user } = await updateSession(request);

  // /admin/login is the only /admin/* route that doesn't require auth
  if (request.nextUrl.pathname === "/admin/login") {
    if (user) {
      return NextResponse.redirect(new URL("/admin/bulletins", request.url));
    }
    return response;
  }

  if (!user) {
    const loginUrl = new URL("/admin/login", request.url);
    loginUrl.searchParams.set("next", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return response;
}
```

- [ ] **Step 3: Create `src/lib/supabase/auth.ts`** — server-side helpers for action handlers

```typescript
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "./server";

export type AdminUser = {
  id: string;
  email: string;
};

/**
 * Resolves the current user, asserts they are in admin_allowlist (via RLS read).
 * Throws (redirect to /admin/login) if no session or email is null.
 * The is_admin SQL function gates writes; this function is for UI logic.
 */
export async function requireAdmin(): Promise<AdminUser> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !user.email) {
    redirect("/admin/login");
  }

  return { id: user.id, email: user.email.toLowerCase() };
}

/**
 * Returns the current user without throwing. Use when a route can render
 * for both signed-in and signed-out states.
 */
export async function getCurrentAdmin(): Promise<AdminUser | null> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || !user.email) return null;
  return { id: user.id, email: user.email.toLowerCase() };
}
```

- [ ] **Step 4: Verify build**

```bash
pnpm build
```

Expected: build succeeds. The middleware compiles but won't intercept anything until `/admin/*` routes exist.

- [ ] **Step 5: Commit**

```bash
git add src/middleware.ts src/lib/supabase/middleware.ts src/lib/supabase/auth.ts
git commit -m "feat(admin): add session-refreshing middleware and requireAdmin helper"
```

---

### Task 5: OAuth callback route + login page

**Files:**
- Create: `src/app/auth/callback/route.ts`
- Create: `src/app/admin/login/page.tsx`

- [ ] **Step 1: Create the OAuth callback route**

`src/app/auth/callback/route.ts`:

```typescript
import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const error = url.searchParams.get("error");
  const errorDescription = url.searchParams.get("error_description");
  const next = url.searchParams.get("next") ?? "/admin/bulletins";

  if (error) {
    const message = errorDescription ?? error;
    const loginUrl = new URL("/admin/login", url.origin);
    loginUrl.searchParams.set("error", message);
    return NextResponse.redirect(loginUrl);
  }

  if (!code) {
    const loginUrl = new URL("/admin/login", url.origin);
    loginUrl.searchParams.set("error", "Missing authorization code");
    return NextResponse.redirect(loginUrl);
  }

  const supabase = await createSupabaseServerClient();
  const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

  if (exchangeError) {
    const loginUrl = new URL("/admin/login", url.origin);
    loginUrl.searchParams.set("error", exchangeError.message);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.redirect(new URL(next, url.origin));
}
```

- [ ] **Step 2: Create the login page**

`src/app/admin/login/page.tsx`:

```typescript
import React from "react";
import { GoogleSignInButton } from "../_components/GoogleSignInButton";

type SearchParams = Promise<{ error?: string; next?: string }>;

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { error, next } = await searchParams;

  return (
    <main className="min-h-screen flex items-center justify-center px-4 bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow p-8 text-center">
        <h1 className="text-2xl font-serif font-bold text-black">
          Praise Church Admin
        </h1>
        <p className="mt-2 text-sm text-gray-600 font-sans">
          Sign in with the Google account associated with your admin email.
        </p>
        {error && (
          <p className="mt-6 text-sm text-red-600 font-sans bg-red-50 border border-red-200 rounded px-3 py-2">
            {error}
          </p>
        )}
        <div className="mt-8">
          <GoogleSignInButton next={next} />
        </div>
        <p className="mt-6 text-xs text-gray-500 font-sans">
          If your email isn&apos;t authorized, ask the pastor to add you.
        </p>
      </div>
    </main>
  );
}
```

- [ ] **Step 3: Create the Google sign-in button (client component)**

`src/app/admin/_components/GoogleSignInButton.tsx`:

```typescript
"use client";

import React from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type Props = { next?: string };

export const GoogleSignInButton: React.FC<Props> = ({ next }) => {
  const handleClick = async () => {
    const supabase = createSupabaseBrowserClient();
    const redirectTo = new URL("/auth/callback", window.location.origin);
    if (next) redirectTo.searchParams.set("next", next);

    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: redirectTo.toString() },
    });
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className="w-full py-3 px-4 rounded-md bg-black text-white text-sm font-sans font-bold uppercase tracking-widest hover:bg-accent-dark-green transition"
    >
      Sign in with Google
    </button>
  );
};
```

- [ ] **Step 4: Verify build**

```bash
pnpm build
```

Expected: `/admin/login` appears as a Static or SSR route. `/auth/callback` appears as Dynamic.

- [ ] **Step 5: Commit**

```bash
git add src/app/auth src/app/admin/login src/app/admin/_components/GoogleSignInButton.tsx
git commit -m "feat(admin): add Google OAuth callback and login page"
```

---

### Task 6: Admin shell layout

**Files:**
- Create: `src/app/admin/layout.tsx`
- Create: `src/app/admin/page.tsx`
- Create: `src/app/admin/_components/AdminShell.tsx`
- Create: `src/app/admin/_components/SignOutButton.tsx`
- Create: `src/app/admin/_actions/auth.ts`

- [ ] **Step 1: Create the sign-out server action**

`src/app/admin/_actions/auth.ts`:

```typescript
"use server";

import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function signOut() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}
```

- [ ] **Step 2: Create the sign-out button**

`src/app/admin/_components/SignOutButton.tsx`:

```typescript
"use client";

import React from "react";
import { signOut } from "../_actions/auth";

export const SignOutButton: React.FC = () => (
  <form action={signOut}>
    <button
      type="submit"
      className="text-sm font-sans text-gray-600 hover:text-black underline"
    >
      Sign out
    </button>
  </form>
);
```

- [ ] **Step 3: Create the AdminShell**

`src/app/admin/_components/AdminShell.tsx`:

```typescript
import React from "react";
import Link from "next/link";
import { SignOutButton } from "./SignOutButton";

type Props = {
  email: string;
  children: React.ReactNode;
};

export const AdminShell: React.FC<Props> = ({ email, children }) => (
  <div className="min-h-screen bg-gray-50">
    <header className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/admin/bulletins" className="font-serif font-bold text-black">
            PCWC Admin
          </Link>
          <nav className="flex items-center gap-4 text-sm font-sans">
            <Link href="/admin/bulletins" className="text-gray-700 hover:text-black">
              Bulletins
            </Link>
            <Link href="/admin/config" className="text-gray-700 hover:text-black">
              Config
            </Link>
            <Link href="/admin/users" className="text-gray-700 hover:text-black">
              Users
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <span className="text-gray-600 font-sans hidden md:inline">{email}</span>
          <SignOutButton />
        </div>
      </div>
    </header>
    {children}
  </div>
);
```

- [ ] **Step 4: Create the admin layout**

`src/app/admin/layout.tsx`:

```typescript
import React from "react";
import { getCurrentAdmin } from "@/lib/supabase/auth";
import { AdminShell } from "./_components/AdminShell";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const admin = await getCurrentAdmin();

  // The middleware redirects unauthenticated users away from /admin/* except
  // /admin/login. So if there's no session here, we're rendering the login
  // page — show it bare without the shell.
  if (!admin) {
    return <>{children}</>;
  }

  return <AdminShell email={admin.email}>{children}</AdminShell>;
}
```

- [ ] **Step 5: Create the /admin index redirect**

`src/app/admin/page.tsx`:

```typescript
import { redirect } from "next/navigation";

export default function AdminIndexPage() {
  redirect("/admin/bulletins");
}
```

- [ ] **Step 6: Verify build**

```bash
pnpm build
```

Expected: `/admin` and `/admin/login` appear in the routes table.

- [ ] **Step 7: Commit**

```bash
git add src/app/admin/layout.tsx \
        src/app/admin/page.tsx \
        src/app/admin/_components/AdminShell.tsx \
        src/app/admin/_components/SignOutButton.tsx \
        src/app/admin/_actions/auth.ts
git commit -m "feat(admin): add admin shell layout with header, nav, sign-out"
```

---

### Task 7: Admin-side data accessors (drafts visible)

**Files:**
- Modify: `src/app/bulletin/_data/bulletins.ts`

- [ ] **Step 1: Add admin accessor functions**

Append to the bottom of `src/app/bulletin/_data/bulletins.ts`:

```typescript
import { createSupabaseServerClient } from "@/lib/supabase/server";

/**
 * Admin read path — uses the cookie-based server client so RLS sees the
 * authenticated user. Returns drafts as well as published bulletins.
 */
export async function adminListAll(): Promise<BulletinSummary[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("bulletins")
    .select("date, data, published_at")
    .order("date", { ascending: false });

  if (error) throw new Error(`adminListAll failed: ${error.message}`);
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

export async function adminGetByDate(
  date: string,
): Promise<StoredBulletin | null> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("bulletins")
    .select("date, data, published_at, schema_version, render_version")
    .eq("date", date)
    .maybeSingle();

  if (error) throw new Error(`adminGetByDate failed: ${error.message}`);
  return data ? parseRow(data as DbRow) : null;
}
```

- [ ] **Step 2: Verify build**

```bash
pnpm build
```

Expected: build succeeds.

- [ ] **Step 3: Commit**

```bash
git add src/app/bulletin/_data/bulletins.ts
git commit -m "feat(admin): add cookie-session bulletin accessors that include drafts"
```

---

### Task 8: Server actions for bulletin mutations

**Files:**
- Create: `src/app/admin/_actions/bulletins.ts`

- [ ] **Step 1: Create `bulletins.ts`**

```typescript
"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/supabase/auth";
import { getConfig } from "@/app/bulletin/_data/config";
import { adminGetByDate } from "@/app/bulletin/_data/bulletins";
import { buildSlug } from "@/app/bulletin/_data/slug";
import {
  BulletinSchemaV1,
  CURRENT_SCHEMA_VERSION,
  CURRENT_RENDER_VERSION,
} from "@/app/bulletin/_data/schemas";
import type { Bulletin } from "@/app/bulletin/types";

function revalidateBulletinSurface(date: string, sermonTitle: string) {
  const slug = buildSlug(date, sermonTitle);
  revalidateTag("bulletins");
  revalidatePath("/bulletin");
  revalidatePath(`/bulletin/${slug}`);
  revalidatePath("/bulletin/archive");
  revalidatePath("/admin/bulletins");
  revalidatePath(`/admin/bulletins/${date}`);
}

export async function upsertBulletin(date: string, raw: unknown): Promise<void> {
  await requireAdmin();
  const bulletin: Bulletin = BulletinSchemaV1.parse(raw);

  const supabase = await createSupabaseServerClient();
  const existing = await adminGetByDate(date);
  const data = existing
    ? { bulletin, configSnapshot: existing.configSnapshot }
    : { bulletin };

  const { error } = await supabase.from("bulletins").upsert(
    {
      date,
      data,
      published_at: existing?.publishedAt ?? null,
      schema_version: CURRENT_SCHEMA_VERSION,
      render_version: CURRENT_RENDER_VERSION,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "date" },
  );
  if (error) throw new Error(`upsertBulletin failed: ${error.message}`);

  revalidateBulletinSurface(date, bulletin.sermon.title);
}

export async function publishBulletin(date: string): Promise<void> {
  await requireAdmin();
  const [bulletin, config] = await Promise.all([adminGetByDate(date), getConfig()]);
  if (!bulletin) throw new Error("Bulletin not found");

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("bulletins")
    .update({
      data: { bulletin: bulletin.bulletin, configSnapshot: config },
      published_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("date", date);
  if (error) throw new Error(`publishBulletin failed: ${error.message}`);

  revalidateBulletinSurface(date, bulletin.bulletin.sermon.title);
}

export async function unpublishBulletin(date: string): Promise<void> {
  await requireAdmin();
  const existing = await adminGetByDate(date);
  if (!existing) throw new Error("Bulletin not found");

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("bulletins")
    .update({
      data: { bulletin: existing.bulletin },
      published_at: null,
      updated_at: new Date().toISOString(),
    })
    .eq("date", date);
  if (error) throw new Error(`unpublishBulletin failed: ${error.message}`);

  revalidateBulletinSurface(date, existing.bulletin.sermon.title);
}

export async function reSnapshotConfig(date: string): Promise<void> {
  await requireAdmin();
  const [existing, config] = await Promise.all([adminGetByDate(date), getConfig()]);
  if (!existing) throw new Error("Bulletin not found");
  if (!existing.publishedAt) throw new Error("Cannot re-snapshot a draft");

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("bulletins")
    .update({
      data: { bulletin: existing.bulletin, configSnapshot: config },
      updated_at: new Date().toISOString(),
    })
    .eq("date", date);
  if (error) throw new Error(`reSnapshotConfig failed: ${error.message}`);

  revalidateBulletinSurface(date, existing.bulletin.sermon.title);
}

export async function deleteBulletin(date: string): Promise<void> {
  await requireAdmin();
  const existing = await adminGetByDate(date);
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("bulletins").delete().eq("date", date);
  if (error) throw new Error(`deleteBulletin failed: ${error.message}`);

  if (existing) {
    revalidateBulletinSurface(date, existing.bulletin.sermon.title);
  } else {
    revalidateTag("bulletins");
    revalidatePath("/bulletin");
    revalidatePath("/bulletin/archive");
    revalidatePath("/admin/bulletins");
  }
}
```

- [ ] **Step 2: Verify build**

```bash
pnpm build
```

Expected: build succeeds.

- [ ] **Step 3: Commit**

```bash
git add src/app/admin/_actions/bulletins.ts
git commit -m "feat(admin): add server actions for bulletin upsert/publish/delete"
```

---

### Task 9: Server actions for config + admin allowlist

**Files:**
- Create: `src/app/admin/_actions/config.ts`
- Create: `src/app/admin/_actions/users.ts`

- [ ] **Step 1: Create `config.ts`**

```typescript
"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/supabase/auth";
import {
  BulletinConfigSchemaV1,
  CURRENT_SCHEMA_VERSION,
} from "@/app/bulletin/_data/schemas";

export async function updateConfig(raw: unknown): Promise<void> {
  await requireAdmin();
  const config = BulletinConfigSchemaV1.parse(raw);

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("bulletin_config").upsert(
    {
      id: 1,
      data: config,
      schema_version: CURRENT_SCHEMA_VERSION,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "id" },
  );
  if (error) throw new Error(`updateConfig failed: ${error.message}`);

  revalidateTag("bulletins");
  revalidatePath("/bulletin");
  revalidatePath("/bulletin/archive");
  revalidatePath("/admin/config");
}
```

- [ ] **Step 2: Create `users.ts`**

```typescript
"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/supabase/auth";

const EmailSchema = z.string().trim().toLowerCase().email();

export async function addAdmin(rawEmail: string): Promise<void> {
  await requireAdmin();
  const email = EmailSchema.parse(rawEmail);

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("admin_allowlist")
    .insert({ email });
  if (error) {
    if (error.code === "23505") {
      throw new Error("Email is already an admin");
    }
    throw new Error(`addAdmin failed: ${error.message}`);
  }

  revalidatePath("/admin/users");
}

export async function removeAdmin(rawEmail: string): Promise<void> {
  const currentAdmin = await requireAdmin();
  const email = EmailSchema.parse(rawEmail);

  if (email === currentAdmin.email) {
    throw new Error("Cannot remove yourself");
  }

  const supabase = await createSupabaseServerClient();
  const { count, error: countError } = await supabase
    .from("admin_allowlist")
    .select("*", { count: "exact", head: true });
  if (countError) throw new Error(`removeAdmin count failed: ${countError.message}`);
  if ((count ?? 0) <= 1) {
    throw new Error("At least one admin must remain");
  }

  const { error } = await supabase
    .from("admin_allowlist")
    .delete()
    .eq("email", email);
  if (error) throw new Error(`removeAdmin failed: ${error.message}`);

  revalidatePath("/admin/users");
}
```

- [ ] **Step 3: Verify build**

```bash
pnpm build
```

- [ ] **Step 4: Commit**

```bash
git add src/app/admin/_actions/config.ts src/app/admin/_actions/users.ts
git commit -m "feat(admin): add server actions for config update and admin allowlist"
```

---

### Task 10: Font isolation refactor — split server vs client font registration

**Files:**
- Rename: `src/app/bulletin/_pdf/fonts.ts` → `src/app/bulletin/_pdf/fonts.server.ts`
- Modify: `src/app/bulletin/_pdf/styles.ts`
- Modify: `src/app/bulletin/[slug]/pdf/route.ts`
- Create: `src/app/bulletin/_pdf/fonts.client.ts`

The existing `_pdf/fonts.ts` uses Node `fs` to embed fonts as base64 — fine on the server, breaks on the client. Live preview needs a parallel registration that fetches from `/fonts/bulletin/...` URLs.

- [ ] **Step 1: Rename `fonts.ts` → `fonts.server.ts`**

```bash
git mv src/app/bulletin/_pdf/fonts.ts src/app/bulletin/_pdf/fonts.server.ts
```

- [ ] **Step 2: Remove the side-effect import from `styles.ts`**

Edit `src/app/bulletin/_pdf/styles.ts` — change the top of the file from:

```typescript
import { StyleSheet } from "@react-pdf/renderer";
import "./fonts";
```

to:

```typescript
import { StyleSheet } from "@react-pdf/renderer";
```

(No font registration in styles — renderers register before importing styles.)

- [ ] **Step 3: Add the server-side font registration to the PDF route handler**

Edit `src/app/bulletin/[slug]/pdf/route.ts` — add as the first import line:

```typescript
import "../../_pdf/fonts.server";
```

- [ ] **Step 4: Create `fonts.client.ts`** for browser-side PDFViewer

```typescript
import { Font } from "@react-pdf/renderer";

// Browser registration — fetches OTF files from public/fonts/bulletin/.
// These paths resolve at runtime against the current origin.
const base = "/fonts/bulletin";

Font.register({
  family: "AlrightSans",
  fonts: [
    { src: `${base}/AlrightSans-Regular.otf` },
    { src: `${base}/AlrightSans-RegularItalic.otf`, fontStyle: "italic" },
    { src: `${base}/AlrightSans-Bold.otf`, fontWeight: "bold" },
    {
      src: `${base}/AlrightSans-BoldItalic.otf`,
      fontWeight: "bold",
      fontStyle: "italic",
    },
  ],
});

Font.register({
  family: "KlinicSlab",
  fonts: [
    { src: `${base}/KlinicSlabBook.otf` },
    { src: `${base}/KlinicSlabBookIt.otf`, fontStyle: "italic" },
    { src: `${base}/KlinicSlabBold.otf`, fontWeight: "bold" },
    {
      src: `${base}/KlinicSlabBoldIt.otf`,
      fontWeight: "bold",
      fontStyle: "italic",
    },
  ],
});
```

- [ ] **Step 5: Verify the existing PDF route still works**

```bash
pnpm build
lsof -ti:3000 | xargs kill 2>/dev/null; sleep 1
pnpm dev > /tmp/pcwc-dev.log 2>&1 &
sleep 4
curl -s -o /tmp/b.pdf -w "%{http_code}\n" http://localhost:3000/bulletin/2026-01-04-doing-good-is-from-god/pdf
file /tmp/b.pdf
kill %1 2>/dev/null; wait 2>/dev/null
```

Expected: HTTP 200, valid PDF (server-side fonts still register correctly via `fonts.server.ts`).

- [ ] **Step 6: Commit**

```bash
git add src/app/bulletin/_pdf/
git commit -m "refactor(bulletin): split pdf font registration into server + client variants"
```

---

### Task 11: BulletinPreview client component (mobile + PDF tabs)

**Files:**
- Create: `src/app/admin/_components/BulletinPreview.tsx`

- [ ] **Step 1: Create the preview component**

```typescript
"use client";

import React, { useState } from "react";
import { PDFViewer } from "@react-pdf/renderer";
import "@/app/bulletin/_pdf/fonts.client";
import { BulletinView } from "@/app/bulletin/_view/BulletinView";
import { BulletinDocument } from "@/app/bulletin/_pdf/BulletinDocument";
import type { ResolvedBulletin } from "@/app/bulletin/types";

type PreviewMode = "mobile" | "pdf";

type Props = { resolved: ResolvedBulletin };

export const BulletinPreview: React.FC<Props> = ({ resolved }) => {
  const [mode, setMode] = useState<PreviewMode>("mobile");

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 border-b border-gray-200 p-2 bg-white">
        <TabButton active={mode === "mobile"} onClick={() => setMode("mobile")}>
          Mobile
        </TabButton>
        <TabButton active={mode === "pdf"} onClick={() => setMode("pdf")}>
          PDF
        </TabButton>
      </div>
      <div className="flex-1 overflow-auto bg-gray-100">
        {mode === "mobile" ? (
          <div className="bg-white max-w-md mx-auto my-4 shadow">
            <BulletinView resolved={resolved} />
          </div>
        ) : (
          <PDFViewer style={{ width: "100%", height: "100%", border: 0 }}>
            <BulletinDocument resolved={resolved} />
          </PDFViewer>
        )}
      </div>
    </div>
  );
};

const TabButton: React.FC<{
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}> = ({ active, onClick, children }) => (
  <button
    type="button"
    onClick={onClick}
    className={`px-3 py-1 text-sm font-sans font-bold uppercase tracking-widest rounded ${
      active ? "bg-black text-white" : "text-gray-700 hover:bg-gray-100"
    }`}
  >
    {children}
  </button>
);
```

- [ ] **Step 2: Verify build**

```bash
pnpm build
```

Expected: build succeeds.

- [ ] **Step 3: Commit**

```bash
git add src/app/admin/_components/BulletinPreview.tsx
git commit -m "feat(admin): add BulletinPreview with mobile and PDF live tabs"
```

---

### Task 12: BulletinForm client component

**Files:**
- Create: `src/app/admin/_components/BulletinForm.tsx`

- [ ] **Step 1: Create the form component**

```typescript
"use client";

import React, { useState, useTransition } from "react";
import {
  useForm,
  useFieldArray,
  Controller,
  type SubmitHandler,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type {
  Bulletin,
  BulletinConfig,
  ResolvedBulletin,
} from "@/app/bulletin/types";
import { BulletinSchemaV1 } from "@/app/bulletin/_data/schemas";
import { resolveBulletin } from "@/app/bulletin/_data/resolve";
import { BulletinPreview } from "./BulletinPreview";
import {
  upsertBulletin,
  publishBulletin,
  unpublishBulletin,
  reSnapshotConfig,
  deleteBulletin,
} from "../_actions/bulletins";

type Props = {
  initialBulletin: Bulletin;
  config: BulletinConfig;
  isPublished: boolean;
  isNew: boolean;
};

export const BulletinForm: React.FC<Props> = ({
  initialBulletin,
  config,
  isPublished,
  isNew,
}) => {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const form = useForm<Bulletin>({
    resolver: zodResolver(BulletinSchemaV1),
    defaultValues: initialBulletin,
  });

  const { control, register, handleSubmit, watch, formState } = form;
  const { fields: eventFields, append: appendEvent, remove: removeEvent } =
    useFieldArray({ control, name: "upcomingEvents" });

  const liveValues = watch();
  let resolved: ResolvedBulletin | null = null;
  try {
    resolved = resolveBulletin(liveValues, config);
  } catch {
    resolved = resolveBulletin(initialBulletin, config);
  }

  const onSave: SubmitHandler<Bulletin> = (values) => {
    setError(null);
    startTransition(async () => {
      try {
        await upsertBulletin(values.date, values);
      } catch (e) {
        setError(e instanceof Error ? e.message : String(e));
      }
    });
  };

  const onPublish = () => {
    setError(null);
    startTransition(async () => {
      try {
        await publishBulletin(initialBulletin.date);
      } catch (e) {
        setError(e instanceof Error ? e.message : String(e));
      }
    });
  };

  const onUnpublish = () => {
    setError(null);
    startTransition(async () => {
      try {
        await unpublishBulletin(initialBulletin.date);
      } catch (e) {
        setError(e instanceof Error ? e.message : String(e));
      }
    });
  };

  const onResnapshot = () => {
    setError(null);
    startTransition(async () => {
      try {
        await reSnapshotConfig(initialBulletin.date);
      } catch (e) {
        setError(e instanceof Error ? e.message : String(e));
      }
    });
  };

  const onDelete = () => {
    if (!confirm(isPublished ? "Delete this published bulletin? Its public URL will 404." : "Delete this draft?")) return;
    setError(null);
    startTransition(async () => {
      try {
        await deleteBulletin(initialBulletin.date);
        window.location.href = "/admin/bulletins";
      } catch (e) {
        setError(e instanceof Error ? e.message : String(e));
      }
    });
  };

  return (
    <div className="grid lg:grid-cols-2 gap-0 h-[calc(100vh-3.5rem)]">
      <form
        onSubmit={handleSubmit(onSave)}
        className="overflow-y-auto p-6 bg-white border-r border-gray-200 space-y-6"
      >
        <header className="flex items-center justify-between">
          <h1 className="text-xl font-serif font-bold">
            {isNew ? "New bulletin" : `Bulletin ${initialBulletin.date}`}
          </h1>
          <span className="text-xs font-sans uppercase tracking-widest">
            {isPublished ? "Published" : "Draft"}
            {formState.isDirty && (
              <span className="ml-2 text-orange-600">· Unsaved</span>
            )}
          </span>
        </header>

        <fieldset className="space-y-3">
          <label className="block text-sm font-sans font-bold">Date</label>
          <input
            type="date"
            {...register("date")}
            disabled={!isNew}
            className="w-full border border-gray-300 rounded px-3 py-2 disabled:bg-gray-100"
          />
          {formState.errors.date && (
            <p className="text-sm text-red-600">{formState.errors.date.message}</p>
          )}
        </fieldset>

        <fieldset className="space-y-3">
          <legend className="text-sm font-sans font-bold uppercase tracking-widest">
            Sermon
          </legend>
          <input
            placeholder="Title"
            {...register("sermon.title")}
            className="w-full border border-gray-300 rounded px-3 py-2"
          />
          <input
            placeholder="Scripture reference (e.g. 3 John 1:9-11)"
            {...register("sermon.scriptureReference")}
            className="w-full border border-gray-300 rounded px-3 py-2"
          />
          <textarea
            placeholder="Scripture passage with {N} verse markers"
            rows={8}
            {...register("sermon.scripturePassage")}
            className="w-full border border-gray-300 rounded px-3 py-2 font-mono text-sm"
          />
        </fieldset>

        <fieldset className="space-y-3">
          <legend className="text-sm font-sans font-bold uppercase tracking-widest">
            Worship step overrides
          </legend>
          <p className="text-xs text-gray-600 font-sans">
            Leave blank to use the config default.
          </p>
          {config.worshipSteps.map((step) => (
            <div key={step.id} className="flex items-center gap-3">
              <span className="text-xs font-sans w-32 text-gray-600">
                {step.title}
              </span>
              <input
                placeholder={step.defaultAssignment}
                {...register(`assignmentOverrides.${step.id}`)}
                className="flex-1 border border-gray-300 rounded px-3 py-1.5 text-sm"
              />
            </div>
          ))}
        </fieldset>

        <fieldset>
          <label className="flex items-center gap-2 text-sm font-sans">
            <input type="checkbox" {...register("isCommunion")} />
            Communion Sunday (highlight Lord&apos;s Supper step)
          </label>
        </fieldset>

        <fieldset className="space-y-3">
          <legend className="text-sm font-sans font-bold uppercase tracking-widest">
            Discovery
          </legend>
          <input
            placeholder="Men's group location"
            {...register("discovery.mens")}
            className="w-full border border-gray-300 rounded px-3 py-2"
          />
          <input
            placeholder="Women's group location"
            {...register("discovery.womens")}
            className="w-full border border-gray-300 rounded px-3 py-2"
          />
        </fieldset>

        <fieldset className="space-y-3">
          <div className="flex items-center justify-between">
            <legend className="text-sm font-sans font-bold uppercase tracking-widest">
              Upcoming events
            </legend>
            <button
              type="button"
              onClick={() =>
                appendEvent({ category: config.enums.eventCategory[0] ?? "GENERAL", date: "", title: "" })
              }
              className="text-xs font-sans underline"
            >
              + Add event
            </button>
          </div>
          {eventFields.map((field, idx) => (
            <div key={field.id} className="flex items-center gap-2">
              <Controller
                control={control}
                name={`upcomingEvents.${idx}.category`}
                render={({ field: f }) => (
                  <select
                    {...f}
                    className="border border-gray-300 rounded px-2 py-1.5 text-sm"
                  >
                    {config.enums.eventCategory.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                )}
              />
              <input
                type="date"
                {...register(`upcomingEvents.${idx}.date`)}
                className="border border-gray-300 rounded px-2 py-1.5 text-sm"
              />
              <input
                placeholder="Title"
                {...register(`upcomingEvents.${idx}.title`)}
                className="flex-1 border border-gray-300 rounded px-2 py-1.5 text-sm"
              />
              <button
                type="button"
                onClick={() => removeEvent(idx)}
                className="text-sm text-red-600"
                aria-label="Remove event"
              >
                ✕
              </button>
            </div>
          ))}
        </fieldset>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
            {error}
          </p>
        )}

        <div className="flex flex-wrap gap-3 sticky bottom-0 bg-white pt-4 border-t border-gray-200">
          <button
            type="submit"
            disabled={pending}
            className="px-4 py-2 bg-black text-white rounded text-sm font-sans font-bold disabled:opacity-50"
          >
            Save
          </button>
          {!isPublished && !isNew && (
            <button
              type="button"
              onClick={onPublish}
              disabled={pending || formState.isDirty}
              title={formState.isDirty ? "Save first" : ""}
              className="px-4 py-2 bg-slide-orange text-white rounded text-sm font-sans font-bold disabled:opacity-50"
            >
              Publish
            </button>
          )}
          {isPublished && (
            <>
              <button
                type="button"
                onClick={onUnpublish}
                disabled={pending}
                className="px-4 py-2 border border-gray-300 rounded text-sm font-sans font-bold disabled:opacity-50"
              >
                Unpublish
              </button>
              <button
                type="button"
                onClick={onResnapshot}
                disabled={pending}
                className="px-4 py-2 border border-gray-300 rounded text-sm font-sans disabled:opacity-50"
              >
                Re-snapshot config
              </button>
            </>
          )}
          {!isNew && (
            <button
              type="button"
              onClick={onDelete}
              disabled={pending}
              className="ml-auto px-4 py-2 text-sm font-sans text-red-600 disabled:opacity-50"
            >
              Delete
            </button>
          )}
        </div>
      </form>
      <div className="hidden lg:block">
        {resolved && <BulletinPreview resolved={resolved} />}
      </div>
    </div>
  );
};
```

- [ ] **Step 2: Verify build**

```bash
pnpm build
```

- [ ] **Step 3: Commit**

```bash
git add src/app/admin/_components/BulletinForm.tsx
git commit -m "feat(admin): add BulletinForm with split-pane live preview"
```

---

### Task 13: `/admin/bulletins` list + new + edit pages

**Files:**
- Create: `src/app/admin/bulletins/page.tsx`
- Create: `src/app/admin/bulletins/new/page.tsx`
- Create: `src/app/admin/bulletins/[date]/page.tsx`

- [ ] **Step 1: List page**

`src/app/admin/bulletins/page.tsx`:

```typescript
import React from "react";
import Link from "next/link";
import { adminListAll } from "@/app/bulletin/_data/bulletins";
import { formatBulletinDate } from "@/app/bulletin/_view/format";

export const dynamic = "force-dynamic";

export default async function AdminBulletinsListPage() {
  const bulletins = await adminListAll();

  return (
    <main className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-serif font-bold">Bulletins</h1>
        <Link
          href="/admin/bulletins/new"
          className="px-4 py-2 bg-black text-white rounded text-sm font-sans font-bold"
        >
          + New bulletin
        </Link>
      </div>
      {bulletins.length === 0 ? (
        <p className="text-gray-600 font-sans">No bulletins yet. Create one to get started.</p>
      ) : (
        <div className="bg-white border border-gray-200 rounded overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left p-3 font-sans font-bold text-xs uppercase tracking-widest">Date</th>
                <th className="text-left p-3 font-sans font-bold text-xs uppercase tracking-widest">Sermon</th>
                <th className="text-left p-3 font-sans font-bold text-xs uppercase tracking-widest">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {bulletins.map((b) => (
                <tr key={b.date} className="hover:bg-gray-50">
                  <td className="p-3">
                    <Link href={`/admin/bulletins/${b.date}`} className="font-sans hover:text-slide-orange">
                      {formatBulletinDate(b.date)}
                    </Link>
                  </td>
                  <td className="p-3 font-serif">{b.sermonTitle}</td>
                  <td className="p-3">
                    <span
                      className={`inline-block text-xs font-sans uppercase tracking-widest px-2 py-1 rounded ${
                        b.publishedAt
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {b.publishedAt ? "Published" : "Draft"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
```

- [ ] **Step 2: New page**

`src/app/admin/bulletins/new/page.tsx`:

```typescript
import React from "react";
import { redirect } from "next/navigation";
import { BulletinForm } from "../../_components/BulletinForm";
import { getConfig } from "@/app/bulletin/_data/config";
import { adminGetByDate } from "@/app/bulletin/_data/bulletins";
import type { Bulletin } from "@/app/bulletin/types";

export const dynamic = "force-dynamic";

type SearchParams = Promise<{ date?: string }>;

function todayIsoLA(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Los_Angeles",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

function emptyBulletin(date: string): Bulletin {
  return {
    date,
    sermon: { title: "", scriptureReference: "", scripturePassage: "" },
    assignmentOverrides: {},
    isCommunion: false,
    discovery: { mens: "", womens: "" },
    upcomingEvents: [],
    publishedAt: null,
  };
}

export default async function NewBulletinPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { date } = await searchParams;
  const targetDate = date ?? todayIsoLA();

  // If a bulletin already exists for this date, redirect to its edit page
  const existing = await adminGetByDate(targetDate);
  if (existing) {
    redirect(`/admin/bulletins/${targetDate}`);
  }

  const config = await getConfig();

  return (
    <BulletinForm
      initialBulletin={emptyBulletin(targetDate)}
      config={config}
      isPublished={false}
      isNew={true}
    />
  );
}
```

- [ ] **Step 3: Edit page**

`src/app/admin/bulletins/[date]/page.tsx`:

```typescript
import React from "react";
import { notFound } from "next/navigation";
import { BulletinForm } from "../../_components/BulletinForm";
import { getConfig } from "@/app/bulletin/_data/config";
import { adminGetByDate } from "@/app/bulletin/_data/bulletins";

export const dynamic = "force-dynamic";

type PageProps = { params: Promise<{ date: string }> };

export default async function EditBulletinPage({ params }: PageProps) {
  const { date } = await params;
  const stored = await adminGetByDate(date);
  if (!stored) notFound();

  const config = await getConfig();
  return (
    <BulletinForm
      initialBulletin={stored.bulletin}
      config={config}
      isPublished={stored.publishedAt !== null}
      isNew={false}
    />
  );
}
```

- [ ] **Step 4: Verify build**

```bash
pnpm build
```

Expected: `/admin/bulletins`, `/admin/bulletins/new`, `/admin/bulletins/[date]` appear.

- [ ] **Step 5: Commit**

```bash
git add src/app/admin/bulletins/
git commit -m "feat(admin): add bulletin list, new, and edit pages"
```

---

### Task 14: `/admin/config` page + ConfigForm + EnumListEditor

**Files:**
- Create: `src/app/admin/config/page.tsx`
- Create: `src/app/admin/_components/ConfigForm.tsx`
- Create: `src/app/admin/_components/EnumListEditor.tsx`

- [ ] **Step 1: EnumListEditor**

`src/app/admin/_components/EnumListEditor.tsx`:

```typescript
"use client";

import React, { useState } from "react";

type Props = {
  label: string;
  values: string[];
  onChange: (values: string[]) => void;
};

export const EnumListEditor: React.FC<Props> = ({ label, values, onChange }) => {
  const [draft, setDraft] = useState("");

  const add = () => {
    const trimmed = draft.trim().toUpperCase();
    if (!trimmed || values.includes(trimmed)) return;
    onChange([...values, trimmed]);
    setDraft("");
  };

  const remove = (value: string) => {
    onChange(values.filter((v) => v !== value));
  };

  return (
    <div>
      <p className="text-sm font-sans font-bold uppercase tracking-widest mb-2">
        {label}
      </p>
      <ul className="space-y-1 mb-3">
        {values.map((v) => (
          <li key={v} className="flex items-center gap-2">
            <span className="font-sans text-sm">{v}</span>
            <button
              type="button"
              onClick={() => remove(v)}
              className="text-xs text-red-600 underline"
            >
              remove
            </button>
          </li>
        ))}
      </ul>
      <div className="flex gap-2">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              add();
            }
          }}
          placeholder="ADD VALUE"
          className="flex-1 border border-gray-300 rounded px-3 py-1.5 text-sm font-sans uppercase"
        />
        <button
          type="button"
          onClick={add}
          className="px-3 py-1.5 text-sm bg-black text-white rounded font-sans font-bold"
        >
          Add
        </button>
      </div>
    </div>
  );
};
```

- [ ] **Step 2: ConfigForm**

`src/app/admin/_components/ConfigForm.tsx`:

```typescript
"use client";

import React, { useState, useTransition } from "react";
import { useForm, useFieldArray, Controller, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { BulletinConfig } from "@/app/bulletin/types";
import { BulletinConfigSchemaV1 } from "@/app/bulletin/_data/schemas";
import { updateConfig } from "../_actions/config";
import { EnumListEditor } from "./EnumListEditor";

type Props = { initialConfig: BulletinConfig };

export const ConfigForm: React.FC<Props> = ({ initialConfig }) => {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<string | null>(null);

  const form = useForm<BulletinConfig>({
    resolver: zodResolver(BulletinConfigSchemaV1),
    defaultValues: initialConfig,
  });
  const { control, register, handleSubmit, formState } = form;

  const stepFields = useFieldArray({ control, name: "worshipSteps" });
  const midweekFields = useFieldArray({ control, name: "midweekMinistries" });

  const onSubmit: SubmitHandler<BulletinConfig> = (values) => {
    setError(null);
    startTransition(async () => {
      try {
        await updateConfig(values);
        setSavedAt(new Date().toLocaleTimeString());
      } catch (e) {
        setError(e instanceof Error ? e.message : String(e));
      }
    });
  };

  return (
    <main className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-serif font-bold mb-6">Site config</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <fieldset className="space-y-3">
          <legend className="text-sm font-sans font-bold uppercase tracking-widest">
            Church
          </legend>
          <input
            {...register("church.name")}
            placeholder="Church name"
            className="w-full border border-gray-300 rounded px-3 py-2"
          />
          <input
            {...register("church.address")}
            placeholder="Address"
            className="w-full border border-gray-300 rounded px-3 py-2"
          />
          <input
            {...register("church.welcomeLine")}
            placeholder="Welcome line"
            className="w-full border border-gray-300 rounded px-3 py-2"
          />
        </fieldset>

        <fieldset>
          <legend className="text-sm font-sans font-bold uppercase tracking-widest mb-2">
            Mission statement
          </legend>
          <textarea
            {...register("missionStatement")}
            rows={3}
            className="w-full border border-gray-300 rounded px-3 py-2"
          />
        </fieldset>

        <fieldset className="space-y-3">
          <legend className="text-sm font-sans font-bold uppercase tracking-widest">
            Worship steps
          </legend>
          {stepFields.fields.map((field, idx) => (
            <div key={field.id} className="grid grid-cols-3 gap-2">
              <input
                {...register(`worshipSteps.${idx}.id`)}
                placeholder="id"
                className="border border-gray-300 rounded px-2 py-1.5 text-sm font-mono"
              />
              <input
                {...register(`worshipSteps.${idx}.title`)}
                placeholder="title"
                className="border border-gray-300 rounded px-2 py-1.5 text-sm"
              />
              <input
                {...register(`worshipSteps.${idx}.defaultAssignment`)}
                placeholder="default assignment"
                className="border border-gray-300 rounded px-2 py-1.5 text-sm"
              />
            </div>
          ))}
        </fieldset>

        <fieldset className="space-y-4">
          <legend className="text-sm font-sans font-bold uppercase tracking-widest">
            Midweek ministries
          </legend>
          {midweekFields.fields.map((dayField, dIdx) => (
            <MidweekDayEditor key={dayField.id} dIdx={dIdx} control={control} register={register} />
          ))}
        </fieldset>

        <fieldset>
          <legend className="text-sm font-sans font-bold uppercase tracking-widest mb-3">
            Enums
          </legend>
          <Controller
            control={control}
            name="enums.eventCategory"
            render={({ field }) => (
              <EnumListEditor
                label="Event category"
                values={field.value}
                onChange={field.onChange}
              />
            )}
          />
        </fieldset>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
            {error}
          </p>
        )}
        {savedAt && (
          <p className="text-sm text-green-700">Saved at {savedAt}</p>
        )}

        <div className="sticky bottom-0 bg-white pt-4 border-t border-gray-200">
          <button
            type="submit"
            disabled={pending || !formState.isDirty}
            className="px-4 py-2 bg-black text-white rounded text-sm font-sans font-bold disabled:opacity-50"
          >
            Save config
          </button>
        </div>
      </form>
    </main>
  );
};

const MidweekDayEditor: React.FC<{
  dIdx: number;
  control: any;
  register: any;
}> = ({ dIdx, control, register }) => {
  const meetingsField = useFieldArray({ control, name: `midweekMinistries.${dIdx}.meetings` });
  return (
    <div className="border border-gray-200 rounded p-3 space-y-2">
      <input
        {...register(`midweekMinistries.${dIdx}.day`)}
        placeholder="Day (e.g. Wednesday)"
        className="border border-gray-300 rounded px-2 py-1 text-sm"
      />
      {meetingsField.fields.map((m, mIdx) => (
        <div key={m.id} className="grid grid-cols-3 gap-2">
          <input
            {...register(`midweekMinistries.${dIdx}.meetings.${mIdx}.name`)}
            placeholder="Meeting name"
            className="border border-gray-300 rounded px-2 py-1 text-sm"
          />
          <input
            {...register(`midweekMinistries.${dIdx}.meetings.${mIdx}.location`)}
            placeholder="Location"
            className="border border-gray-300 rounded px-2 py-1 text-sm"
          />
          <input
            {...register(`midweekMinistries.${dIdx}.meetings.${mIdx}.time`)}
            placeholder="Time"
            className="border border-gray-300 rounded px-2 py-1 text-sm"
          />
        </div>
      ))}
      <button
        type="button"
        onClick={() => meetingsField.append({ name: "", location: "", time: "" })}
        className="text-xs underline"
      >
        + Add meeting
      </button>
    </div>
  );
};
```

- [ ] **Step 3: Config page**

`src/app/admin/config/page.tsx`:

```typescript
import React from "react";
import { ConfigForm } from "../_components/ConfigForm";
import { getConfig } from "@/app/bulletin/_data/config";

export const dynamic = "force-dynamic";

export default async function AdminConfigPage() {
  const config = await getConfig();
  return <ConfigForm initialConfig={config} />;
}
```

- [ ] **Step 4: Verify build**

```bash
pnpm build
```

- [ ] **Step 5: Commit**

```bash
git add src/app/admin/config/ src/app/admin/_components/ConfigForm.tsx src/app/admin/_components/EnumListEditor.tsx
git commit -m "feat(admin): add config edit page with enum list editor"
```

---

### Task 15: `/admin/users` page + AdminAllowlistTable

**Files:**
- Create: `src/app/admin/users/page.tsx`
- Create: `src/app/admin/_components/AdminAllowlistTable.tsx`

- [ ] **Step 1: AdminAllowlistTable client component**

`src/app/admin/_components/AdminAllowlistTable.tsx`:

```typescript
"use client";

import React, { useState, useTransition } from "react";
import { addAdmin, removeAdmin } from "../_actions/users";

type Props = {
  initialEmails: string[];
  currentEmail: string;
};

export const AdminAllowlistTable: React.FC<Props> = ({
  initialEmails,
  currentEmail,
}) => {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [draftEmail, setDraftEmail] = useState("");

  const handleAdd = () => {
    setError(null);
    startTransition(async () => {
      try {
        await addAdmin(draftEmail);
        setDraftEmail("");
      } catch (e) {
        setError(e instanceof Error ? e.message : String(e));
      }
    });
  };

  const handleRemove = (email: string) => {
    if (!confirm(`Remove ${email}?`)) return;
    setError(null);
    startTransition(async () => {
      try {
        await removeAdmin(email);
      } catch (e) {
        setError(e instanceof Error ? e.message : String(e));
      }
    });
  };

  return (
    <main className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-serif font-bold mb-6">Admins</h1>

      <div className="bg-white border border-gray-200 rounded mb-6">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left p-3 font-sans font-bold text-xs uppercase tracking-widest">Email</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {initialEmails.map((email) => {
              const isSelf = email === currentEmail;
              return (
                <tr key={email}>
                  <td className="p-3 font-sans">
                    {email}
                    {isSelf && (
                      <span className="ml-2 text-xs text-gray-500">(you)</span>
                    )}
                  </td>
                  <td className="p-3 text-right">
                    <button
                      type="button"
                      onClick={() => handleRemove(email)}
                      disabled={pending || isSelf}
                      title={isSelf ? "You can't remove yourself here" : ""}
                      className="text-sm text-red-600 disabled:text-gray-400"
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="bg-white border border-gray-200 rounded p-4">
        <h2 className="text-sm font-sans font-bold uppercase tracking-widest mb-3">
          Add admin
        </h2>
        <div className="flex gap-2">
          <input
            type="email"
            value={draftEmail}
            onChange={(e) => setDraftEmail(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleAdd();
              }
            }}
            placeholder="email@example.com"
            className="flex-1 border border-gray-300 rounded px-3 py-2"
          />
          <button
            type="button"
            onClick={handleAdd}
            disabled={pending || !draftEmail.trim()}
            className="px-4 py-2 bg-black text-white rounded text-sm font-sans font-bold disabled:opacity-50"
          >
            Add admin
          </button>
        </div>
        <p className="mt-3 text-xs text-gray-600 font-sans">
          Tell them to sign in at <code>/admin/login</code> with the matching Google account.
        </p>
      </div>

      {error && (
        <p className="mt-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
          {error}
        </p>
      )}
    </main>
  );
};
```

- [ ] **Step 2: Users page (server)**

`src/app/admin/users/page.tsx`:

```typescript
import React from "react";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/supabase/auth";
import { AdminAllowlistTable } from "../_components/AdminAllowlistTable";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const me = await requireAdmin();
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("admin_allowlist")
    .select("email")
    .order("email", { ascending: true });

  if (error) throw new Error(`Failed to load admin_allowlist: ${error.message}`);

  return (
    <AdminAllowlistTable
      initialEmails={(data ?? []).map((r) => r.email.toLowerCase())}
      currentEmail={me.email}
    />
  );
}
```

- [ ] **Step 3: Verify build**

```bash
pnpm build
```

Expected: `/admin/users` appears in the routes.

- [ ] **Step 4: Commit**

```bash
git add src/app/admin/users/ src/app/admin/_components/AdminAllowlistTable.tsx
git commit -m "feat(admin): add /admin/users page for managing admin allowlist"
```

---

### Task 16: Update setup doc + final E2E verification

**Files:**
- Modify: `docs/bulletin-admin-setup.md`

- [ ] **Step 1: Replace `docs/bulletin-admin-setup.md`** with the expanded version

```markdown
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
```

- [ ] **Step 2: Clean build**

```bash
rm -rf .next
pnpm build
```

Expected: all admin routes appear in the build output.

- [ ] **Step 3: Manual smoke test**

```bash
pnpm dev
```

Open in browser:

- `http://localhost:3000/admin` → redirects to `/admin/login` (no session)
- Sign in with allowlisted Google account → redirects to `/admin/bulletins`
- `/admin/bulletins` shows the seeded sample bulletin with "Published" badge
- Click the row → edit page loads with split-pane preview
- Edit sermon title → preview re-renders instantly (mobile tab)
- Switch to PDF tab → PDFViewer renders the document with brand fonts
- Click Save → button shows pending; success returns to form
- Try `/admin/config` → all fields editable, enum editor works
- Try `/admin/users` → see your email; "Remove" button disabled on your row
- Add a fake admin email → table updates
- Remove the fake admin email → table updates
- Try `/admin/login` while signed in → redirects to `/admin/bulletins`
- Sign out → redirects to `/admin/login`

Then sign in with a non-allowlisted Google account:
- Should be rejected by the hook with the "not authorized" message displayed on the login page
- `auth.users` in Supabase should NOT contain the rejected email

- [ ] **Step 4: Lint**

```bash
pnpm lint
```

Expected: only pre-existing warnings (Navbar.tsx, page.tsx). No new warnings from admin code.

- [ ] **Step 5: Commit docs**

```bash
git add docs/bulletin-admin-setup.md
git commit -m "docs: expand bulletin admin setup with auth + admin UI"
```

---

## Open follow-ups (not in this plan)

- Image/asset uploads (sermons currently text-only)
- Audit log of who edited what and when
- Revision history with diff/restore
- Calendar integration replacing inline `upcomingEvents`
- Role differentiation (admin vs editor vs viewer)
- HTML snapshot of mobile view for archive fidelity (PDF is handled via versioned components)
- "Preview against old config" toggle for archives
