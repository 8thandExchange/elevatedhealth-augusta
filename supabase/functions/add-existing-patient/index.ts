import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  console.log(`[ADD-EXISTING-PATIENT] ${step}`, details ? JSON.stringify(details) : "");
};

interface AddExistingPatientRequest {
  patient_email: string;
  patient_name: string;
  patient_phone?: string | null;
  service_type: string;
  patient_status: string;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function invoked");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    // Verify the user is authenticated and has admin/staff role
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      logStep("No auth header provided");
      return new Response(
        JSON.stringify({ success: false, error: "Authorization required" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create client with user's auth token to check permissions
    const supabaseUser = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: userError } = await supabaseUser.auth.getUser();
    if (userError || !user) {
      logStep("Auth error", { error: userError?.message });
      return new Response(
        JSON.stringify({ success: false, error: "Invalid authentication" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    logStep("User authenticated", { userId: user.id, email: user.email });

    // Use service role client for admin operations
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Check user has admin or staff role
    const { data: roles, error: rolesError } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id);

    if (rolesError) {
      logStep("Error checking roles", { error: rolesError.message });
      return new Response(
        JSON.stringify({ success: false, error: "Failed to verify permissions" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const userRoles = roles?.map((r) => r.role) || [];
    if (!userRoles.includes("admin") && !userRoles.includes("staff")) {
      logStep("User lacks required role", { roles: userRoles });
      return new Response(
        JSON.stringify({ success: false, error: "Admin or staff role required" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    logStep("User authorized", { roles: userRoles });

    // Parse request body
    const body: AddExistingPatientRequest = await req.json();
    const { patient_email, patient_name, patient_phone, service_type, patient_status } = body;

    logStep("Request data", { patient_email, patient_name, service_type, patient_status });

    // Validate required fields
    if (!patient_email || !patient_name) {
      return new Response(
        JSON.stringify({ success: false, error: "Email and name are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if patient already exists with this email
    const { data: existingPatient, error: checkError } = await supabaseAdmin
      .from("patients")
      .select("id, full_name, email")
      .eq("email", patient_email.toLowerCase())
      .maybeSingle();

    if (checkError) {
      logStep("Error checking existing patient", { error: checkError.message });
    }

    if (existingPatient) {
      logStep("Patient already exists", { patientId: existingPatient.id });
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: `Patient with email ${patient_email} already exists: ${existingPatient.full_name}` 
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Map patient_status to onboarding_status
    let onboardingStatus = "existing_patient";
    switch (patient_status) {
      case "existing_patient":
        onboardingStatus = "existing_patient";
        break;
      case "consultation_completed":
        onboardingStatus = "consultation_completed";
        break;
      case "treatment_active":
        onboardingStatus = "treatment_active";
        break;
      default:
        onboardingStatus = "existing_patient";
    }

    // Create the patient record
    const { data: newPatient, error: createError } = await supabaseAdmin
      .from("patients")
      .insert({
        full_name: patient_name,
        email: patient_email.toLowerCase(),
        phone: patient_phone || null,
        primary_program: service_type,
        onboarding_status: onboardingStatus,
        risk_status: "standard",
        invited_by: user.id,
        invited_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (createError) {
      logStep("Error creating patient", { error: createError.message });
      return new Response(
        JSON.stringify({ success: false, error: createError.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    logStep("Patient created successfully", { patientId: newPatient.id });

    return new Response(
      JSON.stringify({ 
        success: true, 
        patient_id: newPatient.id,
        message: `Patient ${patient_name} added successfully with status: ${onboardingStatus}`
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: any) {
    logStep("Unexpected error", { error: error.message });
    return new Response(
      JSON.stringify({ success: false, error: error.message || "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
