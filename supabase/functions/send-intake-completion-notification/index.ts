import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface IntakeCompletionRequest {
  patientName: string;
  patientEmail: string;
  patientId: string;
  primaryProgram: string;
  treatmentInterests: string[];
  symptomScores?: {
    estrogen: number;
    progesterone: number;
    androgen: number;
    cortisol: number;
  };
  mentalWellnessScores?: {
    phq9: number;
    gad7: number;
  };
  isHighRisk: boolean;
  safetyFlags?: string[];
  labPath?: string;
  gender?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const data: IntakeCompletionRequest = await req.json();

    console.log("[send-intake-completion-notification] Intake completed:", {
      patientName: data.patientName,
      patientEmail: data.patientEmail,
      treatmentInterests: data.treatmentInterests,
      isHighRisk: data.isHighRisk
    });

    // Build treatment interests list
    const interestLabels: Record<string, string> = {
      hormone: "Hormone Optimization",
      hormone_female: "Hormone Optimization (Women)",
      testosterone: "Testosterone Therapy (TRT)",
      hormone_male: "Hormone Optimization (Men)",
      weight_loss: "Medical Weight Loss",
      ketamine: "Ketamine Therapy",
      peptides: "Peptide Therapy",
    };

    const treatmentListHtml = data.treatmentInterests
      .map(t => `<li>${interestLabels[t] || t}</li>`)
      .join("");

    // Build symptom scores table
    let scoresHtml = "";
    if (data.symptomScores) {
      const { estrogen, progesterone, androgen, cortisol } = data.symptomScores;
      const getScoreColor = (score: number, max: number) => {
        const pct = score / max;
        if (pct < 0.33) return "#16a34a"; // green
        if (pct < 0.66) return "#ca8a04"; // yellow
        return "#dc2626"; // red
      };

      scoresHtml = `
        <div style="background-color: #f3f4f6; border-radius: 8px; padding: 16px; margin: 16px 0;">
          <h3 style="color: #374151; margin: 0 0 12px 0;">Symptom Scores</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px; color: #6b7280;">Estrogen</td>
              <td style="padding: 8px; color: ${getScoreColor(estrogen, 15)}; font-weight: 600;">${estrogen}/15</td>
            </tr>
            <tr>
              <td style="padding: 8px; color: #6b7280;">Progesterone</td>
              <td style="padding: 8px; color: ${getScoreColor(progesterone, 9)}; font-weight: 600;">${progesterone}/9</td>
            </tr>
            <tr>
              <td style="padding: 8px; color: #6b7280;">Androgen/Vitality</td>
              <td style="padding: 8px; color: ${getScoreColor(androgen, 12)}; font-weight: 600;">${androgen}/12</td>
            </tr>
            <tr>
              <td style="padding: 8px; color: #6b7280;">Cortisol/Stress</td>
              <td style="padding: 8px; color: ${getScoreColor(cortisol, 9)}; font-weight: 600;">${cortisol}/9</td>
            </tr>
          </table>
        </div>
      `;
    }

    // Mental wellness scores for ketamine patients
    let mentalScoresHtml = "";
    if (data.mentalWellnessScores) {
      const { phq9, gad7 } = data.mentalWellnessScores;
      const getDepressionSeverity = (score: number) => {
        if (score <= 4) return { label: "Minimal", color: "#16a34a" };
        if (score <= 9) return { label: "Mild", color: "#ca8a04" };
        if (score <= 14) return { label: "Moderate", color: "#ea580c" };
        if (score <= 19) return { label: "Moderately Severe", color: "#dc2626" };
        return { label: "Severe", color: "#7f1d1d" };
      };
      const getAnxietySeverity = (score: number) => {
        if (score <= 4) return { label: "Minimal", color: "#16a34a" };
        if (score <= 9) return { label: "Mild", color: "#ca8a04" };
        if (score <= 14) return { label: "Moderate", color: "#ea580c" };
        return { label: "Severe", color: "#dc2626" };
      };
      
      const depression = getDepressionSeverity(phq9);
      const anxiety = getAnxietySeverity(gad7);

      mentalScoresHtml = `
        <div style="background-color: #f3f4f6; border-radius: 8px; padding: 16px; margin: 16px 0;">
          <h3 style="color: #374151; margin: 0 0 12px 0;">Mental Wellness Assessment</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px; color: #6b7280;">PHQ-9 (Depression)</td>
              <td style="padding: 8px; color: ${depression.color}; font-weight: 600;">${phq9}/27 - ${depression.label}</td>
            </tr>
            <tr>
              <td style="padding: 8px; color: #6b7280;">GAD-7 (Anxiety)</td>
              <td style="padding: 8px; color: ${anxiety.color}; font-weight: 600;">${gad7}/21 - ${anxiety.label}</td>
            </tr>
          </table>
        </div>
      `;
    }

    // Risk badge
    const riskBadge = data.isHighRisk
      ? `<span style="background-color: #fee2e2; color: #dc2626; padding: 4px 12px; border-radius: 4px; font-weight: 600;">⚠️ HIGH RISK - REQUIRES REVIEW</span>`
      : `<span style="background-color: #dcfce7; color: #16a34a; padding: 4px 12px; border-radius: 4px; font-weight: 600;">✓ Standard Risk</span>`;

    // Safety flags
    const safetyFlagsHtml = data.isHighRisk && data.safetyFlags && data.safetyFlags.length > 0
      ? `
        <div style="background-color: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 16px; margin-top: 16px;">
          <h3 style="color: #92400e; margin: 0 0 8px 0;">⚠️ Safety Flags Identified:</h3>
          <ul style="margin: 0; padding-left: 20px; color: #78350f;">
            ${data.safetyFlags.map(flag => `<li>${flag}</li>`).join('')}
          </ul>
        </div>
      `
      : '';

    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Patient Intake Completed</title>
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8f9fa; padding: 20px;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); overflow: hidden;">
            
            <div style="background: linear-gradient(135deg, #2C3E50 0%, #34495e 100%); padding: 24px 32px;">
              <h1 style="color: #ffffff; margin: 0; font-size: 24px;">📋 Medical Intake Completed</h1>
              <p style="color: #C5A059; margin: 8px 0 0 0; font-size: 14px;">Ready for Provider Review</p>
            </div>

            <div style="padding: 32px;">
              <p style="color: #374151; font-size: 16px; margin: 0 0 24px 0;">
                A patient has completed their medical intake and is <strong>waiting for provider review</strong>:
              </p>

              <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
                <tr>
                  <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb; color: #6b7280; width: 140px;">Patient Name:</td>
                  <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb; color: #111827; font-weight: 600;">${data.patientName}</td>
                </tr>
                <tr>
                  <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb; color: #6b7280;">Email:</td>
                  <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb; color: #111827;">${data.patientEmail}</td>
                </tr>
                <tr>
                  <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb; color: #6b7280;">Gender:</td>
                  <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb; color: #111827; text-transform: capitalize;">${data.gender || "Not specified"}</td>
                </tr>
                <tr>
                  <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb; color: #6b7280;">Lab Path:</td>
                  <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb; color: #111827; text-transform: uppercase;">${data.labPath || "ZRT"}</td>
                </tr>
                <tr>
                  <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb; color: #6b7280;">Treatment Interests:</td>
                  <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb; color: #111827;">
                    <ul style="margin: 0; padding-left: 20px;">${treatmentListHtml}</ul>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 0; color: #6b7280;">Risk Status:</td>
                  <td style="padding: 12px 0;">${riskBadge}</td>
                </tr>
              </table>

              ${scoresHtml}
              ${mentalScoresHtml}
              ${safetyFlagsHtml}

              <div style="margin-top: 32px; padding-top: 24px; border-top: 1px solid #e5e7eb;">
                <p style="color: #6b7280; font-size: 14px; margin-bottom: 16px;">
                  ⏱️ <strong>Estimated review time:</strong> Most reviews completed within 24-48 hours
                </p>
                <a href="https://reveil.health/provider/dashboard" 
                   style="display: inline-block; background-color: #C5A059; color: #ffffff; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 600;">
                  Review in Provider Dashboard →
                </a>
              </div>
            </div>

            <div style="background-color: #f3f4f6; padding: 16px 32px; text-align: center;">
              <p style="color: #6b7280; font-size: 12px; margin: 0;">
                This is an automated notification from Réveil Patient Portal
              </p>
            </div>

          </div>
        </body>
      </html>
    `;

    // Determine subject based on risk and program
    const programLabel = data.treatmentInterests.includes("ketamine") ? "Ketamine" : "Hormone/Weight";
    const subject = `📋 Intake Complete: ${data.patientName}${data.isHighRisk ? " ⚠️ HIGH RISK" : ""} - ${programLabel}`;

    const emailResponse = await resend.emails.send({
      from: "Réveil <noreply@stripe.reveil.health>",
      to: ["booking@reveil.health"],
      subject,
      html: emailHtml,
    });

    console.log("[send-intake-completion-notification] Email sent successfully:", emailResponse);

    // Send SMS alert to staff (especially for high-risk patients)
    try {
      const smsAlertType = data.isHighRisk ? "high_risk_patient" : "intake_completed";
      const supabaseUrl = Deno.env.get("SUPABASE_URL");
      const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");
      
      if (supabaseUrl && supabaseAnonKey) {
        const smsResponse = await fetch(
          `${supabaseUrl}/functions/v1/send-staff-alert-sms`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${supabaseAnonKey}`,
            },
            body: JSON.stringify({
              alert_type: smsAlertType,
              patient_name: data.patientName,
              patient_email: data.patientEmail,
              is_high_risk: data.isHighRisk,
              program: data.primaryProgram,
            }),
          }
        );
        console.log("[send-intake-completion-notification] Staff SMS alert sent:", smsResponse.ok);
      }
    } catch (smsError) {
      console.log("[send-intake-completion-notification] Staff SMS failed (non-critical):", smsError);
    }

    return new Response(JSON.stringify({ success: true, emailResponse }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("[send-intake-completion-notification] Error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
