-- Staff/admin read policies for onboarding credit funnel tables.
-- Uses existing role helpers: has_role(admin|provider) + has_business_admin_role.
-- Patient-self policies remain from 20260629210000_onboarding_credit_funnel.sql.

BEGIN;

DROP POLICY IF EXISTS onboarding_credits_staff_read ON public.onboarding_credits;
CREATE POLICY onboarding_credits_staff_read
  ON public.onboarding_credits
  FOR SELECT
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin'::public.app_role)
    OR public.has_role(auth.uid(), 'provider'::public.app_role)
    OR public.has_business_admin_role(auth.uid())
  );

DROP POLICY IF EXISTS patient_journey_staff_read ON public.patient_journey;
CREATE POLICY patient_journey_staff_read
  ON public.patient_journey
  FOR SELECT
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin'::public.app_role)
    OR public.has_role(auth.uid(), 'provider'::public.app_role)
    OR public.has_business_admin_role(auth.uid())
  );

DROP POLICY IF EXISTS patient_journey_events_staff_read ON public.patient_journey_events;
CREATE POLICY patient_journey_events_staff_read
  ON public.patient_journey_events
  FOR SELECT
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin'::public.app_role)
    OR public.has_role(auth.uid(), 'provider'::public.app_role)
    OR public.has_business_admin_role(auth.uid())
  );

COMMIT;
