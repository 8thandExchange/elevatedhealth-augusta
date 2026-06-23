-- Populate LabCorp client COGS and correct mis-mapped test codes.
-- Cost source: LabCorp Client Special Pricing, account 10084710, eff 2026-06-22.
-- Before this, every lab_tests.eha_cost_cents was NULL (margin tooling blind)
-- and several rows carried wrong/duplicate LabCorp codes (e.g. Lipid Panel and
-- A1c both 001453; Estradiol and Progesterone both 004515; Free T3 on a cortisol
-- code). Match by canonical test name and set the authoritative code + cost.

DO $$
BEGIN
  UPDATE public.lab_tests t
  SET labcorp_test_code = v.code,
      eha_cost_cents = v.cost,
      updated_at = now()
  FROM (VALUES
    ('Complete Blood Count','005009',320),
    ('Comprehensive Metabolic Panel','322000',390),
    ('Ferritin','004598',540),
    ('Hemoglobin A1c','001453',400),
    ('Lipid Panel','303756',360),
    ('Thyroid Stimulating Hormone','004259',480),
    ('Vitamin D, 25-OH','081950',2400),
    ('Cortisol, AM','004051',720),
    ('DHEA-Sulfate','004020',1260),
    ('Estradiol, Sensitive','004515',1720),
    ('Follicle-Stimulating Hormone','004309',900),
    ('Free T3','010389',1660),
    ('Free T4','019745',560),
    ('Luteinizing Hormone','004283',900),
    ('Progesterone','004317',960),
    ('Prolactin','004465',1020),
    ('Prostate-Specific Antigen','010322',640),
    ('Sex Hormone-Binding Globulin','082016',1600),
    ('Testosterone, Free','144980',2400),
    ('Testosterone, Total','070001',2275),
    ('Folate','002014',600),
    ('Homocysteine','706994',2800),
    ('Iron Studies','001321',620),
    ('Vitamin B12','001503',720)
  ) AS v(name, code, cost)
  WHERE t.name = v.name;

  -- hs-CRP: true high-sensitivity code (120766) is not on the client sheet.
  -- Use CRP Quant (006627, $4.80) as a cost proxy and document it.
  UPDATE public.lab_tests
  SET eha_cost_cents = 480,
      updated_at = now(),
      internal_notes = COALESCE(NULLIF(internal_notes,''), '')
        || ' [cost proxy: CRP Quant 006627 $4.80; hs-CRP 120766 not on LabCorp client sheet 2026-06-22]'
  WHERE name = 'High-Sensitivity C-Reactive Protein';

  -- Off-sheet specialty assays: not present in LabCorp client pricing as of
  -- 2026-06-22. Leave eha_cost_cents NULL and flag for a price quote so the
  -- margin model does not silently treat them as free.
  UPDATE public.lab_tests
  SET updated_at = now(),
      internal_notes = COALESCE(NULLIF(internal_notes,''), '')
        || ' [NOT on LabCorp client sheet 2026-06-22 — obtain client price before relying on margin]'
  WHERE name IN ('Apolipoprotein B','Fasting Insulin','Leptin','Lipoprotein (a)');
END $$;
