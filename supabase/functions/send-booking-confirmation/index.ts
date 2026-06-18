import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { edgeStructuredLog } from "../_shared/edge-structured-log.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: unknown) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : "";
  console.log(`[BOOKING-CONFIRM] ${step}${detailsStr}`);
};

function bookingConfirmLog(
  event: string,
  fields: {
    service_label?: string | null;
    success: boolean;
    error_message?: string | null;
    email_sent?: boolean;
    sms_sent?: boolean;
  },
  level: "info" | "error" = "info",
) {
  edgeStructuredLog("send-booking-confirmation", {
    event,
    service_label: fields.service_label ?? null,
    success: fields.success,
    error_message: fields.error_message ?? null,
    email_sent: fields.email_sent ?? null,
    sms_sent: fields.sms_sent ?? null,
  }, level);
}

// Brand tokens — kept in sync with src/index.css and .cursorrules.
// Charcoal #2A2826, Camel #B8956A, Bone #F2EBDC.
const BRAND_CHARCOAL = "#2A2826";
const BRAND_CAMEL = "#B8956A";
const BRAND_BONE = "#F2EBDC";

const CLINIC_NAME = "Elevated Health Augusta";
const CLINIC_ADDRESS = "7013 Evans Town Center Blvd, Suite 203, Evans, GA 30809";
const CLINIC_PHONE = "(706) 760-3470";
const CLINIC_PHONE_RAW = "+17067603470";
const FROM_ADDRESS = "Elevated Health Augusta <noreply@elevatedhealthaugusta.com>";

// Service line → patient-facing pre-visit instructions. Mirrors the lists
// rendered on the in-app confirmation page so email and on-site copy agree.
const PRE_VISIT_INSTRUCTIONS: Record<string, string[]> = {
  iv: [
    "Arrive hydrated and have eaten a light meal beforehand",
    "Wear comfortable clothing with easy arm access",
    "Bring photo ID; allow 45–60 minutes",
  ],
  consult: [
    "Bring photo ID and a list of any current medications",
    "Plan to be on-site about 45 minutes for your wellness assessment",
    "Eat normally beforehand unless your care team told you otherwise",
  ],
  hormone: [
    "Bring photo ID and a list of any current medications",
    "Plan to be on-site about 45 minutes for your wellness assessment",
    "Eat normally beforehand unless your care team told you otherwise",
  ],
  weight_loss: [
    "Bring photo ID and a list of any current medications",
    "Plan to be on-site about 45 minutes for your consultation",
    "Bring recent labs if you already have them",
  ],
  peptide: [
    "Bring photo ID and a list of any current medications",
    "Plan to be on-site about 45 minutes for your consultation",
    "Bring any recent bloodwork or sleep-study results if you have them",
  ],
};

// Format phone number for Sinch (E.164 format)
function formatPhoneNumber(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits.startsWith("1")) return `+${digits}`;
  if (digits.length > 10) return `+${digits}`;
  throw new Error(`Invalid phone number format: ${phone}`);
}

function formatScheduledDate(scheduledAt: string): {
  fullDate: string;
  time: string;
  short: string;
} {
  const d = new Date(scheduledAt);
  const fullDate = d.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "America/New_York",
  });
  const time = d.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: "America/New_York",
  });
  const short = d.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    timeZone: "America/New_York",
  });
  return { fullDate, time, short };
}

interface SendBookingArgs {
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  service_label: string;
  service_line?: string;
  scheduled_at: string;
  duration_minutes: number;
  confirmation_number?: string | null;
}

async function sendSMS(to: string, message: string): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const { sendSms } = await import("../_shared/sms.ts");
  return sendSms(to, message);
}

function buildEmailHtml(args: SendBookingArgs): string {
  const { service_label, service_line, scheduled_at, confirmation_number } = args;
  const { fullDate, time } = formatScheduledDate(scheduled_at);
  const instructions =
    PRE_VISIT_INSTRUCTIONS[service_line || ""] ||
    PRE_VISIT_INSTRUCTIONS.consult;
  const firstName = (args.name || "there").trim().split(/\s+/)[0] || "there";
  const mapUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(CLINIC_ADDRESS)}`;
  const confLine = confirmation_number
    ? `<p style="margin: 0 0 8px; color: ${BRAND_CHARCOAL}99; font-size: 13px; letter-spacing: 0.08em; text-transform: uppercase;">Confirmation #${confirmation_number}</p>`
    : "";

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <body style="margin: 0; padding: 0; background-color: ${BRAND_BONE}; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: ${BRAND_CHARCOAL};">
        <table role="presentation" cellspacing="0" cellpadding="0" width="100%" style="background-color: ${BRAND_BONE};">
          <tr>
            <td align="center" style="padding: 32px 16px;">
              <table role="presentation" cellspacing="0" cellpadding="0" width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 14px; overflow: hidden; box-shadow: 0 6px 24px rgba(42,40,38,0.08);">
                <tr>
                  <td style="background-color: ${BRAND_CHARCOAL}; padding: 40px 32px; text-align: center;">
                    <p style="margin: 0; color: ${BRAND_CAMEL}; font-size: 12px; letter-spacing: 0.2em; text-transform: uppercase;">${CLINIC_NAME}</p>
                    <h1 style="margin: 12px 0 0; color: #ffffff; font-size: 28px; font-weight: 400; font-style: italic; font-family: Georgia, 'Times New Roman', serif;">You're booked.</h1>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 36px 32px 8px;">
                    ${confLine}
                    <h2 style="margin: 0 0 16px; color: ${BRAND_CHARCOAL}; font-size: 22px; font-weight: 400; font-family: Georgia, 'Times New Roman', serif;">${service_label}</h2>
                    <table role="presentation" cellspacing="0" cellpadding="0" width="100%" style="margin: 16px 0 24px; background-color: ${BRAND_BONE}; border-left: 3px solid ${BRAND_CAMEL}; border-radius: 6px;">
                      <tr>
                        <td style="padding: 18px 20px;">
                          <p style="margin: 0 0 4px; color: ${BRAND_CHARCOAL}99; font-size: 12px; letter-spacing: 0.08em; text-transform: uppercase;">When</p>
                          <p style="margin: 0 0 14px; color: ${BRAND_CHARCOAL}; font-size: 16px; font-weight: 600;">${fullDate}<br/>${time}</p>
                          <p style="margin: 0 0 4px; color: ${BRAND_CHARCOAL}99; font-size: 12px; letter-spacing: 0.08em; text-transform: uppercase;">Where</p>
                          <p style="margin: 0; color: ${BRAND_CHARCOAL}; font-size: 15px;">${CLINIC_ADDRESS}<br/><a href="${mapUrl}" style="color: ${BRAND_CAMEL}; text-decoration: none;">Get directions →</a></p>
                        </td>
                      </tr>
                    </table>

                    <p style="margin: 0 0 8px; color: ${BRAND_CHARCOAL}99; font-size: 12px; letter-spacing: 0.08em; text-transform: uppercase;">Before your visit</p>
                    <ul style="margin: 0 0 24px; padding-left: 20px; color: ${BRAND_CHARCOAL}; font-size: 14px; line-height: 1.6;">
                      ${instructions.map((i) => `<li>${i}</li>`).join("")}
                    </ul>

                    <p style="margin: 0 0 8px; color: ${BRAND_CHARCOAL}; font-size: 15px;">Hi ${firstName},</p>
                    <p style="margin: 0 0 24px; color: ${BRAND_CHARCOAL}; font-size: 15px; line-height: 1.6;">We've got you on the calendar. If you need to change anything, just call us at <a href="tel:${CLINIC_PHONE_RAW}" style="color: ${BRAND_CAMEL}; text-decoration: none;">${CLINIC_PHONE}</a>.</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 0 32px 36px;">
                    <table role="presentation" cellspacing="0" cellpadding="0" width="100%">
                      <tr>
                        <td align="center">
                          <a href="tel:${CLINIC_PHONE_RAW}" style="display: inline-block; padding: 12px 28px; background-color: ${BRAND_CHARCOAL}; color: ${BRAND_CAMEL}; text-decoration: none; font-size: 14px; letter-spacing: 0.08em; border-radius: 4px;">Reschedule by phone</a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="background-color: ${BRAND_BONE}; padding: 20px 32px; text-align: center; border-top: 1px solid #e7dfd0;">
                    <p style="margin: 0; color: ${BRAND_CHARCOAL}99; font-size: 12px;">${CLINIC_NAME} · ${CLINIC_ADDRESS} · ${CLINIC_PHONE}</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>`;
}

async function sendEmail(args: SendBookingArgs): Promise<{ success: boolean; error?: string }> {
  const resendApiKey = Deno.env.get("RESEND_API_KEY");

  if (!resendApiKey) {
    logStep("Resend API key not configured - skipping email");
    return { success: false, error: "Resend API key not configured" };
  }

  const { fullDate, time } = formatScheduledDate(args.scheduled_at);
  const subject = `Confirmed: ${args.service_label} · ${fullDate} at ${time}`;

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: FROM_ADDRESS,
        to: [args.email],
        subject,
        html: buildEmailHtml(args),
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      logStep("Resend API error", { status: response.status, result });
      return { success: false, error: result.message || "Failed to send email" };
    }

    logStep("Email sent successfully", { id: result.id });
    return { success: true };
  } catch (error) {
    logStep("Email send error", { error: String(error) });
    return { success: false, error: String(error) };
  }
}

function buildSmsBody(args: SendBookingArgs): string {
  const { short, time } = formatScheduledDate(args.scheduled_at);
  const firstName = (args.name || "").trim().split(/\s+/)[0] || "Hi";
  // Single-segment GSM-7 budget is 160 chars; we aim under 160.
  return (
    `${firstName}: ${args.service_label} confirmed for ${short} ${time} at ` +
    `Elevated Health Augusta, 7013 Evans Town Center Blvd, Suite 203. ` +
    `Reschedule: ${CLINIC_PHONE}.`
  );
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");
    bookingConfirmLog("entry", { service_label: null, success: true, error_message: null });

    const body = (await req.json()) as Partial<SendBookingArgs>;
    const args: SendBookingArgs = {
      name: body.name ?? null,
      email: body.email ?? null,
      phone: body.phone ?? null,
      service_label: body.service_label || "Your appointment",
      service_line: body.service_line || "consult",
      scheduled_at: body.scheduled_at || new Date().toISOString(),
      duration_minutes: body.duration_minutes || 30,
      confirmation_number: body.confirmation_number ?? null,
    };

    if (!body.scheduled_at) {
      logStep("Missing scheduled_at — caller did not supply visit time");
    }

    logStep("Request received", {
      hasEmail: Boolean(args.email),
      hasPhone: Boolean(args.phone),
      service_label: args.service_label,
      scheduled_at: args.scheduled_at,
    });

    bookingConfirmLog("request_parsed", {
      service_label: args.service_label,
      success: true,
      error_message: null,
    });

    const results = {
      email: { success: false, error: null as string | null },
      sms: { success: false, error: null as string | null },
    };

    if (args.email) {
      const emailResult = await sendEmail(args);
      results.email = {
        success: emailResult.success,
        error: emailResult.error || null,
      };
    } else {
      results.email = { success: false, error: "No email provided" };
    }

    if (args.phone) {
      try {
        const smsResult = await sendSMS(args.phone, buildSmsBody(args));
        results.sms = {
          success: smsResult.success,
          error: smsResult.error || null,
        };
      } catch (e) {
        results.sms = { success: false, error: String(e) };
      }
    } else {
      results.sms = { success: false, error: "No phone provided" };
    }

    const overallSuccess = results.email.success || results.sms.success;
    logStep("Complete", {
      emailSent: results.email.success,
      smsSent: results.sms.success,
    });

    bookingConfirmLog("send_complete", {
      service_label: args.service_label,
      success: overallSuccess,
      error_message: overallSuccess
        ? null
        : [results.email.error, results.sms.error].filter(Boolean).join(" | ") || null,
      email_sent: results.email.success,
      sms_sent: results.sms.success,
    }, overallSuccess ? "info" : "error");

    return new Response(
      JSON.stringify({ success: overallSuccess, results }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      },
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    bookingConfirmLog("handler_error", {
      service_label: null,
      success: false,
      error_message: errorMessage,
    }, "error");
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
