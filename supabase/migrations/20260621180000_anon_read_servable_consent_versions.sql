-- Pre-payment consult enrollment (/consult/start) runs before auth.
-- Patients must read active, legally approved consent catalog rows to sign Tier 1 forms.

DROP POLICY IF EXISTS "consent_versions_anon_servable_read" ON public.consent_versions;

CREATE POLICY "consent_versions_anon_servable_read"
  ON public.consent_versions
  FOR SELECT
  TO anon
  USING (
    is_active = true
    AND legal_review_status = 'approved'
  );

COMMENT ON POLICY "consent_versions_anon_servable_read" ON public.consent_versions IS
  'Anonymous Lane B prequal may load servable catalog text only (active + counsel-approved).';
