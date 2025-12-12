import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface FaxRequest {
  patient_id: string;
  medication_name: string;
  medication_strength: string;
  medication_sig: string;
  quantity: number;
  refills: number;
  supply_days: number;
  provider_email: string;
  provider_notes?: string;
}

// Provider NPI mapping based on email
const PROVIDER_MAP: Record<string, { name: string; credentials: string; npiKey: string }> = {
  "lauren": { name: "Lauren Bursey", credentials: "FNP-C", npiKey: "provider_npi_lauren_bursey" },
  "troy": { name: "Troy Akers", credentials: "DO", npiKey: "provider_npi_troy_akers" },
  "michael": { name: "Michael Bursey", credentials: "DO", npiKey: "provider_npi_michael_bursey" },
  "dennis": { name: "Dennis Williams", credentials: "MD", npiKey: "provider_npi_dennis_williams" },
};

function getProviderFromEmail(email: string): { name: string; credentials: string; npiKey: string } | null {
  const emailLower = email.toLowerCase();
  for (const [key, value] of Object.entries(PROVIDER_MAP)) {
    if (emailLower.includes(key)) {
      return value;
    }
  }
  // Default to Lauren if no match
  return PROVIDER_MAP["lauren"];
}

function generatePrescriptionHtml(
  patient: any,
  medication: { name: string; strength: string; sig: string },
  quantity: number,
  refills: number,
  supplyDays: number,
  provider: { name: string; credentials: string; npi: string },
  providerNotes?: string
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
    .signature-name { font-size: 14px; font-weight: bold; }
    .electronic-sig { font-size: 11px; color: #888; font-style: italic; margin-top: 10px; }
    .footer { margin-top: 30px; text-align: center; font-size: 10px; color: #999; border-top: 1px solid #eee; padding-top: 15px; }
  </style>
</head>
<body>
  <div class="header">
    <h1>ELEVATED HEALTH AUGUSTA</h1>
    <p>7013 Evans Town Center Blvd, Suite 203, Evans, GA 30809</p>
    <p>Phone: (706) 760-3470 | Fax: (706) 993-3772</p>
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
    <div class="signature-line"></div>
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

  try {
    const SINCH_ACCESS_KEY = Deno.env.get("SINCH_ACCESS_KEY");
    const SINCH_SECRET_KEY = Deno.env.get("SINCH_SECRET_KEY");
    const HOLGATE_FAX_NUMBER = Deno.env.get("HOLGATE_FAX_NUMBER") || "+17069933772";
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    if (!SINCH_ACCESS_KEY || !SINCH_SECRET_KEY) {
      throw new Error("Sinch API credentials not configured");
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const body: FaxRequest = await req.json();
    const { 
      patient_id, 
      medication_name, 
      medication_strength, 
      medication_sig, 
      quantity, 
      refills, 
      supply_days, 
      provider_email,
      provider_notes 
    } = body;

    console.log("Processing fax request for patient:", patient_id);

    // Fetch patient data
    const { data: patient, error: patientError } = await supabase
      .from("patients")
      .select("full_name, dob, street_address, city, state, zip_code, allergies")
      .eq("id", patient_id)
      .single();

    if (patientError || !patient) {
      throw new Error(`Failed to fetch patient: ${patientError?.message}`);
    }

    // Get provider info from email
    const providerInfo = getProviderFromEmail(provider_email);
    if (!providerInfo) {
      throw new Error("Could not determine provider from email");
    }

    // Fetch provider NPI from clinic_settings
    const { data: npiSetting } = await supabase
      .from("clinic_settings")
      .select("value")
      .eq("key", providerInfo.npiKey)
      .single();

    const providerNpi = npiSetting?.value || "1578971552"; // Default to Lauren's NPI

    // Generate the prescription HTML
    const prescriptionHtml = generatePrescriptionHtml(
      patient,
      { name: medication_name, strength: medication_strength, sig: medication_sig },
      quantity,
      refills,
      supply_days,
      { name: providerInfo.name, credentials: providerInfo.credentials, npi: providerNpi },
      provider_notes
    );

    // Convert HTML to base64 for Sinch API
    const htmlBase64 = btoa(unescape(encodeURIComponent(prescriptionHtml)));

    // Send fax via Sinch API
    const sinchAuth = btoa(`${SINCH_ACCESS_KEY}:${SINCH_SECRET_KEY}`);
    
    console.log("Sending fax to:", HOLGATE_FAX_NUMBER);

    const faxResponse = await fetch("https://fax.api.sinch.com/v3/faxes", {
      method: "POST",
      headers: {
        "Authorization": `Basic ${sinchAuth}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        to: HOLGATE_FAX_NUMBER,
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
          provider: providerInfo.name,
        },
        fax_id: faxId,
        fax_status: "queued",
        fax_sent_at: new Date().toISOString(),
        fax_destination: HOLGATE_FAX_NUMBER,
      })
      .select()
      .single();

    if (orderError) {
      console.error("Error creating order record:", orderError);
    }

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
