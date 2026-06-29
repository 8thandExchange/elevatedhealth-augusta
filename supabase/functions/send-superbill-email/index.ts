import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { MAIL_FROM } from "../_shared/mail-config.ts";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SuperbillEmailRequest {
  patientEmail: string;
  patientName: string;
  dateOfService: string;
  patientDob: string;
  patientAddress: string;
  diagnoses: Array<{ code: string; description: string }>;
  cptCodes: Array<{ code: string; description: string; quantity: number; charge: number }>;
  totalCharge: number;
  clinicSettings: {
    legalName: string;
    taxId: string;
    npi: string;
    address: string;
    phone: string;
  };
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const data: SuperbillEmailRequest = await req.json();
    console.log("Sending superbill email to:", data.patientEmail);

    const diagnosisRows = data.diagnoses
      .map((d) => `<span style="background: #e3f2fd; color: #1565c0; padding: 6px 12px; border-radius: 4px; font-size: 12px; margin-right: 8px;"><strong>${d.code}</strong> - ${d.description}</span>`)
      .join("");

    const cptRows = data.cptCodes
      .map(
        (c) => `
        <tr>
          <td style="border: 1px solid #ddd; padding: 10px;"><strong>${c.code}</strong></td>
          <td style="border: 1px solid #ddd; padding: 10px;">${c.description}</td>
          <td style="border: 1px solid #ddd; padding: 10px; text-align: center;">${c.quantity}</td>
          <td style="border: 1px solid #ddd; padding: 10px; text-align: right;">$${c.charge.toFixed(2)}</td>
        </tr>
      `
      )
      .join("");

    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Superbill - ${data.patientName}</title>
      </head>
      <body style="font-family: Arial, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; font-size: 14px; color: #333;">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 3px solid #2C3E50; padding-bottom: 20px; margin-bottom: 25px;">
          <div>
            <div style="font-size: 24px; font-weight: bold; color: #2C3E50;">ELEVATED HEALTH</div>
            <div style="font-size: 12px; color: #666; margin-top: 4px;">Medical Wellness & Optimization</div>
            <div style="font-size: 12px; color: #666; margin-top: 8px;">${data.clinicSettings.address}</div>
            <div style="font-size: 12px; color: #666;">${data.clinicSettings.phone}</div>
          </div>
          <div style="text-align: right; font-size: 12px; color: #444;">
            <p style="margin: 2px 0;"><strong>SUPERBILL</strong></p>
            <p style="margin: 2px 0;">Tax ID (EIN): ${data.clinicSettings.taxId || "_______________"}</p>
            <p style="margin: 2px 0;">NPI: ${data.clinicSettings.npi || "_______________"}</p>
            <p style="margin: 2px 0;">Legal Entity: ${data.clinicSettings.legalName || "_______________"}</p>
          </div>
        </div>

        <div style="margin-bottom: 25px;">
          <div style="font-weight: bold; font-size: 14px; color: #2C3E50; background: #f5f5f5; padding: 8px 12px; margin-bottom: 12px; border-left: 4px solid #2C3E50;">PATIENT INFORMATION</div>
          <table style="width: 100%;">
            <tr>
              <td style="width: 50%; vertical-align: top;">
                <div style="margin-bottom: 8px;">
                  <div style="font-size: 11px; color: #666; text-transform: uppercase;">Patient Name</div>
                  <div style="font-size: 14px; font-weight: 500; padding: 4px 0; border-bottom: 1px solid #ddd;">${data.patientName}</div>
                </div>
                <div style="margin-bottom: 8px;">
                  <div style="font-size: 11px; color: #666; text-transform: uppercase;">Date of Birth</div>
                  <div style="font-size: 14px; font-weight: 500; padding: 4px 0; border-bottom: 1px solid #ddd;">${data.patientDob}</div>
                </div>
              </td>
              <td style="width: 50%; vertical-align: top;">
                <div style="margin-bottom: 8px;">
                  <div style="font-size: 11px; color: #666; text-transform: uppercase;">Address</div>
                  <div style="font-size: 14px; font-weight: 500; padding: 4px 0; border-bottom: 1px solid #ddd;">${data.patientAddress}</div>
                </div>
                <div style="margin-bottom: 8px;">
                  <div style="font-size: 11px; color: #666; text-transform: uppercase;">Date of Service</div>
                  <div style="font-size: 14px; font-weight: 500; padding: 4px 0; border-bottom: 1px solid #ddd;">${data.dateOfService}</div>
                </div>
              </td>
            </tr>
          </table>
        </div>

        <div style="margin-bottom: 25px;">
          <div style="font-weight: bold; font-size: 14px; color: #2C3E50; background: #f5f5f5; padding: 8px 12px; margin-bottom: 12px; border-left: 4px solid #2C3E50;">DIAGNOSIS CODES (ICD-10)</div>
          <div style="margin-top: 8px;">
            ${diagnosisRows}
          </div>
        </div>

        <div style="margin-bottom: 25px;">
          <div style="font-weight: bold; font-size: 14px; color: #2C3E50; background: #f5f5f5; padding: 8px 12px; margin-bottom: 12px; border-left: 4px solid #2C3E50;">SERVICES RENDERED (CPT CODES)</div>
          <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
            <thead>
              <tr>
                <th style="border: 1px solid #ddd; padding: 10px; background: #f9f9f9; text-align: left; width: 100px;">CPT Code</th>
                <th style="border: 1px solid #ddd; padding: 10px; background: #f9f9f9; text-align: left;">Description</th>
                <th style="border: 1px solid #ddd; padding: 10px; background: #f9f9f9; text-align: center; width: 60px;">Qty</th>
                <th style="border: 1px solid #ddd; padding: 10px; background: #f9f9f9; text-align: right; width: 100px;">Charge</th>
              </tr>
            </thead>
            <tbody>
              ${cptRows}
              <tr style="background: #f5f5f5; font-weight: bold;">
                <td colspan="3" style="border: 1px solid #ddd; padding: 10px; text-align: right;"><strong>TOTAL CHARGE:</strong></td>
                <td style="border: 1px solid #ddd; padding: 10px; text-align: right;"><strong>$${data.totalCharge.toFixed(2)}</strong></td>
              </tr>
            </tbody>
          </table>
        </div>

        <div style="margin-top: 40px; padding-top: 20px; border-top: 2px solid #ddd;">
          <div style="font-weight: bold; font-size: 14px; color: #2C3E50; background: #f5f5f5; padding: 8px 12px; margin-bottom: 12px; border-left: 4px solid #2C3E50;">PROVIDER CERTIFICATION</div>
          <p style="font-size: 12px; color: #444; line-height: 1.6;">
            I certify that the services listed above were medically necessary and were personally furnished by me or were furnished incident to my professional service.
          </p>
          <div style="margin-top: 30px;">
            <div style="font-size: 12px;">
              <strong>${data.providerName || 'Provider'}, ${data.providerCredentials || ''}</strong><br/>
              NPI: ${data.clinicSettings.npi}
            </div>
          </div>
        </div>

        <div style="text-align: center; color: #999; font-size: 11px; margin-top: 30px; font-style: italic;">
          This document is a Superbill for insurance reimbursement purposes. Provider signature on file.<br/>
          Generated by Elevated Health Augusta | HIPAA Compliant
        </div>
      </body>
      </html>
    `;

    const emailResponse = await resend.emails.send({
      from: MAIL_FROM,
      to: [data.patientEmail],
      subject: `Your Superbill from Elevated Health Augusta - ${data.dateOfService}`,
      html: emailHtml,
    });

    console.log("Superbill email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, id: emailResponse.data?.id }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error sending superbill email:", error);
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