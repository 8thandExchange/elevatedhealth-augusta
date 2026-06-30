import type { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

/** Keep in sync with src/lib/referralSources.ts */
const REFERRAL_SOURCE_LABELS: Record<string, string> = {
  social_media: "Social media (Instagram, Facebook, TikTok)",
  google_search: "Google or online search",
  friend_family: "Friend or family",
  provider_referral: "Doctor or healthcare provider",
  signage_drive_by: "Saw our location / drove by",
  event_community: "Event, health fair, or community",
  radio_podcast_news: "Radio, podcast, or news",
  returning_patient: "Returning patient",
  other: "Other",
};

export type ReferralAttribution = {
  referral_source: string | null;
  referral_source_detail: string | null;
  display: string;
};

export function formatReferralAttribution(
  source?: string | null,
  detail?: string | null,
): string {
  if (!source?.trim()) return "Not provided";
  const label = REFERRAL_SOURCE_LABELS[source] ?? source.replace(/_/g, " ");
  return detail?.trim() ? `${label} — ${detail.trim()}` : label;
}

export async function resolveReferralAttribution(
  supabase: SupabaseClient,
  opts: {
    patientEmail?: string | null;
    patientId?: string | null;
    prequalSessionId?: string | null;
  },
): Promise<ReferralAttribution> {
  let source: string | null = null;
  let detail: string | null = null;

  if (opts.prequalSessionId) {
    const { data: prequal } = await supabase
      .from("consult_prequal_sessions")
      .select("referral_source, referral_source_detail")
      .eq("id", opts.prequalSessionId)
      .maybeSingle();
    source = prequal?.referral_source ?? null;
    detail = prequal?.referral_source_detail ?? null;
  }

  if (!source && opts.patientId) {
    const { data: patient } = await supabase
      .from("patients")
      .select("referral_source, referral_source_detail, medical_history")
      .eq("id", opts.patientId)
      .maybeSingle();
    source = patient?.referral_source ?? null;
    detail = patient?.referral_source_detail ?? null;
    if (!source && patient?.medical_history && typeof patient.medical_history === "object") {
      const marketing = (patient.medical_history as { marketing?: { referral_source?: string; referral_source_detail?: string } }).marketing;
      source = marketing?.referral_source ?? null;
      detail = marketing?.referral_source_detail ?? null;
    }
  }

  if (!source && opts.patientEmail) {
    const email = opts.patientEmail.toLowerCase().trim();
    const { data: patient } = await supabase
      .from("patients")
      .select("referral_source, referral_source_detail, medical_history")
      .eq("email", email)
      .maybeSingle();
    source = patient?.referral_source ?? null;
    detail = patient?.referral_source_detail ?? null;
    if (!source && patient?.medical_history && typeof patient.medical_history === "object") {
      const marketing = (patient.medical_history as { marketing?: { referral_source?: string; referral_source_detail?: string } }).marketing;
      source = marketing?.referral_source ?? null;
      detail = marketing?.referral_source_detail ?? null;
    }

    if (!source) {
      const { data: prequal } = await supabase
        .from("consult_prequal_sessions")
        .select("referral_source, referral_source_detail")
        .ilike("email", email)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      source = prequal?.referral_source ?? null;
      detail = prequal?.referral_source_detail ?? null;
    }
  }

  return {
    referral_source: source,
    referral_source_detail: detail,
    display: formatReferralAttribution(source, detail),
  };
}
