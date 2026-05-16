import { supabase } from "@/integrations/supabase/client";
import type { EncounterType, PatientEncounter } from "@/data/encounters/types";

export interface EncounterDraftFields {
  encounter_date?: string;
  encounter_type?: string;
  chief_complaint?: string | null;
  subjective?: string | null;
  objective?: string | null;
  assessment?: string | null;
  plan?: string | null;
  medications_prescribed?: string | null;
  follow_up_plan?: string | null;
  internal_notes?: string | null;
}

export async function logEncounterAction(
  encounterId: string,
  action: import("@/data/encounters/types").EncounterAuditAction,
  details: Record<string, unknown> = {},
  meta?: { ip?: string | null; userAgent?: string | null },
): Promise<void> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;
  await supabase.from("encounter_audit_log").insert({
    encounter_id: encounterId,
    user_id: user.id,
    action,
    action_details: details,
    ip_address: meta?.ip ?? null,
    user_agent: meta?.userAgent ?? (typeof navigator !== "undefined" ? navigator.userAgent : null),
  });
}

export async function createEncounterDraft(
  patientId: string,
  encounterType: EncounterType,
): Promise<PatientEncounter> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not signed in");

  const { data, error } = await supabase
    .from("patient_encounters")
    .insert({
      patient_id: patientId,
      encounter_type: encounterType,
      status: "draft",
      created_by_user_id: user.id,
    })
    .select("*")
    .single();

  if (error) throw new Error(error.message);
  const row = data as PatientEncounter;
  await logEncounterAction(row.id, "created", { encounter_type: encounterType });
  return row;
}

export async function saveEncounterDraft(encounterId: string, fields: EncounterDraftFields): Promise<void> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not signed in");

  const { error } = await supabase
    .from("patient_encounters")
    .update({
      ...fields,
      last_edited_by_user_id: user.id,
      last_edited_at: new Date().toISOString(),
    })
    .eq("id", encounterId)
    .eq("status", "draft");

  if (error) throw new Error(error.message);
  await logEncounterAction(encounterId, "edited", { fields: Object.keys(fields) });
}

export interface VitalsInput {
  systolic_bp?: number | null;
  diastolic_bp?: number | null;
  heart_rate?: number | null;
  respiratory_rate?: number | null;
  temperature_f?: number | null;
  weight_lbs?: number | null;
  height_inches?: number | null;
  spo2_pct?: number | null;
}

export async function saveEncounterVitals(encounterId: string, vitals: VitalsInput): Promise<void> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not signed in");

  const { data: existing } = await supabase
    .from("encounter_vitals")
    .select("id")
    .eq("encounter_id", encounterId)
    .order("recorded_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const payload = {
    ...vitals,
    recorded_at: new Date().toISOString(),
    recorded_by_user_id: user.id,
  };

  if (existing?.id) {
    const { error } = await supabase.from("encounter_vitals").update(payload).eq("id", existing.id);
    if (error) throw new Error(error.message);
  } else {
    const { error } = await supabase.from("encounter_vitals").insert({
      encounter_id: encounterId,
      ...payload,
    });
    if (error) throw new Error(error.message);
  }
}

async function fetchPublicIp(): Promise<string | null> {
  try {
    const r = await fetch("https://api.ipify.org?format=json");
    const j = (await r.json()) as { ip?: string };
    return j.ip ?? null;
  } catch {
    return null;
  }
}

export async function signEncounter(encounterId: string): Promise<PatientEncounter> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not signed in");

  const { data: current, error: fetchErr } = await supabase
    .from("patient_encounters")
    .select("*")
    .eq("id", encounterId)
    .single();

  if (fetchErr || !current) throw new Error(fetchErr?.message ?? "Encounter not found");
  const enc = current as PatientEncounter & { amends_encounter_id?: string | null };
  if (enc.status !== "draft") throw new Error("Only draft encounters can be signed");

  const signedIp = await fetchPublicIp();
  const signedAt = new Date().toISOString();

  const { data: updated, error: upErr } = await supabase
    .from("patient_encounters")
    .update({
      status: "signed",
      signed_by_user_id: user.id,
      signed_at: signedAt,
      signed_ip_address: signedIp,
      last_edited_by_user_id: user.id,
      last_edited_at: signedAt,
    })
    .eq("id", encounterId)
    .eq("status", "draft")
    .select("*")
    .single();

  if (upErr || !updated) throw new Error(upErr?.message ?? "Could not sign encounter");

  if (enc.amends_encounter_id) {
    await supabase
      .from("patient_encounters")
      .update({ status: "amended" })
      .eq("id", enc.amends_encounter_id)
      .eq("status", "signed");
    await logEncounterAction(enc.amends_encounter_id, "amended", { superseded_by: encounterId });
  }

  await logEncounterAction(encounterId, "signed", {});
  return updated as PatientEncounter;
}

export async function createAmendment(originalEncounterId: string): Promise<PatientEncounter> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not signed in");

  const { data: orig, error: oErr } = await supabase
    .from("patient_encounters")
    .select("*")
    .eq("id", originalEncounterId)
    .single();

  if (oErr || !orig) throw new Error(oErr?.message ?? "Original encounter not found");
  const o = orig as PatientEncounter;
  if (o.status !== "signed") throw new Error("Can only amend signed encounters");

  const { data: inserted, error: insErr } = await supabase
    .from("patient_encounters")
    .insert({
      patient_id: o.patient_id,
      encounter_date: new Date().toISOString(),
      encounter_type: o.encounter_type,
      chief_complaint: o.chief_complaint,
      subjective: o.subjective,
      objective: o.objective,
      assessment: o.assessment,
      plan: o.plan,
      medications_prescribed: o.medications_prescribed,
      follow_up_plan: o.follow_up_plan,
      internal_notes: o.internal_notes,
      status: "draft",
      created_by_user_id: user.id,
      amends_encounter_id: originalEncounterId,
    })
    .select("*")
    .single();

  if (insErr || !inserted) throw new Error(insErr?.message ?? "Could not create amendment");

  const row = inserted as PatientEncounter;
  await logEncounterAction(row.id, "created", { amendment_of: originalEncounterId });
  await logEncounterAction(originalEncounterId, "amended", { amendment_id: row.id });

  const { data: vit } = await supabase
    .from("encounter_vitals")
    .select("*")
    .eq("encounter_id", originalEncounterId)
    .order("recorded_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (vit) {
    const v = vit as Record<string, unknown>;
    await supabase.from("encounter_vitals").insert({
      encounter_id: row.id,
      systolic_bp: v.systolic_bp,
      diastolic_bp: v.diastolic_bp,
      heart_rate: v.heart_rate,
      respiratory_rate: v.respiratory_rate,
      temperature_f: v.temperature_f,
      weight_lbs: v.weight_lbs,
      height_inches: v.height_inches,
      spo2_pct: v.spo2_pct,
      recorded_by_user_id: user.id,
    });
  }

  return row;
}
