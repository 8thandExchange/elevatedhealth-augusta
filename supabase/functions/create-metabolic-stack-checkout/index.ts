/**
 * create-metabolic-stack-checkout — RETIRED 2026-06-24.
 *
 * The standalone ELEVATED Metabolic Recomposition program ($599/$1,199) was
 * discontinued. Advanced metabolic support lives inside the GLP-1 lane as
 * provider-directed à la carte peptides. This endpoint is hard-blocked.
 */
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { edgeStructuredLog } from "../_shared/edge-structured-log.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  edgeStructuredLog("create-metabolic-stack-checkout", {
    event_type: "blocked",
    success: false,
    action_taken: "program_retired",
    product_recognition: "elevated_metabolic_recomposition",
    error_message: "ELEVATED Metabolic Recomposition stack discontinued 2026-06-24",
  }, "info");

  return new Response(
    JSON.stringify({
      error:
        "The ELEVATED Metabolic Recomposition program is no longer offered. Start with a $79 Wellness Assessment and discuss GLP-1 or provider-directed metabolic support in clinic.",
      code: "PROGRAM_RETIRED",
    }),
    {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 410,
    },
  );
});
