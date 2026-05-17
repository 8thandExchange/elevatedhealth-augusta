import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface LabCorpRequisitionRequest {
  patientName: string;
  patientDob?: string;
  gender: string;
  panelType: "mens_safety" | "thyroid" | "safety_cmp";
  reason: string;
  providerName?: string;
  providerCredentials?: string;
}

const PANEL_DETAILS: Record<string, {
  title: string;
  tests: { code: string; name: string; reason: string }[];
  icd10: string;
  instructions: string;
}> = {
  mens_safety: {
    title: "Men's Safety Panel",
    tests: [
      { code: "PSA", name: "Prostate-Specific Antigen", reason: "Prostate health baseline" },
      { code: "CBC", name: "Complete Blood Count", reason: "Red blood cell monitoring" },
      { code: "CMP", name: "Comprehensive Metabolic Panel", reason: "Liver/kidney function" },
    ],
    icd10: "E29.1",
    instructions: "Fasting recommended. Draw in morning before 10am for accurate hormone levels.",
  },
  thyroid: {
    title: "Thyroid Panel",
    tests: [
      { code: "TSH", name: "Thyroid Stimulating Hormone", reason: "Thyroid function" },
      { code: "Free T3", name: "Triiodothyronine, Free", reason: "Active thyroid hormone" },
      { code: "Free T4", name: "Thyroxine, Free", reason: "Thyroid hormone production" },
    ],
    icd10: "E03.9",
    instructions: "No fasting required. Can be drawn any time of day.",
  },
  safety_cmp: {
    title: "Safety Panel (CMP)",
    tests: [
      { code: "CMP", name: "Comprehensive Metabolic Panel", reason: "Liver/kidney function monitoring" },
      { code: "GFR", name: "Glomerular Filtration Rate", reason: "Kidney function estimation" },
    ],
    icd10: "Z13.89",
    instructions: "Fasting 8-12 hours recommended for accurate glucose and lipid results.",
  },
};

const handler = async (req: Request): Promise<Response> => {
  console.log("LabCorp requisition email request received");

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { patientName, patientDob, gender, panelType, reason, providerName, providerCredentials }: LabCorpRequisitionRequest = await req.json();
    
    const displayProviderName = providerName || "Provider";
    const displayProviderCredentials = providerCredentials || "NP-C";
    
    console.log(`Processing requisition for patient: ${patientName}, panel: ${panelType}, provider: ${displayProviderName}`);

    const panel = PANEL_DETAILS[panelType];
    if (!panel) {
      throw new Error(`Unknown panel type: ${panelType}`);
    }

    const today = new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const testsHtml = panel.tests.map(t => `
      <tr>
        <td style="border: 1px solid #ddd; padding: 10px;"><strong>${t.code}</strong></td>
        <td style="border: 1px solid #ddd; padding: 10px;">${t.name}</td>
        <td style="border: 1px solid #ddd; padding: 10px;">${t.reason}</td>
      </tr>
    `).join("");

    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; max-width: 700px; margin: 0 auto; padding: 20px; }
          .header { border-bottom: 2px solid #2C3E50; padding-bottom: 15px; margin-bottom: 20px; }
          .logo { font-size: 22px; font-weight: bold; color: #2C3E50; }
          .subtitle { color: #666; font-size: 12px; }
          .alert { background: #FEF3C7; border-left: 4px solid #F59E0B; padding: 15px; margin-bottom: 20px; }
          .section { margin-bottom: 20px; }
          .section-title { font-weight: bold; color: #2C3E50; margin-bottom: 10px; border-bottom: 1px solid #ddd; padding-bottom: 5px; }
          table { width: 100%; border-collapse: collapse; }
          th { background: #f5f5f5; border: 1px solid #ddd; padding: 10px; text-align: left; }
          .instructions { background: #f9f9f9; padding: 15px; border-radius: 5px; margin-top: 20px; }
          .signature-area { margin-top: 30px; padding: 20px; background: #FFFBEB; border: 1px dashed #F59E0B; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="logo">Elevated Health Augusta</div>
          <div class="subtitle">7013 Evans Town Center Blvd, Suite 203 | Evans, GA 30809 | (706) 760-3470</div>
        </div>

        <div class="alert">
          <strong>⚠️ LabCorp Requisition Needed</strong><br/>
          A patient requires a LabCorp in-office blood draw (requisition below).
        </div>

        <h2 style="color: #2C3E50; margin-top: 0;">LabCorp Laboratory Requisition</h2>
        <p style="color: #666;">Date Generated: ${today}</p>

        <div class="section">
          <div class="section-title">Patient Information</div>
          <p><strong>Patient Name:</strong> ${patientName}</p>
          <p><strong>Date of Birth:</strong> ${patientDob || "Not provided"}</p>
          <p><strong>Gender:</strong> ${gender === "male" ? "Male" : "Female"}</p>
        </div>

        <div class="section">
          <div class="section-title">${panel.title}</div>
          <p><strong>ICD-10 Code:</strong> ${panel.icd10}</p>
          <p><strong>Clinical Reason:</strong> ${reason}</p>
          
          <table>
            <thead>
              <tr>
                <th>Test Code</th>
                <th>Test Name</th>
                <th>Clinical Indication</th>
              </tr>
            </thead>
            <tbody>
              ${testsHtml}
            </tbody>
          </table>
        </div>

        <div class="instructions">
          <strong>Patient Instructions:</strong><br/>
          ${panel.instructions}
        </div>

        <div class="signature-area">
          <p style="margin: 0 0 20px 0; font-weight: bold;">Provider Authorization</p>
          <p style="border-bottom: 1px solid #000; width: 300px; height: 30px;"></p>
          <p style="font-size: 12px; color: #666;">Provider Signature / Date</p>
          <p style="margin-top: 15px; font-size: 13px;">
            <strong>Ordering Provider:</strong> ${displayProviderName}, ${displayProviderCredentials}<br/>
            <strong>NPI:</strong> _______________<br/>
            <strong>License:</strong> Georgia NP License
          </p>
        </div>

        <p style="margin-top: 30px; font-size: 11px; color: #666; text-align: center;">
          This requisition is valid for 90 days from the date of issue.<br/>
          Patient should present this form at any LabCorp Patient Service Center.
        </p>
      </body>
      </html>
    `;

    // Send email via Resend

    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Elevated Health Augusta <care@stripe.elevatedhealthaugusta.com>",
        to: ["booking@elevatedhealthaugusta.com"],
        subject: `LabCorp Requisition Required - ${patientName} (${panel.title})`,
        html: emailHtml,
      }),
    });

    if (!emailResponse.ok) {
      const errorText = await emailResponse.text();
      throw new Error(`Resend API error (${emailResponse.status}): ${errorText}`);
    }

    console.log("LabCorp requisition email sent successfully via Resend");

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error sending LabCorp requisition email:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);