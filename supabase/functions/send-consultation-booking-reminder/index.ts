/**
 * send-consultation-booking-reminder
 *
 * Sweep job: reminds patients who paid for a consult more than 2 hours
 * ago but never picked a time. Replaces the prior version that pointed
 * at a Google Calendar iframe and carried a stale Réveil-era credit
 * code ($99) and phone number (706-922-7958), plus dead service
 * branches for ketamine, hair, and sexual wellness.
 *
 * Now:
 *   - Targets paid consultation_bookings whose booked_for is null AND
 *     whose payment_status is 'paid' or 'pending_payment' (covers both
 *     post-Stripe self-serve paths and staff-initiated 'pending_link' /
 *     'pay_at_visit' paths once the patient settles up).
 *   - Links to /schedule-consult, our native rebooking surface, instead
 *     of an external Google Calendar.
 *   - Brand-aligned styling, current address + phone, $79 credit copy.
 *   - Drops legacy service-type branches; one canonical CTA.
 */
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { Resend } from "https://esm.sh/resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const log = (step: string, details?: unknown) =>
  console.log(`[BOOKING-REMINDER] ${step}${details ? ` - ${JSON.stringify(details)}` : ""}`);

const PHONE = "(706) 760-3470";
const PHONE_RAW = "7067603470";
const ADDRESS_LINE1 = "7013 Evans Town Center Blvd, Suite 203";
const ADDRESS_LINE2 = "Evans, GA 30809";

const SERVICE_LABEL: Record<string, string> = {
  hormone: "Hormone Optimization Consultation",
  weight_loss: "Medical Weight Loss Consultation",
  peptide: "Peptide Protocols Consultation",
  follow_up: "Follow-up Visit",
};

const renderEmail = (args: {
  patientName: string;
  serviceLabel: string;
  scheduleUrl: string;
}) => `
<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="font-family: Georgia, 'Times New Roman', serif; background:#F2EBDC; margin:0; padding:24px; color:#2A2826;">
  <div style="max-width:600px; margin:0 auto; background:#ffffff; border-radius:4px; overflow:hidden; border:1px solid rgba(184,149,106,0.25);">
    <div style="background:#2A2826; padding:32px; text-align:center;">
      <p style="color:#B8956A; font-size:11px; letter-spacing:2.5px; margin:0; text-transform:uppercase;">Elevated Health Augusta</p>
      <h1 style="color:#F2EBDC; font-family:Georgia,serif; font-size:24px; margin:12px 0 0; font-weight:normal;">Pick a time for your visit.</h1>
    </div>

    <div style="padding:28px; font-size:15px; line-height:1.7;">
      <p style="margin:0 0 16px;">Hi ${args.patientName || "there"},</p>

      <p style="margin:0 0 16px;">
        Your <strong>${args.serviceLabel}</strong> is paid for, but we don&rsquo;t see
        a time on the calendar yet. Pick a slot that works for you and we&rsquo;ll see
        you in the clinic.
      </p>

      <div style="text-align:center; margin:28px 0;">
        <a href="${args.scheduleUrl}" style="display:inline-block; background:#2A2826; color:#B8956A; text-decoration:none; padding:14px 28px; border-radius:2px; font-size:14px; letter-spacing:1.5px; text-transform:uppercase;">Schedule your visit</a>
      </div>

      <p style="margin:0 0 16px; color:#7a7a7a; font-size:14px;">
        Your $79 consultation fee credits toward your protocol if you enroll in
        ongoing care after the visit. The booking link works for hormones,
        peptides, weight loss, and follow-ups.
      </p>

      <p style="margin:24px 0 4px;">
        Need help picking a time or have a question first? Call
        <a href="tel:${PHONE_RAW}" style="color:#B8956A;">${PHONE}</a>.
      </p>

      <p style="margin:24px 0 4px; color:#7a7a7a; font-size:13px;">— The Elevated Health Augusta team</p>
    </div>

    <div style="background:#FAF6EE; padding:16px 24px; border-top:1px solid rgba(184,149,106,0.25); text-align:center;">
      <p style="color:#7a7a7a; font-size:12px; margin:0;">${ADDRESS_LINE1}</p>
      <p style="color:#7a7a7a; font-size:12px; margin:0;">${ADDRESS_LINE2} &middot; ${PHONE}</p>
    </div>
  </div>
</body></html>`;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    log("Reminder sweep started");

    const resendKey = Deno.env.get("RESEND_API_KEY");
    if (!resendKey) throw new Error("RESEND_API_KEY is not set");
    const resend = new Resend(resendKey);

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    const origin = req.headers.get("origin") || "https://elevatedhealthaugusta.com";
    const scheduleUrl = `${origin}/schedule-consult`;

    // Two hours after payment, prompt anyone who hasn't picked a slot.
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();

    // Statuses that represent "paid but unscheduled":
    //   - 'paid'             — the post-Stripe self-serve path
    //   - 'pending_payment'  — staff-initiated bookings still waiting on a
    //                          link payment; we still nudge them.
    const { data: rows, error } = await supabaseClient
      .from("consultation_bookings")
      .select("id, customer_name, customer_email, service_type, status, booked_for, calendar_booked_at, booking_reminder_sent_at, created_at")
      .in("status", ["paid", "pending_payment"])
      .is("booked_for", null)
      .is("calendar_booked_at", null)
      .is("booking_reminder_sent_at", null)
      .lt("created_at", twoHoursAgo);

    if (error) throw error;

    log("Found unbooked consults", { count: rows?.length || 0 });

    if (!rows || rows.length === 0) {
      return new Response(JSON.stringify({ success: true, sent: 0 }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    let sent = 0;
    const errors: string[] = [];

    for (const row of rows) {
      if (!row.customer_email) continue;
      const serviceLabel = SERVICE_LABEL[row.service_type as string] || "Wellness Assessment";
      try {
        await resend.emails.send({
          from: "Elevated Health Augusta <noreply@elevatedhealthaugusta.com>",
          to: [row.customer_email],
          subject: `Pick a time for your ${serviceLabel}`,
          html: renderEmail({
            patientName: row.customer_name || "there",
            serviceLabel,
            scheduleUrl,
          }),
        });
        await supabaseClient
          .from("consultation_bookings")
          .update({ booking_reminder_sent_at: new Date().toISOString() })
          .eq("id", row.id);
        sent++;
        log("Reminder sent", { email: row.customer_email });
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        errors.push(`${row.customer_email}: ${msg}`);
        log("Reminder failed", { email: row.customer_email, error: msg });
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        sent,
        total: rows.length,
        errors: errors.length ? errors : undefined,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 },
    );
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    log("ERROR", { message: msg });
    return new Response(JSON.stringify({ error: msg }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
