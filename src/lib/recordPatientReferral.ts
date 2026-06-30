import { supabase } from "@/integrations/supabase/client";
import { readEdgeFunctionError } from "@/lib/edgeFunctionError";
import { referralSourceLabel } from "@/lib/referralSources";

export async function recordPatientReferral(input: {
  referral_source: string;
  referral_source_detail?: string;
}): Promise<{ display: string; already_recorded?: boolean }> {
  const { data, error } = await supabase.functions.invoke("record-patient-referral", {
    body: input,
  });
  if (error) {
    throw new Error(await readEdgeFunctionError(error, "Could not save referral source"));
  }
  if (data?.error) throw new Error(String(data.error));
  const display =
    (typeof data?.display === "string" && data.display) ||
    referralSourceLabel(input.referral_source);
  return { display, already_recorded: !!data?.already_recorded };
}
