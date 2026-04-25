import { createClient } from "@supabase/supabase-js";

// Cookie-free Supabase client for public, anonymous reads (RLS-gated SELECT).
// Safe to call inside `unstable_cache` boundaries — no dynamic data access.
export function createSupabasePublicClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    { auth: { persistSession: false } },
  );
}
