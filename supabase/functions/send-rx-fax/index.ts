/**
 * send-rx-fax
 *
 * Faxes a prescription to the FCC compounding pharmacy via Sinch and writes
 * an `orders` row + a `communication_logs` row.
 *
 * AUTH POSTURE (security audit R-5, 2026-05-08):
 *   - verify_jwt = true in supabase/config.toml
 *   - Caller MUST present a valid Supabase JWT
 *   - Caller MUST have role = 'staff' OR role = 'admin'
 *   - Anonymous or patient-role callers are rejected with 401
 *
 * Background: prior to this change anyone who could reach the function URL
 * (no JWT required) could trigger a real Rx fax to FCC for any patient_id,
 * exfiltrating PHI to FCC and creating fake orders. This is the most
 * severe finding in the audit. The role check below is the launch-blocking
 * fix.
 */
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://deno.land/x/zod@v3.23.8/mod.ts";

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

// TODO(inventory): Once Caroline confirms the FCC fax → received flow, log
// each successfully sent fax as an "expected lot" record so receiving in the
// Inventory Dashboard can be one-click matched against an outstanding
// expectation (lot_number + expiration_date confirmed at receipt). For now
// faxes do not touch inventory_*; receiving is fully manual via
// /inventory → "Receive Shipment".

// Input validation schema for prescription fax requests
const faxRequestSchema = z.object({
  patient_id: z.string().uuid("Invalid patient ID format"),
  medication_name: z.string().min(1).max(200, "Medication name too long"),
  medication_strength: z.string().min(1).max(100, "Medication strength too long"),
  medication_sig: z.string().min(1).max(500, "Sig instructions too long"),
  quantity: z.number().int().positive().max(999, "Invalid quantity"),
  refills: z.number().int().min(0).max(12, "Invalid refill count"),
  supply_days: z.number().int().positive().max(365, "Invalid supply days"),
  provider_name: z.string().min(1).max(100, "Provider name too long"),
  provider_credentials: z.string().min(1).max(50, "Provider credentials too long"),
  provider_npi: z.string().regex(/^\d{10}$/, "Invalid NPI format - must be 10 digits"),
  provider_notes: z.string().max(1000, "Provider notes too long").optional(),
  diagnosis_code: z.string().max(20).optional(),
  diagnosis_description: z.string().max(200).optional(),
  provider_signature_url: z.string().url().max(500).optional(),
  pharmacy_id: z.string().uuid().optional(),
  /** Optional override; normalized to E.164. When omitted, uses pharmacy / default resolution. */
  fax_to: z.string().max(40).optional(),
});

type FaxRequest = z.infer<typeof faxRequestSchema>;

function normalizeFaxDestination(raw: string | undefined, fallback: string): string {
  if (!raw || !raw.trim()) return fallback;
  const digits = raw.replace(/\D/g, "");
  if (digits.length === 11 && digits.startsWith("1")) return `+${digits}`;
  if (digits.length === 10) return `+1${digits}`;
  return fallback;
}

function generatePrescriptionHtml(
  patient: any,
  medication: { name: string; strength: string; sig: string },
  quantity: number,
  refills: number,
  supplyDays: number,
  provider: { name: string; credentials: string; npi: string; signatureUrl?: string },
  providerNotes?: string,
  diagnosis?: { code: string; description: string }
): string {
  const today = new Date().toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
  const timestamp = new Date().toLocaleString('en-US', { 
    timeZone: 'America/New_York',
    dateStyle: 'short',
    timeStyle: 'short'
  });

  const patientAddress = [
    patient.street_address,
    patient.city,
    patient.state,
    patient.zip_code
  ].filter(Boolean).join(', ') || 'Address on file';

  const patientDob = patient.dob 
    ? new Date(patient.dob).toLocaleDateString('en-US') 
    : 'DOB on file';

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Georgia, 'Times New Roman', serif; max-width: 650px; margin: 0 auto; padding: 40px; color: #2C3E50; }
    .header { text-align: center; border-bottom: 3px solid #C5A059; padding-bottom: 20px; margin-bottom: 25px; }
    .header h1 { margin: 0; font-size: 24px; letter-spacing: 2px; color: #1a3a4a; }
    .header p { margin: 5px 0; font-size: 12px; color: #666; }
    .provider-info { margin: 20px 0; padding: 15px; background: #f9f9f7; border-left: 4px solid #C5A059; }
    .provider-info p { margin: 5px 0; font-size: 14px; }
    .patient-info { border: 1px solid #ddd; padding: 15px; margin: 20px 0; border-radius: 4px; }
    .patient-info h3 { margin: 0 0 10px 0; font-size: 14px; color: #C5A059; text-transform: uppercase; letter-spacing: 1px; }
    .patient-info p { margin: 5px 0; font-size: 14px; }
    .rx-section { margin: 30px 0; padding: 25px; background: linear-gradient(135deg, #f9f9f7 0%, #fff 100%); border: 2px solid #C5A059; border-radius: 8px; }
    .rx-symbol { font-size: 36px; color: #C5A059; margin-bottom: 15px; }
    .rx-details { font-size: 16px; line-height: 1.8; }
    .rx-details strong { color: #1a3a4a; }
    .notes { margin: 20px 0; padding: 15px; background: #fff8e7; border: 1px dashed #C5A059; font-style: italic; }
    .signature-section { margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; }
    .signature-line { border-bottom: 1px solid #000; width: 300px; height: 40px; margin-bottom: 5px; }
    .signature-image { max-height: 60px; max-width: 280px; object-fit: contain; margin-bottom: 5px; }
    .signature-name { font-size: 14px; font-weight: bold; }
    .electronic-sig { font-size: 11px; color: #888; font-style: italic; margin-top: 10px; }
    .footer { margin-top: 30px; text-align: center; font-size: 10px; color: #999; border-top: 1px solid #eee; padding-top: 15px; }
  </style>
</head>
<body>
  <div class="header">
    <h1>ELEVATED HEALTH AUGUSTA</h1>
    <p>7013 Evans Town Center Blvd, Suite 203, Evans, GA 30809</p>
    <p>Phone: (706) 760-3470</p>
  </div>

  <div class="provider-info">
    <p><strong>Prescriber:</strong> ${provider.name}, ${provider.credentials}</p>
    <p><strong>NPI:</strong> ${provider.npi}</p>
    <p><strong>Date:</strong> ${today}</p>
  </div>

  <div class="patient-info">
    <h3>Patient Information</h3>
    <p><strong>Name:</strong> ${patient.full_name}</p>
    <p><strong>DOB:</strong> ${patientDob}</p>
    <p><strong>Address:</strong> ${patientAddress}</p>
    <p><strong>Allergies:</strong> ${patient.allergies || 'NKDA'}</p>
  </div>

  ${diagnosis ? `
  <div class="indication-section" style="margin: 20px 0; padding: 15px; background: #e8f4e8; border: 2px solid #4a7c59; border-radius: 8px;">
    <h3 style="margin: 0 0 10px 0; font-size: 14px; color: #4a7c59; text-transform: uppercase; letter-spacing: 1px;">Clinical Indication</h3>
    <p style="margin: 5px 0; font-size: 16px; font-weight: bold;"><strong>ICD-10:</strong> ${diagnosis.code}</p>
    <p style="margin: 5px 0; font-size: 14px;"><strong>Diagnosis:</strong> ${diagnosis.description}</p>
  </div>
  ` : ''}

  <div class="rx-section">
    <div class="rx-symbol">℞</div>
    <div class="rx-details">
      <p><strong>${medication.name}</strong></p>
      <p><strong>Strength:</strong> ${medication.strength}</p>
      <p><strong>Sig:</strong> ${medication.sig}</p>
      <p><strong>Quantity:</strong> ${supplyDays}-day supply (${quantity} units)</p>
      <p><strong>Refills:</strong> ${refills}</p>
    </div>
  </div>

  ${providerNotes ? `
  <div class="notes">
    <strong>Provider Notes:</strong> ${providerNotes}
  </div>
  ` : ''}

  <div class="signature-section">
    ${provider.signatureUrl 
      ? `<img src="${provider.signatureUrl}" alt="Provider Signature" class="signature-image" />`
      : `<div class="signature-line"></div>`
    }
    <p class="signature-name">${provider.name}, ${provider.credentials}</p>
    <p class="electronic-sig">Electronically signed at ${timestamp} EST</p>
  </div>

  <div class="footer">
    <p>This prescription was transmitted electronically via secure fax.</p>
    <p>For questions, contact Elevated Health Augusta at (706) 760-3470</p>
  </div>
</body>
</html>
  `;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const authResult = await requireStaffOrAdmin(req);
  if (!authResult.ok) {
    return new Response(
      JSON.stringify({ success: false, error: authResult.error }),
      { status: authResult.status, headers: { "Content-Type": "application/json", ...corsHeaders } },
    );
  }

  try {
    const SINCH_ACCESS_KEY = Deno.env.get("SINCH_ACCESS_KEY");
    const SINCH_SECRET_KEY = Deno.env.get("SINCH_SECRET_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    if (!SINCH_ACCESS_KEY || !SINCH_SECRET_KEY) {
      throw new Error("Sinch API credentials not configured");
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const rawBody = await req.json();
    
    // Validate input against schema
    const validationResult = faxRequestSchema.safeParse(rawBody);
    if (!validationResult.success) {
      console.error("Fax request validation error:", validationResult.error.errors);
      return new Response(
        JSON.stringify({ success: false, error: "Invalid request format: " + validationResult.error.errors[0]?.message }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }
    
    const { 
      patient_id, 
      medication_name, 
      medication_strength, 
      medication_sig, 
      quantity, 
      refills, 
      supply_days, 
      provider_name,
      provider_credentials,
      provider_npi,
      provider_notes,
      diagnosis_code,
      diagnosis_description,
      provider_signature_url,
      pharmacy_id,
      fax_to,
    } = validationResult.data;

    // Resolve destination pharmacy
    let destinationFax: string;
    let pharmacyName: string;
    let resolvedPharmacyId: string | null = null;

    if (pharmacy_id) {
      const { data: pharmacy, error: pharmErr } = await supabase
        .from("pharmacies")
        .select("id, name, fax_number, fulfillment_method, is_active")
        .eq("id", pharmacy_id)
        .single();

      if (pharmErr || !pharmacy) {
        return new Response(
          JSON.stringify({ error: "Pharmacy not found", pharmacy_id }),
          { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (!pharmacy.is_active) {
        return new Response(
          JSON.stringify({ error: `Pharmacy ${pharmacy.name} is inactive` }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (pharmacy.fulfillment_method !== "fax") {
        return new Response(
          JSON.stringify({
            error: `Pharmacy ${pharmacy.name} uses ${pharmacy.fulfillment_method}, not fax. Use the portal submission flow instead.`,
            fulfillment_method: pharmacy.fulfillment_method,
          }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (!pharmacy.fax_number) {
        return new Response(
          JSON.stringify({ error: `Pharmacy ${pharmacy.name} has no fax number configured` }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      destinationFax = pharmacy.fax_number;
      pharmacyName = pharmacy.name;
      resolvedPharmacyId = pharmacy.id;
    } else {
      const { data: defaultPharmacy } = await supabase
        .from("pharmacies")
        .select("id, name, fax_number")
        .eq("slug", "custom-pharmacy-evans")
        .eq("is_active", true)
        .single();

      if (defaultPharmacy?.fax_number) {
        destinationFax = defaultPharmacy.fax_number;
        pharmacyName = defaultPharmacy.name;
        resolvedPharmacyId = defaultPharmacy.id;
      } else {
        destinationFax = Deno.env.get("HOLGATE_FAX_NUMBER") || "+17069933772";
        pharmacyName = "Custom Pharmacy of Evans (env fallback)";
        resolvedPharmacyId = null;
      }
    }
    console.log("Resolved pharmacy:", pharmacyName, "->", destinationFax);

    const faxDestination = normalizeFaxDestination(fax_to, destinationFax);

    console.log("Processing validated fax request for patient:", patient_id);
    console.log("Provider:", provider_name, provider_credentials, "NPI:", provider_npi);

    // Fetch patient data
    const { data: patient, error: patientError } = await supabase
      .from("patients")
      .select("full_name, dob, street_address, city, state, zip_code, allergies")
      .eq("id", patient_id)
      .single();

    if (patientError || !patient) {
      throw new Error(`Failed to fetch patient: ${patientError?.message}`);
    }

    // Generate the prescription HTML using the provider data passed from frontend
    const prescriptionHtml = generatePrescriptionHtml(
      patient,
      { name: medication_name, strength: medication_strength, sig: medication_sig },
      quantity,
      refills,
      supply_days,
      { name: provider_name, credentials: provider_credentials, npi: provider_npi, signatureUrl: provider_signature_url },
      provider_notes,
      diagnosis_code && diagnosis_description ? { code: diagnosis_code, description: diagnosis_description } : undefined
    );

    // Convert HTML to base64 for Sinch API
    const htmlBase64 = btoa(unescape(encodeURIComponent(prescriptionHtml)));

    // Send fax via Sinch API
    const sinchAuth = btoa(`${SINCH_ACCESS_KEY}:${SINCH_SECRET_KEY}`);
    
    console.log("Sending fax to:", faxDestination);

    const faxResponse = await fetch("https://fax.api.sinch.com/v3/faxes", {
      method: "POST",
      headers: {
        "Authorization": `Basic ${sinchAuth}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        to: faxDestination,
        contentUrl: `data:text/html;base64,${htmlBase64}`,
        headerText: "Elevated Health Augusta - Prescription",
      }),
    });

    const faxResult = await faxResponse.json();
    console.log("Sinch API response:", JSON.stringify(faxResult));

    if (!faxResponse.ok) {
      throw new Error(`Sinch API error: ${faxResult.error?.message || JSON.stringify(faxResult)}`);
    }

    const faxId = faxResult.id || faxResult.faxId || `fax_${Date.now()}`;

    // Create order record with fax tracking
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        patient_id,
        status: "sent_to_pharmacy",
        protocol_snapshot: {
          medication_name,
          medication_strength,
          medication_sig,
          quantity,
          refills,
          supply_days,
          provider: provider_name,
          submission_method: "fax",
        },
        fax_id: faxId,
        fax_status: "queued",
        fax_sent_at: new Date().toISOString(),
        fax_destination: faxDestination,
        pharmacy_id: resolvedPharmacyId,
        submission_method: "fax",
      })
      .select()
      .single();

    if (orderError) {
      console.error("Error creating order record:", orderError);
    }

    // Log communication
    await supabase.from("communication_logs").insert({
      patient_id,
      template_key: "rx_fax",
      subject: `Rx Fax: ${medication_name}`,
      body_preview: `${medication_name} ${medication_strength} faxed to pharmacy`,
      delivery_method: "fax",
      status: "sent",
    });

    console.log("Fax sent successfully, ID:", faxId);

    return new Response(
      JSON.stringify({
        success: true,
        fax_id: faxId,
        status: "queued",
        message: "Prescription faxed successfully",
        order_id: order?.id,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in send-rx-fax:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
});
