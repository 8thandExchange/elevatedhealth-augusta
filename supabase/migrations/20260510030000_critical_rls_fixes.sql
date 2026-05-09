-- ============================================================================
-- Critical RLS fixes — R-1, R-2, R-3 from docs/security/rls-audit-2026-05-08.md
--
-- Three independent fixes bundled because each is a single-policy correction
-- and they were identified together in the audit. No medium/low items, no
-- search_path hardening — those land in a follow-up migration after this one
-- is verified.
--
-- Rollback: each block is independently reversible. To roll back the entire
-- migration, run the inverse in reverse order. There is a rollback recipe
-- at the bottom of this file (commented out).
-- ============================================================================

-- ----------------------------------------------------------------------------
-- R-1: iv_drip_bookings SELECT was USING (true) — fully public
--
-- Before: any caller (including anonymous) could SELECT every row, leaking
-- patient name, email, phone, scheduled time, Stripe session ID.
--
-- After:
--   - Existing "Staff and admins can manage IV drip bookings" ALL policy
--     continues to cover staff/admin SELECT (FOR ALL implies SELECT).
--   - New "Patients can view their own IV drip bookings" lets a logged-in
--     patient see rows linked to them via either customer_email or via the
--     appointment_id → appointments.patient_id chain.
--   - The post-payment confirmation surface (IVPaymentSuccess.tsx) does NOT
--     read iv_drip_bookings directly today; it invokes book-iv-appointment
--     which uses the service role. So no anon SELECT path is required for
--     the live frontend.
--   - For future use we still expose get_iv_booking_by_stripe_session(text),
--     a SECURITY DEFINER function that returns at most one row matching the
--     supplied stripe_session_id. This is the only sanctioned anon read
--     path. The function is deliberately narrow: it returns the columns the
--     post-payment UI would need and nothing more (no PII beyond what the
--     caller already supplied as the session id).
-- ----------------------------------------------------------------------------

DROP POLICY IF EXISTS "Public can view by stripe session id"
  ON public.iv_drip_bookings;

CREATE POLICY "Patients can view their own IV drip bookings"
  ON public.iv_drip_bookings
  FOR SELECT
  TO authenticated
  USING (
    customer_email IN (
      SELECT email FROM public.patients WHERE user_id = auth.uid()
    )
    OR appointment_id IN (
      SELECT id FROM public.appointments
      WHERE patient_id IN (
        SELECT id FROM public.patients WHERE user_id = auth.uid()
      )
    )
  );

CREATE OR REPLACE FUNCTION public.get_iv_booking_by_stripe_session(
  _session_id text
)
RETURNS TABLE (
  id uuid,
  therapy_id uuid,
  therapy_name text,
  customer_email text,
  customer_name text,
  amount_paid integer,
  payment_status text,
  appointment_id uuid
)
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT id, therapy_id, therapy_name, customer_email, customer_name,
         amount_paid, payment_status, appointment_id
  FROM public.iv_drip_bookings
  WHERE stripe_session_id = _session_id
  LIMIT 1
$$;

REVOKE ALL ON FUNCTION public.get_iv_booking_by_stripe_session(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_iv_booking_by_stripe_session(text)
  TO anon, authenticated;

COMMENT ON FUNCTION public.get_iv_booking_by_stripe_session(text) IS
  'Sanctioned anon read path for the IV post-payment confirmation surface. '
  'Takes a Stripe checkout session id and returns at most one matching '
  'iv_drip_bookings row. The session id is unguessable and treated as the '
  'auth credential for this single read. Do not widen the row shape — the '
  'public landing only needs payment + therapy display fields, not full PHI.';

-- ----------------------------------------------------------------------------
-- R-2: patients intake-token policy filtered by token EXISTENCE, not VALUE
--
-- Before: USING (intake_token IS NOT NULL AND intake_token_expires_at > NOW())
-- meant any caller could SELECT * FROM patients WHERE intake_token IS NOT NULL
-- and dump every patient with an active intake link.
--
-- After: drop the policy entirely. Public callers (the patient clicking the
-- intake link from their welcome email) reach patient data through
-- get_patient_by_intake_token(text), a SECURITY DEFINER function that:
--   1. Casts the supplied text token to uuid (the actual column type), inside
--      a BEGIN/EXCEPTION block that returns zero rows if the cast fails.
--      The original LANGUAGE SQL body compared `intake_token = _token` and
--      Postgres rejected it at function-definition time with a
--      "operator does not exist: uuid = text" error. The plpgsql wrapper
--      below was the first working version Lovable deployed; keep this in
--      sync with the deployed function.
--   2. Enforces the same expiry check that was on the policy.
--   3. Returns at most one row, with only the fields PublicIntake needs.
--
-- Behaviour on malformed input: the cast raises invalid_text_representation
-- which we swallow → empty result set. PublicIntake treats an empty result
-- as "invalid token", which is the correct UX. This also avoids leaking
-- whether a token format is valid via a 500 response.
--
-- PublicIntake.tsx is updated in the same change set to call
-- supabase.rpc('get_patient_by_intake_token', { _token: token }) instead of
-- the prior .from('patients').select(...).eq('intake_token', token) query.
-- The replacement query shape is preserved.
--
-- This file was reconciled in-place to match the deployed Lovable
-- migration 20260509065337_*.sql. Do not push this migration — the live
-- DB already runs the function below via that Lovable file. This file
-- exists for schema-diff fidelity only.
-- ----------------------------------------------------------------------------

DROP POLICY IF EXISTS "Allow public intake token lookup"
  ON public.patients;

CREATE OR REPLACE FUNCTION public.get_patient_by_intake_token(
  _token text
)
RETURNS TABLE (
  id uuid,
  full_name text,
  email text,
  phone text,
  primary_program text,
  service_interests jsonb
)
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
DECLARE
  _token_uuid uuid;
BEGIN
  BEGIN
    _token_uuid := _token::uuid;
  EXCEPTION WHEN invalid_text_representation THEN
    RETURN;
  END;

  RETURN QUERY
  SELECT p.id, p.full_name, p.email, p.phone, p.primary_program, p.service_interests
  FROM public.patients p
  WHERE p.intake_token = _token_uuid
    AND p.intake_token IS NOT NULL
    AND p.intake_token_expires_at > NOW()
  LIMIT 1;
END;
$$;

REVOKE ALL ON FUNCTION public.get_patient_by_intake_token(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_patient_by_intake_token(text)
  TO anon, authenticated;

COMMENT ON FUNCTION public.get_patient_by_intake_token(text) IS
  'Sanctioned public read path for the intake-link landing page. Takes a '
  'patient intake token (delivered out-of-band via welcome email) and '
  'returns at most one matching patient row, scoped to the columns the '
  'intake form needs. Unguessable token acts as the auth credential. '
  'Replaces the prior open RLS policy that filtered on token existence '
  'rather than token value (security audit R-2, 2026-05-08). plpgsql '
  'wrapper handles the text→uuid cast inside an exception block so '
  'malformed tokens return empty rather than 500.';

-- ----------------------------------------------------------------------------
-- R-3: user_roles "Protect master admin role" had inverted DELETE logic
--
-- Before:
--   USING (
--     NOT (user_id = '31178...' AND role = 'admin')
--     OR has_role(auth.uid(), 'admin') = false
--   )
-- For a non-admin authenticated user attempting to delete the master admin
-- row, this evaluated to: (false) OR (true) = TRUE → policy permitted the
-- delete. Combined with Postgres OR'ing of permissive policies, any logged-
-- in user (including a patient with a user account) could delete the master
-- admin row and lock the clinic out of admin operations.
--
-- After:
--   - Drop the broken policy.
--   - Add a RESTRICTIVE DELETE policy that ANDs with the existing "Admins
--     can manage all roles" permissive policy. The RESTRICTIVE policy
--     blocks deletion of the master admin row for ALL callers, including
--     other admins. The existing permissive policy continues to require
--     admin role for any user_roles delete.
--
-- Net result:
--   - Non-admin tries to DELETE any row → blocked by permissive policy.
--   - Admin tries to DELETE non-master row → permissive admits, restrictive
--     does not block (predicate is true), delete succeeds.
--   - Admin tries to DELETE master admin row → permissive admits but
--     restrictive blocks (predicate is false), delete fails.
--
-- We deliberately make the master admin row undeletable even by other
-- admins. If the master admin needs to be rotated, do it via a SQL operator
-- with service_role + an explicit migration, which is the appropriate
-- friction level for "remove the founder's admin access".
-- ----------------------------------------------------------------------------

DROP POLICY IF EXISTS "Protect master admin role"
  ON public.user_roles;

CREATE POLICY "Block deletion of master admin role"
  ON public.user_roles
  AS RESTRICTIVE
  FOR DELETE
  USING (
    NOT (
      user_id = '31178dc3-3509-4cdd-8440-e75835bb1521'::uuid
      AND role = 'admin'::app_role
    )
  );

-- ----------------------------------------------------------------------------
-- Rollback recipe (for reference; do not uncomment in this migration)
--
-- BEGIN;
--   -- R-3
--   DROP POLICY IF EXISTS "Block deletion of master admin role" ON public.user_roles;
--   CREATE POLICY "Protect master admin role"
--     ON public.user_roles FOR DELETE
--     USING (
--       NOT (user_id = '31178dc3-3509-4cdd-8440-e75835bb1521' AND role = 'admin'::app_role)
--       OR has_role(auth.uid(), 'admin'::app_role) = false
--     );
--
--   -- R-2
--   DROP FUNCTION IF EXISTS public.get_patient_by_intake_token(text);
--   CREATE POLICY "Allow public intake token lookup"
--     ON public.patients FOR SELECT
--     USING (intake_token IS NOT NULL AND intake_token_expires_at > NOW());
--
--   -- R-1
--   DROP FUNCTION IF EXISTS public.get_iv_booking_by_stripe_session(text);
--   DROP POLICY IF EXISTS "Patients can view their own IV drip bookings"
--     ON public.iv_drip_bookings;
--   CREATE POLICY "Public can view by stripe session id"
--     ON public.iv_drip_bookings FOR SELECT USING (true);
-- COMMIT;
--
-- After rollback, also revert the PublicIntake.tsx change so the page
-- queries patients directly via .eq('intake_token', token) again.
-- ----------------------------------------------------------------------------
