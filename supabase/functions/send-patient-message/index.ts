/**
 * send-patient-message
 *
 * Delivers a staff-authored portal message to the patient over email and/or SMS
 * after the row is written to `messages`.
 *
 * Auth (audit R-5 pattern): verify_jwt = true; caller must be staff or admin.
 *
 * Preference columns `email_opt_in` / `sms_opt_in` are not on `patients` today.
 * When present on a row they are honored; otherwise we deliver to channels that
 * have contact info (staff-initiated care coordination).
 */
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { edgeStructuredLog } from "../_shared/edge-structured-log.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const BRAND_CHARCOAL = "#2A2826";
const BRAND_CAMEL = "#B8956A";
const BRAND_BONE = "#F2EBDC";

async function requireStaffOrAdmin(req: Request): Promise<
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
  const service = createClient(url, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  const { data: roles } = await service
    .from("user_roles")
    .select("role")
    .eq("user_id", userData.user.id);
  const allowed = (roles || []).some((r) => r.role === "staff" || r.role === "admin");
  if (!allowed) {
    return { ok: false, status: 403, error: "Staff or admin role required" };
  }
  return { ok: true, user_id: userData.user.id };
}

async function sendSMS(to: string, message: string): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const { sendSmsViaGhl } = await import("../_shared/ghl-sms.ts");
  return sendSmsViaGhl(to, message);
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const ts = new Date().toISOString();
  let messageId: string | null = null;
  let patientId: string | null = null;
  let channelsDelivered: string[] = [];

  try {
    const gate = await requireStaffOrAdmin(req);
    if (!gate.ok) {
      return new Response(JSON.stringify({ error: gate.error }), {
        status: gate.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { patient_id, message_id } = await req.json();
    patientId = patient_id ?? null;
    messageId = message_id ?? null;
    if (!patient_id || !message_id) {
      edgeStructuredLog(
        "send-patient-message",
        {
          event: "validation_error",
          patient_id,
          message_id,
          channels_delivered: [],
          success: false,
          error_message: "patient_id and message_id are required",
        },
        "error",
      );
      return new Response(
        JSON.stringify({ error: "patient_id and message_id are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const url = Deno.env.get("SUPABASE_URL")!;
    const service = createClient(url, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

    const { data: patient, error: pErr } = await service
      .from("patients")
      .select("id, full_name, email, phone")
      .eq("id", patient_id)
      .maybeSingle();
    if (pErr || !patient) {
      throw new Error("Patient not found");
    }

    const { data: msg, error: mErr } = await service
      .from("messages")
      .select("id, content, conversation_id")
      .eq("id", message_id)
      .maybeSingle();
    if (mErr || !msg) {
      throw new Error("Message not found");
    }

    const { data: convo } = await service
      .from("conversations")
      .select("id")
      .eq("id", msg.conversation_id)
      .eq("patient_id", patient_id)
      .maybeSingle();
    if (!convo) {
      throw new Error("Message does not belong to this patient");
    }

    const row = patient as Record<string, unknown>;
    const emailOptIn = row["email_opt_in"] as boolean | null | undefined;
    const smsOptIn = row["sms_opt_in"] as boolean | null | undefined;
    const email: string | null = patient.email;
    const phone: string | null = patient.phone;

    const sendEmail = Boolean(email && (emailOptIn === undefined || emailOptIn === null ? true : emailOptIn));
    const sendSms = Boolean(phone && (smsOptIn === undefined || smsOptIn === null ? true : smsOptIn));

    if (!sendEmail && !sendSms) {
      console.warn(
        JSON.stringify({
          timestamp: ts,
          event: "send-patient-message",
          message_id,
          patient_id,
          channels_delivered: [],
          delivery_gap: true,
          warning: "No opted-in channel with contact info",
        }),
      );
      edgeStructuredLog(
        "send-patient-message",
        {
          event: "no_channel",
          patient_id,
          message_id,
          channels_delivered: [],
          success: true,
          error_message: "db_write_ok_no_delivery_channel",
        },
        "info",
      );
      return new Response(
        JSON.stringify({
          success: true,
          delivered: false,
          delivery_gap: true,
          message: "Message saved; patient has no opted-in email/SMS channel on file",
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const preview = msg.content.length > 400 ? msg.content.slice(0, 397) + "…" : msg.content;
    const resendKey = Deno.env.get("RESEND_API_KEY");
    const resend = resendKey ? new Resend(resendKey) : null;

    if (sendEmail && resend) {
      const first = (patient.full_name || "there").split(" ")[0];
      await resend.emails.send({
        from: "Elevated Health Augusta <noreply@elevatedhealthaugusta.com>",
        to: [email!],
        subject: "Message from your care team — Elevated Health Augusta",
        html: `
          <!DOCTYPE html><html><head><meta charset="utf-8"></head>
          <body style="margin:0;padding:0;background:${BRAND_BONE};font-family:Helvetica,Arial,sans-serif;color:${BRAND_CHARCOAL};">
            <table width="100%" cellpadding="0" cellspacing="0" style="background:${BRAND_BONE};padding:24px;">
              <tr><td align="center">
                <table width="100%" style="max-width:560px;background:#fff;border-radius:12px;padding:28px;">
                  <tr><td>
                    <p style="margin:0 0 8px;font-size:12px;letter-spacing:0.12em;text-transform:uppercase;color:${BRAND_CAMEL};">Elevated Health Augusta</p>
                    <h1 style="margin:0 0 16px;font-size:22px;font-weight:400;font-style:italic;font-family:Georgia,serif;">Hi ${first},</h1>
                    <p style="margin:0 0 16px;line-height:1.6;font-size:15px;">You have a new message from your care team in your patient portal:</p>
                    <div style="border-left:3px solid ${BRAND_CAMEL};padding:12px 16px;background:${BRAND_BONE};border-radius:6px;margin:16px 0;">
                      <p style="margin:0;white-space:pre-wrap;font-size:14px;">${preview.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</p>
                    </div>
                    <p style="margin:16px 0 0;font-size:14px;">Reply by logging into your portal or call us at <a href="tel:+17067603470" style="color:${BRAND_CAMEL};">(706) 760-3470</a>.</p>
                  </td></tr>
                </table>
              </td></tr>
            </table>
          </body></html>`,
      });
      channelsDelivered.push("email");
    }

    if (sendSms) {
      const body =
        `EHA: Message from your care team. ${preview.slice(0, 120)}${preview.length > 120 ? "…" : ""} Log in to your portal or call (706) 760-3470.`;
      const ok = await sendSMS(phone!, body);
      if (ok) channelsDelivered.push("sms");
    }

    const payload = {
      timestamp: ts,
      event: "send-patient-message",
      message_id,
      patient_id,
      channels_delivered: channelsDelivered,
      success: channelsDelivered.length > 0,
    };
    console.log(JSON.stringify(payload));
    edgeStructuredLog(
      "send-patient-message",
      {
        event: "deliver_complete",
        patient_id,
        message_id,
        channels_delivered: channelsDelivered,
        success: channelsDelivered.length > 0,
        error_message: channelsDelivered.length === 0 ? "resend_or_sinch_not_sent" : null,
      },
      channelsDelivered.length > 0 ? "info" : "error",
    );

    return new Response(
      JSON.stringify({
        success: true,
        delivered: channelsDelivered.length > 0,
        channels: channelsDelivered,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    const err = e instanceof Error ? e.message : String(e);
    console.error(JSON.stringify({ timestamp: ts, event: "send-patient-message", message_id, patient_id, channels_delivered: channelsDelivered, success: false, error_message: err }));
    edgeStructuredLog(
      "send-patient-message",
      {
        event: "handler_error",
        patient_id,
        message_id,
        channels_delivered: channelsDelivered,
        success: false,
        error_message: err,
      },
      "error",
    );
    return new Response(JSON.stringify({ error: err }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
