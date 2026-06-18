-- Patient portal: account linking RPCs, patient read on GFE/lab orders,
-- tighten appointment + IV intake policies.

-- ── Link auth user to existing patient row (post-Stripe / pre-portal) ──
CREATE OR REPLACE FUNCTION public.link_patient_account(
  p_email text,
  p_full_name text DEFAULT NULL,
  p_phone text DEFAULT NULL
)
RETURNS TABLE (
  patient_id uuid,
  primary_program text,
  phone text,
  linked boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _uid uuid := auth.uid();
  _row public.patients%ROWTYPE;
  _phone text;
BEGIN
  IF _uid IS NULL THEN
    RAISE EXCEPTION 'not_authenticated';
  END IF;

  IF p_email IS NULL OR trim(p_email) = '' THEN
    RAISE EXCEPTION 'email_required';
  END IF;

  SELECT * INTO _row
  FROM public.patients
  WHERE lower(trim(email)) = lower(trim(p_email))
    AND (is_archived IS NOT TRUE)
  ORDER BY created_at DESC
  LIMIT 1;

  IF NOT FOUND THEN
    RETURN;
  END IF;

  IF _row.user_id IS NOT NULL AND _row.user_id <> _uid THEN
    RAISE EXCEPTION 'email_already_linked_to_another_account';
  END IF;

  _phone := NULLIF(regexp_replace(COALESCE(p_phone, ''), '\D', '', 'g'), '');
  IF _phone IS NOT NULL AND length(_phone) <> 10 THEN
    _phone := NULL;
  END IF;

  IF _row.user_id IS NULL THEN
    UPDATE public.patients
    SET
      user_id = _uid,
      full_name = COALESCE(NULLIF(trim(p_full_name), ''), _row.full_name),
      phone = COALESCE(_phone, _row.phone),
      onboarding_status = CASE
        WHEN _row.onboarding_status IS NULL OR _row.onboarding_status = 'new' THEN 'account_created'
        ELSE _row.onboarding_status
      END
    WHERE id = _row.id
    RETURNING * INTO _row;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _uid AND role = 'user'::public.app_role
  ) THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (_uid, 'user'::public.app_role);
  END IF;

  patient_id := _row.id;
  primary_program := _row.primary_program;
  phone := _row.phone;
  linked := true;
  RETURN NEXT;
END;
$$;

REVOKE ALL ON FUNCTION public.link_patient_account(text, text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.link_patient_account(text, text, text) TO authenticated;

COMMENT ON FUNCTION public.link_patient_account IS
  'Links auth.uid() to an unlinked patients row by email (post-payment signup).';

-- ── Prefill create-account form for unlinked patient rows only ──
CREATE OR REPLACE FUNCTION public.get_patient_signup_prefill(p_email text)
RETURNS TABLE (full_name text, phone text)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF p_email IS NULL OR trim(p_email) = '' THEN
    RETURN;
  END IF;

  RETURN QUERY
  SELECT p.full_name, p.phone
  FROM public.patients p
  WHERE lower(trim(p.email)) = lower(trim(p_email))
    AND p.user_id IS NULL
    AND (p.is_archived IS NOT TRUE)
  ORDER BY p.created_at DESC
  LIMIT 1;
END;
$$;

REVOKE ALL ON FUNCTION public.get_patient_signup_prefill(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_patient_signup_prefill(text) TO anon, authenticated;

-- ── Patient read: GFE clearance status ──
DROP POLICY IF EXISTS "Patients can view own gfe clearances" ON public.gfe_clearances;
CREATE POLICY "Patients can view own gfe clearances"
  ON public.gfe_clearances
  FOR SELECT
  TO authenticated
  USING (public.auth_owns_patient(patient_id));

-- ── Patient read: lab order tracking (no staff notes) ──
DROP POLICY IF EXISTS "Patients can view own lab orders" ON public.lab_orders;
CREATE POLICY "Patients can view own lab orders"
  ON public.lab_orders
  FOR SELECT
  TO authenticated
  USING (public.auth_owns_patient(patient_id));

-- ── Appointments: booking via edge functions only ──
DROP POLICY IF EXISTS "Patients can create their own appointments" ON public.appointments;

-- ── IV intake: inserts via service-role edge functions only ──
DROP POLICY IF EXISTS "iv_intake_insert_anyone" ON public.iv_intake_responses;
