-- RLS: allow staff/admin to insert orders from provider surfaces (e.g. PrescriptionPortalModal).
-- Pharmacies table, orders extension columns, pharmacy seed, and pharmacies SELECT policy
-- were applied earlier (Lovable Phase 1); this migration only adds the missing INSERT policy
-- after R-10 dropped patient self-INSERT on orders.

DROP POLICY IF EXISTS "Staff and admins can insert orders" ON public.orders;

CREATE POLICY "Staff and admins can insert orders"
  ON public.orders
  FOR INSERT
  TO authenticated
  WITH CHECK (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'staff'));
