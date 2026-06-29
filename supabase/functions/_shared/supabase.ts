import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Service-role client. Bypasses RLS. Only ever instantiated inside edge
// functions, never shipped to the browser.
export function serviceClient() {
  const url = Deno.env.get("SUPABASE_URL");
  const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !key) {
    throw new Error("missing_supabase_env");
  }
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
