-- ============================================================================
-- Revise inventory RLS: staff get full operational visibility (same as admin)
-- for SKU catalog management and complete dispensation audit history.
--
-- Idempotent for databases that already applied 20260509220000 with the
-- previous admin-only SKU policy and staff-self-only dispensation SELECT.
-- ============================================================================

-- inventory_skus: staff + admin may INSERT/UPDATE/DELETE (not admin-only)
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

-- inventory_dispensations: single SELECT policy for full history
DROP POLICY IF EXISTS "Admins can read all dispensations" ON public.inventory_dispensations;
DROP POLICY IF EXISTS "Staff can read their own dispensations" ON public.inventory_dispensations;
DROP POLICY IF EXISTS "Staff and admins can read all dispensations" ON public.inventory_dispensations;

CREATE POLICY "Staff and admins can read all dispensations"
  ON public.inventory_dispensations FOR SELECT
  USING (
    public.has_role(auth.uid(), 'admin'::app_role)
    OR public.has_role(auth.uid(), 'staff'::app_role)
  );

-- inventory_lots policies unchanged from 20260509220000; no-op here.
