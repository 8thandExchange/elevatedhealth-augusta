-- Pre-payment consult prequal sessions + journey status support.

CREATE TABLE IF NOT EXISTS public.consult_prequal_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  full_name text NOT NULL,
  phone text,
  dob date NOT NULL,
  gender text,
  visit_reasons text[] NOT NULL DEFAULT '{}',
  screening_answers jsonb NOT NULL DEFAULT '{}'::jsonb,
  screening_result text NOT NULL CHECK (screening_result IN ('cleared', 'blocked', 'flagged')),
  block_reasons text[] DEFAULT '{}',
  consents_completed_at timestamptz,
  consent_payload jsonb,
  checkout_token uuid UNIQUE,
  checkout_token_expires_at timestamptz,
  stripe_session_id text,
  consumed_at timestamptz,
  patient_id uuid REFERENCES public.patients(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_consult_prequal_email ON public.consult_prequal_sessions (lower(trim(email)));
CREATE INDEX IF NOT EXISTS idx_consult_prequal_checkout_token ON public.consult_prequal_sessions (checkout_token)
  WHERE checkout_token IS NOT NULL AND consumed_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_consult_prequal_stripe ON public.consult_prequal_sessions (stripe_session_id)
  WHERE stripe_session_id IS NOT NULL;

DROP TRIGGER IF EXISTS trg_consult_prequal_sessions_updated_at ON public.consult_prequal_sessions;
CREATE TRIGGER trg_consult_prequal_sessions_updated_at
  BEFORE UPDATE ON public.consult_prequal_sessions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.consult_prequal_sessions ENABLE ROW LEVEL SECURITY;

-- No direct client access; edge functions use service role.
COMMENT ON TABLE public.consult_prequal_sessions IS
  'Anonymous pre-payment screening + consent session for Lane B wellness assessment checkout.';

COMMENT ON COLUMN public.patients.onboarding_status IS
  'Patient journey status. Pre-visit funnel (2026-06):
  prequal_screening_passed, prequal_consents_complete,
  consultation_paid, gfe_pending, gfe_cleared, consultation_scheduled,
  consultation_complete, intake_complete, awaiting_blood_work, labs_in_progress,
  results_ready, labs_reviewed, protocol_approved, treatment_active,
  high_risk_review, rebooking_fee_required';

-- Validate checkout token for Stripe (service role / edge only).
CREATE OR REPLACE FUNCTION public.validate_consult_checkout_token(p_token uuid)
RETURNS TABLE (
  session_id uuid,
  email text,
  full_name text,
  visit_reasons text[]
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF p_token IS NULL THEN
    RETURN;
  END IF;

  RETURN QUERY
  SELECT
    s.id,
    s.email,
    s.full_name,
    s.visit_reasons
  FROM public.consult_prequal_sessions s
  WHERE s.checkout_token = p_token
    AND s.screening_result = 'cleared'
    AND s.consents_completed_at IS NOT NULL
    AND s.consumed_at IS NULL
    AND (s.checkout_token_expires_at IS NULL OR s.checkout_token_expires_at > now())
  LIMIT 1;
END;
$$;

REVOKE ALL ON FUNCTION public.validate_consult_checkout_token(uuid) FROM PUBLIC;
