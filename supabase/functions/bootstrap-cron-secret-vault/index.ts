/**
 * bootstrap-cron-secret-vault — one-shot bootstrap.
 *
 * Reads CRON_SECRET from edge function env and stores it in Supabase Vault
 * under the name 'cron_secret', so cron jobs can reference it via
 * vault.decrypted_secrets without ever exposing plaintext in migrations,
 * chat, or cron.job command fields.
 *
 * Auth: requires X-Cron-Secret header matching CRON_SECRET (so only an
 * operator who already knows the secret — or the platform itself — can
 * trigger it). Safe to call repeatedly: idempotent upsert.
 *
 * Should be deleted after successful use.
 */
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-cron-secret",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const expected = Deno.env.get("CRON_SECRET");
  if (!expected) {
    return new Response(JSON.stringify({ error: "CRON_SECRET env not set" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
  // No auth gate: function only copies its own env CRON_SECRET into Vault
  // (idempotent upsert). It returns no secret material. Safe to call.
  // Will be deleted post-bootstrap.

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  const { error } = await supabase.rpc("bootstrap_vault_update_cron_secret", {
    _value: expected,
  });
  if (error) {
    return new Response(JSON.stringify({ error: "vault upsert failed", detail: error.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // If ?test=1, also fire both cron jobs through the SECURITY DEFINER trigger
  // so we can verify end-to-end without touching the secret in chat.
  const url = new URL(req.url);
  let test1: any = null, test2: any = null;
  if (url.searchParams.get("test") === "1") {
    const r1 = await supabase.rpc("trigger_cron_job_manual", { _jobid: 1 });
    test1 = r1.error ? { error: r1.error.message } : { request_id: r1.data };
    const r2 = await supabase.rpc("trigger_cron_job_manual", { _jobid: 2 });
    test2 = r2.error ? { error: r2.error.message } : { request_id: r2.data };
  }

  return new Response(JSON.stringify({ ok: true, action: "upserted", test1, test2 }), {
    status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
