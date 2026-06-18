-- Fix infinite RLS recursion on patients (Postgres 42P17).
--
-- Cycle: patients_provider_select_treated → appointments →
--   "Patients can view their own appointments" → patients → …
--
-- Providers already have full patient read via "Staff and admins can read all
-- patients" (migration 20260618160000). This legacy treated-only policy is
-- redundant and triggers the recursion for every authenticated SELECT.

DROP POLICY IF EXISTS "patients_provider_select_treated" ON public.patients;

-- Break the appointments ↔ patients cycle for patient self-read policies.
CREATE OR REPLACE FUNCTION public.auth_owns_patient(_patient_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.patients
    WHERE id = _patient_id
      AND user_id = auth.uid()
  );
$$;

DROP POLICY IF EXISTS "Patients can view their own appointments" ON public.appointments;
CREATE POLICY "Patients can view their own appointments"
  ON public.appointments
  FOR SELECT
  TO authenticated
  USING (public.auth_owns_patient(patient_id));
