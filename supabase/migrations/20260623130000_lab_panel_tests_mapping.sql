-- Formal panel -> test composition mapping. Until now the DB had no join
-- between lab_panels and lab_tests; panel composition was only implied by the
-- approximate testCount in labPanelCheckout.ts. This makes composition
-- authoritative and lets the margin tooling sum real per-test COGS per panel.
--
-- Rows are seeded as status='draft' from the clinically-inferred composition.
-- They are NOT physician-approved order sets — Caroline / the medical director
-- must review and promote to status='active' before they drive ordering.

CREATE TABLE IF NOT EXISTS public.lab_panel_tests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  panel_id uuid NOT NULL REFERENCES public.lab_panels(id) ON DELETE CASCADE,
  test_id uuid NOT NULL REFERENCES public.lab_tests(id) ON DELETE CASCADE,
  -- false => reflex / order-on-indication rather than part of the default draw
  is_default boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  -- 'draft' until physician sign-off; only 'active' rows should drive ordering
  status text NOT NULL DEFAULT 'draft',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (panel_id, test_id)
);

ALTER TABLE public.lab_panel_tests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS lab_panel_tests_select ON public.lab_panel_tests;
DROP POLICY IF EXISTS lab_panel_tests_manage ON public.lab_panel_tests;

CREATE POLICY lab_panel_tests_select
ON public.lab_panel_tests
FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin'::public.app_role)
  OR public.has_role(auth.uid(), 'staff'::public.app_role)
  OR public.has_role(auth.uid(), 'provider'::public.app_role)
  OR public.has_business_admin_role(auth.uid())
);

CREATE POLICY lab_panel_tests_manage
ON public.lab_panel_tests
FOR ALL
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin'::public.app_role)
  OR public.has_role(auth.uid(), 'staff'::public.app_role)
  OR public.has_business_admin_role(auth.uid())
)
WITH CHECK (
  public.has_role(auth.uid(), 'admin'::public.app_role)
  OR public.has_role(auth.uid(), 'staff'::public.app_role)
  OR public.has_business_admin_role(auth.uid())
);

-- Seed draft compositions. Helper inserts (panel slug, test name) pairs.
DO $$
DECLARE
  r record;
BEGIN
  FOR r IN
    SELECT * FROM (VALUES
      -- Foundational Labs (8)
      ('foundation-wellness','Complete Blood Count'),
      ('foundation-wellness','Comprehensive Metabolic Panel'),
      ('foundation-wellness','Ferritin'),
      ('foundation-wellness','Hemoglobin A1c'),
      ('foundation-wellness','High-Sensitivity C-Reactive Protein'),
      ('foundation-wellness','Lipid Panel'),
      ('foundation-wellness','Thyroid Stimulating Hormone'),
      ('foundation-wellness','Vitamin D, 25-OH'),
      -- Male Hormone Panel (foundation 8 + 8)
      ('hormone-male','Complete Blood Count'),
      ('hormone-male','Comprehensive Metabolic Panel'),
      ('hormone-male','Ferritin'),
      ('hormone-male','Hemoglobin A1c'),
      ('hormone-male','High-Sensitivity C-Reactive Protein'),
      ('hormone-male','Lipid Panel'),
      ('hormone-male','Thyroid Stimulating Hormone'),
      ('hormone-male','Vitamin D, 25-OH'),
      ('hormone-male','Testosterone, Total'),
      ('hormone-male','Testosterone, Free'),
      ('hormone-male','Estradiol, Sensitive'),
      ('hormone-male','Sex Hormone-Binding Globulin'),
      ('hormone-male','Luteinizing Hormone'),
      ('hormone-male','Follicle-Stimulating Hormone'),
      ('hormone-male','Prostate-Specific Antigen'),
      ('hormone-male','DHEA-Sulfate'),
      -- Female Hormone Panel (foundation 8 + 10)
      ('hormone-female','Complete Blood Count'),
      ('hormone-female','Comprehensive Metabolic Panel'),
      ('hormone-female','Ferritin'),
      ('hormone-female','Hemoglobin A1c'),
      ('hormone-female','High-Sensitivity C-Reactive Protein'),
      ('hormone-female','Lipid Panel'),
      ('hormone-female','Thyroid Stimulating Hormone'),
      ('hormone-female','Vitamin D, 25-OH'),
      ('hormone-female','Estradiol, Sensitive'),
      ('hormone-female','Progesterone'),
      ('hormone-female','Follicle-Stimulating Hormone'),
      ('hormone-female','Luteinizing Hormone'),
      ('hormone-female','Prolactin'),
      ('hormone-female','DHEA-Sulfate'),
      ('hormone-female','Free T3'),
      ('hormone-female','Free T4'),
      ('hormone-female','Testosterone, Total'),
      ('hormone-female','Sex Hormone-Binding Globulin'),
      -- Expanded / Weight Optimization (foundation 8 + metabolic 8)
      ('weight-optimization','Complete Blood Count'),
      ('weight-optimization','Comprehensive Metabolic Panel'),
      ('weight-optimization','Ferritin'),
      ('weight-optimization','Hemoglobin A1c'),
      ('weight-optimization','High-Sensitivity C-Reactive Protein'),
      ('weight-optimization','Lipid Panel'),
      ('weight-optimization','Thyroid Stimulating Hormone'),
      ('weight-optimization','Vitamin D, 25-OH'),
      ('weight-optimization','Fasting Insulin'),
      ('weight-optimization','Apolipoprotein B'),
      ('weight-optimization','Lipoprotein (a)'),
      ('weight-optimization','Leptin'),
      ('weight-optimization','Homocysteine'),
      ('weight-optimization','Folate'),
      ('weight-optimization','Vitamin B12'),
      ('weight-optimization','Iron Studies'),
      -- Sexual Wellness (7)
      ('sexual-wellness','Testosterone, Total'),
      ('sexual-wellness','Testosterone, Free'),
      ('sexual-wellness','Estradiol, Sensitive'),
      ('sexual-wellness','Prolactin'),
      ('sexual-wellness','Sex Hormone-Binding Globulin'),
      ('sexual-wellness','DHEA-Sulfate'),
      ('sexual-wellness','Thyroid Stimulating Hormone')
    ) AS s(panel_slug, test_name)
  LOOP
    INSERT INTO public.lab_panel_tests (panel_id, test_id, status)
    SELECT p.id, t.id, 'draft'
    FROM public.lab_panels p
    JOIN public.lab_tests t ON t.name = r.test_name
    WHERE p.slug = r.panel_slug
    ON CONFLICT (panel_id, test_id) DO NOTHING;
  END LOOP;
END $$;
