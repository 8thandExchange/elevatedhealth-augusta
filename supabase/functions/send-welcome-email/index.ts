/**
 * send-welcome-email
 *
 * OPTION I-3 (with hardening): Resend runs with the service-role Supabase client.
 * Callers must present a valid JWT. Allowed:
 *   - Staff/admin (QuickEmailModal, ConsultationTracker, ResendWelcomeEmailButton), or
 *   - The newly registered auth user (CreateAccount): JWT sub must equal body.user_id,
 *     and auth.admin.getUserById must confirm the same email as body.email.
 *
 * Legacy request shapes still accepted: patient_email / patient_name in addition to
 * email / first_name / last_name.
 */
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { edgeStructuredLog } from "../_shared/edge-structured-log.ts";
import { MAIL_FROM } from "../_shared/mail-config.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const CLINIC_PHONE = "(706) 760-3470";
const CLINIC_PHONE_TEL = "+17067603470";
const CLINIC_ADDRESS = "7013 Evans Town Center Blvd, Suite 203, Evans, GA 30809";

function welcomeLog(
  event: string,
  fields: {
    user_id?: string | null;
    patient_id?: string | null;
    email_domain?: string | null;
    email_sent?: boolean;
    success: boolean;
    error_message?: string | null;
  },
  level: "info" | "error" = "info",
) {
  edgeStructuredLog("send-welcome-email", {
    event,
    user_id: fields.user_id ?? null,
    patient_id: fields.patient_id ?? null,
    email_domain: fields.email_domain ?? null,
    email_sent: fields.email_sent ?? null,
    success: fields.success,
    error_message: fields.error_message ?? null,
  }, level);
}

async function getJwtUser(req: Request): Promise<
  | { ok: true; user_id: string }
  | { ok: false; status: number; error: string }
> {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader) {
    return { ok: false, status: 401, error: "Missing Authorization header" };
  }
  const url = Deno.env.get("SUPABASE_URL")!;
  const anon = Deno.env.get("SUPABASE_ANON_KEY")!;
  const authClient = createClient(url, anon, {
    global: { headers: { Authorization: authHeader } },
  });
  const { data: userData, error: userErr } = await authClient.auth.getUser();
  if (userErr || !userData?.user) {
    return { ok: false, status: 401, error: "Invalid or expired session" };
  }
  return { ok: true, user_id: userData.user.id };
}

async function isStaffOrAdmin(userId: string): Promise<boolean> {
  const url = Deno.env.get("SUPABASE_URL")!;
  const service = createClient(url, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  const { data: roles } = await service
    .from("user_roles")
    .select("role")
    .eq("user_id", userId);
  return (roles || []).some((r) => r.role === "staff" || r.role === "admin");
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const ts = new Date().toISOString();
  let userIdForLog: string | null = null;
  let patientIdForLog: string | null = null;
  let emailDomainForLog: string | null = null;

  try {
    const jwt = await getJwtUser(req);
    if (!jwt.ok) {
      welcomeLog("auth_error", {
        user_id: null,
        patient_id: null,
        email_domain: null,
        email_sent: false,
        success: false,
        error_message: jwt.error,
      }, "error");
      return new Response(JSON.stringify({ error: jwt.error }), {
        status: jwt.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    userIdForLog = jwt.user_id;

    const raw = await req.json();
    const email = (raw.email ?? raw.patient_email) as string | undefined;
    const patient_id = raw.patient_id as string | undefined;
    const user_id = raw.user_id as string | undefined;
    const primary_program = raw.primary_program as string | undefined;

    const nameFromFields = raw.first_name != null || raw.last_name != null
      ? `${raw.first_name || ""} ${raw.last_name || ""}`.trim()
      : (raw.patient_name as string | undefined);
    const first_name = (raw.first_name as string | undefined) ??
      (nameFromFields ? nameFromFields.split(/\s+/)[0] : undefined);
    const last_name = (raw.last_name as string | undefined) ??
      (nameFromFields ? nameFromFields.split(/\s+/).slice(1).join(" ") : undefined);

    welcomeLog("entry", {
      user_id: userIdForLog,
      patient_id: patient_id ?? null,
      email_domain: email?.includes("@") ? email.split("@")[1] : null,
      email_sent: false,
      success: true,
      error_message: null,
    });

    if (!email) {
      welcomeLog("validation_error", {
        user_id: userIdForLog,
        patient_id: patient_id ?? null,
        email_domain: null,
        email_sent: false,
        success: false,
        error_message: "email is required",
      }, "error");
      throw new Error("email is required");
    }

    patientIdForLog = patient_id ?? null;
    emailDomainForLog = email.includes("@") ? email.split("@")[1] : null;

    const url = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(url, serviceKey);

    const staff = await isStaffOrAdmin(jwt.user_id);
    const selfWelcome = Boolean(user_id && jwt.user_id === user_id);

    if (!staff && !selfWelcome) {
      welcomeLog("forbidden", {
        user_id: userIdForLog,
        patient_id: patientIdForLog,
        email_domain: emailDomainForLog,
        email_sent: false,
        success: false,
        error_message: "staff/admin or matching new-user session required",
      }, "error");
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (selfWelcome) {
      const { data: authData, error: authLookupErr } = await supabase.auth.admin.getUserById(
        user_id,
      );
      if (authLookupErr || !authData?.user?.email) {
        welcomeLog("auth_user_missing", {
          user_id,
          patient_id: patientIdForLog,
          email_domain: emailDomainForLog,
          email_sent: false,
          success: false,
          error_message: authLookupErr?.message || "auth user not found",
        }, "error");
        throw new Error("Invalid user_id — not found in auth.users");
      }
      const canonical = (authData.user.email || "").trim().toLowerCase();
      if (canonical !== email.trim().toLowerCase()) {
        welcomeLog("email_mismatch", {
          user_id,
          patient_id: patientIdForLog,
          email_domain: emailDomainForLog,
          email_sent: false,
          success: false,
          error_message: "email does not match auth.users for user_id",
        }, "error");
        throw new Error("Email does not match authenticated user");
      }
    }

    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      welcomeLog("config_error", {
        user_id: userIdForLog,
        patient_id: patientIdForLog,
        email_domain: emailDomainForLog,
        email_sent: false,
        success: false,
        error_message: "RESEND_API_KEY not configured",
      }, "error");
      throw new Error("RESEND_API_KEY not configured");
    }

    const firstName = first_name || "there";
    const rawProgram = primary_program || "general";
    const programKey = rawProgram === "ketamine" ? "general" : rawProgram;

    const serviceDescriptions: Record<
      string,
      { name: string; description: string; nextSteps: string }
    > = {
      hormone: {
        name: "Hormone Optimization",
        description:
          "Your Wellness Assessment includes an in-person visit and LabCorp blood draws in-office when your provider orders them. We build a personalized plan for energy, sleep, mood, and body composition.",
        nextSteps:
          "Book your Wellness Assessment ($79). After your visit, you may choose an ELEVATED program: TRT $249/mo, HRT $229/mo, or WELLNESS $199/mo — all include ongoing care and member lab pricing.",
      },
      weight_loss: {
        name: "Medical Weight Loss",
        description:
          "Physician-supervised GLP-1 therapy with compounded semaglutide or tirzepatide (when clinically appropriate), plus nutrition coaching and follow-up.",
        nextSteps:
          "Book your Wellness Assessment ($79). If you enroll in GLP-1 therapy, the ELEVATED GLP-1 program is $349/mo with labs and follow-ups bundled in.",
      },
      peptide: {
        name: "Peptide Protocols",
        description:
          "Named peptide stacks and à la carte options from our 503A compounding pharmacy partner, prescribed only after your Wellness Assessment and labs.",
        nextSteps:
          "Book your Wellness Assessment ($79). Your provider will recommend a stack based on your goals and labs.",
      },
      general: {
        name: "Elevated Health Augusta",
        description:
          "Personalized wellness with IV therapy, hormones, peptides, and medical weight loss — cash-pay, transparent pricing, physician-led care.",
        nextSteps:
          "Book your Wellness Assessment ($79) to get started. ELEVATED programs from $199/mo include ongoing visits and member lab pricing.",
      },
    };

    const service = serviceDescriptions[programKey] || serviceDescriptions.general;

    const resend = new Resend(resendApiKey);

    const { error: emailError } = await resend.emails.send({
      from: MAIL_FROM,
      to: [email],
      subject: `Welcome to Elevated Health Augusta — ${service.name}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Welcome to Elevated Health Augusta</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #F2EBDC; color: #2A2826;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #F2EBDC; padding: 40px 20px;">
            <tr>
              <td align="center">
                <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(42, 40, 38, 0.1);">
                  <tr>
                    <td style="background: linear-gradient(135deg, #2A2826 0%, #3d3a37 100%); padding: 40px 30px; text-align: center;">
                      <h1 style="margin: 0; color: #F2EBDC; font-size: 28px; font-weight: 300; font-style: italic; font-family: Georgia, serif;">
                        Welcome, ${firstName}!
                      </h1>
                      <p style="margin: 15px 0 0; color: #B8956A; font-size: 14px; letter-spacing: 2px; text-transform: uppercase;">
                        Your journey to optimal wellness begins
                      </p>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 40px 30px;">
                      <p style="font-size: 16px; line-height: 1.6; margin: 0 0 20px;">
                        Thank you for choosing <strong style="color: #B8956A;">Elevated Health Augusta</strong>. We're honored to be part of your health journey.
                      </p>
                      <p style="font-size: 16px; line-height: 1.6; margin: 0 0 20px;">
                        ${service.description}
                      </p>
                      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #F2EBDC; border-radius: 8px; margin: 25px 0; border-left: 4px solid #B8956A;">
                        <tr>
                          <td style="padding: 25px;">
                            <h2 style="margin: 0 0 15px; color: #2A2826; font-size: 18px; font-family: Georgia, serif; font-style: italic;">
                              Everything included
                            </h2>
                            <ul style="margin: 0; padding-left: 20px; font-size: 15px; line-height: 1.7; color: #2A2826;">
                              <li>Physician-led care and follow-up visits as your program requires</li>
                              <li>LabCorp blood draws in-office when your provider orders panels</li>
                              <li>Transparent ELEVATED program pricing: TRT $249/mo, HRT $229/mo, GLP-1 $349/mo, WELLNESS $199/mo</li>
                              <li>Member lab panel discounts when you maintain Elevated Membership ($199/mo)</li>
                            </ul>
                          </td>
                        </tr>
                      </table>
                      <h2 style="color: #2A2826; font-size: 20px; margin: 30px 0 15px; font-family: Georgia, serif; font-style: italic;">
                        What's Next?
                      </h2>
                      <p style="font-size: 16px; line-height: 1.6; margin: 0 0 20px;">
                        ${service.nextSteps}
                      </p>
                      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin: 30px 0;">
                        <tr>
                          <td align="center">
                            <a href="https://elevatedhealthaugusta.com/patient/login" style="display: inline-block; background: linear-gradient(135deg, #B8956A 0%, #a3845f 100%); color: #2A2826; text-decoration: none; padding: 16px 40px; border-radius: 6px; font-size: 16px; font-weight: 600; letter-spacing: 1px;">
                              ACCESS YOUR PORTAL
                            </a>
                          </td>
                        </tr>
                      </table>
                      <p style="font-size: 14px; line-height: 1.6; color: #666; text-align: center; margin: 20px 0 0;">
                        Complete your intake forms before your first visit to make the most of your appointment time.
                      </p>
                    </td>
                  </tr>
                  <tr>
                    <td style="background-color: #2A2826; padding: 30px; text-align: center;">
                      <p style="margin: 0 0 10px; color: #B8956A; font-size: 14px; font-weight: 600;">
                        Elevated Health Augusta
                      </p>
                      <p style="margin: 0; color: #F2EBDC; font-size: 14px;">
                        ${CLINIC_ADDRESS}
                      </p>
                      <p style="margin: 10px 0 0;">
                        <a href="tel:${CLINIC_PHONE_TEL}" style="color: #B8956A; text-decoration: none; font-size: 16px;">
                          ${CLINIC_PHONE}
                        </a>
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
    });

    if (emailError) {
      console.error("Welcome email error:", emailError);
      welcomeLog("resend_error", {
        user_id: userIdForLog,
        patient_id: patientIdForLog,
        email_domain: emailDomainForLog,
        email_sent: false,
        success: false,
        error_message: String(emailError),
      }, "error");
      throw emailError;
    }

    if (patient_id) {
      await supabase
        .from("patients")
        .update({ welcome_email_sent_at: new Date().toISOString() })
        .eq("id", patient_id);
    }

    console.log(JSON.stringify({
      timestamp: ts,
      event: "send-welcome-email",
      user_id: userIdForLog,
      patient_id: patientIdForLog,
      email_sent: true,
      success: true,
      error_message: null,
    }));

    welcomeLog("send_complete", {
      user_id: userIdForLog,
      patient_id: patientIdForLog,
      email_domain: emailDomainForLog,
      email_sent: true,
      success: true,
      error_message: null,
    });

    return new Response(
      JSON.stringify({ success: true, message: "Welcome email sent" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 },
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(JSON.stringify({
      timestamp: ts,
      event: "send-welcome-email",
      user_id: userIdForLog,
      patient_id: patientIdForLog,
      email_sent: false,
      success: false,
      error_message: message,
    }));
    welcomeLog("handler_error", {
      user_id: userIdForLog,
      patient_id: patientIdForLog,
      email_domain: emailDomainForLog,
      email_sent: false,
      success: false,
      error_message: message,
    }, "error");
    return new Response(
      JSON.stringify({ error: message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 },
    );
  }
});