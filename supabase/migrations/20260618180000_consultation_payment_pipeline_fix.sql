-- Consultation payment pipeline: clearer defaults + staff RLS on consultation_bookings.

BEGIN;

ALTER TABLE public.consultation_bookings
  ALTER COLUMN amount_paid DROP DEFAULT;

DROP POLICY IF EXISTS "Staff and admins can view all bookings" ON public.consultation_bookings;
CREATE POLICY "Staff and admins can view all bookings"
  ON public.consultation_bookings
  FOR SELECT
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin'::public.app_role)
    OR public.has_role(auth.uid(), 'staff'::public.app_role)
    OR public.has_role(auth.uid(), 'provider'::public.app_role)
    OR public.has_business_admin_role(auth.uid())
  );

DROP POLICY IF EXISTS "Staff and admins can update bookings" ON public.consultation_bookings;
CREATE POLICY "Staff and admins can update bookings"
  ON public.consultation_bookings
  FOR UPDATE
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin'::public.app_role)
    OR public.has_role(auth.uid(), 'staff'::public.app_role)
    OR public.has_role(auth.uid(), 'provider'::public.app_role)
    OR public.has_business_admin_role(auth.uid())
  )
  WITH CHECK (
    public.has_role(auth.uid(), 'admin'::public.app_role)
    OR public.has_role(auth.uid(), 'staff'::public.app_role)
    OR public.has_role(auth.uid(), 'provider'::public.app_role)
    OR public.has_business_admin_role(auth.uid())
  );

COMMIT;
