import { createClient } from "@supabase/supabase-js";

/**
 * Service-role client for privileged operations (deleting an auth user).
 * Never import this into anything that runs in the browser — the secret key
 * bypasses row-level security entirely.
 */
export function createAdminClient() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SECRET_KEY!, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
