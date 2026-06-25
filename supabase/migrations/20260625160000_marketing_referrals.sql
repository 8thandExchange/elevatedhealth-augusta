-- Unified marketing attribution: "How did you hear about us?" across every
-- patient entry point (medical intake, IV screening, contact form).
--
-- Rationale: each entry point writes to a different table (patients,
-- iv_intake_responses, chat_leads). Rather than bolt a referral column onto all
-- three and union them for reporting, every entry point writes one lightweight
-- row here. The Office Manager "Marketing" tab reads this single table for the
-- "how patients found us" breakdown. Edge functions insert via the service role
-- on a best-effort basis (a failed insert never blocks the core flow).
--
-- Controlled vocabulary for referral_source lives in src/lib/referralSources.ts.
--
-- INTENTIONAL ACCESS PATTERN (mirrors eligibility_review_requests):
--   Pattern: staff/admin read only; inserts via service-role edge functions.
--   Rationale: internal marketing-attribution log; no patient self-read needed.
--   Contains contact name/email (mild PII) — not clinical PHI.

CREATE TABLE IF NOT EXISTS public.marketing_referrals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  channel text NOT NULL,                         -- medical_intake | iv_screening | contact_form
  referral_source text NOT NULL,                 -- controlled vocab (referralSources.ts)
  referral_source_detail text,
  contact_name text,
  contact_email text,
  patient_id uuid REFERENCES public.patients(id) ON DELETE SET NULL
);

COMMENT ON TABLE public.marketing_referrals IS
  'Marketing attribution events ("How did you hear about us?") captured across intake, IV screening, and contact form. Staff/admin read; service-role inserts only.';

CREATE INDEX IF NOT EXISTS marketing_referrals_created_at_idx
  ON public.marketing_referrals (created_at DESC);
CREATE INDEX IF NOT EXISTS marketing_referrals_source_idx
  ON public.marketing_referrals (referral_source);

ALTER TABLE public.marketing_referrals ENABLE ROW LEVEL SECURITY;

-- Staff/admin may read the attribution log.
DROP POLICY IF EXISTS marketing_referrals_select_staff ON public.marketing_referrals;
CREATE POLICY marketing_referrals_select_staff
  ON public.marketing_referrals
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = auth.uid()
        AND ur.role IN ('admin', 'staff')
    )
  );

-- Inserts are performed by edge functions using the service role, which
-- bypasses RLS; no authenticated INSERT policy is granted on purpose.

-- Backfill medical-intake referrals already captured in patients.medical_history.
-- Guarded so re-running the migration does not duplicate rows.
INSERT INTO public.marketing_referrals
  (channel, referral_source, referral_source_detail, contact_name, contact_email, patient_id, created_at)
SELECT
  'medical_intake',
  p.medical_history -> 'marketing' ->> 'referral_source',
  p.medical_history -> 'marketing' ->> 'referral_source_detail',
  p.full_name,
  p.email,
  p.id,
  COALESCE((p.medical_history -> 'marketing' ->> 'captured_at')::timestamptz, now())
FROM public.patients p
WHERE p.medical_history -> 'marketing' ->> 'referral_source' IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM public.marketing_referrals mr
    WHERE mr.patient_id = p.id AND mr.channel = 'medical_intake'
  );
