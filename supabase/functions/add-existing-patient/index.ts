import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "https://esm.sh/resend@2.0.0";

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
  service_interests?: string[];
  patient_status: string;
  send_welcome_email?: boolean;
  credit_code?: string | null;
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
    const resendApiKey = Deno.env.get("RESEND_API_KEY");

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
    const { 
      patient_email, 
      patient_name, 
      patient_phone, 
      service_type, 
      service_interests = [],
      patient_status,
      send_welcome_email = false,
      credit_code = null
    } = body;

    // Determine interests array - use provided array or fallback to single service_type
    const finalServiceInterests = service_interests.length > 0 ? service_interests : [service_type];

    logStep("Request data", { patient_email, patient_name, service_type, service_interests: finalServiceInterests, patient_status, send_welcome_email, credit_code: credit_code ? "provided" : "none" });

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

    // Handle credit code - look up in consultation_bookings
    let creditApplied = false;
    let consultationBookingId: string | null = null;
    
    if (credit_code) {
      logStep("Looking up credit code", { credit_code });
      
      const { data: booking, error: bookingError } = await supabaseAdmin
        .from("consultation_bookings")
        .select("*")
        .eq("credit_code", credit_code.toUpperCase())
        .is("credit_used_at", null)
        .eq("status", "paid")
        .maybeSingle();

      if (bookingError) {
        logStep("Error looking up credit code", { error: bookingError.message });
      }

      if (booking) {
        logStep("Valid credit code found", { bookingId: booking.id, amount: booking.amount_paid });
        consultationBookingId = booking.id;
        creditApplied = true;
        
        // Mark the credit as used
        await supabaseAdmin
          .from("consultation_bookings")
          .update({ 
            credit_used_at: new Date().toISOString(),
            notes: `Credit applied to existing patient: ${patient_name} (${patient_email})`
          })
          .eq("id", booking.id);
        
        logStep("Credit code marked as used");
      } else {
        logStep("Credit code not found or already used", { credit_code });
      }
    }

    // Map patient_status to onboarding_status (use treatment_active as default for existing patients)
    let onboardingStatus = "treatment_active";
    switch (patient_status) {
      case "treatment_active":
        onboardingStatus = "treatment_active";
        break;
      case "results_ready":
        onboardingStatus = "results_ready";
        break;
      case "protocol_approved":
        onboardingStatus = "protocol_approved";
        break;
      case "consultation_completed":
        onboardingStatus = "consultation_completed";
        break;
      case "existing_patient":
        // Legacy status - map to treatment_active
        onboardingStatus = "treatment_active";
        break;
      default:
        onboardingStatus = "treatment_active";
    }

    // Create the patient record
    // Note: Patients added via this function are "migrated" existing patients
    // We store this info in medical_history.is_migrated_patient for display purposes
    const { data: newPatient, error: createError } = await supabaseAdmin
      .from("patients")
      .insert({
        full_name: patient_name,
        email: patient_email.toLowerCase(),
        phone: patient_phone || null,
        primary_program: finalServiceInterests[0], // First interest as primary
        service_interests: finalServiceInterests, // All interests as JSONB array
        onboarding_status: onboardingStatus,
        risk_status: "standard",
        invited_by: user.id,
        invited_at: new Date().toISOString(),
        consultation_booking_id: consultationBookingId,
        // Mark as migrated patient for UI display purposes
        medical_history: { is_migrated_patient: true, migrated_at: new Date().toISOString() },
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

    // Send welcome email if requested
    let emailSent = false;
    if (send_welcome_email && resendApiKey) {
      try {
        const resend = new Resend(resendApiKey);
        const firstName = patient_name.split(" ")[0];
        
        const serviceLabels: Record<string, string> = {
          hormone: "Hormone Therapy",
          weight_loss: "Weight Loss",
          ketamine: "Ketamine Therapy",
          general: "General Wellness",
        };
        const serviceName = serviceLabels[service_type] || "Wellness";

        const { error: emailError } = await resend.emails.send({
          from: "Elevated Health <noreply@stripe.elevatedhealthaugusta.com>",
          to: [patient_email],
          subject: `Welcome to Elevated Health, ${firstName}!`,
          html: `
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
            </head>
            <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="color: #0d9488; margin: 0;">Elevated Health Augusta</h1>
                <p style="color: #666; margin-top: 5px;">Your Partner in Optimal Wellness</p>
              </div>
              
              <h2 style="color: #1a1a1a;">Welcome, ${firstName}!</h2>
              
              <p>We're excited to have you as part of the Elevated Health family. Your account has been created and you're ready to begin your ${serviceName} journey with us.</p>
              
              ${creditApplied ? `
              <div style="background: linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%); padding: 15px 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #28a745;">
                <p style="margin: 0; font-weight: 600; color: #155724;">
                  ✓ Your $99 consultation credit has been applied to your account!
                </p>
                <p style="margin: 5px 0 0 0; font-size: 14px; color: #155724;">
                  This credit will be applied toward your Hormone Mapping Kit ($349).
                </p>
              </div>
              ` : ''}
              
              <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="margin-top: 0; color: #1a1a1a;">What's Next?</h3>
                <ul style="padding-left: 20px; margin-bottom: 0;">
                  <li>Our team will reach out to schedule your next steps</li>
                  <li>You'll receive payment links for any recommended services</li>
                  <li>We're here to answer any questions you may have</li>
                </ul>
              </div>
              
              <p>If you have any questions, don't hesitate to reach out to us at <a href="mailto:booking@elevatedhealthaugusta.com" style="color: #0d9488;">booking@elevatedhealthaugusta.com</a> or call us at <a href="tel:7064266862" style="color: #0d9488;">(706) 426-6862</a>.</p>
              
              <p style="margin-top: 30px;">
                Warm regards,<br>
                <strong>The Elevated Health Team</strong>
              </p>
              
              <div style="border-top: 1px solid #e5e5e5; margin-top: 30px; padding-top: 20px; text-align: center; color: #666; font-size: 12px;">
                <p style="margin: 0;">Elevated Health Augusta</p>
                <p style="margin: 5px 0;">3523 Walton Way Ext, Suite A | Augusta, GA 30909</p>
                <p style="margin: 5px 0;">(706) 426-6862 | booking@elevatedhealthaugusta.com</p>
              </div>
            </body>
            </html>
          `,
        });

        if (emailError) {
          logStep("Error sending welcome email", { error: emailError });
        } else {
          emailSent = true;
          logStep("Welcome email sent successfully");
        }
      } catch (emailErr: any) {
        logStep("Exception sending welcome email", { error: emailErr.message });
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        patient_id: newPatient.id,
        email_sent: emailSent,
        credit_applied: creditApplied,
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
