-- Enable Row-Level Security on two public tables flagged by the Supabase
-- security linter (rls_disabled_in_public). Without RLS, anyone with the public
-- anon key (embedded in the site bundle) could read/insert/delete these rows.
--
-- Both are internal operational logs:
--   * catalog_reconciliation_log  — service-catalog sync notes (no PHI)
--   * notification_failures        — failed-notification records (intake_id,
--                                    email_type, error_message)
--
-- They are written only by service-role edge functions and by migrations, both
-- of which bypass RLS, and nothing in the frontend reads them. So enabling RLS
-- breaks no code path. Posture mirrors eligibility_review_requests:
-- staff/admin read-only; no patient/anon access; writes via service role only
-- (no INSERT/UPDATE/DELETE policies → immutable from client connections).

ALTER TABLE public.catalog_reconciliation_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS catalog_reconciliation_log_select_staff ON public.catalog_reconciliation_log;
CREATE POLICY catalog_reconciliation_log_select_staff
  ON public.catalog_reconciliation_log
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = auth.uid()
        AND ur.role IN ('admin', 'staff')
    )
  );

ALTER TABLE public.notification_failures ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS notification_failures_select_staff ON public.notification_failures;
CREATE POLICY notification_failures_select_staff
  ON public.notification_failures
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = auth.uid()
        AND ur.role IN ('admin', 'staff')
    )
  );
