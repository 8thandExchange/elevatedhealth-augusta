import { supabase } from "@/integrations/supabase/client";

export interface LinkPatientAccountResult {
  patient_id: string;
  primary_program: string | null;
  phone: string | null;
  linked: boolean;
}

export interface PatientSignupPrefill {
  full_name: string | null;
  phone: string | null;
}

/** Link the signed-in auth user to an existing patient row by email. */
export async function linkPatientAccount(args: {
  email: string;
  fullName?: string | null;
  phone?: string | null;
}): Promise<LinkPatientAccountResult | null> {
  const { data, error } = await supabase.rpc("link_patient_account", {
    p_email: args.email.trim(),
    p_full_name: args.fullName?.trim() || null,
    p_phone: args.phone?.replace(/\D/g, "") || null,
  });

  if (error) throw error;
  const row = Array.isArray(data) ? data[0] : data;
  if (!row?.patient_id) return null;
  return row as LinkPatientAccountResult;
}

/** Prefill signup form for unlinked patient rows (no auth required). */
export async function getPatientSignupPrefill(email: string): Promise<PatientSignupPrefill | null> {
  const { data, error } = await supabase.rpc("get_patient_signup_prefill", {
    p_email: email.trim(),
  });
  if (error) {
    console.warn("get_patient_signup_prefill", error);
    return null;
  }
  const row = Array.isArray(data) ? data[0] : data;
  if (!row) return null;
  return row as PatientSignupPrefill;
}
