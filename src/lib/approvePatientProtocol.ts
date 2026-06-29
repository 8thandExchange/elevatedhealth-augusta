import { supabase } from "@/integrations/supabase/client";

export async function approvePatientProtocol(
  patientId: string,
  protocolName: string | null | undefined,
): Promise<{ error: string | null }> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not signed in" };

  let protocolVersionId: string | null = null;
  let protocolId: string | null = null;

  if (protocolName?.trim()) {
    const { data: protocols } = await supabase
      .from("clinical_protocols")
      .select("id, title, current_version_id")
      .ilike("title", `%${protocolName.trim()}%`)
      .limit(1);

    const match = protocols?.[0];
    if (match?.current_version_id) {
      protocolId = match.id;
      protocolVersionId = match.current_version_id;
    }
  }

  if (protocolId && protocolVersionId) {
    await supabase.from("patient_protocol_assignments").insert({
      patient_id: patientId,
      protocol_id: protocolId,
      protocol_version_id: protocolVersionId,
      status: "approved",
      approved_by: user.id,
      approved_at: new Date().toISOString(),
    });
  }

  const { data: patientRow } = await supabase
    .from("patients")
    .select("user_id")
    .eq("id", patientId)
    .maybeSingle();

  const { error } = await supabase
    .from("patients")
    .update({ onboarding_status: "protocol_approved" })
    .eq("id", patientId);

  if (!error && patientRow?.user_id) {
    await supabase.functions.invoke("advance-patient-journey", {
      body: {
        patientId,
        stage: "protocol_recommended",
        note: protocolName ? `Protocol recommended: ${protocolName}` : "Protocol recommended",
      },
    });
  }

  return { error: error?.message ?? null };
}
