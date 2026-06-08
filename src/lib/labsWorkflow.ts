import { supabase } from "@/integrations/supabase/client";

/** Mark patient labs reviewed and close open lab orders. */
export async function markLabsReviewedForPatient(patientId: string): Promise<{ error: string | null }> {
  const { data: { user } } = await supabase.auth.getUser();

  const { error: patientError } = await supabase
    .from("patients")
    .update({ onboarding_status: "labs_reviewed" })
    .eq("id", patientId);

  if (patientError) return { error: patientError.message };

  const { data: openOrders } = await supabase
    .from("lab_orders")
    .select("id")
    .eq("patient_id", patientId)
    .in("status", ["results_received", "results_pending", "sample_collected", "awaiting_draw", "requisition_sent", "ordered"]);

  if (openOrders?.length) {
    const now = new Date().toISOString();
    await supabase
      .from("lab_orders")
      .update({
        status: "reviewed",
        reviewed_at: now,
        reviewed_by: user?.id ?? null,
      })
      .in("id", openOrders.map((o) => o.id));
  }

  return { error: null };
}

/** Link a new lab result to the patient's most recent in-flight order. */
export async function linkLabResultToOpenOrder(patientId: string, labResultId: string): Promise<void> {
  const { data: order } = await supabase
    .from("lab_orders")
    .select("id")
    .eq("patient_id", patientId)
    .neq("status", "cancelled")
    .neq("status", "reviewed")
    .order("ordered_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (order?.id) {
    await supabase.from("lab_results").update({ lab_order_id: order.id }).eq("id", labResultId);
  }
}
