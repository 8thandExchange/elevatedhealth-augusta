-- Office calendar access: business_admin + provider-wide read for unified schedule.
-- Staff/admin already had full manage via legacy policy; extend to business_admin.
-- Providers need SELECT on all rows for the multi-column office grid (updates stay scoped).

BEGIN;

DROP POLICY IF EXISTS "Staff and admins can manage appointments" ON public.appointments;

CREATE POLICY "Staff and admins can manage appointments"
  ON public.appointments
  FOR ALL
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin'::public.app_role)
    OR public.has_role(auth.uid(), 'staff'::public.app_role)
    OR public.has_business_admin_role(auth.uid())
  )
  WITH CHECK (
    public.has_role(auth.uid(), 'admin'::public.app_role)
    OR public.has_role(auth.uid(), 'staff'::public.app_role)
    OR public.has_business_admin_role(auth.uid())
  );

DROP POLICY IF EXISTS "appointments_provider_office_schedule_select" ON public.appointments;
CREATE POLICY "appointments_provider_office_schedule_select"
  ON public.appointments
  FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'provider'::public.app_role));

COMMIT;
