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

// Service-specific email content
const serviceDescriptions: Record<string, { name: string; tagline: string; description: string }> = {
  peptides: {
    name: "Peptide Therapy",
    tagline: "targeted recovery and optimization",
    description: "When prescribed, our peptide protocols use 503A pharmacy partners and informed consent — your clinician selects stacks that match your goals and labs."
  },
  hormone: {
    name: "Hormone Optimization",
    tagline: "restored energy and vitality",
    description: "Our hormone optimization program is designed to restore your energy, vitality, and overall well-being through personalized bioidentical hormone therapy."
  },
  weight_loss: {
    name: "Weight Loss & Metabolic Health",
    tagline: "sustainable, medically-guided weight management",
    description: "Our medical weight loss program uses the latest GLP-1 therapies to help you achieve sustainable results with ongoing clinical support."
  },
  general: {
    name: "Personalized Wellness",
    tagline: "your optimal health goals",
    description: "Our personalized wellness programs are tailored to your unique health needs, combining cutting-edge treatments with compassionate care."
  }
};

// Build personalized service content from interests array
function buildServiceContent(interests: string[]): { journeyName: string; descriptions: string[] } {
  const validInterests = interests.filter(i => serviceDescriptions[i]);
  
  if (validInterests.length === 0) {
    return {
      journeyName: serviceDescriptions.general.name,
      descriptions: [serviceDescriptions.general.description]
    };
  }
  
  if (validInterests.length === 1) {
    const service = serviceDescriptions[validInterests[0]];
    return {
      journeyName: service.name,
      descriptions: [service.description]
    };
  }
  
  // Multiple interests - combine names and show first two descriptions
  const names = validInterests.map(i => serviceDescriptions[i].name);
  const journeyName = names.length === 2 
    ? `${names[0]} and ${names[1]}`
    : names.slice(0, -1).join(", ") + ", and " + names[names.length - 1];
  
  const descriptions = validInterests.slice(0, 2).map(i => serviceDescriptions[i].description);
  
  return { journeyName, descriptions };
}

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

    // Generate intake token for the patient (7-day expiry)
    const intakeToken = crypto.randomUUID();
    const intakeTokenExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

    // Create the patient record
    const { data: newPatient, error: createError } = await supabaseAdmin
      .from("patients")
      .insert({
        full_name: patient_name,
        email: patient_email.toLowerCase(),
        phone: patient_phone || null,
        primary_program: finalServiceInterests[0],
        service_interests: finalServiceInterests,
        onboarding_status: onboardingStatus,
        risk_status: "standard",
        invited_by: user.id,
        invited_at: new Date().toISOString(),
        consultation_booking_id: consultationBookingId,
        intake_token: intakeToken,
        intake_token_expires_at: intakeTokenExpiresAt,
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

    logStep("Patient created successfully", { patientId: newPatient.id, intakeToken: intakeToken.slice(0, 8) + "..." });

    // Send welcome email if requested
    let emailSent = false;
    if (send_welcome_email && resendApiKey) {
      try {
        const resend = new Resend(resendApiKey);
        const firstName = patient_name.split(" ")[0];
        
        // Build personalized service content
        const { journeyName, descriptions } = buildServiceContent(finalServiceInterests);
        
        // Build description HTML
        const descriptionHtml = descriptions.map(d => 
          `<p style="margin: 0 0 15px 0; color: #4a5568;">${d}</p>`
        ).join("");

        // Intake form URL with token
        const intakeUrl = `https://elevatedhealthaugusta.com/intake?token=${intakeToken}`;

        const { error: emailError } = await resend.emails.send({
          from: "Elevated Health Augusta <noreply@stripe.elevatedhealthaugusta.com>",
          to: [patient_email],
          subject: `Welcome to Elevated Health Augusta, ${firstName}!`,
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
              
              <p>We're excited to have you as part of the Elevated Health Augusta family. Your account has been created and you're ready to begin your <strong>${journeyName}</strong> journey with us.</p>
              
              <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                ${descriptionHtml}
              </div>
              
              ${creditApplied ? `
              <div style="background: linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%); padding: 15px 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #28a745;">
                <p style="margin: 0; font-weight: 600; color: #155724;">
                  ✓ Your $149 consultation credit has been applied to your account!
                </p>
                <p style="margin: 5px 0 0 0; font-size: 14px; color: #155724;">
                  This credit will be applied toward your treatment program.
                </p>
              </div>
              ` : ''}
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${intakeUrl}" style="display: inline-block; background: linear-gradient(135deg, #0d9488 0%, #0f766e 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
                  Complete Your Medical Intake
                </a>
                <p style="margin-top: 10px; font-size: 13px; color: #666;">
                  This link expires in 7 days
                </p>
              </div>
              
              <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="margin-top: 0; color: #1a1a1a;">What's Next?</h3>
                <ul style="padding-left: 20px; margin-bottom: 0;">
                  <li>Complete your medical intake form (takes about 5-10 minutes)</li>
                  <li>Our team will review your information and reach out</li>
                  <li>We're here to answer any questions you may have</li>
                </ul>
              </div>
              
              <p>If you have any questions, don't hesitate to reach out to us at <a href="mailto:appointments@elevatedhealthaugusta.com" style="color: #0d9488;">appointments@elevatedhealthaugusta.com</a> or call us at <a href="tel:7067603470" style="color: #0d9488;">(706) 760-3470</a>.</p>
              
              <p style="margin-top: 30px;">
                Warm regards,<br>
                <strong>The Elevated Health Augusta Team</strong>
              </p>
              
              <div style="border-top: 1px solid #e5e5e5; margin-top: 30px; padding-top: 20px; text-align: center; color: #666; font-size: 12px;">
                <p style="margin: 0;">Elevated Health Augusta</p>
                <p style="margin: 5px 0;">7013 Evans Town Center Blvd, Suite 203 | Evans, GA 30809</p>
                <p style="margin: 5px 0;">(706) 760-3470 | appointments@elevatedhealthaugusta.com</p>
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
        intake_token: intakeToken,
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
