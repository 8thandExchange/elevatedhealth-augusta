DROP POLICY IF EXISTS "Admins can manage SKU catalog" ON public.inventory_skus;
DROP POLICY IF EXISTS "Staff and admins can manage SKU catalog" ON public.inventory_skus;

CREATE POLICY "Staff and admins can manage SKU catalog"
  ON public.inventory_skus FOR ALL
  USING (
    public.has_role(auth.uid(), 'admin'::app_role)
    OR public.has_role(auth.uid(), 'staff'::app_role)
  )
  WITH CHECK (
    public.has_role(auth.uid(), 'admin'::app_role)
    OR public.has_role(auth.uid(), 'staff'::app_role)
  );

DROP POLICY IF EXISTS "Admins can read all dispensations" ON public.inventory_dispensations;
DROP POLICY IF EXISTS "Staff can read their own dispensations" ON public.inventory_dispensations;
DROP POLICY IF EXISTS "Staff and admins can read all dispensations" ON public.inventory_dispensations;

CREATE POLICY "Staff and admins can read all dispensations"
  ON public.inventory_dispensations FOR SELECT
  USING (
    public.has_role(auth.uid(), 'admin'::app_role)
    OR public.has_role(auth.uid(), 'staff'::app_role)
  );