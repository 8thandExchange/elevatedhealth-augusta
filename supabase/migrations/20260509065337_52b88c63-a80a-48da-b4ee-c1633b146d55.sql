-- R-1: iv_drip_bookings
DROP POLICY IF EXISTS "Public can view by stripe session id" ON public.iv_drip_bookings;

CREATE POLICY "Patients can view their own IV drip bookings"
  ON public.iv_drip_bookings
  FOR SELECT
  TO authenticated
  USING (
    customer_email IN (SELECT email FROM public.patients WHERE user_id = auth.uid())
    OR appointment_id IN (
      SELECT id FROM public.appointments
      WHERE patient_id IN (SELECT id FROM public.patients WHERE user_id = auth.uid())
    )
  );

CREATE OR REPLACE FUNCTION public.get_iv_booking_by_stripe_session(_session_id text)
RETURNS TABLE (
  id uuid, therapy_id uuid, therapy_name text, customer_email text,
  customer_name text, amount_paid integer, payment_status text, appointment_id uuid
)
LANGUAGE sql SECURITY DEFINER STABLE SET search_path = public
AS $$
  SELECT id, therapy_id, therapy_name, customer_email, customer_name,
         amount_paid, payment_status, appointment_id
  FROM public.iv_drip_bookings
  WHERE stripe_session_id = _session_id
  LIMIT 1
$$;

REVOKE ALL ON FUNCTION public.get_iv_booking_by_stripe_session(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_iv_booking_by_stripe_session(text) TO anon, authenticated;

-- R-2: patients intake-token (FIX: cast text → uuid, swallow malformed tokens)
DROP POLICY IF EXISTS "Allow public intake token lookup" ON public.patients;

CREATE OR REPLACE FUNCTION public.get_patient_by_intake_token(_token text)
RETURNS TABLE (
  id uuid, full_name text, email text, phone text,
  primary_program text, service_interests jsonb
)
LANGUAGE plpgsql SECURITY DEFINER STABLE SET search_path = public
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
GRANT EXECUTE ON FUNCTION public.get_patient_by_intake_token(text) TO anon, authenticated;

-- R-3: user_roles RESTRICTIVE delete block
DROP POLICY IF EXISTS "Protect master admin role" ON public.user_roles;

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