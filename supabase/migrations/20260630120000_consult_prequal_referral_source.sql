-- Marketing attribution on the consult prequal funnel (/consult/start).
-- Mirrors patients.referral_source; populated before $79 checkout so staff
-- payment alerts can include "how they heard about us."

ALTER TABLE public.consult_prequal_sessions
  ADD COLUMN IF NOT EXISTS referral_source text,
  ADD COLUMN IF NOT EXISTS referral_source_detail text;

COMMENT ON COLUMN public.consult_prequal_sessions.referral_source IS
  'How the patient heard about us (controlled vocab — src/lib/referralSources.ts).';
COMMENT ON COLUMN public.consult_prequal_sessions.referral_source_detail IS
  'Optional detail for referral_source (platform, referring provider, etc.).';
