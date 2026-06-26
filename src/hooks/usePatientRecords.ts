import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface VisitNote {
  id: string;
  encounter_date: string;
  encounter_type: string | null;
  chief_complaint: string | null;
  subjective: string | null;
  objective: string | null;
  assessment: string | null;
  plan: string | null;
  follow_up_plan: string | null;
  signed_at: string | null;
}

export interface PatientDocumentRow {
  id: string;
  document_type: string | null;
  file_name: string | null;
  file_url: string | null;
  notes: string | null;
  created_at: string;
}

export interface SuperbillRow {
  id: string;
  date_of_service: string | null;
  total_charge: number | null;
  cpt_codes: unknown;
  diagnosis_codes: unknown;
  notes: string | null;
  created_at: string;
}

export interface IvVisitRow {
  id: string;
  therapy_name: string | null;
  amount_paid: number | null;
  payment_status: string | null;
  created_at: string;
}

export interface PatientRecordsData {
  visitNotes: VisitNote[];
  documents: PatientDocumentRow[];
  superbills: SuperbillRow[];
  ivVisits: IvVisitRow[];
}

export function usePatientRecords(patientId: string | undefined, patientEmail?: string | null) {
  const normalizedEmail = patientEmail?.toLowerCase().trim() ?? "";

  return useQuery({
    queryKey: patientId ? ["patientRecords", patientId, normalizedEmail] : ["patientRecords", "none"],
    queryFn: async (): Promise<PatientRecordsData> => {
      const [encounterRes, docRes, superbillRes, ivRes] = await Promise.all([
        supabase
          .from("patient_encounters")
          .select(
            "id, encounter_date, encounter_type, chief_complaint, subjective, objective, assessment, plan, follow_up_plan, signed_at",
          )
          .eq("patient_id", patientId!)
          .not("signed_at", "is", null)
          .order("encounter_date", { ascending: false })
          .limit(20),
        supabase
          .from("patient_documents")
          .select("id, document_type, file_name, file_url, notes, created_at")
          .eq("patient_id", patientId!)
          .order("created_at", { ascending: false })
          .limit(30),
        supabase
          .from("superbills")
          .select("id, date_of_service, total_charge, cpt_codes, diagnosis_codes, notes, created_at")
          .eq("patient_id", patientId!)
          .order("date_of_service", { ascending: false })
          .limit(20),
        normalizedEmail
          ? supabase
              .from("iv_drip_bookings")
              .select("id, therapy_name, amount_paid, payment_status, created_at")
              .eq("customer_email", normalizedEmail)
              .order("created_at", { ascending: false })
              .limit(10)
          : Promise.resolve({ data: [], error: null }),
      ]);

      if (encounterRes.error) throw encounterRes.error;
      if (docRes.error) throw docRes.error;
      if (superbillRes.error) throw superbillRes.error;
      if (ivRes.error) throw ivRes.error;

      return {
        visitNotes: (encounterRes.data ?? []) as VisitNote[],
        documents: (docRes.data ?? []) as PatientDocumentRow[],
        superbills: (superbillRes.data ?? []) as SuperbillRow[],
        ivVisits: (ivRes.data ?? []) as IvVisitRow[],
      };
    },
    enabled: !!patientId,
    staleTime: 60_000,
  });
}
