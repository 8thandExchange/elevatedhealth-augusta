import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { edgeStructuredLog } from "../_shared/edge-structured-log.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const TIER_1_TYPES = [
  "terms_of_service",
  "hipaa_acknowledgment",
  "general_medical_treatment",
  "telehealth",
  "communication",
] as const;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const functionName = "complete-consult-prequal-consents";

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    const body = await req.json().catch(() => ({}));
    const sessionId = body.session_id as string;
    const signatureName = String(body.signature_name ?? "").trim();
    const consentRecords = body.consent_records as
      | { consent_type: string; consent_version_id: string }[]
      | undefined;

    if (!sessionId || !signatureName) {
      return new Response(JSON.stringify({ error: "session_id and signature_name are required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: session, error: loadError } = await supabase
      .from("consult_prequal_sessions")
      .select("*")
      .eq("id", sessionId)
      .maybeSingle();

    if (loadError) throw loadError;
    if (!session) {
      return new Response(JSON.stringify({ error: "Session not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (session.screening_result !== "cleared") {
      return new Response(JSON.stringify({ error: "Screening must be cleared before consents" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const signedTypes = new Set(
      (consentRecords ?? []).map((r) => r.consent_type).filter(Boolean),
    );
    for (const t of TIER_1_TYPES) {
      if (!signedTypes.has(t)) {
        return new Response(JSON.stringify({ error: `Missing consent: ${t}` }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    const checkoutToken = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    const signedSessionId = crypto.randomUUID();

    const { error: updateError } = await supabase
      .from("consult_prequal_sessions")
      .update({
        consents_completed_at: new Date().toISOString(),
        consent_payload: {
          signature_name: signatureName,
          signed_session_id: signedSessionId,
          consent_records: consentRecords,
          signed_at: new Date().toISOString(),
        },
        checkout_token: checkoutToken,
        checkout_token_expires_at: expiresAt,
      })
      .eq("id", sessionId);

    if (updateError) throw updateError;

    edgeStructuredLog(functionName, { session_id: sessionId, success: true });

    return new Response(
      JSON.stringify({ checkout_token: checkoutToken, expires_at: expiresAt }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    edgeStructuredLog(functionName, { success: false, error_message: message }, "error");
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
