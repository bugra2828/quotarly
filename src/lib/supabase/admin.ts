import { createClient as createSupabaseClient } from "@supabase/supabase-js";

// Service-role client: bypasses RLS. Server-only — never import from a
// client component or expose SUPABASE_SERVICE_ROLE_KEY to the browser.
// Used for trusted backend entry points (webhooks, cron jobs) that don't
// run in the context of a signed-in user.
export function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
}
