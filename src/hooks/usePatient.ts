import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface Patient {
  id: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  avatar_url: string | null;
  dob: string | null;
  gender: string | null;
  current_protocol: string | null;
  intake_completed: boolean | null;
  onboarding_status: string | null;
  primary_program: string | null;
  risk_status: string | null;
  safety_flags: any;
  treatment_request: string | null;
  membership_tier: string | null;
  membership_renewal_date: string | null;
  elevated_membership_status?: string | null;
  elevated_program?: string | null;
  elevated_program_addon?: string | null;
  street_address: string | null;
  city: string | null;
  state: string | null;
  zip_code: string | null;
  allergies: string | null;
  consent_completed_at: string | null;
  intake_consents_completed_at?: string | null;
}

export interface SymptomLog {
  id: string;
  date_logged: string;
  estrogen_score: number | null;
  progesterone_score: number | null;
  androgen_score: number | null;
  cortisol_score: number | null;
}

export interface Order {
  id: string;
  status: string;
  protocol_snapshot: any;
  created_at: string;
}

export interface KitTracking {
  id: string;
  zrt_kit_status: string;
  tracking_number: string | null;
  shipped_at: string | null;
  sample_received_at: string | null;
  results_ready_at: string | null;
}

export interface NeurotransmitterPayment {
  id: string;
  kit_status: string;
  tracking_number: string | null;
  shipped_at: string | null;
  sample_received_at: string | null;
  results_ready_at: string | null;
}

export interface MetabolicPayment {
  id: string;
  kit_status: string;
  tracking_number: string | null;
  shipped_at: string | null;
  sample_received_at: string | null;
  results_ready_at: string | null;
}

export interface LabResult {
  id: string;
  collection_date: string;
  vitamin_d: number | null;
  magnesium: number | null;
  cortisol_morning: number | null;
  cortisol_night: number | null;
  fasting_insulin: number | null;
  a1c: number | null;
  tsh: number | null;
  mercury: number | null;
  lead_level: number | null;
  serotonin: number | null;
  gaba: number | null;
  triglycerides: number | null;
  testosterone_t: number | null;
  estradiol_e2: number | null;
  progesterone_pg: number | null;
  dhea_s: number | null;
}

const QUERY_KEYS = {
  patient: ["patient"] as const,
  latestSymptomLog: (patientId: string) => ["symptomLog", patientId, "latest"] as const,
  latestOrder: (patientId: string) => ["order", patientId, "latest"] as const,
  kitTracking: (patientId: string) => ["kitTracking", patientId] as const,
  latestLabResult: (patientId: string) => ["labResult", patientId, "latest"] as const,
};

/**
 * Fetches and caches the current user's patient profile
 */
export function usePatient() {
  const { user, isLoggedIn } = useAuth();
  
  return useQuery({
    queryKey: QUERY_KEYS.patient,
    queryFn: async (): Promise<Patient | null> => {
      const { data, error } = await supabase
        .from("patients")
        .select("*")
        .eq("user_id", user!.id)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: isLoggedIn && !!user,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes (formerly cacheTime)
  });
}

/**
 * Fetches the latest symptom log for a patient
 */
export function useLatestSymptomLog(patientId: string | undefined) {
  return useQuery({
    queryKey: patientId ? QUERY_KEYS.latestSymptomLog(patientId) : ["symptomLog", "none"],
    queryFn: async (): Promise<SymptomLog | null> => {
      const { data, error } = await supabase
        .from("symptom_logs")
        .select("id, date_logged, estrogen_score, progesterone_score, androgen_score, cortisol_score")
        .eq("patient_id", patientId!)
        .order("date_logged", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!patientId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

/**
 * Fetches the latest order for a patient
 */
export function useLatestOrder(patientId: string | undefined) {
  return useQuery({
    queryKey: patientId ? QUERY_KEYS.latestOrder(patientId) : ["order", "none"],
    queryFn: async (): Promise<Order | null> => {
      const { data, error } = await supabase
        .from("orders")
        .select("id, status, protocol_snapshot, created_at")
        .eq("patient_id", patientId!)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!patientId,
    staleTime: 2 * 60 * 1000,
  });
}

/**
 * Fetches kit tracking info for hormone mapping payments
 */
export function useKitTracking(patientId: string | undefined) {
  return useQuery({
    queryKey: patientId ? QUERY_KEYS.kitTracking(patientId) : ["kitTracking", "none"],
    queryFn: async (): Promise<KitTracking | null> => {
      const { data, error } = await supabase
        .from("hormone_mapping_payments")
        .select("id, zrt_kit_status, tracking_number, shipped_at, sample_received_at, results_ready_at")
        .eq("patient_id", patientId!)
        .eq("payment_status", "paid")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!patientId,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Fetches the latest lab result for a patient
 */
export function useLatestLabResult(patientId: string | undefined) {
  return useQuery({
    queryKey: patientId ? QUERY_KEYS.latestLabResult(patientId) : ["labResult", "none"],
    queryFn: async (): Promise<LabResult | null> => {
      const { data, error } = await supabase
        .from("lab_results")
        .select(`
          id, collection_date,
          vitamin_d, magnesium, cortisol_morning, cortisol_night,
          fasting_insulin, a1c, tsh, mercury, lead_level,
          serotonin, gaba, triglycerides,
          testosterone_t, estradiol_e2, progesterone_pg, dhea_s
        `)
        .eq("patient_id", patientId!)
        .order("collection_date", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!patientId,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Hook to update patient profile
 */
export function useUpdatePatient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ patientId, updates }: { patientId: string; updates: Partial<Patient> }) => {
      const { data, error } = await supabase
        .from("patients")
        .update(updates)
        .eq("id", patientId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.patient });
    },
  });
}

/**
 * Fetches the latest neurotransmitter payment for a patient
 */
export function useNeurotransmitterPayment(patientId: string | undefined) {
  return useQuery({
    queryKey: patientId ? ["neurotransmitterPayment", patientId] : ["neurotransmitterPayment", "none"],
    queryFn: async (): Promise<NeurotransmitterPayment | null> => {
      const { data, error } = await supabase
        .from("neurotransmitter_payments")
        .select("id, kit_status, tracking_number, shipped_at, sample_received_at, results_ready_at")
        .eq("patient_id", patientId!)
        .eq("payment_status", "paid")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!patientId,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Fetches the latest metabolic payment for a patient
 */
export function useMetabolicPayment(patientId: string | undefined) {
  return useQuery({
    queryKey: patientId ? ["metabolicPayment", patientId] : ["metabolicPayment", "none"],
    queryFn: async (): Promise<MetabolicPayment | null> => {
      const { data, error } = await supabase
        .from("metabolic_payments")
        .select("id, kit_status, tracking_number, shipped_at, sample_received_at, results_ready_at")
        .eq("patient_id", patientId!)
        .eq("payment_status", "paid")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!patientId,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Hook to invalidate all patient-related queries (useful after major updates)
 */
export function useInvalidatePatientData() {
  const queryClient = useQueryClient();

  return {
    invalidateAll: (patientId?: string) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.patient });
      if (patientId) {
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.latestSymptomLog(patientId) });
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.latestOrder(patientId) });
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.kitTracking(patientId) });
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.latestLabResult(patientId) });
        queryClient.invalidateQueries({ queryKey: ["neurotransmitterPayment", patientId] });
        queryClient.invalidateQueries({ queryKey: ["metabolicPayment", patientId] });
      }
    },
    invalidatePatient: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.patient });
    },
    invalidateSymptomLogs: (patientId: string) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.latestSymptomLog(patientId) });
    },
    invalidateOrders: (patientId: string) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.latestOrder(patientId) });
    },
    invalidateLabResults: (patientId: string) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.latestLabResult(patientId) });
    },
    invalidateNeurotransmitterPayment: (patientId: string) => {
      queryClient.invalidateQueries({ queryKey: ["neurotransmitterPayment", patientId] });
    },
    invalidateMetabolicPayment: (patientId: string) => {
      queryClient.invalidateQueries({ queryKey: ["metabolicPayment", patientId] });
    },
  };
}
