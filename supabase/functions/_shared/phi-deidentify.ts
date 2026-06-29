/**
 * HIPAA Safe Harbor de-identification helpers for outbound AI payloads.
 * Allowlist-only — never pass whole patient rows or free-text clinical notes.
 */

export type DeidentifiedLabPatientInput = {
  dob?: string | null;
  gender?: string | null;
  primary_program?: string | null;
  treatment_request?: string | null;
  service_interests?: unknown;
  medical_history?: unknown;
  medications?: Array<{
    medication_name?: string | null;
    service_line?: string | null;
  }> | null;
};

export type DeidentifiedLabContext = {
  ageBracket: string;
  sex: string;
  program: string;
  symptomList: string[];
  medicationList: string[];
};

const SAFE_HARBOR_AGE_CAP = 90;

/** Integer age string; ages >= 90 become "90+" per Safe Harbor. */
export function safeHarborAge(dob: string | Date): string {
  const born = dob instanceof Date ? dob : new Date(dob);
  if (Number.isNaN(born.getTime())) return "unknown";
  const age = Math.floor(
    (Date.now() - born.getTime()) / (365.25 * 24 * 60 * 60 * 1000),
  );
  if (age >= SAFE_HARBOR_AGE_CAP) return "90+";
  if (age < 0) return "unknown";
  return String(age);
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

/** Map structured screening booleans to coded symptom tokens (no free text). */
function codedSymptomsFromMedicalHistory(mh: Record<string, unknown>): string[] {
  const out = new Set<string>();

  const safety = asRecord(mh.safety_screening);
  for (const [key, val] of Object.entries(safety)) {
    if (val === true) out.add(`screen:${key}`);
  }

  const family = asRecord(mh.family_history);
  for (const [key, val] of Object.entries(family)) {
    if (val === true) out.add(`family:${key}`);
  }

  return [...out];
}

function serviceInterestList(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((x): x is string => typeof x === "string" && x.trim().length > 0)
    .map((x) => x.trim());
}

/**
 * Safe Harbor allowlist for recommend-lab-panel OpenAI context.
 * Excludes name, dob, id, address, phone, email, dates, and all free-text clinical fields
 * (medical_history blobs, treatment_request, medication dosages, referral detail, etc.).
 */
export function toDeidentifiedLabContext(
  patient: DeidentifiedLabPatientInput,
): DeidentifiedLabContext {
  const mh = asRecord(patient.medical_history);

  const symptomList = [
    ...serviceInterestList(patient.service_interests),
    ...codedSymptomsFromMedicalHistory(mh),
  ];

  const medicationList = (patient.medications ?? [])
    .map((m) => {
      const name = m.medication_name?.trim();
      if (!name) return null;
      const line = m.service_line?.trim();
      return line ? `${name} (${line})` : name;
    })
    .filter((x): x is string => Boolean(x));

  return {
    ageBracket: patient.dob ? safeHarborAge(patient.dob) : "unknown",
    sex: patient.gender?.trim() || "unknown",
    program: patient.primary_program?.trim() || "unknown",
    symptomList: [...new Set(symptomList)],
    medicationList,
  };
}

export function formatDeidentifiedLabPrompt(ctx: DeidentifiedLabContext): string {
  return [
    "De-identified patient context (Safe Harbor — no PHI identifiers):",
    `- Age bracket: ${ctx.ageBracket}`,
    `- Sex: ${ctx.sex}`,
    `- Primary program: ${ctx.program}`,
    `- Symptom / interest codes: ${ctx.symptomList.length ? ctx.symptomList.join(", ") : "none documented"}`,
    `- Active medication classes: ${ctx.medicationList.length ? ctx.medicationList.join(", ") : "none"}`,
    "",
    "Recommend the appropriate baseline / monitoring lab panel.",
  ].join("\n");
}
