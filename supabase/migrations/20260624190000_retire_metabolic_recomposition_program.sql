-- Retire the bundled "ELEVATED Metabolic Recomposition" program (2026-06-24).
--
-- Leadership decision: the standalone metabolic program is discontinued. This
-- reverses the 2026-06-14 physician policy override that introduced it.
--
-- SCOPE (deliberately narrow):
--   * Deactivate ONLY the program bundle row STACK-METABOLIC-FULL.
--   * KEEP retatrutide (PEPTIDE-RETATRUTIDE) active — it was relocated into the
--     GLP-1 lane as a gated, physician-only investigational option (GLP-1 consent
--     Section 11A, go-live 2026-06-21). DO NOT remove it.
--   * KEEP the standalone metabolic peptides (SS-31, AOD-9604, SLU-PP-332,
--     5-Amino-1MQ) active — they remain provider-directed à la carte.
--
-- The CDS pathway (metabolic-recomposition) and candidate (elevated_metabolic_program)
-- rows are already inactive; re-asserted here for idempotency. Retatrutide stays.
-- Idempotent: safe to re-run.

DO $$
BEGIN
  -- 1. Deactivate the program bundle in the ops formulary.
  UPDATE public.clinic_formulary
  SET is_active = false,
      updated_at = now()
  WHERE item_code = 'STACK-METABOLIC-FULL'
    AND is_active IS DISTINCT FROM false;

  -- 2. Re-assert CDS program rows inactive (no-op if already inactive).
  IF to_regclass('public.cds_pathways') IS NOT NULL THEN
    UPDATE public.cds_pathways
    SET active = false,
        updated_at = now()
    WHERE slug = 'metabolic-recomposition'
      AND active IS DISTINCT FROM false;
  END IF;

  IF to_regclass('public.cds_candidates') IS NOT NULL THEN
    UPDATE public.cds_candidates
    SET active = false,
        updated_at = now()
    WHERE candidate_key IN ('elevated_metabolic_program')
      AND active IS DISTINCT FROM false;
  END IF;
END $$;
