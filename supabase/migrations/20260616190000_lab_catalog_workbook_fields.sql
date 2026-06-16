-- Lab catalog workbook alignment: extend master lab fields, add expanded-panel analytes,
-- refresh panel display names. Tests remain deduplicated; panels reference via panel_tests.

-- ---------------------------------------------------------------------------
-- 1. Extend lab_tests with operational / COGS fields
-- ---------------------------------------------------------------------------

ALTER TABLE public.lab_tests
  ADD COLUMN IF NOT EXISTS also_called text,
  ADD COLUMN IF NOT EXISTS what_it_checks text,
  ADD COLUMN IF NOT EXISTS when_we_order_it text,
  ADD COLUMN IF NOT EXISTS specimen_or_tube text,
  ADD COLUMN IF NOT EXISTS labcorp_test_code text,
  ADD COLUMN IF NOT EXISTS cpt_or_order_code text,
  ADD COLUMN IF NOT EXISTS eha_cost_cents integer
    CHECK (eha_cost_cents IS NULL OR eha_cost_cents >= 0),
  ADD COLUMN IF NOT EXISTS labcorp_bundle_notes text,
  ADD COLUMN IF NOT EXISTS internal_notes text;

COMMENT ON COLUMN public.lab_tests.eha_cost_cents IS
  'EHA LabCorp client-bill COGS per test. NULL = price not yet entered; margin calculations must warn.';
COMMENT ON COLUMN public.lab_tests.non_member_price_cents IS
  'Patient charge if this test were ordered à la carte (not panel bundle).';

-- Backfill what_it_checks from legacy description where empty
UPDATE public.lab_tests
SET what_it_checks = description
WHERE what_it_checks IS NULL AND description IS NOT NULL;

-- Labcorp order codes (staff reference — verify against live LabCorp fee schedule)
UPDATE public.lab_tests SET labcorp_test_code = v.labcorp, cpt_or_order_code = v.cpt
FROM (VALUES
  ('CBC',    '005009', '85025'),
  ('CMP',    '322000', '80053'),
  ('LIPID',  '001453', '80061'),
  ('HBA1C',  '001453', '83036'),
  ('VITD',   '081950', '82306'),
  ('TSH',    '004259', '84443'),
  ('FERR',   '004333', '82728'),
  ('HSCRP',  '120766', '86141'),
  ('TT',     '070001', '84403'),
  ('FT',     '070001', '84402'),
  ('E2-S',   '004515', '82670'),
  ('PROG',   '004515', '84144'),
  ('DHEAS',  '004309', '82627'),
  ('FSH',    '010165', '83001'),
  ('LH',     '010181', '83002'),
  ('SHBG',   '001719', '84270'),
  ('FT3',    '010363', '84481'),
  ('FT4',    '001974', '84439'),
  ('PSA',    '010322', '84153'),
  ('PRL',    '004465', '84146'),
  ('AMCORT', '010363', '82533'),
  ('INS',    '004333', '83527'),
  ('LEP',    '004432', '83789')
) AS v(code, labcorp, cpt)
WHERE lab_tests.code = v.code;

-- ---------------------------------------------------------------------------
-- 2. New analytes for Expanded / Weight Optimization panel
-- ---------------------------------------------------------------------------

INSERT INTO public.lab_tests (
  name, code, category, description, what_it_checks,
  non_member_price_cents, member_price_cents, display_order, is_active
) VALUES
  ('Apolipoprotein B', 'APOB', 'weight_metabolic',
   'ApoB — atherogenic particle count marker.',
   'Cardiovascular risk and metabolic health; complements standard lipid panel.',
   7500, 5500, 330, true),
  ('Lipoprotein (a)', 'LPA', 'weight_metabolic',
   'Lp(a) — genetically influenced cardiovascular risk marker.',
   'ASCVD risk stratification on weight/metabolic programs.',
   8500, 6500, 340, true),
  ('Homocysteine', 'HOMOCYST', 'weight_metabolic',
   'Homocysteine — methylation and cardiovascular marker.',
   'Metabolic and cardiovascular work-up on expanded panel.',
   6500, 4500, 350, true),
  ('Iron Studies', 'IRON', 'weight_metabolic',
   'Serum iron, TIBC, transferrin saturation (iron studies panel).',
   'Anemia and fatigue differentiation on expanded metabolic panel.',
   5500, 4000, 360, true),
  ('Vitamin B12', 'B12', 'weight_metabolic',
   'Serum vitamin B12.',
   'Fatigue, neuropathy, and methylation support on expanded panel.',
   4500, 3500, 370, true),
  ('Folate', 'FOLATE', 'weight_metabolic',
   'Serum folate.',
   'Methylation and anemia work-up on expanded panel.',
   4500, 3500, 380, true)
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  category = EXCLUDED.category,
  description = EXCLUDED.description,
  what_it_checks = EXCLUDED.what_it_checks,
  non_member_price_cents = EXCLUDED.non_member_price_cents,
  member_price_cents = EXCLUDED.member_price_cents,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

-- ---------------------------------------------------------------------------
-- 3. Panel display names (workbook terminology; slugs unchanged)
-- ---------------------------------------------------------------------------

UPDATE public.lab_panels SET name = 'Foundational Labs', display_order = 10
  WHERE slug = 'foundation-wellness';
UPDATE public.lab_panels SET name = 'Male Hormone Panel', display_order = 20
  WHERE slug = 'hormone-male';
UPDATE public.lab_panels SET name = 'Female Hormone Panel', display_order = 30
  WHERE slug = 'hormone-female';
UPDATE public.lab_panels SET name = 'Expanded Panel / Weight Optimization', display_order = 40
  WHERE slug = 'weight-optimization';
UPDATE public.lab_panels SET name = 'Sexual Wellness Labs', display_order = 50
  WHERE slug = 'sexual-wellness';

-- ---------------------------------------------------------------------------
-- 4. Expanded panel composition (foundation 8 + metabolic/hormone add-ons)
-- ---------------------------------------------------------------------------

INSERT INTO public.panel_tests (panel_id, test_id, display_order)
SELECT p.id, t.id, x.display_order
FROM (
  VALUES
    ('weight-optimization', 'APOB',     330),
    ('weight-optimization', 'LPA',      340),
    ('weight-optimization', 'HOMOCYST', 350),
    ('weight-optimization', 'IRON',     360),
    ('weight-optimization', 'B12',      370),
    ('weight-optimization', 'FOLATE',   380)
) AS x(panel_slug, test_code, display_order)
JOIN public.lab_panels p ON p.slug = x.panel_slug
JOIN public.lab_tests t ON t.code = x.test_code
ON CONFLICT (panel_id, test_id) DO UPDATE
  SET display_order = EXCLUDED.display_order;
