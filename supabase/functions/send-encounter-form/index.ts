import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { MAIL_FROM } from "../_shared/mail-config.ts";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface CPTCode {
  code: string;
  description: string;
  quantity: number;
  charge: number;
}

interface EncounterFormRequest {
  patientName: string;
  patientDob: string | null;
  patientPhone: string | null;
  dateOfService: string;
  serviceType: string;
  insuranceType: string;
  cptCodes: CPTCode[];
  totalCharges: number;
  paymentAmount: number | null;
  paymentMethod: string | null;
  checkNumber: string | null;
  followUpDate: string | null;
  notes: string | null;
  providerEmail: string | null;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      throw new Error("RESEND_API_KEY is not configured");
    }

    const resend = new Resend(resendApiKey);
    const data: EncounterFormRequest = await req.json();

    // Office Manager email - Kristen Covington
    const officeManagerEmail = "kcovington@pmrehab.net";
    const ccEmails = data.providerEmail ? [data.providerEmail] : [];

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 700px; margin: 0 auto; }
          .header { background: linear-gradient(135deg, #2C3E50, #34495E); color: white; padding: 25px; text-align: center; }
          .header h1 { margin: 0; font-size: 24px; }
          .header p { margin: 5px 0 0; opacity: 0.9; }
          .content { padding: 25px; background: #fff; }
          .section { margin-bottom: 25px; padding-bottom: 20px; border-bottom: 1px solid #eee; }
          .section:last-child { border-bottom: none; }
          .section-title { font-weight: bold; font-size: 16px; color: #2C3E50; margin-bottom: 15px; padding-bottom: 8px; border-bottom: 2px solid #3498db; }
          .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
          .field { margin-bottom: 10px; }
          .field-label { font-size: 11px; text-transform: uppercase; color: #666; margin-bottom: 3px; }
          .field-value { font-size: 14px; font-weight: 500; }
          table { width: 100%; border-collapse: collapse; }
          th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
          th { background: #f5f5f5; font-weight: 600; }
          .total-row { background: #f0f7ff; font-weight: bold; }
          .badge { display: inline-block; padding: 4px 10px; border-radius: 4px; font-size: 12px; font-weight: 600; }
          .badge-service { background: #e3f2fd; color: #1565c0; }
          .badge-insurance { background: #f3e5f5; color: #7b1fa2; }
          .badge-payment { background: #e8f5e9; color: #2e7d32; }
          .payment-box { background: #f5f5f5; padding: 15px; border-radius: 8px; margin-top: 15px; }
          .footer { background: #f9f9f9; padding: 20px; text-align: center; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>ELEVATED HEALTH ENCOUNTER FORM</h1>
          <p>Clinical Billing Documentation</p>
        </div>
        
        <div class="content">
          <div class="section">
            <div class="section-title">PATIENT INFORMATION</div>
            <div class="grid">
              <div class="field">
                <div class="field-label">Patient Name</div>
                <div class="field-value">${data.patientName}</div>
              </div>
              <div class="field">
                <div class="field-label">Date of Birth</div>
                <div class="field-value">${data.patientDob || "Not provided"}</div>
              </div>
              <div class="field">
                <div class="field-label">Phone</div>
                <div class="field-value">${data.patientPhone || "Not provided"}</div>
              </div>
              <div class="field">
                <div class="field-label">Date of Service</div>
                <div class="field-value">${data.dateOfService}</div>
              </div>
            </div>
          </div>

          <div class="section">
            <div class="section-title">SERVICE DETAILS</div>
            <div class="grid">
              <div class="field">
                <div class="field-label">Service Type</div>
                <div class="field-value">
                  <span class="badge badge-service">${data.serviceType}</span>
                </div>
              </div>
              <div class="field">
                <div class="field-label">Insurance Type</div>
                <div class="field-value">
                  <span class="badge badge-insurance">${data.insuranceType}</span>
                </div>
              </div>
            </div>
          </div>

          <div class="section">
            <div class="section-title">CPT CODES & CHARGES</div>
            <table>
              <thead>
                <tr>
                  <th style="width: 100px;">CPT Code</th>
                  <th>Description</th>
                  <th style="width: 60px;">Qty</th>
                  <th style="width: 100px;">Charge</th>
                </tr>
              </thead>
              <tbody>
                ${data.cptCodes.map(code => `
                  <tr>
                    <td><strong>${code.code}</strong></td>
                    <td>${code.description}</td>
                    <td>${code.quantity}</td>
                    <td>$${(code.charge || 0).toFixed(2)}</td>
                  </tr>
                `).join("")}
                <tr class="total-row">
                  <td colspan="3" style="text-align: right;">TOTAL CHARGES:</td>
                  <td><strong>$${data.totalCharges.toFixed(2)}</strong></td>
                </tr>
              </tbody>
            </table>
          </div>

          ${data.paymentAmount || data.paymentMethod ? `
            <div class="section">
              <div class="section-title">PAYMENT COLLECTED</div>
              <div class="payment-box">
                <div class="grid">
                  <div class="field">
                    <div class="field-label">Amount Collected</div>
                    <div class="field-value">
                      <span class="badge badge-payment">$${data.paymentAmount?.toFixed(2) || "0.00"}</span>
                    </div>
                  </div>
                  <div class="field">
                    <div class="field-label">Payment Method</div>
                    <div class="field-value">${data.paymentMethod || "Not specified"}</div>
                  </div>
                  ${data.checkNumber ? `
                    <div class="field">
                      <div class="field-label">Check Number</div>
                      <div class="field-value">${data.checkNumber}</div>
                    </div>
                  ` : ""}
                </div>
              </div>
            </div>
          ` : ""}

          ${data.followUpDate ? `
            <div class="section">
              <div class="section-title">FOLLOW-UP APPOINTMENT</div>
              <div class="field">
                <div class="field-value">${data.followUpDate}</div>
              </div>
            </div>
          ` : ""}

          ${data.notes ? `
            <div class="section">
              <div class="section-title">NOTES</div>
              <div class="field">
                <div class="field-value">${data.notes}</div>
              </div>
            </div>
          ` : ""}
        </div>

        <div class="footer">
          <p>Elevated Health Augusta | 7013 Evans Town Center Blvd, Suite 203 | Evans, GA 30809</p>
          <p>This encounter form was submitted electronically on ${new Date().toLocaleString("en-US", { timeZone: "America/New_York" })}</p>
          ${data.providerEmail ? `<p>Submitted by: ${data.providerEmail}</p>` : ""}
        </div>
      </body>
      </html>
    `;

    const emailResponse = await resend.emails.send({
      from: MAIL_FROM,
      to: [officeManagerEmail],
      cc: ccEmails,
      subject: `Encounter Form: ${data.patientName} - ${data.serviceType} (${data.dateOfService})`,
      html,
    });

    console.log("Encounter form email sent:", emailResponse);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Error sending encounter form:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
};

serve(handler);