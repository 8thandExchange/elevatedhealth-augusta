-- Clinical formulary / program catalog (Recovery Peptide Review strategy)
-- Mirrors src/lib/clinicalOptimizationCatalog.ts for staff/provider queries and RLS-backed reads.

CREATE TABLE IF NOT EXISTS public.clinical_formulary_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL,
  display_name text NOT NULL,
  category text NOT NULL,
  public_status text NOT NULL DEFAULT 'public',
  clinical_status text NOT NULL DEFAULT 'active',
  supplier text,
  supplier_sku text,
  route text,
  dosage_form text,
  patient_price_cents integer,
  member_price_cents integer,
  clinic_cost_cents integer,
  requires_labs boolean NOT NULL DEFAULT true,
  lab_panel text,
  requires_consent boolean NOT NULL DEFAULT false,
  consent_type text,
  requires_provider_signoff boolean NOT NULL DEFAULT true,
  inventory_required boolean NOT NULL DEFAULT false,
  supply_checklist_key text,
  public_description text NOT NULL DEFAULT '',
  staff_description text NOT NULL DEFAULT '',
  provider_algorithm jsonb,
  regulatory_notes text,
  last_reviewed_at date,
  reviewed_by text,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT clinical_formulary_items_slug_unique UNIQUE (slug),
  CONSTRAINT clinical_formulary_items_public_status_check
    CHECK (public_status IN ('public', 'hidden', 'provider_only', 'inactive')),
  CONSTRAINT clinical_formulary_items_clinical_status_check
    CHECK (clinical_status IN ('active', 'draft', 'policy_review', 'inactive'))
);

CREATE INDEX IF NOT EXISTS idx_clinical_formulary_items_public
  ON public.clinical_formulary_items(public_status) WHERE active = true;

ALTER TABLE public.clinical_formulary_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Staff read clinical_formulary_items" ON public.clinical_formulary_items;
CREATE POLICY "Staff read clinical_formulary_items"
  ON public.clinical_formulary_items FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'staff') OR public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admin manage clinical_formulary_items" ON public.clinical_formulary_items;
CREATE POLICY "Admin manage clinical_formulary_items"
  ON public.clinical_formulary_items FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Seed core recovery + peptide strategy rows (idempotent)
INSERT INTO public.clinical_formulary_items (
  slug, display_name, category, public_status, clinical_status,
  supplier, route, dosage_form, patient_price_cents, member_price_cents, clinic_cost_cents,
  requires_labs, lab_panel, requires_consent, consent_type, requires_provider_signoff,
  inventory_required, supply_checklist_key, public_description, staff_description,
  provider_algorithm, regulatory_notes, last_reviewed_at, reviewed_by
) VALUES
  (
    'recovery-peptide-review', 'Recovery Peptide Review', 'peptide_recovery', 'public', 'active',
    NULL, NULL, 'care pathway', 7900, 7900, NULL,
    true, 'foundation-wellness', true, 'research_peptide', true,
    false, 'recovery_peptide',
    'Structured clinical review for recovery peptide protocols.',
    'Route injury/training recovery interest here.',
    '{"protocolSlug":"recovery-peptide-review"}'::jsonb,
    'Cat 2 research peptides require Research Peptide Consent.',
    '2026-06-16', 'Dr. Troy Akers'
  ),
  (
    'bpc-157', 'BPC-157', 'peptide_recovery', 'public', 'active',
    'FCC', 'subQ', 'injectable', 32900, 24900, 4700,
    true, 'foundation-wellness', true, 'research_peptide', true,
    true, 'recovery_peptide',
    'Injectable recovery peptide after provider review.',
    'Recovery Peptide Review lane required.',
    '{"protocolSlug":"recovery-bpc157"}'::jsonb,
    'FDA Cat 2 — research peptide consent.',
    '2026-06-16', 'Dr. Troy Akers'
  ),
  (
    'tb-500', 'TB-500 (Thymosin Beta-4)', 'peptide_recovery', 'public', 'active',
    'FCC', 'subQ', 'injectable', 32900, 24900, 4700,
    true, 'foundation-wellness', true, 'research_peptide', true,
    true, 'recovery_peptide',
    'Injectable recovery peptide after provider review.',
    'WADA disclosure for athletes.',
    '{"protocolSlug":"recovery-tb500"}'::jsonb,
    'WADA prohibited for competitive athletes.',
    '2026-06-16', 'Dr. Troy Akers'
  ),
  (
    'bpc-157-tb-500-stack', 'BPC-157 / TB-500 Recovery Stack', 'peptide_recovery', 'public', 'active',
    'FCC / GC', 'subQ', 'injectable blend', 32900, 24900, 9400,
    true, 'foundation-wellness', true, 'research_peptide', true,
    true, 'recovery_peptide',
    'Combined recovery protocol when physician selects stack.',
    'Pre-blended vial per FCC/GC formulary.',
    '{"protocolSlug":"recovery-bpc-tb-stack"}'::jsonb,
    'Cat 2 research peptide consent.',
    '2026-06-16', 'Dr. Troy Akers'
  ),
  (
    'pda-pentadeca-arginate', 'Pentadeca Arginate (PDA)', 'peptide_recovery', 'public', 'active',
    'FCC', 'oral', 'capsule', 24900, 19900, 8500,
    true, 'foundation-wellness', true, 'research_peptide', true,
    false, 'oral_capsule',
    'Oral recovery alternate after Recovery Peptide Review.',
    'Provider-selected alternate to BPC/TB.',
    '{"protocolSlug":"recovery-pda"}'::jsonb,
    NULL, '2026-06-16', 'Dr. Troy Akers'
  ),
  (
    'aod-9604', 'AOD-9604', 'peptide_metabolic', 'provider_only', 'active',
    'GC', 'subQ', 'injectable', 12900, 10320, NULL,
    true, NULL, false, NULL, true,
    true, NULL,
    'Provider-only metabolic adjunct.',
    'Not on public peptide menu.',
    NULL, NULL, '2026-06-16', 'Dr. Troy Akers'
  ),
  (
    'ss-31-provider-only', 'SS-31 (Elamipretide)', 'peptide_metabolic', 'provider_only', 'active',
    'GC', 'subQ', 'injectable', 24900, 19920, NULL,
    true, NULL, true, 'research_peptide', true,
    true, NULL,
    'Provider-only mitochondrial peptide.',
    'Metabolic program context only.',
    NULL, NULL, '2026-06-16', 'Dr. Troy Akers'
  ),
  (
    'slu-pp-332-provider-only', 'SLU-PP-332', 'peptide_metabolic', 'provider_only', 'active',
    'GC', 'subQ', 'injectable', 19900, 15920, NULL,
    true, NULL, true, 'research_peptide', true,
    true, NULL,
    'Provider-only metabolic peptide.',
    'Not on public menu.',
    NULL, NULL, '2026-06-16', 'Dr. Troy Akers'
  ),
  (
    '5-amino-1mq-provider-only', '5-Amino-1MQ', 'peptide_metabolic', 'provider_only', 'active',
    'GC', 'oral', 'capsule', 14900, 11920, NULL,
    true, NULL, false, NULL, true,
    false, NULL,
    'Provider-only metabolic support.',
    'Not on public menu.',
    NULL, NULL, '2026-06-16', 'Dr. Troy Akers'
  )
ON CONFLICT (slug) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  public_status = EXCLUDED.public_status,
  clinical_status = EXCLUDED.clinical_status,
  public_description = EXCLUDED.public_description,
  staff_description = EXCLUDED.staff_description,
  provider_algorithm = EXCLUDED.provider_algorithm,
  updated_at = now();
