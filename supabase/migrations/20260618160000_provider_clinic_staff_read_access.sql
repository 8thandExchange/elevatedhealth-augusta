-- Provider portal: align RLS with Provider Dashboard + scheduling patient search.
--
-- The provider-only "treated patients" policies (20260520095500) require a past/today
-- appointment before a patient row is readable. That blocks:
--   - Triage queue (intake-complete patients with no visit yet)
--   - orders.pending_review joins in ProviderDashboard
--   - Future appointment patient names on the calendar
--
-- Prescribers use the same clinical roster as staff; extend staff read/write policies
-- to include app_role provider. Treated-only policies remain as an additional path.

BEGIN;

DROP POLICY IF EXISTS "Staff and admins can read all patients" ON public.patients;
CREATE POLICY "Staff and admins can read all patients"
  ON public.patients
  FOR SELECT
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin'::public.app_role)
    OR public.has_role(auth.uid(), 'staff'::public.app_role)
    OR public.has_role(auth.uid(), 'provider'::public.app_role)
    OR public.has_business_admin_role(auth.uid())
  );

DROP POLICY IF EXISTS "Staff and admins can update patients" ON public.patients;
CREATE POLICY "Staff and admins can update patients"
  ON public.patients
  FOR UPDATE
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin'::public.app_role)
    OR public.has_role(auth.uid(), 'staff'::public.app_role)
    OR public.has_role(auth.uid(), 'provider'::public.app_role)
  )
  WITH CHECK (
    public.has_role(auth.uid(), 'admin'::public.app_role)
    OR public.has_role(auth.uid(), 'staff'::public.app_role)
    OR public.has_role(auth.uid(), 'provider'::public.app_role)
  );

DROP POLICY IF EXISTS "Staff and admins can view all orders" ON public.orders;
CREATE POLICY "Staff and admins can view all orders"
  ON public.orders
  FOR SELECT
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin'::public.app_role)
    OR public.has_role(auth.uid(), 'staff'::public.app_role)
    OR public.has_role(auth.uid(), 'provider'::public.app_role)
  );

DROP POLICY IF EXISTS "Staff and admins can update orders" ON public.orders;
CREATE POLICY "Staff and admins can update orders"
  ON public.orders
  FOR UPDATE
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin'::public.app_role)
    OR public.has_role(auth.uid(), 'staff'::public.app_role)
    OR public.has_role(auth.uid(), 'provider'::public.app_role)
  )
  WITH CHECK (
    public.has_role(auth.uid(), 'admin'::public.app_role)
    OR public.has_role(auth.uid(), 'staff'::public.app_role)
    OR public.has_role(auth.uid(), 'provider'::public.app_role)
  );

DROP POLICY IF EXISTS "Staff and admins can insert orders" ON public.orders;
CREATE POLICY "Staff and admins can insert orders"
  ON public.orders
  FOR INSERT
  TO authenticated
  WITH CHECK (
    public.has_role(auth.uid(), 'admin'::public.app_role)
    OR public.has_role(auth.uid(), 'staff'::public.app_role)
    OR public.has_role(auth.uid(), 'provider'::public.app_role)
  );

DROP POLICY IF EXISTS "Staff and admins can view all symptom logs" ON public.symptom_logs;
CREATE POLICY "Staff and admins can view all symptom logs"
  ON public.symptom_logs
  FOR SELECT
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin'::public.app_role)
    OR public.has_role(auth.uid(), 'staff'::public.app_role)
    OR public.has_role(auth.uid(), 'provider'::public.app_role)
  );

COMMIT;
