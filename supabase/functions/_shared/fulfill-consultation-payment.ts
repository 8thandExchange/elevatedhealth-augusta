import Stripe from "https://esm.sh/stripe@18.5.0";
import { type SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { LIVE_CORE_SERVICES } from "./live-prices.ts";
import { applyPrequalSessionToPatient } from "./apply-prequal-session.ts";
import { sendQualiphyGfeInvite } from "./send-qualiphy-gfe-invite-core.ts";

export const CONSULT_FEE_USD = 79;
const LEGACY_DISCOVERY_AMOUNT_CENTS = 9900;

export function generateCreditCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "EH-";
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export function isConsultationCheckoutSession(session: Stripe.Checkout.Session): boolean {
  const meta = session.metadata ?? {};
  if (meta.payment_type === "consultation") return true;
  if (meta.product === "wellness_assessment") return true;
  return false;
}

export async function recognizeConsultationProduct(
  stripe: Stripe,
  sessionId: string,
  session: Stripe.Checkout.Session,
): Promise<{ product_recognized: string; legacy_path: boolean }> {
  const items = await stripe.checkout.sessions.listLineItems(sessionId, { limit: 10 });
  const li0 = items.data[0];
  const priceId = li0?.price?.id ?? null;
  const desc = (li0?.description || "").toLowerCase();
  const nickname = ((li0?.price as { nickname?: string } | null)?.nickname || "").toLowerCase();
  const blob = `${desc} ${nickname}`;

  if (priceId === LIVE_CORE_SERVICES.wellnessAssessment) {
    return { product_recognized: "wellness_assessment_live_price", legacy_path: false };
  }

  const total = session.amount_total ?? 0;
  if (total === 7900) {
    return { product_recognized: "wellness_assessment_amount_7900", legacy_path: false };
  }
  if (total === LEGACY_DISCOVERY_AMOUNT_CENTS) {
    return { product_recognized: "legacy_discovery_9900_cents", legacy_path: true };
  }

  if (blob.includes("wellness assessment")) {
    return { product_recognized: "wellness_assessment_line_name", legacy_path: false };
  }
  if (blob.includes("discovery consultation") || blob.includes("discovery")) {
    return { product_recognized: "legacy_discovery_consultation_name", legacy_path: true };
  }

  return { product_recognized: "consult_checkout_unknown_line", legacy_path: false };
}

function mapServiceTypeToProgram(serviceType: string | null | undefined): string {
  const st = (serviceType || "hormone").toLowerCase();
  if (st.includes("weight")) return "weight_loss";
  if (st.includes("peptide")) return "peptide";
  if (st.includes("iv")) return "iv_therapy";
  return "hormone";
}

async function upsertPatientConsultPaid(
  supabase: SupabaseClient,
  customerEmail: string,
  customerName: string | null | undefined,
  serviceType: string,
): Promise<string | null> {
  const email = customerEmail.toLowerCase().trim();
  const { data: existing } = await supabase
    .from("patients")
    .select("id, onboarding_status, full_name")
    .eq("email", email)
    .maybeSingle();

  const program = mapServiceTypeToProgram(serviceType);
  const advanceable = new Set([
    null,
    "consultation_pending",
    "pending_invite",
    "account_created",
  ]);

  if (!existing) {
    const { data: inserted, error } = await supabase
      .from("patients")
      .insert({
        full_name: customerName?.trim() || "Unknown",
        email,
        onboarding_status: "consultation_paid",
        primary_program: program,
      })
      .select("id")
      .maybeSingle();
    if (error) throw error;
    return inserted?.id ?? null;
  }

  const patch: Record<string, string> = {};
  if (advanceable.has(existing.onboarding_status)) {
    patch.onboarding_status = "consultation_paid";
  }
  if (customerName?.trim() && (existing.full_name === "Unknown" || !existing.full_name)) {
    patch.full_name = customerName.trim();
  }
  if (Object.keys(patch).length > 0) {
    await supabase.from("patients").update(patch).eq("id", existing.id);
  }
  return existing.id;
}

async function finalizeConsultPatient(
  supabase: SupabaseClient,
  session: Stripe.Checkout.Session,
  customerEmail: string,
  customerName: string | null | undefined,
  serviceType: string,
  bookingId?: string,
): Promise<string | null> {
  const prequalId =
    typeof session.metadata?.prequal_session_id === "string"
      ? session.metadata.prequal_session_id
      : null;

  if (prequalId) {
    const fromPrequal = await applyPrequalSessionToPatient(
      supabase,
      prequalId,
      customerEmail,
      customerName,
      serviceType,
      bookingId,
    );
    if (fromPrequal) {
      const gfe = await sendQualiphyGfeInvite(supabase, {
        patientId: fromPrequal,
        channels: ["email", "sms"],
      });
      if (!gfe.ok && !gfe.skipped) {
        console.warn("[fulfillConsultationPayment] auto GFE failed:", gfe.error);
      }
      return fromPrequal;
    }
  }

  return upsertPatientConsultPaid(supabase, customerEmail, customerName, serviceType);
}

export type FulfillConsultationResult = {
  success: boolean;
  credit_code?: string;
  already_recorded?: boolean;
  booking_id?: string;
  patient_id?: string | null;
  product_recognized?: string;
  error?: string;
};

/** Idempotent: records paid consultation + patient row from a Stripe Checkout session. */
export async function fulfillConsultationPayment(
  supabase: SupabaseClient,
  stripe: Stripe,
  session: Stripe.Checkout.Session,
): Promise<FulfillConsultationResult> {
  const sessionId = session.id;
  if (session.payment_status !== "paid") {
    return { success: false, error: "Payment not completed" };
  }

  const recognition = await recognizeConsultationProduct(stripe, sessionId, session);
  const customerEmail = (
    session.customer_email ||
    session.customer_details?.email ||
    session.metadata?.patient_email ||
    ""
  ).toLowerCase().trim();

  if (!customerEmail) {
    return { success: false, error: "Customer email not found in session" };
  }

  const customerName =
    session.customer_details?.name ||
    (typeof session.metadata?.patient_name === "string" ? session.metadata.patient_name : null);
  const serviceType =
    (typeof session.metadata?.service_type === "string" && session.metadata.service_type) ||
    "hormone";
  const amountPaid = session.amount_total ? Math.round(session.amount_total / 100) : CONSULT_FEE_USD;

  const { data: existing } = await supabase
    .from("consultation_bookings")
    .select("id, credit_code, customer_name, status")
    .eq("stripe_session_id", sessionId)
    .maybeSingle();

  if (existing?.credit_code) {
    const patientId = await finalizeConsultPatient(
      supabase,
      session,
      customerEmail,
      customerName,
      serviceType,
      existing.id,
    );
    return {
      success: true,
      already_recorded: true,
      credit_code: existing.credit_code,
      booking_id: existing.id,
      patient_id: patientId,
      product_recognized: recognition.product_recognized,
    };
  }

  const creditCode = generateCreditCode();
  let bookingId: string | undefined;
  let claimed = false;

  if (existing) {
    const { data: updatedRow, error: updateError } = await supabase
      .from("consultation_bookings")
      .update({
        credit_code: creditCode,
        stripe_payment_intent_id: session.payment_intent as string,
        amount_paid: amountPaid,
        status: "paid",
        customer_name: customerName || existing.customer_name,
        customer_email: customerEmail,
      })
      .eq("id", existing.id)
      .is("credit_code", null)
      .select("id, credit_code")
      .maybeSingle();

    if (updateError) throw updateError;

    if (updatedRow?.credit_code) {
      bookingId = updatedRow.id;
      claimed = true;
    } else {
      const { data: peer } = await supabase
        .from("consultation_bookings")
        .select("id, credit_code")
        .eq("stripe_session_id", sessionId)
        .maybeSingle();
      if (peer?.credit_code) {
        const patientId = await finalizeConsultPatient(
          supabase,
          session,
          customerEmail,
          customerName,
          serviceType,
          peer.id,
        );
        return {
          success: true,
          already_recorded: true,
          credit_code: peer.credit_code,
          booking_id: peer.id,
          patient_id: patientId,
          product_recognized: recognition.product_recognized,
        };
      }
    }
  } else {
    const { data: inserted, error: insertError } = await supabase
      .from("consultation_bookings")
      .insert({
        customer_email: customerEmail,
        customer_name: customerName || null,
        stripe_session_id: sessionId,
        stripe_payment_intent_id: session.payment_intent as string,
        amount_paid: amountPaid,
        status: "paid",
        credit_code: creditCode,
        service_type: serviceType,
        booking_source: "self_service",
      })
      .select("id, credit_code")
      .maybeSingle();

    if (insertError) {
      const pgCode = (insertError as { code?: string }).code;
      const msg = insertError.message || "";
      if (pgCode === "23505" || msg.includes("duplicate") || msg.includes("unique")) {
        const { data: peer } = await supabase
          .from("consultation_bookings")
          .select("id, credit_code")
          .eq("stripe_session_id", sessionId)
          .maybeSingle();
        if (peer?.credit_code) {
          const patientId = await finalizeConsultPatient(
            supabase,
            session,
            customerEmail,
            customerName,
            serviceType,
            peer.id,
          );
          return {
            success: true,
            already_recorded: true,
            credit_code: peer.credit_code,
            booking_id: peer.id,
            patient_id: patientId,
            product_recognized: recognition.product_recognized,
          };
        }
      }
      throw insertError;
    }

    if (inserted?.credit_code) {
      bookingId = inserted.id;
      claimed = true;
    }
  }

  if (!claimed) {
    return { success: false, error: "Consultation booking was not recorded after successful payment" };
  }

  const patientId = await finalizeConsultPatient(
    supabase,
    session,
    customerEmail,
    customerName,
    serviceType,
    bookingId,
  );

  return {
    success: true,
    credit_code: creditCode,
    booking_id: bookingId,
    patient_id: patientId,
    product_recognized: recognition.product_recognized,
  };
}
