/**
 * send-safety-callback-request
 *
 * Called by SafetyGate when a flagged patient asks the clinic to call
 * them back. Two responsibilities:
 *
 *   1. Insert a row into eligibility_review_requests so Caroline / Troy
 *      have a real, queryable queue. Replaces the previous fire-and-forget
 *      email that left no audit trail.
 *
 *   2. Email Caroline + Troy (and a fallback distribution list) with the
 *      patient's flag reasons and contact info, plus a deep link into
 *      the admin queue at /admin/eligibility-reviews.
 *
 * The caller can be unauthenticated (a brand-new patient hitting
 * SafetyGate during initial intake), so we don't require an auth token.
 * The edge function uses the service role for the DB insert.
 *
 * Notification recipients are configured via the
 * ELIGIBILITY_REVIEW_NOTIFY_EMAIL env var (comma-separated list).
 * Defaults to caroline@ + troy@ if unset.
 */
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { MAIL_FROM } from "../_shared/mail-config.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const log = (step: string, details?: unknown) =>
  console.log(`[SAFETY-CALLBACK] ${step}${details ? ` - ${JSON.stringify(details)}` : ""}`);

const ALLOWED_WINDOWS = new Set(["morning", "afternoon", "evening", "no_preference"]);

interface RequestBody {
  patient_id?: string | null;
  patient_name: string;
  patient_email?: string | null;
  patient_phone: string;
  intake_id?: string | null;
  safety_flags?: string[];
  treatment_type?: string | null;
  preferred_callback_window?: string;
}

const renderClinicEmail = (args: {
  reviewId: string;
  patientName: string;
  patientEmail?: string | null;
  patientPhone: string;
  flagReasons: string[];
  treatmentType: string;
  preferredWindow: string;
  origin: string;
}) => {
  const flagsBlock = args.flagReasons.length
    ? args.flagReasons.map((f) => `<li style="margin-bottom:4px;">${f}</li>`).join("")
    : "<li>(none specified)</li>";
  const queueUrl = `${args.origin || "https://elevatedhealthaugusta.com"}/admin/eligibility-reviews`;
  return `
<!DOCTYPE html><html><head><meta charset="utf-8"></head>
<body style="font-family: Georgia, 'Times New Roman', serif; background:#F2EBDC; margin:0; padding:24px; color:#2A2826;">
  <div style="max-width:600px; margin:0 auto; background:#ffffff; border-radius:4px; overflow:hidden; border:1px solid rgba(184,149,106,0.25);">
    <div style="background:#2A2826; padding:24px; text-align:center;">
      <p style="color:#B8956A; font-size:11px; letter-spacing:2.5px; margin:0; text-transform:uppercase;">Elevated Health Augusta</p>
      <h1 style="color:#F2EBDC; font-family:Georgia,serif; font-size:22px; margin:8px 0 0; font-weight:normal;">Eligibility review requested</h1>
    </div>
    <div style="padding:24px;">
      <p style="font-size:15px; margin:0 0 16px;">A patient hit the safety gate during intake and asked us to call them back.</p>
      <table style="width:100%; border-collapse:collapse; font-size:14px; margin:16px 0;">
        <tr><td style="padding:6px 0; color:#7a7a7a; width:140px;">Patient</td><td style="padding:6px 0;">${args.patientName}</td></tr>
        <tr><td style="padding:6px 0; color:#7a7a7a;">Phone</td><td style="padding:6px 0;"><a href="tel:${args.patientPhone}" style="color:#B8956A;">${args.patientPhone}</a></td></tr>
        ${args.patientEmail ? `<tr><td style="padding:6px 0; color:#7a7a7a;">Email</td><td style="padding:6px 0;"><a href="mailto:${args.patientEmail}" style="color:#B8956A;">${args.patientEmail}</a></td></tr>` : ""}
        <tr><td style="padding:6px 0; color:#7a7a7a;">Treatment</td><td style="padding:6px 0;">${args.treatmentType || "—"}</td></tr>
        <tr><td style="padding:6px 0; color:#7a7a7a;">Best time</td><td style="padding:6px 0;">${args.preferredWindow.replace("_", " ")}</td></tr>
      </table>

      <p style="font-size:13px; color:#7a7a7a; margin:16px 0 4px; text-transform:uppercase; letter-spacing:1.5px;">Flag reasons</p>
      <ul style="font-size:14px; padding-left:20px; margin:0 0 16px;">${flagsBlock}</ul>

      <p style="font-size:13px; color:#7a7a7a; margin:16px 0 4px;">Review ID: ${args.reviewId}</p>

      <div style="margin:24px 0; text-align:center;">
        <a href="${queueUrl}" style="display:inline-block; background:#2A2826; color:#B8956A; text-decoration:none; padding:14px 28px; border-radius:2px; font-size:14px; letter-spacing:1px; text-transform:uppercase;">Open eligibility queue</a>
      </div>

      <p style="font-size:12px; color:#7a7a7a; margin:16px 0 0; line-height:1.5;">
        Target turnaround: 1 business day. The patient was told a clinician would reach out within
        that window and was given (706)&nbsp;760-3470 as their urgent escape hatch.
      </p>
    </div>
  </div>
</body></html>`;
};

const renderPatientConfirmationEmail = (args: { patientName: string }) => `
<!DOCTYPE html><html><head><meta charset="utf-8"></head>
<body style="font-family: Georgia, 'Times New Roman', serif; background:#F2EBDC; margin:0; padding:24px; color:#2A2826;">
  <div style="max-width:600px; margin:0 auto; background:#ffffff; border-radius:4px; overflow:hidden; border:1px solid rgba(184,149,106,0.25);">
    <div style="background:#2A2826; padding:32px; text-align:center;">
      <p style="color:#B8956A; font-size:11px; letter-spacing:2.5px; margin:0; text-transform:uppercase;">Elevated Health Augusta</p>
      <h1 style="color:#F2EBDC; font-family:Georgia,serif; font-size:24px; margin:12px 0 0; font-weight:normal;">We have your request.</h1>
    </div>
    <div style="padding:28px; font-size:15px; line-height:1.7;">
      <p style="margin:0 0 16px;">Hi ${args.patientName},</p>
      <p style="margin:0 0 16px;">
        Thanks for trusting us with your medical history. A clinician will review your intake
        and contact you <strong>within 1 business day</strong>. We do not auto-book this kind
        of visit because the right next step depends on what your physician sees in your answers.
      </p>
      <p style="margin:0 0 16px;">
        If your situation feels urgent, please call us directly at
        <a href="tel:7067603470" style="color:#B8956A;">(706)&nbsp;760-3470</a>. We answer the
        phone in person during clinic hours and listen to voicemails after-hours.
      </p>
      <p style="margin:0 0 4px; color:#7a7a7a; font-size:13px;">— The Elevated Health Augusta team</p>
      <p style="margin:0; color:#7a7a7a; font-size:12px;">7013 Evans Town Center Blvd, Suite 203, Evans, GA 30809</p>
    </div>
  </div>
</body></html>`;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body = (await req.json()) as RequestBody;
    if (!body.patient_name || !body.patient_phone) {
      return new Response(
        JSON.stringify({ error: "patient_name and patient_phone are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const window = body.preferred_callback_window && ALLOWED_WINDOWS.has(body.preferred_callback_window)
      ? body.preferred_callback_window
      : "no_preference";
    const flagReasons = Array.isArray(body.safety_flags) ? body.safety_flags : [];

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } },
    );

    const { data: row, error: insertErr } = await supabase
      .from("eligibility_review_requests")
      .insert({
        patient_id: body.patient_id || null,
        patient_name: body.patient_name,
        patient_email: body.patient_email || null,
        preferred_phone: body.patient_phone,
        preferred_callback_window: window,
        intake_id: body.intake_id || null,
        flag_reasons: flagReasons,
        treatment_type: body.treatment_type || null,
        status: "pending",
      })
      .select("id")
      .single();

    if (insertErr) {
      log("Insert failed", { error: insertErr });
      throw insertErr;
    }
    log("Eligibility review row created", { reviewId: row.id });

    const resendKey = Deno.env.get("RESEND_API_KEY");
    if (resendKey) {
      const resend = new Resend(resendKey);
      const notifyEnv = Deno.env.get("ELIGIBILITY_REVIEW_NOTIFY_EMAIL") || "";
      const notifyTargets = notifyEnv
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      const fallback = ["appointments@elevatedhealthaugusta.com"];
      const recipients = notifyTargets.length ? notifyTargets : fallback;
      const origin = req.headers.get("origin") || "https://elevatedhealthaugusta.com";

      try {
        await resend.emails.send({
          from: MAIL_FROM,
          to: recipients,
          subject: `Eligibility review requested — ${body.patient_name}`,
          html: renderClinicEmail({
            reviewId: row.id,
            patientName: body.patient_name,
            patientEmail: body.patient_email,
            patientPhone: body.patient_phone,
            flagReasons,
            treatmentType: body.treatment_type || "",
            preferredWindow: window,
            origin,
          }),
        });
        log("Clinical notification sent", { recipients });
      } catch (e) {
        log("Failed to send clinical notification", { error: e instanceof Error ? e.message : String(e) });
      }

      if (body.patient_email) {
        try {
          await resend.emails.send({
            from: MAIL_FROM,
            to: [body.patient_email],
            subject: "We have your request — Elevated Health Augusta",
            html: renderPatientConfirmationEmail({ patientName: body.patient_name }),
          });
          log("Patient confirmation sent");
        } catch (e) {
          log("Failed to send patient confirmation", { error: e instanceof Error ? e.message : String(e) });
        }
      }
    } else {
      log("RESEND_API_KEY missing — skipped email notifications");
    }

    return new Response(JSON.stringify({ success: true, review_id: row.id }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    log("ERROR", { message: msg });
    return new Response(JSON.stringify({ error: msg }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});