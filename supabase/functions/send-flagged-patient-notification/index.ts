/**
 * send-flagged-patient-notification
 *
 * Sent to a patient whose intake answers tripped the SafetyGate. The
 * email mirrors the on-screen SafetyGate copy: a clinician will review
 * their intake within 1 business day, no self-scheduling link.
 *
 * Replaces the prior version that linked to a Google Calendar iframe and
 * carried a stale Réveil-era address (3330 McClure Road) and phone
 * number ((762) 222-0098). Both are corrected to current EHA values.
 *
 * Note: this email DOES NOT create the eligibility_review_requests row
 * — that's handled by send-safety-callback-request when the patient
 * actually submits the callback form. This function is for the case
 * where the intake flow wants to acknowledge the flag in the patient's
 * inbox (e.g. they completed intake but bounced before submitting the
 * callback form).
 */
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const log = (step: string, details?: unknown) =>
  console.log(`[FLAGGED-PATIENT] ${step}${details ? `: ${JSON.stringify(details)}` : ""}`);

interface RequestBody {
  patient_name: string;
  patient_email: string;
  safety_flags?: string[];
  treatment_type?: string;
}

const PHONE = "(706) 760-3470";
const PHONE_RAW = "7067603470";
const ADDRESS_LINE1 = "7013 Evans Town Center Blvd, Suite 203";
const ADDRESS_LINE2 = "Evans, GA 30809";

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const resendKey = Deno.env.get("RESEND_API_KEY");
    if (!resendKey) throw new Error("RESEND_API_KEY is not set");

    const { patient_name, patient_email, safety_flags, treatment_type }: RequestBody = await req.json();
    log("Request data", { patient_name, patient_email, safety_flags, treatment_type });

    if (!patient_email) throw new Error("patient_email is required");

    const resend = new Resend(resendKey);
    const flagsBlock = safety_flags && safety_flags.length > 0
      ? safety_flags.map((f) => `<li style="margin-bottom:4px;">${f}</li>`).join("")
      : "<li>(none specified)</li>";

    const html = `
<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="font-family: Georgia, 'Times New Roman', serif; background:#F2EBDC; margin:0; padding:24px; color:#2A2826;">
  <div style="max-width:600px; margin:0 auto; background:#ffffff; border-radius:4px; overflow:hidden; border:1px solid rgba(184,149,106,0.25);">
    <div style="background:#2A2826; padding:32px; text-align:center;">
      <p style="color:#B8956A; font-size:11px; letter-spacing:2.5px; margin:0; text-transform:uppercase;">Elevated Health Augusta</p>
      <h1 style="color:#F2EBDC; font-family:Georgia,serif; font-size:24px; margin:12px 0 0; font-weight:normal;">One quick step before we book.</h1>
    </div>

    <div style="padding:28px; font-size:15px; line-height:1.7;">
      <p style="margin:0 0 16px;">Hi ${patient_name || "there"},</p>

      <p style="margin:0 0 16px;">
        Thanks for completing your intake. A couple of your answers raised something
        our physician needs to look at before we set up a visit for ${treatment_type || "treatment"}.
        Standard practice — your safety is our first priority.
      </p>

      <div style="background:#FAF6EE; border-left:3px solid #B8956A; padding:14px 16px; margin:20px 0;">
        <p style="margin:0 0 8px; font-size:12px; color:#7a7a7a; text-transform:uppercase; letter-spacing:1.5px;">
          What we noted
        </p>
        <ul style="margin:0; padding-left:18px; font-size:14px; color:#2A2826;">
          ${flagsBlock}
        </ul>
      </div>

      <p style="margin:0 0 16px;">
        <strong>What happens next:</strong> a clinician will review your intake and
        reach out within <strong>1 business day</strong>. They&rsquo;ll talk through what
        triggered the flag and what your options are &mdash; including, if appropriate,
        scheduling the visit you came here for.
      </p>

      <p style="margin:0 0 24px; color:#7a7a7a; font-style:italic;">
        We don&rsquo;t auto-book this kind of visit because the right next step depends on
        what your physician sees in your answers.
      </p>

      <p style="margin:0 0 16px;">
        If your situation feels urgent, please call us at
        <a href="tel:${PHONE_RAW}" style="color:#B8956A; text-decoration:underline;">${PHONE}</a>.
        We answer the phone in person during clinic hours.
      </p>

      <p style="margin:24px 0 4px; color:#7a7a7a; font-size:13px;">— The Elevated Health Augusta team</p>
    </div>

    <div style="background:#FAF6EE; padding:16px 24px; border-top:1px solid rgba(184,149,106,0.25); text-align:center;">
      <p style="color:#7a7a7a; font-size:12px; margin:0;">${ADDRESS_LINE1}</p>
      <p style="color:#7a7a7a; font-size:12px; margin:0;">${ADDRESS_LINE2} &middot; ${PHONE}</p>
    </div>
  </div>
</body></html>`;

    const emailResponse = await resend.emails.send({
      from: "Elevated Health Augusta <noreply@elevatedhealthaugusta.com>",
      to: [patient_email],
      subject: "We need to look at your intake before we book — Elevated Health Augusta",
      html,
    });

    log("Email sent", { id: emailResponse?.data?.id });

    return new Response(JSON.stringify({ success: true, id: emailResponse?.data?.id }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    log("ERROR", { message: msg });
    return new Response(JSON.stringify({ error: msg }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
