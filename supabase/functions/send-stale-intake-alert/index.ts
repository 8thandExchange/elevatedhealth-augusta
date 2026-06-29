/**
 * send-stale-intake-alert
 *
 * Daily-cron-style alert email to clinical operations summarising patients
 * who have been in `account_created` status for 48+ hours without
 * completing intake. Used by Caroline / office to do personal phone
 * outreach.
 *
 * AUTH POSTURE (security audit R-5, 2026-05-08):
 *   - verify_jwt = false (this is a scheduled function with no user context)
 *   - Caller MUST present a header: `X-Cron-Secret: <CRON_SECRET env var>`
 *
 * Background: previously anyone reachable to the function URL could read
 * patient PHI (full_name, email, phone) for every stale intake patient and
 * trigger an outbound email to appointments@elevatedhealthaugusta.com. The
 * cron-secret header pattern preserves the scheduled function while
 * shutting down the public attack surface.
 */
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { MAIL_FROM } from "../_shared/mail-config.ts";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-cron-secret",
};

function authorizeCron(req: Request): { ok: true } | { ok: false; status: number; error: string } {
  const expected = Deno.env.get("CRON_SECRET");
  if (!expected) {
    return { ok: false, status: 500, error: "CRON_SECRET not configured on the server" };
  }
  const supplied = req.headers.get("X-Cron-Secret");
  if (!supplied || supplied !== expected) {
    return { ok: false, status: 401, error: "Invalid or missing X-Cron-Secret header" };
  }
  return { ok: true };
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const authResult = authorizeCron(req);
  if (!authResult.ok) {
    return new Response(JSON.stringify({ error: authResult.error }), {
      status: authResult.status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log("Checking for stale patients (48+ hours without intake)...");

    // Find patients who:
    // 1. Have onboarding_status = 'account_created'
    // 2. Created more than 48 hours ago
    // 3. Haven't completed intake
    const fortyEightHoursAgo = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString();
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

    const { data: stalePatients, error: fetchError } = await supabase
      .from("patients")
      .select("id, full_name, email, phone, created_at, onboarding_status, primary_program, treatment_request")
      .eq("onboarding_status", "account_created")
      .or("intake_completed.is.null,intake_completed.eq.false")
      .lt("created_at", fortyEightHoursAgo)
      .gt("created_at", oneWeekAgo) // Only show patients from the last week
      .not("email", "is", null)
      .order("created_at", { ascending: false });

    if (fetchError) {
      console.error("Error fetching stale patients:", fetchError);
      throw fetchError;
    }

    const patientCount = stalePatients?.length || 0;
    console.log(`Found ${patientCount} stale patients needing outreach`);

    // Only send email if there are stale patients
    if (patientCount === 0) {
      return new Response(
        JSON.stringify({ success: true, message: "No stale patients found", count: 0 }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Calculate hours since signup for each patient
    const patientsWithAge = stalePatients.map(patient => {
      const hoursSinceSignup = Math.round(
        (Date.now() - new Date(patient.created_at).getTime()) / (1000 * 60 * 60)
      );
      const daysSinceSignup = Math.round(hoursSinceSignup / 24);
      return { ...patient, hoursSinceSignup, daysSinceSignup };
    });

    // Build patient rows for email
    const patientRowsHtml = patientsWithAge.map(patient => {
      const programLabel = '💊 Hormone/Weight';
      const urgencyColor = patient.daysSinceSignup >= 5 ? '#dc2626' : patient.daysSinceSignup >= 3 ? '#ea580c' : '#ca8a04';
      
      return `
        <tr>
          <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">
            <strong style="color: #111827;">${patient.full_name}</strong><br>
            <span style="color: #6b7280; font-size: 13px;">${patient.email}</span>
            ${patient.phone ? `<br><span style="color: #6b7280; font-size: 13px;">📞 ${patient.phone}</span>` : ''}
          </td>
          <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: center;">
            <span style="background: ${urgencyColor}; color: white; padding: 4px 8px; border-radius: 12px; font-size: 12px; font-weight: 600;">
              ${patient.daysSinceSignup} days
            </span>
          </td>
          <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; color: #6b7280; font-size: 13px;">
            ${programLabel}
          </td>
        </tr>
      `;
    }).join("");

    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Stale Intake Alert</title>
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8f9fa; padding: 20px;">
          <div style="max-width: 650px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); overflow: hidden;">
            
            <div style="background: linear-gradient(135deg, #dc2626 0%, #ea580c 100%); padding: 24px 32px;">
              <h1 style="color: #ffffff; margin: 0; font-size: 22px;">⏰ Stale Intake Alert</h1>
              <p style="color: #fecaca; margin: 8px 0 0 0; font-size: 14px;">
                ${patientCount} patient${patientCount > 1 ? 's' : ''} waiting 48+ hours for personal outreach
              </p>
            </div>

            <div style="padding: 24px 32px;">
              <p style="color: #374151; font-size: 15px; margin: 0 0 20px 0;">
                The following patients created accounts but <strong>haven't completed their medical intake</strong>. 
                They've received an automated reminder email, but may benefit from a personal phone call or text.
              </p>

              <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
                <thead>
                  <tr style="background-color: #f3f4f6;">
                    <th style="padding: 12px; text-align: left; color: #374151; font-size: 13px; font-weight: 600;">Patient</th>
                    <th style="padding: 12px; text-align: center; color: #374151; font-size: 13px; font-weight: 600;">Waiting</th>
                    <th style="padding: 12px; text-align: left; color: #374151; font-size: 13px; font-weight: 600;">Program</th>
                  </tr>
                </thead>
                <tbody>
                  ${patientRowsHtml}
                </tbody>
              </table>

              <div style="background: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
                <h3 style="color: #92400e; margin: 0 0 8px 0; font-size: 14px;">💡 Suggested Outreach Script:</h3>
                <p style="color: #78350f; font-size: 13px; margin: 0; line-height: 1.6;">
                  "Hi [Name], this is [Your Name] from Elevated Health Augusta. I noticed you started setting up your patient account but haven't had a chance to complete your health questionnaire yet. It only takes about 5-10 minutes, and once it's done, our provider can review your profile and get your personalized plan started. Is there anything I can help you with?"
                </p>
              </div>

              <div style="text-align: center;">
                <a href="https://elevatedhealthaugusta.com/provider/dashboard" 
                   style="display: inline-block; background-color: #2C3E50; color: #ffffff; padding: 12px 28px; border-radius: 6px; text-decoration: none; font-weight: 600; font-size: 14px;">
                  Open Provider Dashboard →
                </a>
              </div>
            </div>

            <div style="background-color: #f3f4f6; padding: 16px 32px; text-align: center;">
              <p style="color: #6b7280; font-size: 12px; margin: 0;">
                This is an automated daily alert from Elevated Health Augusta
              </p>
            </div>
          </div>
        </body>
      </html>
    `;

    const emailResponse = await resend.emails.send({
      from: MAIL_FROM,
      to: ["appointments@elevatedhealthaugusta.com"],
      subject: `⏰ ${patientCount} Patient${patientCount > 1 ? 's' : ''} Need Outreach - Stale Intake Alert`,
      html: emailHtml,
    });

    console.log("Stale intake alert sent successfully:", emailResponse);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Alert sent for ${patientCount} stale patients`,
        count: patientCount,
        emailResponse 
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Error in stale intake alert:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);