/**
 * send-welcome-email
 *
 * Sends a welcome email to a newly-onboarded patient and (if patient_id is
 * supplied) generates / persists an intake_token used by the public intake
 * landing page.
 *
 * AUTH POSTURE (security audit R-5, 2026-05-08):
 *   - verify_jwt = true in supabase/config.toml
 *   - Caller MUST present a valid Supabase JWT
 *   - Caller MUST have role = 'staff' OR role = 'admin'
 *
 * Background: prior to this change anyone reachable to the function URL
 * could (a) spam welcome emails to arbitrary addresses, (b) force a fresh
 * intake_token to be issued for any patient_id (which is a takeover vector
 * because the token is the public key for the intake page), and
 * (c) write a row into communication_logs. Restricting to staff/admin
 * removes (a)/(b)/(c) from the unauthenticated attack surface.
 */
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

async function requireStaffOrAdmin(req: Request): Promise<
  | { ok: true; user_id: string }
  | { ok: false; status: number; error: string }
> {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader) {
    return { ok: false, status: 401, error: "Missing Authorization header" };
  }
  const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
  const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
  const supabaseAuth = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: authHeader } },
  });
  const { data: userData, error: userErr } = await supabaseAuth.auth.getUser();
  if (userErr || !userData?.user) {
    return { ok: false, status: 401, error: "Invalid or expired session" };
  }
  const user_id = userData.user.id;

  const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
  const { data: roles } = await supabaseAdmin
    .from("user_roles")
    .select("role")
    .eq("user_id", user_id);
  const isStaffOrAdmin = (roles || []).some(
    (r) => r.role === "staff" || r.role === "admin",
  );
  if (!isStaffOrAdmin) {
    return { ok: false, status: 403, error: "Staff or admin role required" };
  }
  return { ok: true, user_id };
}

// Service-specific email content
const serviceDescriptions: Record<string, { name: string; description: string }> = {
  ketamine: {
    name: "Mental Wellness & Ketamine Therapy",
    description: "Our ketamine therapy program offers breakthrough treatment for depression, anxiety, and PTSD. Our medical team will guide you through every step of your healing journey."
  },
  hormone: {
    name: "Hormone Optimization",
    description: "Our hormone optimization program is designed to restore your energy, vitality, and overall well-being through personalized bioidentical hormone therapy."
  },
  weight_loss: {
    name: "Weight Loss & Metabolic Health",
    description: "Our medical weight loss program uses the latest GLP-1 therapies to help you achieve sustainable results with ongoing clinical support."
  },
  general: {
    name: "Personalized Wellness",
    description: "Our personalized wellness programs are tailored to your unique health needs, combining cutting-edge treatments with compassionate care."
  }
};

interface WelcomeEmailRequest {
  patient_id?: string;
  patient_name: string;
  patient_email: string;
  primary_program?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const authResult = await requireStaffOrAdmin(req);
  if (!authResult.ok) {
    return new Response(
      JSON.stringify({ error: authResult.error }),
      { status: authResult.status, headers: { "Content-Type": "application/json", ...corsHeaders } },
    );
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const supabase = createClient(supabaseUrl!, supabaseServiceKey!);

  try {
    const { patient_id, patient_name, patient_email, primary_program }: WelcomeEmailRequest = await req.json();

    console.log(`Sending welcome email to ${patient_email}`);

    // Get service-specific content
    const service = serviceDescriptions[primary_program || 'general'] || serviceDescriptions.general;
    const firstName = patient_name.split(" ")[0];

    // Generate or retrieve intake token
    let intakeToken = "";
    let intakeUrl = "https://elevatedhealthaugusta.com/patient/intake";
    
    if (patient_id) {
      // Check if patient has an intake token, if not generate one
      const { data: patient } = await supabase
        .from("patients")
        .select("intake_token, intake_token_expires_at")
        .eq("id", patient_id)
        .single();
      
      if (patient?.intake_token) {
        intakeToken = patient.intake_token;
      } else {
        // Generate new token
        intakeToken = crypto.randomUUID();
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
        await supabase
          .from("patients")
          .update({ intake_token: intakeToken, intake_token_expires_at: expiresAt })
          .eq("id", patient_id);
      }
      intakeUrl = `https://elevatedhealthaugusta.com/intake?token=${intakeToken}`;
    }

    const emailResponse = await resend.emails.send({
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
        <body style="font-family: 'Helvetica Neue', Arial, sans-serif; margin: 0; padding: 0; background-color: #F9F9F7;">
          <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
            <!-- Header -->
            <div style="text-align: center; margin-bottom: 32px;">
              <h1 style="font-family: Georgia, serif; font-size: 28px; color: #2C3E50; margin: 0;">
                Elevated Health Augusta
              </h1>
              <p style="color: #D4A017; font-size: 14px; margin-top: 8px; letter-spacing: 2px;">
                PERSONALIZED WELLNESS
              </p>
            </div>

            <!-- Main Content -->
            <div style="background: white; border-radius: 12px; padding: 32px; border: 1px solid #E5E5E5;">
              <h2 style="font-family: Georgia, serif; font-size: 24px; color: #2C3E50; margin: 0 0 16px 0;">
                Welcome, ${firstName}!
              </h2>
              
              <p style="color: #5D6D7E; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
                Thank you for choosing Elevated Health Augusta for your <strong>${service.name}</strong> journey. We're honored to partner with you on your path to optimal wellness.
              </p>

              <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <p style="margin: 0; color: #4a5568;">${service.description}</p>
              </div>

              <div style="background: #F9F9F7; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
                <h3 style="font-family: Georgia, serif; font-size: 18px; color: #2C3E50; margin: 0 0 12px 0;">
                  Your Next Step: Complete Your Medical Intake
                </h3>
                <p style="color: #5D6D7E; font-size: 14px; line-height: 1.6; margin: 0 0 16px 0;">
                  To ensure we create the perfect personalized protocol for you, please complete your medical intake form. This comprehensive assessment helps our providers understand your unique health profile.
                </p>
                <a href="${intakeUrl}" 
                   style="display: inline-block; background: #0d9488; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px;">
                  Complete Medical Intake
                </a>
                ${intakeToken ? '<p style="margin-top: 10px; font-size: 12px; color: #666;">This link expires in 7 days</p>' : ''}
              </div>

              <div style="border-top: 1px solid #E5E5E5; padding-top: 24px;">
                <h4 style="font-size: 14px; color: #2C3E50; margin: 0 0 12px 0;">What Happens Next:</h4>
                <ol style="color: #5D6D7E; font-size: 14px; line-height: 1.8; margin: 0; padding-left: 20px;">
                  <li>Complete your medical intake form (5-10 minutes)</li>
                  <li>Our provider reviews your health profile within 24-48 hours</li>
                  <li>You'll receive an email when your personalized protocol is ready</li>
                  <li>Begin your transformation journey!</li>
                </ol>
              </div>
            </div>

            <!-- Footer with CORRECT contact info -->
            <div style="text-align: center; margin-top: 32px; color: #8E9EAB; font-size: 12px;">
              <p style="margin: 0 0 8px 0;">
                Elevated Health Augusta<br>
                7013 Evans Town Center Blvd, Suite 203 | Evans, GA 30809
              </p>
              <p style="margin: 0;">
                Questions? Call us at (706) 760-3470<br>
                booking@elevatedhealthaugusta.com
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    console.log("Welcome email sent successfully:", emailResponse);

    // Log communication
    if (patient_id) {
      await supabase.from("communication_logs").insert({
        patient_id,
        template_key: "welcome_email",
        subject: `Welcome to Elevated Health Augusta, ${firstName}!`,
        body_preview: `Welcome email sent for ${service.name}`,
        delivery_method: "email",
        status: "sent",
      });
      console.log("Communication logged");
    }

    return new Response(JSON.stringify({ success: true, emailResponse }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error sending welcome email:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
