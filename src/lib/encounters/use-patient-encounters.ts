import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { PatientEncounter } from "@/data/encounters/types";

const PAGE_SIZE = 15;

export function usePatientEncounters(patientId: string | undefined, page: number) {
  const from = page * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  return useQuery({
    queryKey: ["patient_encounters", patientId, page],
    enabled: Boolean(patientId),
    queryFn: async () => {
      if (!patientId) return { rows: [] as PatientEncounter[], total: 0 };

      const { count, error: cErr } = await supabase
        .from("patient_encounters")
        .select("id", { count: "exact", head: true })
        .eq("patient_id", patientId);

      if (cErr) throw new Error(cErr.message);

      const { data, error } = await supabase
        .from("patient_encounters")
        .select("*")
        .eq("patient_id", patientId)
        .order("encounter_date", { ascending: false })
        .range(from, to);

      if (error) throw new Error(error.message);
      return { rows: (data ?? []) as PatientEncounter[], total: count ?? 0 };
    },
  });
}
