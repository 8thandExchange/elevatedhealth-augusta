/**
 * generate-consent-pdf
 *
 * Returns the rendered consent HTML for a patient (or emails it). Reads
 * full PHI from the patients table.
 *
 * AUTH POSTURE (security audit R-5, 2026-05-08):
 *   - verify_jwt = true in supabase/config.toml
 *   - Caller MUST present a valid Supabase JWT
 *   - Caller is allowed when EITHER:
 *       (a) the caller is the patient themselves
 *           (patients.user_id = auth.uid() AND patients.id = patientId), OR
 *       (b) the caller has role = 'staff' OR role = 'admin'
 *   - Anonymous and other-patient callers are rejected with 403.
 *
 * Background: previously anyone reachable to the function URL could submit
 * any patientId and receive that patient's full consent PDF including
 * full_name, dob, email, phone, address. Locking to patient-self or
 * staff/admin closes that exfiltration vector.
 */
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://deno.land/x/zod@v3.23.8/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function authorizePatientOrStaff(
  req: Request,
  patientId: string,
): Promise<{ ok: true } | { ok: false; status: number; error: string }> {
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
  if (isStaffOrAdmin) return { ok: true };

  const { data: patientRow } = await supabaseAdmin
    .from("patients")
    .select("id")
    .eq("id", patientId)
    .eq("user_id", user_id)
    .maybeSingle();
  if (patientRow) return { ok: true };

  return { ok: false, status: 403, error: "Not authorized for this patient" };
}

// Input validation schema
const consentPdfRequestSchema = z.object({
  patientId: z.string().uuid("Invalid patient ID format"),
  action: z.enum(["download", "email"]).optional(),
});

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const rawBody = await req.json();
    
    // Validate input against schema
    const validationResult = consentPdfRequestSchema.safeParse(rawBody);
    if (!validationResult.success) {
      console.error('[generate-consent-pdf] Validation error:', validationResult.error.errors);
      return new Response(
        JSON.stringify({ error: "Invalid request format: " + validationResult.error.errors[0]?.message }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const { patientId, action } = validationResult.data;

    const authResult = await authorizePatientOrStaff(req, patientId);
    if (!authResult.ok) {
      return new Response(
        JSON.stringify({ error: authResult.error }),
        { status: authResult.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[generate-consent-pdf] Processing validated request for patient: ${patientId}, action: ${action}`);

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch patient data
    const { data: patient, error: patientError } = await supabase
      .from('patients')
      .select('*')
      .eq('id', patientId)
      .single();

    if (patientError || !patient) {
      console.error('[generate-consent-pdf] Patient not found:', patientError);
      throw new Error("Patient not found");
    }

    if (!patient.consent_signature || !patient.consent_completed_at) {
      throw new Error("Patient has not completed consent");
    }

    console.log(`[generate-consent-pdf] Found patient: ${patient.full_name}`);

    // Get treatment type
    const treatmentRequest = patient.treatment_request || '';
    const treatmentType = treatmentRequest.includes('weight_loss') 
      ? 'GLP-1 Weight Loss Program' 
      : treatmentRequest.includes('peptide') 
        ? 'Peptide Therapy'
        : 'Hormone Replacement Therapy';

    const clinicName = "Elevated Health Augusta";
    const clinicAddress = "7013 Evans Town Center Blvd, Suite 203, Evans, GA 30809";
    const clinicPhone = "(706) 760-3470";
    const signatureDate = new Date(patient.consent_signature_date || patient.consent_completed_at).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    // Generate HTML content for PDF
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body {
      font-family: 'Times New Roman', Times, serif;
      font-size: 12pt;
      line-height: 1.6;
      color: #333;
      max-width: 800px;
      margin: 0 auto;
      padding: 40px;
    }
    .header {
      text-align: center;
      margin-bottom: 30px;
      border-bottom: 2px solid #1a365d;
      padding-bottom: 20px;
    }
    .clinic-name {
      font-size: 24pt;
      font-weight: bold;
      color: #1a365d;
      margin-bottom: 5px;
    }
    .clinic-info {
      font-size: 10pt;
      color: #666;
    }
    .title {
      font-size: 16pt;
      font-weight: bold;
      text-align: center;
      margin: 30px 0;
      color: #1a365d;
      text-transform: uppercase;
    }
    .patient-info {
      background: #f8f9fa;
      padding: 15px;
      border-radius: 5px;
      margin-bottom: 25px;
    }
    .patient-info p {
      margin: 5px 0;
    }
    .section {
      margin-bottom: 20px;
    }
    .section-title {
      font-weight: bold;
      font-size: 11pt;
      margin-bottom: 8px;
      color: #1a365d;
    }
    .section p {
      margin: 0 0 10px 0;
      text-align: justify;
    }
    .signature-section {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #ccc;
    }
    .signature-box {
      display: flex;
      justify-content: space-between;
      margin-top: 30px;
    }
    .signature-field {
      width: 45%;
    }
    .signature-line {
      border-bottom: 1px solid #333;
      height: 40px;
      margin-bottom: 5px;
      display: flex;
      align-items: flex-end;
      padding-bottom: 5px;
      font-family: 'Brush Script MT', cursive;
      font-size: 18pt;
    }
    .signature-label {
      font-size: 9pt;
      color: #666;
    }
    .footer {
      margin-top: 50px;
      text-align: center;
      font-size: 9pt;
      color: #999;
      border-top: 1px solid #eee;
      padding-top: 15px;
    }
    .verified-badge {
      background: #d4edda;
      color: #155724;
      padding: 8px 15px;
      border-radius: 5px;
      display: inline-block;
      margin-top: 20px;
      font-size: 10pt;
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="clinic-name">${clinicName}</div>
    <div class="clinic-info">${clinicAddress} | ${clinicPhone}</div>
  </div>

  <div class="title">Informed Consent for ${treatmentType}</div>

  <div class="patient-info">
    <p><strong>Patient Name:</strong> ${patient.full_name}</p>
    <p><strong>Date of Birth:</strong> ${patient.dob ? new Date(patient.dob).toLocaleDateString() : 'Not provided'}</p>
    <p><strong>Email:</strong> ${patient.email || 'Not provided'}</p>
    <p><strong>Phone:</strong> ${patient.phone || 'Not provided'}</p>
    <p><strong>Date of Consent:</strong> ${signatureDate}</p>
  </div>

  <div class="section">
    <div class="section-title">NATURE OF TREATMENT</div>
    <p>I understand that ${treatmentType} involves the administration of prescription medications and/or therapeutic interventions under the supervision of a licensed healthcare provider. The specific treatment protocol will be determined based on my individual health assessment, laboratory results, and ongoing evaluation by my care team.</p>
  </div>

  <div class="section">
    <div class="section-title">RISKS AND BENEFITS</div>
    <p>I acknowledge that all medical treatments carry potential risks and benefits. The potential benefits of treatment have been explained to me, including symptom relief and improved quality of life. Potential risks may include, but are not limited to: medication side effects, allergic reactions, and the possibility that treatment may not achieve desired results. I have had the opportunity to ask questions about these risks and benefits.</p>
  </div>

  <div class="section">
    <div class="section-title">ALTERNATIVES</div>
    <p>I understand that alternatives to the proposed treatment exist, including no treatment at all, and that I may discontinue treatment at any time. The potential consequences of not receiving treatment have been explained to me.</p>
  </div>

  <div class="section">
    <div class="section-title">PATIENT RESPONSIBILITIES</div>
    <p>I agree to provide accurate and complete information about my health history, current medications, and any changes in my condition. I understand that I must follow the treatment protocol as prescribed and attend scheduled appointments. I agree to notify the clinic immediately if I experience any adverse effects or concerning symptoms.</p>
  </div>

  <div class="section">
    <div class="section-title">TELEMEDICINE CONSENT</div>
    <p>I consent to receive telemedicine services as part of my care when appropriate. I understand that telemedicine involves the use of electronic communications to deliver healthcare services remotely. I understand the limitations of telemedicine and that in-person evaluation may be required in certain circumstances.</p>
  </div>

  <div class="section">
    <div class="section-title">FINANCIAL RESPONSIBILITY</div>
    <p>I understand that I am financially responsible for all charges not covered by insurance. I authorize ${clinicName} to bill my insurance and/or credit card on file for services rendered.</p>
  </div>

  <div class="section">
    <div class="section-title">HIPAA AUTHORIZATION</div>
    <p>I acknowledge that I have been provided with the Notice of Privacy Practices and understand how my Protected Health Information (PHI) may be used and disclosed. I authorize the release of my medical information to pharmacies, laboratories, and referring providers as necessary for my treatment. I understand my rights under HIPAA, including the right to access, amend, and restrict the use of my health information.</p>
  </div>

  <div class="section">
    <div class="section-title">RELEASE OF LIABILITY</div>
    <p>I understand that medicine is not an exact science and that no guarantees have been made regarding the outcome of my treatment. I release ${clinicName} and its providers from liability for any adverse outcomes that may occur despite proper medical care, except in cases of gross negligence or willful misconduct.</p>
  </div>

  <div class="section">
    <div class="section-title">ACKNOWLEDGMENT</div>
    <p>By signing below, I acknowledge that I have read and understood this Informed Consent form, have had the opportunity to ask questions, and voluntarily consent to treatment. I understand that I may revoke this consent at any time by providing written notice to the clinic.</p>
  </div>

  <div class="signature-section">
    <div class="signature-box">
      <div class="signature-field">
        <div class="signature-line">${patient.consent_signature}</div>
        <div class="signature-label">Patient Signature (Electronic)</div>
      </div>
      <div class="signature-field">
        <div class="signature-line">${signatureDate}</div>
        <div class="signature-label">Date & Time</div>
      </div>
    </div>
    <div class="verified-badge">
      ✓ Electronically signed via ${clinicName} Patient Portal
    </div>
  </div>

  <div class="footer">
    <p>This document was generated on ${new Date().toLocaleString()} and represents the informed consent agreement signed by the patient through the ${clinicName} secure patient portal.</p>
    <p>${clinicName} | ${clinicAddress} | ${clinicPhone}</p>
  </div>
</body>
</html>
    `;

    // If action is email, send the consent form to patient
    if (action === 'email' && patient.email) {
      console.log(`[generate-consent-pdf] Sending consent form email to: ${patient.email}`);
      
      const resendApiKey = Deno.env.get('RESEND_API_KEY');
      if (!resendApiKey) {
        throw new Error("Email service not configured");
      }

      const emailResponse = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'Elevated Health Augusta <noreply@elevatedhealthaugusta.com>',
          to: [patient.email],
          subject: `Your Signed Consent Form - ${clinicName}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #1a365d;">Your Consent Form</h2>
              <p>Dear ${patient.full_name},</p>
              <p>Thank you for completing your informed consent for ${treatmentType}. Please find your signed consent form attached below for your records.</p>
              <p>If you have any questions about your treatment plan, please don't hesitate to contact us at ${clinicPhone}.</p>
              <hr style="border: 1px solid #eee; margin: 30px 0;" />
              ${htmlContent}
              <hr style="border: 1px solid #eee; margin: 30px 0;" />
              <p style="color: #666; font-size: 12px;">This email contains your signed consent form. Please save this email for your records.</p>
            </div>
          `,
        }),
      });

      if (!emailResponse.ok) {
        const errorText = await emailResponse.text();
        console.error('[generate-consent-pdf] Email send failed:', errorText);
        throw new Error("Failed to send email");
      }

      console.log('[generate-consent-pdf] Email sent successfully');

      return new Response(
        JSON.stringify({ success: true, message: "Consent form emailed successfully" }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Return HTML for download/preview
    return new Response(
      JSON.stringify({ 
        success: true, 
        html: htmlContent,
        patientName: patient.full_name,
        signatureDate 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[generate-consent-pdf] Error:', errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});