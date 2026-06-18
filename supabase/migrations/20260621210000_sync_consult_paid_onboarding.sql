-- Sync patient onboarding_status when $79 wellness assessment is paid but status lagged
-- (e.g. portal account_created after Stripe checkout).

UPDATE public.patients p
SET onboarding_status = 'consultation_paid'
WHERE onboarding_status IN (
  'account_created',
  'prequal_consents_complete',
  'prequal_screening_passed',
  'invited',
  'pending_invite',
  'consultation_pending'
)
AND EXISTS (
  SELECT 1
  FROM public.consultation_bookings cb
  WHERE lower(trim(cb.customer_email)) = lower(trim(p.email))
    AND cb.status = 'paid'
);

-- If GFE invite is pending, reflect gfe_pending
UPDATE public.patients p
SET onboarding_status = 'gfe_pending'
WHERE onboarding_status = 'consultation_paid'
AND EXISTS (
  SELECT 1 FROM public.gfe_clearances g
  WHERE g.patient_id = p.id AND g.status = 'pending'
);

CREATE OR REPLACE FUNCTION public.sync_my_consult_payment_status()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _patient_id uuid;
  _email text;
  _status text;
  _has_paid boolean;
  _has_pending_gfe boolean;
  _new_status text;
BEGIN
  SELECT p.id, p.email, p.onboarding_status
  INTO _patient_id, _email, _status
  FROM public.patients p
  WHERE p.user_id = auth.uid()
  LIMIT 1;

  IF _patient_id IS NULL OR _email IS NULL THEN
    RETURN jsonb_build_object('updated', false, 'reason', 'no_patient');
  END IF;

  SELECT EXISTS (
    SELECT 1 FROM public.consultation_bookings cb
    WHERE lower(trim(cb.customer_email)) = lower(trim(_email))
      AND cb.status = 'paid'
  ) INTO _has_paid;

  IF NOT _has_paid THEN
    RETURN jsonb_build_object('updated', false, 'reason', 'no_paid_booking');
  END IF;

  IF _status IN (
    'consultation_paid', 'gfe_pending', 'gfe_cleared', 'consultation_scheduled',
    'consultation_complete', 'intake_complete', 'treatment_active', 'active'
  ) THEN
    RETURN jsonb_build_object('updated', false, 'reason', 'already_advanced', 'onboarding_status', _status);
  END IF;

  SELECT EXISTS (
    SELECT 1 FROM public.gfe_clearances g
    WHERE g.patient_id = _patient_id AND g.status = 'pending'
  ) INTO _has_pending_gfe;

  _new_status := CASE WHEN _has_pending_gfe THEN 'gfe_pending' ELSE 'consultation_paid' END;

  UPDATE public.patients
  SET onboarding_status = _new_status
  WHERE id = _patient_id;

  RETURN jsonb_build_object('updated', true, 'onboarding_status', _new_status);
END;
$$;

REVOKE ALL ON FUNCTION public.sync_my_consult_payment_status() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.sync_my_consult_payment_status() TO authenticated;

COMMENT ON FUNCTION public.sync_my_consult_payment_status IS
  'Patient portal: advance onboarding_status when consultation_bookings shows paid $79 but status stuck at account_created/prequal.';
