import type { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

type PrequalConsentPayload = {
  signature_name?: string;
  signed_session_id?: string;
  consent_records?: { consent_type: string; consent_version_id: string }[];
  signed_at?: string;
};

function mapServiceTypeToProgram(serviceType: string | null | undefined): string {
  const st = (serviceType || "hormone").toLowerCase();
  if (st.includes("weight")) return "weight_loss";
  if (st.includes("peptide")) return "peptide";
  if (st.includes("iv")) return "iv_therapy";
  return "hormone";
}

async function copyPrequalConsentsToPatient(
  supabase: SupabaseClient,
  patientId: string,
  payload: PrequalConsentPayload,
): Promise<void> {
  const records = payload.consent_records ?? [];
  if (!records.length || !payload.signature_name) return;

  const signedAt = payload.signed_at ?? new Date().toISOString();
  const expiresAt = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString();

  for (const rec of records) {
    const { data: version } = await supabase
      .from("consent_versions")
      .select("id, consent_type, body_hash")
      .eq("id", rec.consent_version_id)
      .maybeSingle();
    if (!version) continue;

    await supabase.from("consent_records").insert({
      patient_id: patientId,
      consent_version_id: version.id,
      consent_type: version.consent_type,
      document_text_hash: version.body_hash,
      signed_at: signedAt,
      signed_typed_name: payload.signature_name,
      signed_ip: "prequal-checkout",
      signed_user_agent: "consult-prequal-web",
      signed_session_id: payload.signed_session_id ?? null,
      expires_at: expiresAt,
      signing_method: "patient_typed_name",
    });
  }

  await supabase
    .from("patients")
    .update({ intake_consents_completed_at: signedAt })
    .eq("id", patientId);
}

export async function applyPrequalSessionToPatient(
  supabase: SupabaseClient,
  prequalSessionId: string,
  customerEmail: string,
  customerName: string | null | undefined,
  serviceType: string,
  consultationBookingId?: string,
): Promise<string | null> {
  const { data: prequal } = await supabase
    .from("consult_prequal_sessions")
    .select("*")
    .eq("id", prequalSessionId)
    .maybeSingle();

  if (!prequal) {
    return null;
  }

  const email = customerEmail.toLowerCase().trim();
  const program = mapServiceTypeToProgram(serviceType);
  const payload = (prequal.consent_payload ?? {}) as PrequalConsentPayload;

  const { data: existing } = await supabase
    .from("patients")
    .select("id, onboarding_status, full_name, medical_history")
    .eq("email", email)
    .maybeSingle();

  const patientPatch: Record<string, unknown> = {
    full_name: prequal.full_name || customerName?.trim() || "Unknown",
    phone: prequal.phone,
    dob: prequal.dob,
    gender: prequal.gender,
    primary_program: program,
    onboarding_status: "consultation_paid",
    state: "GA",
  };

  if (prequal.visit_reasons?.length) {
    patientPatch.treatment_request = prequal.visit_reasons.join(",");
  }

  const referralSource =
    typeof prequal.referral_source === "string" ? prequal.referral_source.trim() : "";
  const referralSourceDetail =
    typeof prequal.referral_source_detail === "string" ? prequal.referral_source_detail.trim() : "";
  if (referralSource) {
    patientPatch.referral_source = referralSource;
    patientPatch.referral_source_detail = referralSourceDetail || null;
    const priorHistory =
      existing?.medical_history && typeof existing.medical_history === "object"
        ? (existing.medical_history as Record<string, unknown>)
        : {};
    patientPatch.medical_history = {
      ...priorHistory,
      marketing: {
        referral_source: referralSource,
        referral_source_detail: referralSourceDetail || null,
      },
    };
  }

  let patientId: string;

  if (!existing) {
    const { data: inserted, error } = await supabase
      .from("patients")
      .insert({ email, ...patientPatch })
      .select("id")
      .single();
    if (error) throw error;
    patientId = inserted.id;
  } else {
    patientId = existing.id;
    const advanceable = new Set([
      null,
      "consultation_pending",
      "pending_invite",
      "account_created",
      "prequal_screening_passed",
      "prequal_consents_complete",
    ]);
    if (!advanceable.has(existing.onboarding_status)) {
      delete patientPatch.onboarding_status;
    }
    await supabase.from("patients").update(patientPatch).eq("id", patientId);
  }

  await copyPrequalConsentsToPatient(supabase, patientId, payload);

  if (referralSource) {
    try {
      await supabase.from("marketing_referrals").insert({
        channel: "consult_prequal",
        referral_source: referralSource,
        referral_source_detail: referralSourceDetail || null,
        contact_name: prequal.full_name ?? customerName ?? null,
        contact_email: email,
        patient_id: patientId,
      });
    } catch (e) {
      console.warn("marketing_referrals insert skipped (non-fatal):", e);
    }
  }

  await supabase
    .from("consult_prequal_sessions")
    .update({
      patient_id: patientId,
      consumed_at: new Date().toISOString(),
    })
    .eq("id", prequalSessionId);

  if (consultationBookingId) {
    await supabase
      .from("consultation_bookings")
      .update({ customer_phone: prequal.phone })
      .eq("id", consultationBookingId);
  }

  return patientId;
}
