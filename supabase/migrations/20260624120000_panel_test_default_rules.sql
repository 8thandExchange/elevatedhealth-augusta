-- Lab panel composition rules (MD-directed, 2026-06-24), aligned to current
-- guidelines: Endocrine Society/AUA TRT monitoring, IMS/BMS/ISSWSH menopause &
-- female testosterone, ADA/NLA metabolic, ESE obesity, USPSTF thyroid.
--
-- default_rule on panel_tests:
--   standing  = part of the default draw (the "standard panel")
--   reflex    = ordered on indication / abnormal anchor (e.g. FT4/FT3 if TSH abnormal;
--               estradiol if gynecomastia; free T calculated from Total T + SHBG)
--   optional  = advanced/optimization add-on, not in the default panel
--   one_time  = genetic / once-in-lifetime (e.g. Lp(a)) — draw once at baseline
--
-- Only 'standing' (+ one_time at baseline) tests count toward the standard panel
-- COGS/margin. Reflex/optional remain available to order à la carte.

ALTER TABLE public.panel_tests
  ADD COLUMN IF NOT EXISTS default_rule text NOT NULL DEFAULT 'standing';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'panel_tests_default_rule_chk'
  ) THEN
    ALTER TABLE public.panel_tests
      ADD CONSTRAINT panel_tests_default_rule_chk
      CHECK (default_rule IN ('standing','reflex','optional','one_time'));
  END IF;
END $$;

-- Apply clinical rules by (panel slug, test name).
DO $$
BEGIN
  UPDATE public.panel_tests pt
  SET default_rule = v.rule
  FROM public.lab_panels p, public.lab_tests t,
    (VALUES
      -- Male hormone panel
      ('hormone-male','Estradiol, Sensitive','reflex'),
      ('hormone-male','Free T3','reflex'),
      ('hormone-male','Free T4','reflex'),
      ('hormone-male','Testosterone, Free','reflex'),
      ('hormone-male','DHEA-Sulfate','optional'),
      -- Female hormone panel (menopause: dose by symptoms, not levels)
      ('hormone-female','Estradiol, Sensitive','reflex'),
      ('hormone-female','Progesterone','reflex'),
      ('hormone-female','Follicle-Stimulating Hormone','reflex'),
      ('hormone-female','Luteinizing Hormone','reflex'),
      ('hormone-female','Free T3','reflex'),
      ('hormone-female','Free T4','reflex'),
      ('hormone-female','Testosterone, Free','reflex'),
      ('hormone-female','DHEA-Sulfate','optional'),
      -- Weight / metabolic
      ('weight-optimization','Free T3','reflex'),
      ('weight-optimization','Free T4','reflex'),
      ('weight-optimization','Cortisol, AM','reflex'),
      ('weight-optimization','Iron Studies','reflex'),
      ('weight-optimization','Homocysteine','optional'),
      ('weight-optimization','Leptin','optional'),
      ('weight-optimization','Lipoprotein (a)','one_time'),
      -- Sexual wellness
      ('sexual-wellness','Estradiol, Sensitive','reflex'),
      ('sexual-wellness','Testosterone, Free','reflex')
    ) AS v(slug, test_name, rule)
  WHERE pt.panel_id = p.id
    AND pt.test_id = t.id
    AND p.slug = v.slug
    AND t.name = v.test_name;
END $$;

-- Retire the redundant lab_panel_tests table created 2026-06-23. The EMR Lab
-- Catalog admin and labCatalogEconomics use panel_tests as the single source of
-- truth; lab_panel_tests was an unused duplicate.
DROP TABLE IF EXISTS public.lab_panel_tests;
