import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { Resend } from "https://esm.sh/resend@2.0.0";
import {
  LEGACY_ELEVATED_MEMBERSHIP_PRICE_ID,
  LIVE_ELEVATED_PROGRAMS,
  LIVE_GLP1_TIRZEPATIDE_PRICE_ID,
  type LiveElevatedProgramKey,
} from "../_shared/live-prices.ts";
import {
  fulfillConsultationPayment,
  isConsultationCheckoutSession,
} from "../_shared/fulfill-consultation-payment.ts";
import { resolveSubscriptionElevatedState } from "../_shared/elevated-combo-prices.ts";
import { MAIL_FROM } from "../_shared/mail-config.ts";

/** Legacy single-tier Elevated price IDs — stop recognizing after 2026-08-11 (PR12 sunset). */

type ProductRecognition =
  | "elevated_trt"
  | "elevated_hrt"
  | "elevated_glp1"
  | "elevated_wellness"
  | "elevated_metabolic_recomposition"
  | "legacy_elevated_membership"
  | "alacarte_fill"
  | "consultation"
  | "unknown";

type ElevatedProgramKey = LiveElevatedProgramKey;

const ELEVATED_PROGRAM_PRICE_MAP: Record<string, ElevatedProgramKey> = {
  [LIVE_ELEVATED_PROGRAMS.trt]: "trt",
  [LIVE_ELEVATED_PROGRAMS.hrt]: "hrt",
  [LIVE_ELEVATED_PROGRAMS.glp1]: "glp1",
  // Tirzepatide GLP-1 ($449/mo) — same membership status as semaglutide GLP-1.
  [LIVE_GLP1_TIRZEPATIDE_PRICE_ID]: "glp1",
  [LIVE_ELEVATED_PROGRAMS.wellness]: "wellness",
  [LIVE_ELEVATED_PROGRAMS.metabolicRecomposition]: "metabolicRecomposition",
};

/** Legacy compatibility — remove legacy ID recognition after 2026-08-11 (sunset). */
const LEGACY_ELEVATED_PRICE_IDS = [LEGACY_ELEVATED_MEMBERSHIP_PRICE_ID];

function getProgramFromPriceId(priceId: string): ElevatedProgramKey | null {
  if (ELEVATED_PROGRAM_PRICE_MAP[priceId]) return ELEVATED_PROGRAM_PRICE_MAP[priceId];
  if (LEGACY_ELEVATED_PRICE_IDS.includes(priceId)) return "wellness";
  return null;
}

function recognitionForProgram(p: ElevatedProgramKey | null, legacy: boolean): ProductRecognition {
  if (legacy) return "legacy_elevated_membership";
  if (!p) return "unknown";
  if (p === "trt") return "elevated_trt";
  if (p === "hrt") return "elevated_hrt";
  if (p === "glp1") return "elevated_glp1";
  if (p === "metabolicRecomposition") return "elevated_metabolic_recomposition";
  return "elevated_wellness";
}

function webhookLog(fields: {
  timestamp?: string;
  event_type: string;
  event_id: string;
  price_id?: string | null;
  product_recognition: ProductRecognition;
  patient_id?: string | null;
  stripe_customer_id?: string | null;
  stripe_subscription_id?: string | null;
  action_taken: string;
  success: boolean;
  error_message?: string | null;
}) {
  console.log(
    JSON.stringify({
      timestamp: new Date().toISOString(),
      ...fields,
    }),
  );
}

function isUuid(s: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(s);
}

async function invokeIssueOnboardingCredit(paymentIntentId: string, eventId: string, eventType: string): Promise<void> {
  const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  try {
    const res = await fetch(`${supabaseUrl}/functions/v1/issue-onboarding-credit`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${serviceKey}`,
        apikey: serviceKey,
      },
      body: JSON.stringify({ paymentIntentId }),
    });
    const payload = await res.json().catch(() => ({}));
    webhookLog({
      event_type: eventType,
      event_id: eventId,
      product_recognition: "alacarte_fill",
      action_taken: res.ok
        ? `onboarding_credit_issue:${payload.issued ? "issued" : payload.reason ?? "noop"}`
        : `onboarding_credit_issue_failed:${payload.error ?? res.status}`,
      success: res.ok,
      error_message: res.ok ? null : String(payload.error ?? res.status),
    });
  } catch (err) {
    webhookLog({
      event_type: eventType,
      event_id: eventId,
      product_recognition: "alacarte_fill",
      action_taken: "onboarding_credit_issue_exception",
      success: false,
      error_message: err instanceof Error ? err.message : String(err),
    });
  }
}

const generateWelcomeEmail = (patientName: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: 'Helvetica Neue', Arial, sans-serif; background-color: #f8f9fa;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8f9fa; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <tr>
            <td style="background: linear-gradient(135deg, #2C3E50 0%, #3d5166 100%); padding: 40px 40px 30px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 300; letter-spacing: 1px;">Welcome to Elevated Health Augusta</h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px;">
              <p style="color: #2C3E50; font-size: 18px; margin: 0 0 20px; line-height: 1.6;">
                Dear ${patientName},
              </p>
              <p style="color: #4a5568; font-size: 16px; margin: 0 0 20px; line-height: 1.8;">
                Your ELEVATED program membership is now active. Everything Included starts here: in-office LabCorp draws,
                coordinated care, and your patient portal for plan updates and messaging.
              </p>
              <p style="color: #4a5568; font-size: 16px; margin: 0 0 20px; line-height: 1.8;">
                Here's what happens next:
              </p>
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 20px 0;">
                <tr>
                  <td style="padding: 15px 20px; background-color: #fef3c7; border-radius: 6px; border-left: 4px solid #d97706;">
                    <p style="color: #92400e; font-size: 14px; margin: 0 0 8px; font-weight: 600;">LabCorp — in-office lab draw</p>
                    <p style="color: #78350f; font-size: 14px; margin: 0;">Your labs are drawn at our Evans clinic per your care plan. Our team schedules draws and posts results to your chart for provider review.</p>
                  </td>
                </tr>
                <tr><td style="height: 12px;"></td></tr>
                <tr>
                  <td style="padding: 15px 20px; background-color: #f8f9fa; border-radius: 6px; border-left: 4px solid #2C3E50;">
                    <p style="color: #2C3E50; font-size: 14px; margin: 0 0 8px; font-weight: 600;">✓ Pharmacy & fulfillment</p>
                    <p style="color: #718096; font-size: 14px; margin: 0;">When your protocol is released, our 503A partner ships medications per your signed orders.</p>
                  </td>
                </tr>
                <tr><td style="height: 12px;"></td></tr>
                <tr>
                  <td style="padding: 15px 20px; background-color: #f8f9fa; border-radius: 6px; border-left: 4px solid #2C3E50;">
                    <p style="color: #2C3E50; font-size: 14px; margin: 0 0 8px; font-weight: 600;">✓ Patient Portal</p>
                    <p style="color: #718096; font-size: 14px; margin: 0;">Log in to view your plan, appointments, and secure messages from your care team.</p>
                  </td>
                </tr>
              </table>
              <p style="color: #4a5568; font-size: 16px; margin: 20px 0; line-height: 1.8;">
                Questions? Reply to this email or call <strong>(706) 760-3470</strong>.
              </p>
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                <tr>
                  <td align="center">
                    <a href="https://elevatedhealthaugusta.com/patient/login" style="display: inline-block; background-color: #2C3E50; color: #ffffff; text-decoration: none; padding: 14px 40px; border-radius: 50px; font-size: 16px; font-weight: 500;">Access Patient Portal</a>
                  </td>
                </tr>
              </table>
              <p style="color: #4a5568; font-size: 16px; margin: 20px 0 0; line-height: 1.8;">
                To your health,<br>
                <strong style="color: #2C3E50;">The Elevated Health Augusta Team</strong>
              </p>
            </td>
          </tr>
          <tr>
            <td style="background-color: #f8f9fa; padding: 25px 40px; text-align: center; border-top: 1px solid #e2e8f0;">
              <p style="color: #718096; font-size: 13px; margin: 0 0 8px;">
                Elevated Health Augusta<br>
                7013 Evans Town Center Blvd, Suite 203, Evans, GA 30809
              </p>
              <p style="color: #a0aec0; font-size: 12px; margin: 0;">
                © ${new Date().getFullYear()} Elevated Health Augusta. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

const STAFF_NOTIFICATION_EMAIL =
  Deno.env.get("STAFF_NOTIFICATION_EMAIL") || "appointments@elevatedhealthaugusta.com";

function generateStaffPaymentEmail(opts: {
  patientName: string;
  patientEmail: string | null;
  amountLabel: string;
  description: string;
  isGuest: boolean;
}): string {
  const { patientName, patientEmail, amountLabel, description, isGuest } = opts;
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#f8f9fa;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8f9fa;padding:32px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,.08);">
        <tr><td style="background:linear-gradient(135deg,#2C3E50 0%,#34495e 100%);padding:24px 32px;">
          <h1 style="color:#fff;margin:0;font-size:22px;">&#128176; New Payment Received</h1>
          <p style="color:#C5A059;margin:6px 0 0;font-size:13px;">Elevated Health Augusta &mdash; action needed: contact patient</p>
        </td></tr>
        <tr><td style="padding:28px 32px;">
          <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
            <tr><td style="padding:10px 0;border-bottom:1px solid #eee;color:#6b7280;width:150px;">Patient</td><td style="padding:10px 0;border-bottom:1px solid #eee;color:#111;font-weight:600;">${patientName}</td></tr>
            <tr><td style="padding:10px 0;border-bottom:1px solid #eee;color:#6b7280;">Email</td><td style="padding:10px 0;border-bottom:1px solid #eee;color:#111;">${patientEmail ?? "&mdash;"}</td></tr>
            <tr><td style="padding:10px 0;border-bottom:1px solid #eee;color:#6b7280;">Amount</td><td style="padding:10px 0;border-bottom:1px solid #eee;color:#111;font-weight:600;">${amountLabel}</td></tr>
            <tr><td style="padding:10px 0;border-bottom:1px solid #eee;color:#6b7280;">Purchased</td><td style="padding:10px 0;border-bottom:1px solid #eee;color:#111;">${description}</td></tr>
            <tr><td style="padding:10px 0;color:#6b7280;">Type</td><td style="padding:10px 0;color:#111;">${isGuest ? "Guest checkout (new lead)" : "Existing patient"}</td></tr>
          </table>
          <div style="margin-top:24px;">
            <a href="https://elevatedhealthaugusta.com/provider/dashboard" style="display:inline-block;background:#C5A059;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:600;">Open Provider Dashboard &rarr;</a>
          </div>
        </td></tr>
        <tr><td style="background:#f3f4f6;padding:14px 32px;text-align:center;"><p style="color:#6b7280;font-size:12px;margin:0;">Automated payment alert &middot; Elevated Health Augusta</p></td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

/**
 * Notify staff of a completed checkout so a person can be contacted.
 * Sends an email (reliable, via Resend) and a staff SMS (best-effort, via
 * send-staff-alert-sms). Never throws — notification failures must not block
 * the webhook's 200 response (Stripe would otherwise retry indefinitely).
 */
async function notifyStaffOfPayment(
  resend: Resend,
  opts: {
    patientName: string;
    patientEmail: string | null;
    amount: number | null;
    description: string;
    paymentType: string;
    program?: string | null;
    isGuest: boolean;
    eventId: string;
    eventType: string;
  },
): Promise<void> {
  const amountLabel = opts.amount != null ? `$${opts.amount.toFixed(2)}` : "—";

  // 1) Email — reliable channel.
  try {
    const emailResp = await resend.emails.send({
      from: MAIL_FROM,
      to: [STAFF_NOTIFICATION_EMAIL],
      subject: `💰 New payment: ${opts.patientName} — ${amountLabel} (${opts.description})`,
      html: generateStaffPaymentEmail({
        patientName: opts.patientName,
        patientEmail: opts.patientEmail,
        amountLabel,
        description: opts.description,
        isGuest: opts.isGuest,
      }),
    });
    webhookLog({
      event_type: opts.eventType,
      event_id: opts.eventId,
      product_recognition: "unknown",
      action_taken: `staff_email_alert_sent:${emailResp.data?.id ?? "unknown"}`,
      success: true,
    });
  } catch (emailErr) {
    webhookLog({
      event_type: opts.eventType,
      event_id: opts.eventId,
      product_recognition: "unknown",
      action_taken: "staff_email_alert_failed",
      success: false,
      error_message: emailErr instanceof Error ? emailErr.message : String(emailErr),
    });
  }

  // 2) SMS — best-effort via GHL.
  try {
    const smsResp = await fetch(
      `${Deno.env.get("SUPABASE_URL")}/functions/v1/send-staff-alert-sms`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${Deno.env.get("SUPABASE_ANON_KEY")}`,
        },
        body: JSON.stringify({
          alert_type: "payment_received",
          patient_name: opts.patientName,
          patient_email: opts.patientEmail ?? undefined,
          amount: opts.amount,
          payment_type: opts.paymentType,
          program: opts.program ?? undefined,
        }),
      },
    );
    webhookLog({
      event_type: opts.eventType,
      event_id: opts.eventId,
      product_recognition: "unknown",
      action_taken: smsResp.ok ? "staff_sms_alert_ok" : "staff_sms_alert_failed",
      success: smsResp.ok,
    });
  } catch (smsErr) {
    webhookLog({
      event_type: opts.eventType,
      event_id: opts.eventId,
      product_recognition: "unknown",
      action_taken: "staff_sms_alert_exception",
      success: false,
      error_message: smsErr instanceof Error ? smsErr.message : String(smsErr),
    });
  }
}

async function subscriptionPriceIds(
  stripe: Stripe,
  session: Stripe.Checkout.Session,
): Promise<string[]> {
  try {
    const lineItems = await stripe.checkout.sessions.listLineItems(session.id, { limit: 10 });
    return lineItems.data.map((li) => li.price?.id).filter((id): id is string => !!id);
  } catch {
    return [];
  }
}

async function allSubscriptionItemPriceIds(sub: Stripe.Subscription): Promise<string[]> {
  return sub.items.data.map((it) => it.price?.id).filter((id): id is string => !!id);
}

async function firstSubscriptionPriceId(
  stripe: Stripe,
  session: Stripe.Checkout.Session,
): Promise<string | null> {
  try {
    const lineItems = await stripe.checkout.sessions.listLineItems(session.id, { limit: 10 });
    const first = lineItems.data.find((li) => li.price?.id);
    return first?.price?.id ?? null;
  } catch {
    return null;
  }
}

async function firstSubscriptionItemPriceId(sub: Stripe.Subscription): Promise<string | null> {
  const first = sub.items.data.find((it) => it.price?.id);
  return first?.price?.id ?? null;
}

serve(async (req) => {
  const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
    apiVersion: "2025-08-27.basil",
  });

  const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

  const signature = req.headers.get("stripe-signature");
  if (!signature) {
    webhookLog({
      event_type: "webhook.received",
      event_id: "none",
      product_recognition: "unknown",
      action_taken: "rejected_missing_signature",
      success: false,
      error_message: "No stripe-signature header",
    });
    return new Response("No signature", { status: 400 });
  }

  const body = await req.text();
  let event: Stripe.Event;

  try {
    event = await stripe.webhooks.constructEventAsync(
      body,
      signature,
      Deno.env.get("STRIPE_WEBHOOK_SECRET") || "",
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    webhookLog({
      event_type: "webhook.signature_error",
      event_id: "unknown",
      product_recognition: "unknown",
      action_taken: "signature_verification_failed",
      success: false,
      error_message: message,
    });
    return new Response(`Webhook Error: ${message}`, { status: 400 });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } },
  );

  webhookLog({
    event_type: event.type,
    event_id: event.id,
    product_recognition: "unknown",
    action_taken: "handler_dispatch",
    success: true,
  });

  try {
    if (event.type === "payment_intent.succeeded") {
      const pi = event.data.object as Stripe.PaymentIntent;
      if (pi.metadata?.eha_purpose === "baseline_labs_onboarding") {
        await invokeIssueOnboardingCredit(pi.id, event.id, event.type);
      } else {
        webhookLog({
          event_type: event.type,
          event_id: event.id,
          product_recognition: "unknown",
          action_taken: "payment_intent_succeeded_no_onboarding_action",
          success: true,
        });
      }
    }

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const customerEmail = session.customer_email || session.customer_details?.email || null;
      const metadata = session.metadata || {};
      const patientIdMeta = typeof metadata.patient_id === "string" ? metadata.patient_id : "";
      const isGuestMeta = metadata.is_guest_checkout === "true";

      // Notify staff of EVERY completed checkout (one-time OR subscription,
      // guest OR member, recognized OR not) so the patient can be contacted.
      // This is intentionally outside the mode/program branches below so no
      // paying customer slips through without an alert.
      try {
        const staffPatientName =
          (typeof metadata.patient_name === "string" && metadata.patient_name.trim()) ||
          session.customer_details?.name ||
          customerEmail ||
          "New patient";
        const staffAmount = session.amount_total != null ? session.amount_total / 100 : null;
        const staffProductKey =
          typeof metadata.product_key === "string" ? metadata.product_key : "";
        const staffPaymentType =
          typeof metadata.payment_type === "string" ? metadata.payment_type : "";
        const staffDescription = session.mode === "subscription"
          ? `${staffProductKey || "Membership"} subscription`
          : (staffPaymentType || staffProductKey || "Service payment");
        await notifyStaffOfPayment(resend, {
          patientName: staffPatientName,
          patientEmail: customerEmail,
          amount: staffAmount,
          description: staffDescription,
          paymentType: staffPaymentType || staffProductKey || session.mode || "payment",
          isGuest: isGuestMeta,
          eventId: event.id,
          eventType: event.type,
        });
      } catch (notifyErr) {
        webhookLog({
          event_type: event.type,
          event_id: event.id,
          product_recognition: "unknown",
          action_taken: "staff_notify_exception",
          success: false,
          error_message: notifyErr instanceof Error ? notifyErr.message : String(notifyErr),
        });
      }

      if (session.mode === "payment") {
        const paymentType = metadata.payment_type as string | undefined;

        if (isConsultationCheckoutSession(session)) {
          try {
            const result = await fulfillConsultationPayment(supabaseClient, stripe, session);
            webhookLog({
              event_type: event.type,
              event_id: event.id,
              price_id: null,
              product_recognition: "consultation",
              patient_id: result.patient_id ?? null,
              stripe_customer_id: typeof session.customer === "string" ? session.customer : null,
              stripe_subscription_id: null,
              action_taken: result.success
                ? (result.already_recorded ? "consultation_already_fulfilled" : "consultation_fulfilled")
                : `consultation_fulfill_failed: ${result.error ?? "unknown"}`,
              success: result.success,
              error_message: result.error ?? null,
            });
          } catch (fulfillErr) {
            const msg = fulfillErr instanceof Error ? fulfillErr.message : String(fulfillErr);
            webhookLog({
              event_type: event.type,
              event_id: event.id,
              product_recognition: "consultation",
              action_taken: "consultation_fulfill_exception",
              success: false,
              error_message: msg,
            });
          }
        }

        webhookLog({
          event_type: event.type,
          event_id: event.id,
          price_id: null,
          product_recognition: paymentType === "consultation" ? "consultation" : "unknown",
          patient_id: isUuid(patientIdMeta) ? patientIdMeta : null,
          stripe_customer_id: typeof session.customer === "string" ? session.customer : null,
          stripe_subscription_id: null,
          action_taken: "one_time_payment_branch",
          success: true,
        });

        if (customerEmail) {
          if (paymentType === "hormone_mapping" || paymentType === "lab_kit") {
            const { error } = await supabaseClient
              .from("patients")
              .update({ onboarding_status: "awaiting_blood_work", lab_path: "labcorp" })
              .eq("email", customerEmail);
            webhookLog({
              event_type: event.type,
              event_id: event.id,
              product_recognition: "alacarte_fill",
              patient_id: null,
              stripe_customer_id: typeof session.customer === "string" ? session.customer : null,
              stripe_subscription_id: null,
              action_taken: error
                ? `awaiting_blood_work_update_failed: ${error.message}`
                : "awaiting_blood_work_labcorp_panel_paid",
              success: !error,
              error_message: error?.message ?? null,
            });
          }
        }
      }

      if (session.mode === "subscription") {
        const priceIds = await subscriptionPriceIds(stripe, session);
        const priceId = priceIds[0] ?? null;
        const resolved = resolveSubscriptionElevatedState(priceIds);
        const program = resolved.elevated_program;
        const legacy = !!(priceId && LEGACY_ELEVATED_PRICE_IDS.includes(priceId));
        const recognition = recognitionForProgram(program, legacy);

        const subId = typeof session.subscription === "string"
          ? session.subscription
          : session.subscription && typeof session.subscription === "object"
          ? (session.subscription as Stripe.Subscription).id
          : null;

        webhookLog({
          event_type: event.type,
          event_id: event.id,
          price_id: priceId,
          product_recognition: recognition,
          patient_id: isUuid(patientIdMeta) ? patientIdMeta : null,
          stripe_customer_id: typeof session.customer === "string" ? session.customer : null,
          stripe_subscription_id: subId,
          action_taken: "subscription_checkout_completed",
          success: true,
        });

        if (!program || !priceId) {
          webhookLog({
            event_type: event.type,
            event_id: event.id,
            price_id: priceId,
            product_recognition: "unknown",
            patient_id: isUuid(patientIdMeta) ? patientIdMeta : null,
            stripe_customer_id: typeof session.customer === "string" ? session.customer : null,
            stripe_subscription_id: subId,
            action_taken: "skipped_unrecognized_subscription_price",
            success: true,
          });
        } else if (isGuestMeta || !isUuid(patientIdMeta)) {
          webhookLog({
            event_type: event.type,
            event_id: event.id,
            price_id: priceId,
            product_recognition: recognition,
            patient_id: null,
            stripe_customer_id: typeof session.customer === "string" ? session.customer : null,
            stripe_subscription_id: subId,
            action_taken: "skipped_patient_update_guest_or_missing_patient_id",
            success: true,
          });
        } else {
          const { error: upErr } = await supabaseClient
            .from("patients")
            .update({
              elevated_membership_status: "active",
              elevated_program: program,
              elevated_program_addon: resolved.elevated_program_addon,
              stripe_subscription_id: subId,
            })
            .eq("id", patientIdMeta);

          webhookLog({
            event_type: event.type,
            event_id: event.id,
            price_id: priceId,
            product_recognition: recognition,
            patient_id: patientIdMeta,
            stripe_customer_id: typeof session.customer === "string" ? session.customer : null,
            stripe_subscription_id: subId,
            action_taken: upErr
              ? `patient_program_update_failed: ${upErr.message}`
              : "patient_program_and_subscription_set",
            success: !upErr,
            error_message: upErr?.message ?? null,
          });

          const journeyUserId = typeof metadata.user_id === "string" ? metadata.user_id : "";
          if (!upErr && journeyUserId) {
            try {
              await supabaseClient.rpc("advance_journey", {
                p_patient: journeyUserId,
                p_stage: "membership_enrolled",
                p_note: `Stripe subscription ${subId ?? "unknown"}`,
              });
              await supabaseClient.rpc("advance_journey", {
                p_patient: journeyUserId,
                p_stage: "active",
                p_note: "First subscription invoice path",
              });
            } catch {
              /* journey advance is best-effort alongside legacy onboarding_status */
            }
          }
        }

        if (customerEmail && program && !isGuestMeta) {
          const { data: activationData, error: activationError } = await supabaseClient
            .from("activation_links")
            .update({
              status: "activated",
              activated_at: new Date().toISOString(),
            })
            .eq("patient_email", customerEmail)
            .eq("status", "pending")
            .select();

          if (activationError) {
            webhookLog({
              event_type: event.type,
              event_id: event.id,
              product_recognition: recognition,
              patient_id: isUuid(patientIdMeta) ? patientIdMeta : null,
              stripe_customer_id: typeof session.customer === "string" ? session.customer : null,
              stripe_subscription_id: subId,
              action_taken: `activation_links_error: ${activationError.message}`,
              success: false,
              error_message: activationError.message,
            });
          }

          const tierFromMetadata = metadata.tier || metadata.base_membership || "metabolic";
          const { data: patientData, error: patientError } = await supabaseClient
            .from("patients")
            .update({
              onboarding_status: "treatment_active",
              membership_tier: tierFromMetadata,
              lab_path: "labcorp_in_office",
            })
            .eq("email", customerEmail)
            .select();

          webhookLog({
            event_type: event.type,
            event_id: event.id,
            product_recognition: recognition,
            patient_id: isUuid(patientIdMeta) ? patientIdMeta : null,
            stripe_customer_id: typeof session.customer === "string" ? session.customer : null,
            stripe_subscription_id: subId,
            action_taken: patientError
              ? `patient_onboarding_update_failed: ${patientError.message}`
              : "patient_onboarding_treatment_active",
            success: !patientError,
            error_message: patientError?.message ?? null,
          });

          const patientName = activationData?.[0]?.patient_name || patientData?.[0]?.full_name ||
            "Valued Patient";

          try {
            const emailResponse = await resend.emails.send({
              from: MAIL_FROM,
              to: [customerEmail],
              subject: "Welcome to Elevated Health Augusta – Your Membership is Active!",
              html: generateWelcomeEmail(patientName),
            });
            webhookLog({
              event_type: event.type,
              event_id: event.id,
              product_recognition: recognition,
              patient_id: isUuid(patientIdMeta) ? patientIdMeta : null,
              stripe_customer_id: typeof session.customer === "string" ? session.customer : null,
              stripe_subscription_id: subId,
              action_taken: `welcome_email_sent:${emailResponse.data?.id ?? "unknown"}`,
              success: true,
            });
          } catch (emailError) {
            webhookLog({
              event_type: event.type,
              event_id: event.id,
              product_recognition: recognition,
              action_taken: "welcome_email_failed",
              success: false,
              error_message: emailError instanceof Error ? emailError.message : String(emailError),
            });
          }
        }
      }
    }

    if (event.type === "customer.subscription.created") {
      const subscription = event.data.object as Stripe.Subscription;
      const priceIds = await allSubscriptionItemPriceIds(subscription);
      const priceId = priceIds[0] ?? null;
      const resolved = resolveSubscriptionElevatedState(priceIds);
      const program = resolved.elevated_program;
      const legacy = !!(priceId && LEGACY_ELEVATED_PRICE_IDS.includes(priceId));
      const recognition = recognitionForProgram(program, legacy);
      const customerId = typeof subscription.customer === "string"
        ? subscription.customer
        : subscription.customer.id;
      const customer = await stripe.customers.retrieve(customerId);
      const email = !customer.deleted && customer.email ? customer.email : null;

      webhookLog({
        event_type: event.type,
        event_id: event.id,
        price_id: priceId,
        product_recognition: recognition,
        patient_id: null,
        stripe_customer_id: customerId,
        stripe_subscription_id: subscription.id,
        action_taken: "subscription_created_received",
        success: true,
      });

      if (program && email) {
        const { error } = await supabaseClient
          .from("patients")
          .update({
            elevated_membership_status: "active",
            elevated_program: program,
            elevated_program_addon: resolved.elevated_program_addon,
            stripe_subscription_id: subscription.id,
          })
          .eq("email", email);
        webhookLog({
          event_type: event.type,
          event_id: event.id,
          price_id: priceId,
          product_recognition: recognition,
          patient_id: null,
          stripe_customer_id: customerId,
          stripe_subscription_id: subscription.id,
          action_taken: error ? `patient_update_failed:${error.message}` : "patient_subscription_linked",
          success: !error,
          error_message: error?.message ?? null,
        });
      }
    }

    if (event.type === "customer.subscription.updated") {
      const subscription = event.data.object as Stripe.Subscription;
      const priceIds = await allSubscriptionItemPriceIds(subscription);
      const priceId = priceIds[0] ?? null;
      const resolved = resolveSubscriptionElevatedState(priceIds);
      const program = resolved.elevated_program;
      const legacy = !!(priceId && LEGACY_ELEVATED_PRICE_IDS.includes(priceId));
      const recognition = recognitionForProgram(program, legacy);
      const customerId = typeof subscription.customer === "string"
        ? subscription.customer
        : subscription.customer.id;
      const customer = await stripe.customers.retrieve(customerId);
      const email = !customer.deleted && customer.email ? customer.email : null;

      webhookLog({
        event_type: event.type,
        event_id: event.id,
        price_id: priceId,
        product_recognition: recognition,
        patient_id: null,
        stripe_customer_id: customerId,
        stripe_subscription_id: subscription.id,
        action_taken: `subscription_status:${subscription.status}`,
        success: true,
      });

      if (!email) {
        webhookLog({
          event_type: event.type,
          event_id: event.id,
          product_recognition: recognition,
          action_taken: "skipped_no_customer_email",
          success: true,
        });
      } else if (subscription.status === "active" || subscription.status === "trialing") {
        if (program) {
          const { error } = await supabaseClient
            .from("patients")
            .update({
              elevated_membership_status: "active",
              elevated_program: program,
              elevated_program_addon: resolved.elevated_program_addon,
              stripe_subscription_id: subscription.id,
            })
            .eq("email", email);
          webhookLog({
            event_type: event.type,
            event_id: event.id,
            price_id: priceId,
            product_recognition: recognition,
            stripe_customer_id: customerId,
            stripe_subscription_id: subscription.id,
            action_taken: error ? `active_update_failed:${error.message}` : "patient_marked_active",
            success: !error,
            error_message: error?.message ?? null,
          });
        }
      } else if (
        subscription.status === "canceled" || subscription.status === "unpaid" ||
        subscription.status === "incomplete_expired"
      ) {
        const isElevated = !!(program || legacy || priceIds.some((id) => getProgramFromPriceId(id)));
        const { error } = await supabaseClient
          .from("patients")
          .update({
            onboarding_status: "subscription_canceled",
            ...(isElevated
              ? {
                elevated_membership_status: "cancelled",
                elevated_program: null,
                elevated_program_addon: null,
                stripe_subscription_id: null,
              }
              : {}),
          })
          .eq("email", email);
        webhookLog({
          event_type: event.type,
          event_id: event.id,
          price_id: priceId,
          product_recognition: recognition,
          stripe_customer_id: customerId,
          stripe_subscription_id: subscription.id,
          action_taken: error ? `inactive_update_failed:${error.message}` : "patient_subscription_inactive",
          success: !error,
          error_message: error?.message ?? null,
        });
      }
    }

    if (event.type === "customer.subscription.deleted") {
      const subscription = event.data.object as Stripe.Subscription;
      const priceIds = await allSubscriptionItemPriceIds(subscription);
      const priceId = priceIds[0] ?? null;
      const resolved = resolveSubscriptionElevatedState(priceIds);
      const program = resolved.elevated_program;
      const legacy = !!(priceId && LEGACY_ELEVATED_PRICE_IDS.includes(priceId));
      const recognition = recognitionForProgram(program, legacy);
      const customerId = typeof subscription.customer === "string"
        ? subscription.customer
        : subscription.customer.id;
      const customer = await stripe.customers.retrieve(customerId);
      const email = !customer.deleted && customer.email ? customer.email : null;

      webhookLog({
        event_type: event.type,
        event_id: event.id,
        price_id: priceId,
        product_recognition: recognition,
        patient_id: null,
        stripe_customer_id: customerId,
        stripe_subscription_id: subscription.id,
        action_taken: "subscription_deleted_received",
        success: true,
      });

      if (email) {
        const isElevated = !!(program || legacy);
        const elevatedClear = {
          elevated_membership_status: "cancelled",
          elevated_program: null as string | null,
          elevated_program_addon: null as string | null,
          stripe_subscription_id: null as string | null,
        };
        const { error } = await supabaseClient
          .from("patients")
          .update(
            isElevated
              ? elevatedClear
              : { onboarding_status: "subscription_canceled" },
          )
          .eq("email", email);

        webhookLog({
          event_type: event.type,
          event_id: event.id,
          price_id: priceId,
          product_recognition: recognition,
          stripe_customer_id: customerId,
          stripe_subscription_id: subscription.id,
          action_taken: error ? `deleted_update_failed:${error.message}` : "elevated_fields_cleared",
          success: !error,
          error_message: error?.message ?? null,
        });
      }
    }

    if (event.type === "invoice.payment_succeeded") {
      const invoice = event.data.object as Stripe.Invoice;
      const subId = typeof invoice.subscription === "string"
        ? invoice.subscription
        : invoice.subscription?.id ?? null;
      webhookLog({
        event_type: event.type,
        event_id: event.id,
        price_id: invoice.lines?.data?.[0]?.price?.id ?? null,
        product_recognition: "unknown",
        patient_id: null,
        stripe_customer_id: typeof invoice.customer === "string" ? invoice.customer : null,
        stripe_subscription_id: subId,
        action_taken: "invoice_payment_succeeded_logged",
        success: true,
      });
    }

    if (event.type === "invoice.payment_failed") {
      const invoice = event.data.object as Stripe.Invoice;
      const subId = typeof invoice.subscription === "string"
        ? invoice.subscription
        : invoice.subscription?.id ?? null;
      let patientId: string | null = null;
      if (subId) {
        const { data: rows } = await supabaseClient
          .from("patients")
          .select("id")
          .eq("stripe_subscription_id", subId)
          .limit(1);
        patientId = rows?.[0]?.id ?? null;
        if (patientId) {
          const { error } = await supabaseClient
            .from("patients")
            .update({ elevated_membership_status: "payment_failed" })
            .eq("id", patientId);
          webhookLog({
            event_type: event.type,
            event_id: event.id,
            price_id: invoice.lines?.data?.[0]?.price?.id ?? null,
            product_recognition: "unknown",
            patient_id: patientId,
            stripe_customer_id: typeof invoice.customer === "string" ? invoice.customer : null,
            stripe_subscription_id: subId,
            action_taken: error ? `payment_failed_flag_error:${error.message}` : "marked_payment_failed",
            success: !error,
            error_message: error?.message ?? null,
          });
        } else {
          webhookLog({
            event_type: event.type,
            event_id: event.id,
            product_recognition: "unknown",
            stripe_subscription_id: subId,
            action_taken: "payment_failed_no_patient_match",
            success: true,
          });
        }
      } else {
        webhookLog({
          event_type: event.type,
          event_id: event.id,
          product_recognition: "unknown",
          action_taken: "payment_failed_no_subscription_on_invoice",
          success: true,
        });
      }
    }
  } catch (handlerErr) {
    webhookLog({
      event_type: event.type,
      event_id: event.id,
      product_recognition: "unknown",
      action_taken: "handler_exception",
      success: false,
      error_message: handlerErr instanceof Error ? handlerErr.message : String(handlerErr),
    });
  }

  return new Response(JSON.stringify({ received: true }), {
    headers: { "Content-Type": "application/json" },
    status: 200,
  });
});