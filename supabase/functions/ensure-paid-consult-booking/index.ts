import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { resolveOrCreatePaidConsultBooking } from "../_shared/consult-booking-resolve.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Authorization required" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUser = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } },
    );

    const {
      data: { user },
      error: userError,
    } = await supabaseUser.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Invalid authentication" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: patient, error: patientError } = await supabaseUser
      .from("patients")
      .select("id, email, full_name, onboarding_status, primary_program, consultation_booking_id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (patientError) throw patientError;
    if (!patient) {
      return new Response(JSON.stringify({ error: "Patient record not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    const result = await resolveOrCreatePaidConsultBooking(supabaseAdmin, patient);
    if (!result.ok) {
      return new Response(JSON.stringify({ error: result.error, error_code: "not_paid" }), {
        status: result.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ success: true, booking: result.booking }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("[ensure-paid-consult-booking]", err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Unexpected error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
