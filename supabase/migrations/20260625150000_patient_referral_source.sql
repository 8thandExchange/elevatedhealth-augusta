-- Marketing attribution: capture "How did you hear about us?" on the patient.
--
-- The public intake form (PublicIntake.tsx) now asks how the patient found us.
-- submit-public-intake always stores the answer in patients.medical_history
-- (jsonb -> 'marketing'); these dedicated columns give a clean, queryable home
-- for marketing reporting. The edge function mirrors into these columns on a
-- best-effort basis, so it keeps working whether or not this migration has been
-- applied yet.
--
-- Canonical referral_source values (see src/lib/referralSources.ts):
--   social_media | google_search | friend_family | provider_referral |
--   signage_drive_by | event_community | radio_podcast_news |
--   returning_patient | other
-- Values are intentionally NOT constrained by a CHECK so the option list can
-- evolve without a schema change; the app owns the controlled vocabulary.
--
-- Idempotent: ADD COLUMN IF NOT EXISTS + a guarded backfill.

ALTER TABLE public.patients
  ADD COLUMN IF NOT EXISTS referral_source text,
  ADD COLUMN IF NOT EXISTS referral_source_detail text;

COMMENT ON COLUMN public.patients.referral_source IS
  'Marketing attribution: how the patient heard about us (controlled vocab in src/lib/referralSources.ts). Mirrors medical_history->marketing->referral_source.';
COMMENT ON COLUMN public.patients.referral_source_detail IS
  'Optional free-text detail for referral_source (e.g. which platform, referring provider, who to thank).';

-- Backfill any intakes that already captured a source in medical_history.
UPDATE public.patients
SET referral_source = medical_history -> 'marketing' ->> 'referral_source',
    referral_source_detail = medical_history -> 'marketing' ->> 'referral_source_detail'
WHERE referral_source IS NULL
  AND medical_history -> 'marketing' ->> 'referral_source' IS NOT NULL;
