-- Portal signup: link existing patient row OR create one (patients INSERT is staff-only via RLS).

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
  _name text;
BEGIN
  IF _uid IS NULL THEN
    RAISE EXCEPTION 'not_authenticated';
  END IF;

  IF p_email IS NULL OR trim(p_email) = '' THEN
    RAISE EXCEPTION 'email_required';
  END IF;

  _phone := NULLIF(regexp_replace(COALESCE(p_phone, ''), '\D', '', 'g'), '');
  IF _phone IS NOT NULL AND length(_phone) <> 10 THEN
    _phone := NULL;
  END IF;

  _name := COALESCE(NULLIF(trim(p_full_name), ''), split_part(lower(trim(p_email)), '@', 1));

  SELECT * INTO _row
  FROM public.patients
  WHERE lower(trim(email)) = lower(trim(p_email))
    AND (is_archived IS NOT TRUE)
  ORDER BY created_at DESC
  LIMIT 1;

  IF NOT FOUND THEN
    INSERT INTO public.patients (
      user_id,
      email,
      full_name,
      phone,
      onboarding_status,
      risk_status
    ) VALUES (
      _uid,
      lower(trim(p_email)),
      _name,
      _phone,
      'account_created',
      'standard'
    )
    RETURNING * INTO _row;

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
    RETURN;
  END IF;

  IF _row.user_id IS NOT NULL AND _row.user_id <> _uid THEN
    RAISE EXCEPTION 'email_already_linked_to_another_account';
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

COMMENT ON FUNCTION public.link_patient_account IS
  'Links auth.uid() to patients row by email; creates row if none exists (portal signup).';
