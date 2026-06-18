/** Good Faith Exam clearance validity — clinic policy: 12 months when approved. */
export const GFE_VALIDITY_MONTHS = 12;

export type GfeClearanceStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "deferred"
  | "missed"
  | "na"
  | "cancelled";

export type GfeClearanceSource = "qualiphy" | "in_clinic";

export type GfeServiceCategory =
  | "general"
  | "iv_therapy"
  | "hormone"
  | "weight_loss"
  | "peptide";

export interface GfeClearanceRow {
  id: string;
  patient_id: string;
  service_category: GfeServiceCategory;
  clearance_source: GfeClearanceSource;
  status: GfeClearanceStatus;
  approved_at: string | null;
  expires_at: string | null;
  exam_name: string | null;
  provider_name: string | null;
  pdf_storage_path: string | null;
  sent_at: string | null;
  meeting_url: string | null;
  notes: string | null;
  created_at: string;
}

/** Patient onboarding statuses that indicate $79 wellness assessment was paid. */
export const POST_CONSULT_PAYMENT_STATUSES = new Set([
  "consultation_paid",
  "gfe_pending",
  "gfe_cleared",
  "consultation_scheduled",
  "consultation_complete",
  "intake_complete",
  "awaiting_blood_work",
  "labs_in_progress",
  "results_ready",
  "labs_reviewed",
  "protocol_review",
  "protocol_approved",
  "treatment_active",
  "active",
  "awaiting_medical_clearance",
  "glp1_approved",
  "medical_clearance_complete",
  "glp1_rx_sent",
  "rx_sent",
]);

export function addMonthsUtc(isoDate: string, months: number): Date {
  const d = new Date(isoDate);
  d.setUTCMonth(d.getUTCMonth() + months);
  return d;
}

export function computeGfeExpiresAt(approvedAtIso: string): Date {
  return addMonthsUtc(approvedAtIso, GFE_VALIDITY_MONTHS);
}

export function isGfeClearanceCurrentlyValid(
  row: Pick<GfeClearanceRow, "status" | "expires_at" | "approved_at">,
  now: Date = new Date(),
): boolean {
  if (row.status !== "approved") return false;
  const expiresAt = row.expires_at
    ? new Date(row.expires_at)
    : row.approved_at
      ? computeGfeExpiresAt(row.approved_at)
      : null;
  if (!expiresAt) return false;
  return expiresAt.getTime() > now.getTime();
}

/** Latest approved clearance wins when multiple rows exist. */
export function pickActiveGfeClearance(rows: GfeClearanceRow[]): GfeClearanceRow | null {
  const approved = rows
    .filter((r) => isGfeClearanceCurrentlyValid(r))
    .sort(
      (a, b) =>
        new Date(b.approved_at ?? b.created_at).getTime() -
        new Date(a.approved_at ?? a.created_at).getTime(),
    );
  return approved[0] ?? null;
}

/**
 * True when staff should see the option to send / record a GFE
 * (paid consult assumed checked separately).
 */
export function shouldPromptForGfe(rows: GfeClearanceRow[], now: Date = new Date()): boolean {
  if (pickActiveGfeClearance(rows)) return false;
  const pending = rows.some((r) => r.status === "pending");
  if (pending) return false;
  return true;
}

export function patientLikelyPaidConsult(onboardingStatus: string | null | undefined): boolean {
  if (!onboardingStatus) return false;
  return POST_CONSULT_PAYMENT_STATUSES.has(onboardingStatus);
}

export function gfeStatusLabel(row: GfeClearanceRow | null): string {
  if (!row) return "No GFE on file";
  if (isGfeClearanceCurrentlyValid(row)) {
    const until = row.expires_at
      ? new Date(row.expires_at).toLocaleDateString(undefined, {
          month: "short",
          day: "numeric",
          year: "numeric",
        })
      : row.approved_at
        ? computeGfeExpiresAt(row.approved_at).toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
            year: "numeric",
          })
        : "";
    return until ? `Cleared until ${until}` : "Cleared";
  }
  if (row.status === "approved") {
    return "Cleared";
  }
  switch (row.status) {
    case "pending":
      return "Remote GFE invite sent — awaiting completion";
    case "rejected":
      return "GFE not approved — follow up required";
    case "deferred":
      return "GFE deferred to medical director";
    case "missed":
      return "Patient missed remote GFE — resend or do in-clinic";
    default:
      return "GFE expired or incomplete";
  }
}

/** True when the patient may schedule their wellness visit (GFE complete). */
export function patientGfeIsComplete(
  rows: GfeClearanceRow[],
  onboardingStatus?: string | null,
): boolean {
  if (pickActiveGfeClearance(rows)) return true;
  if (onboardingStatus === "gfe_cleared") return true;
  return rows.some((r) => r.status === "approved");
}

/**
 * Row to show in patient UI — ignores stale pending invites when clearance is already approved.
 */
export function pickPatientGfeDisplayRow(
  rows: GfeClearanceRow[],
  onboardingStatus?: string | null,
): GfeClearanceRow | null {
  if (!rows.length) return null;

  const active = pickActiveGfeClearance(rows);
  if (active) return active;

  const approved = rows
    .filter((r) => r.status === "approved")
    .sort(
      (a, b) =>
        new Date(b.approved_at ?? b.created_at).getTime() -
        new Date(a.approved_at ?? a.created_at).getTime(),
    );
  if (approved[0]) return approved[0];

  if (patientGfeIsComplete(rows, onboardingStatus)) {
    return null;
  }

  return (
    rows.find((r) => r.status !== "cancelled" && r.status !== "na") ?? rows[0] ?? null
  );
}

/** Single label for all patient-facing GFE status surfaces. */
export function patientGfeDisplayLabel(
  rows: GfeClearanceRow[],
  onboardingStatus?: string | null,
): string {
  if (patientGfeIsComplete(rows, onboardingStatus)) {
    const row = pickPatientGfeDisplayRow(rows, onboardingStatus);
    if (row) return gfeStatusLabel(row);
    if (onboardingStatus === "gfe_cleared") {
      return "Cleared — schedule your visit";
    }
    return "Cleared";
  }
  return gfeStatusLabel(pickPatientGfeDisplayRow(rows, onboardingStatus));
}
