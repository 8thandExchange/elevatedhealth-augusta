-- Allow clinic staff (not only admin) to add/update fax pharmacies from the provider UI.
DROP POLICY IF EXISTS pharmacies_admin_write ON public.pharmacies;

DROP POLICY IF EXISTS pharmacies_staff_admin_write ON public.pharmacies;
CREATE POLICY pharmacies_staff_admin_write ON public.pharmacies
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role IN ('admin', 'staff')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role IN ('admin', 'staff')
    )
  );
