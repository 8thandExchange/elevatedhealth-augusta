import { supabase } from "@/integrations/supabase/client";
import type { JourneyStage } from "@/config/onboardingCredit";
import { canEnroll, JOURNEY_ORDER } from "@/config/onboardingCredit";
import type { ConsentType } from "@/data/consents/types";

export type PatientJourneyRow = {
  stage: JourneyStage;
  updated_at: string;
};

export type RedeemableCreditRow = {
  id: string;
  credit_amount_cents: number;
  expires_at: string;
  cap_mode: string;
  status: string;
};

export async function fetchPatientJourney(patientUserId: string): Promise<PatientJourneyRow | null> {
  const { data, error } = await (supabase as unknown as {
    from: (table: string) => {
      select: (cols: string) => {
        eq: (col: string, val: string) => {
          maybeSingle: () => Promise<{ data: { stage: string; updated_at: string } | null; error: Error | null }>;
        };
      };
    };
  })
    .from("patient_journey")
    .select("stage, updated_at")
    .eq("patient_user_id", patientUserId)
    .maybeSingle();
  if (error) throw error;
  if (!data?.stage) return null;
  return { stage: data.stage as JourneyStage, updated_at: data.updated_at };
}

export async function fetchRedeemableCredit(patientUserId: string): Promise<RedeemableCreditRow | null> {
  const { data, error } = await (supabase as unknown as {
    rpc: (
      fn: string,
      args: Record<string, string>,
    ) => Promise<{ data: RedeemableCreditRow | RedeemableCreditRow[] | null; error: Error | null }>;
  }).rpc("get_redeemable_credit", { p_patient: patientUserId });
  if (error) throw error;
  const row = Array.isArray(data) ? data[0] : data;
  return row ?? null;
}

export function journeyAtLeast(stage: JourneyStage | null | undefined, target: JourneyStage): boolean {
  if (!stage) return false;
  return JOURNEY_ORDER[stage] >= JOURNEY_ORDER[target];
}

export function patientCanEnrollMembership(stage: JourneyStage | null | undefined): boolean {
  if (!stage) return false;
  return canEnroll(stage);
}

/** Tier-2 consents required before membership enrollment, keyed to recommended program. */
export function tier2ConsentsForProgram(program: string | null | undefined): ConsentType[] {
  const p = (program ?? "").toLowerCase();
  if (/glp|weight|semaglutide|tirzepatide/.test(p)) return ["glp1", "off_label"];
  if (/peptide|bpc|tb-?500|sermorelin|cjc|tesamorelin/.test(p)) return ["research_peptide", "off_label"];
  if (/trt|hrt|hormone|testosterone|bhrt|estrogen|progesterone/.test(p)) {
    return ["hormone_therapy", "off_label"];
  }
  return ["off_label"];
}

export async function invokeAdvancePatientJourney(input: {
  patientId?: string;
  stage: JourneyStage;
  note?: string;
}): Promise<void> {
  const { error } = await supabase.functions.invoke("advance-patient-journey", { body: input });
  if (error) throw error;
}

export async function invokeCompleteProgramEnrollmentConsents(consentTypes: ConsentType[]): Promise<void> {
  const { error } = await supabase.functions.invoke("complete-program-enrollment-consents", {
    body: { consentTypes },
  });
  if (error) throw error;
}

export async function startBaselineLabsCheckout(input: {
  panel_type: "comprehensive" | "expanded";
  patient_email: string;
  patient_name?: string;
  patient_id: string;
}): Promise<string> {
  const { data, error } = await supabase.functions.invoke("create-lab-panel-checkout", {
    body: { ...input, baseline_labs_onboarding: true },
  });
  if (error) throw error;
  if (!data?.url) throw new Error("Stripe did not return a checkout URL");
  return data.url as string;
}

export async function startMembershipCheckoutWithCredit(program: string): Promise<{ url: string }> {
  const { data, error } = await supabase.functions.invoke("create-membership-checkout", {
    body: { program },
  });
  if (error) throw error;
  if (!data?.url) throw new Error(data?.error ?? "Could not start membership checkout");
  return { url: data.url as string };
}
