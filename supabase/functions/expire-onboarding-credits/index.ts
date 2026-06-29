// expire-onboarding-credits
// ----------------------------------------------------------------------------
// Housekeeping sweep that flips expired 'issued' credits to 'expired' for
// accurate reporting. NOT required for correctness: get_redeemable_credit and
// redeem_onboarding_credit both enforce the window live, so an unswept credit
// can never actually be redeemed past its window.
//
// Run on a schedule via pg_cron (see the migration footer) or invoke this
// function from any external scheduler.
//
// DEPLOY (new function): supabase functions deploy expire-onboarding-credits --no-verify-jwt
// ----------------------------------------------------------------------------

import { corsHeaders, json } from "../_shared/cors.ts";
import { serviceClient } from "../_shared/supabase.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const db = serviceClient();
    const { data, error } = await db.rpc("expire_onboarding_credits");
    if (error) throw error;
    return json({ expired: data ?? 0 });
  } catch (err) {
    return json({ error: String(err?.message ?? err) }, 500);
  }
});
