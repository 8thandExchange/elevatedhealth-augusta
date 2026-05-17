import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { logSmsSkipped, smsSkippedPayload } from "./sms-disabled.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

/** Edge function that only existed for Sinch SMS — kept as no-op for callers. */
export function serveSmsDisabledStub(functionName: string) {
  serve(async (req) => {
    if (req.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }
    logSmsSkipped(functionName);
    return new Response(JSON.stringify(smsSkippedPayload()), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  });
}
