// record-patient-referral — authenticated patient self-service attribution capture.
// Used when referral was missed at consult prequal (legacy) or on /schedule-consult.

import { corsHeaders, json } from "../_shared/cors.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { formatReferralAttribution } from "../_shared/referral-attribution.ts";

const ALLOWED = new Set([
  "social_media",
  "google_search",
  "friend_family",
  "provider_referral",
  "signage_drive_by",
  "event_community",
  "radio_podcast_news",
  "returning_patient",
  "other",
]);

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405);

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return json({ error: "Authentication required" }, 401);

    const anon = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
    );
    const token = authHeader.replace("Bearer ", "");
    const { data: userData } = await anon.auth.getUser(token);
    const userId = userData.user?.id;
    const userEmail = userData.user?.email?.toLowerCase().trim();
    if (!userId || !userEmail) return json({ error: "User not authenticated" }, 401);

    const body = await req.json().catch(() => ({}));
    const referralSource = String(body.referral_source ?? "").trim();
    const referralSourceDetail = String(body.referral_source_detail ?? "").trim() || null;

    if (!referralSource || !ALLOWED.has(referralSource)) {
      return json({ error: "Invalid referral_source" }, 400);
    }

    const service = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    const { data: patient, error: patErr } = await service
      .from("patients")
      .select("id, full_name, email, referral_source, medical_history")
      .eq("user_id", userId)
      .maybeSingle();

    if (patErr) throw patErr;

    let patientRow = patient;
    if (!patientRow) {
      const { data: byEmail } = await service
        .from("patients")
        .select("id, full_name, email, referral_source, medical_history, user_id")
        .eq("email", userEmail)
        .maybeSingle();
      if (byEmail && !byEmail.user_id) {
        await service.from("patients").update({ user_id: userId }).eq("id", byEmail.id);
        patientRow = { ...byEmail, user_id: userId };
      } else {
        patientRow = byEmail;
      }
    }

    if (!patientRow) return json({ error: "Patient record not found" }, 404);
    if (patientRow.referral_source) {
      return json({
        ok: true,
        already_recorded: true,
        display: formatReferralAttribution(patientRow.referral_source, null),
      });
    }

    const priorHistory =
      patientRow.medical_history && typeof patientRow.medical_history === "object"
        ? (patientRow.medical_history as Record<string, unknown>)
        : {};

    const { error: updErr } = await service
      .from("patients")
      .update({
        referral_source: referralSource,
        referral_source_detail: referralSourceDetail,
        medical_history: {
          ...priorHistory,
          marketing: {
            referral_source: referralSource,
            referral_source_detail: referralSourceDetail,
          },
        },
      })
      .eq("id", patientRow.id);
    if (updErr) throw updErr;

    await service.from("marketing_referrals").insert({
      channel: "schedule_consult",
      referral_source: referralSource,
      referral_source_detail: referralSourceDetail,
      contact_name: patientRow.full_name,
      contact_email: patientRow.email ?? userEmail,
      patient_id: patientRow.id,
    });

    return json({
      ok: true,
      display: formatReferralAttribution(referralSource, referralSourceDetail),
    });
  } catch (err) {
    return json({ error: String(err?.message ?? err) }, 500);
  }
});
