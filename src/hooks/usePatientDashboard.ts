import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { GfeClearanceRow } from "@/lib/gfeClearance";

export interface DashboardAppointment {
  id: string;
  scheduled_at: string;
  duration_minutes: number;
  service_line: string;
  status: string;
  is_telehealth: boolean | null;
}

export interface DashboardLabOrder {
  id: string;
  panel_slug: string;
  status: string;
  ordered_at: string;
}

export interface DashboardLabResult {
  id: string;
  collection_date: string;
  testosterone_t: number | null;
  estradiol_e2: number | null;
  progesterone_pg: number | null;
  tsh: number | null;
  a1c: number | null;
}

export interface DashboardConsentRecord {
  id: string;
  consent_type: string;
  signed_at: string;
  expires_at: string;
  revoked_at: string | null;
  pdf_storage_path: string | null;
  signed_typed_name: string;
}

export interface DashboardTreatmentPlan {
  id: string;
  title: string;
  service_line: string;
  status: string;
  start_date: string;
  interventions: unknown;
}

export interface DashboardMedication {
  id: string;
  medication_name: string;
  dosage: string;
  frequency: string;
  route: string;
  status: string;
}

export interface PatientDashboardData {
  nextAppointment: DashboardAppointment | null;
  upcomingAppointments: DashboardAppointment[];
  pastAppointments: DashboardAppointment[];
  labOrders: DashboardLabOrder[];
  labResults: DashboardLabResult[];
  consentRecords: DashboardConsentRecord[];
  treatmentPlans: DashboardTreatmentPlan[];
  medications: DashboardMedication[];
  gfeRows: GfeClearanceRow[];
  hasPaidConsultBooking: boolean;
  paidConsultBookingId: string | null;
}

const QUERY_KEY = (patientId: string) => ["patientDashboard", patientId] as const;

export function usePatientDashboard(patientId: string | undefined, patientEmail?: string | null) {
  return useQuery({
    queryKey: patientId ? [...QUERY_KEY(patientId), patientEmail ?? ""] : ["patientDashboard", "none"],
    queryFn: async (): Promise<PatientDashboardData> => {
      const nowIso = new Date().toISOString();
      const normalizedEmail = patientEmail?.toLowerCase().trim() ?? "";

      const [apptRes, labOrderRes, labResultRes, consentRes, planRes, medRes, gfeRes, bookingRes] =
        await Promise.all([
          supabase
            .from("appointments")
            .select("id, scheduled_at, duration_minutes, service_line, status, is_telehealth")
            .eq("patient_id", patientId!)
            .neq("status", "cancelled")
            .order("scheduled_at", { ascending: true }),
          supabase
            .from("lab_orders")
            .select("id, panel_slug, status, ordered_at")
            .eq("patient_id", patientId!)
            .neq("status", "cancelled")
            .order("ordered_at", { ascending: false })
            .limit(6),
          supabase
            .from("lab_results")
            .select("id, collection_date, testosterone_t, estradiol_e2, progesterone_pg, tsh, a1c")
            .eq("patient_id", patientId!)
            .order("collection_date", { ascending: false })
            .limit(5),
          supabase
            .from("consent_records")
            .select(
              "id, consent_type, signed_at, expires_at, revoked_at, pdf_storage_path, signed_typed_name",
            )
            .eq("patient_id", patientId!)
            .is("revoked_at", null)
            .order("signed_at", { ascending: false }),
          supabase
            .from("treatment_plans")
            .select("id, title, service_line, status, start_date, interventions")
            .eq("patient_id", patientId!)
            .in("status", ["active", "draft"])
            .order("created_at", { ascending: false })
            .limit(3),
          supabase
            .from("medications")
            .select("id, medication_name, dosage, frequency, route, status")
            .eq("patient_id", patientId!)
            .eq("status", "active")
            .order("start_date", { ascending: false })
            .limit(8),
          supabase
            .from("gfe_clearances")
            .select(
              "id, patient_id, service_category, clearance_source, status, approved_at, expires_at, exam_name, provider_name, sent_at, meeting_url, created_at",
            )
            .eq("patient_id", patientId!)
            .order("created_at", { ascending: false })
            .limit(5),
          normalizedEmail
            ? supabase
                .from("consultation_bookings")
                .select("id, status")
                .eq("customer_email", normalizedEmail)
                .eq("status", "paid")
                .order("created_at", { ascending: false })
                .limit(1)
                .maybeSingle()
            : Promise.resolve({ data: null, error: null }),
        ]);

      if (bookingRes.error) throw bookingRes.error;

      if (apptRes.error) throw apptRes.error;
      if (labOrderRes.error) throw labOrderRes.error;
      if (labResultRes.error) throw labResultRes.error;
      if (consentRes.error) throw consentRes.error;
      if (planRes.error) throw planRes.error;
      if (medRes.error) throw medRes.error;
      if (gfeRes.error) throw gfeRes.error;

      const appointments = (apptRes.data ?? []) as DashboardAppointment[];
      const terminal = new Set(["completed", "cancelled", "no_show"]);

      const upcomingAppointments = appointments.filter(
        (a) => a.scheduled_at >= nowIso && !terminal.has(a.status),
      );
      const pastAppointments = appointments
        .filter((a) => a.scheduled_at < nowIso || terminal.has(a.status))
        .reverse();

      return {
        nextAppointment: upcomingAppointments[0] ?? null,
        upcomingAppointments,
        pastAppointments,
        labOrders: (labOrderRes.data ?? []) as DashboardLabOrder[],
        labResults: (labResultRes.data ?? []) as DashboardLabResult[],
        consentRecords: (consentRes.data ?? []) as DashboardConsentRecord[],
        treatmentPlans: (planRes.data ?? []) as DashboardTreatmentPlan[],
        medications: (medRes.data ?? []) as DashboardMedication[],
        gfeRows: (gfeRes.data ?? []) as GfeClearanceRow[],
        hasPaidConsultBooking: !!bookingRes.data?.id,
        paidConsultBookingId: bookingRes.data?.id ?? null,
      };
    },
    enabled: !!patientId,
    staleTime: 60_000,
  });
}
