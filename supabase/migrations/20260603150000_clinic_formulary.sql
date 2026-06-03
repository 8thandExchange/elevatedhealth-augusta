-- ============================================================================
-- Clinic formulary: unified ops catalog (supplier cost, client price, dose).
-- Kristen/staff edit in-app; changes audited in formulary_change_log.
-- Optional links: inventory_skus (stock/FEFO), iv_addons (IV lounge Stripe).
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ============================================================================
-- 1. clinic_formulary
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.clinic_formulary (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  item_code text NOT NULL UNIQUE,
  inventory_sku_id uuid REFERENCES public.inventory_skus(id) ON DELETE SET NULL,
  iv_addon_id uuid REFERENCES public.iv_addons(id) ON DELETE SET NULL,
  display_name text NOT NULL,
  category text NOT NULL CHECK (
    category IN (
      'iv_additive',
      'peptide',
      'peptide_stack',
      'compounded_medication',
      'iv_supply',
      'medical_supply',
      'consumable',
      'glp1',
      'hormone',
      'program',
      'other'
    )
  ),
  dose_strength text,
  dose_notes text,
  supplier text NOT NULL CHECK (
    supplier IN ('fcc', 'henry_schein', 'empower', 'stericycle', 'labcorp', 'other')
  ),
  supplier_sku text,
  supplier_cost_cents integer CHECK (supplier_cost_cents IS NULL OR supplier_cost_cents >= 0),
  supplier_cost_unit text,
  client_price_cents integer CHECK (client_price_cents IS NULL OR client_price_cents >= 0),
  client_price_member_cents integer CHECK (client_price_member_cents IS NULL OR client_price_member_cents >= 0),
  billing_unit text NOT NULL DEFAULT 'each',
  stripe_price_id text,
  tracks_inventory boolean NOT NULL DEFAULT false,
  sort_order integer NOT NULL DEFAULT 0,
  internal_notes text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_clinic_formulary_category
  ON public.clinic_formulary(category) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_clinic_formulary_inventory
  ON public.clinic_formulary(inventory_sku_id) WHERE inventory_sku_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_clinic_formulary_supplier
  ON public.clinic_formulary(supplier) WHERE is_active = true;

DROP TRIGGER IF EXISTS trg_clinic_formulary_updated_at ON public.clinic_formulary;
CREATE TRIGGER trg_clinic_formulary_updated_at
  BEFORE UPDATE ON public.clinic_formulary
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

COMMENT ON TABLE public.clinic_formulary IS
  'Master ops catalog: dose, supplier SKU/cost, and client pricing. Staff-editable with audit log.';

-- ============================================================================
-- 2. formulary_change_log
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.formulary_change_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  formulary_id uuid NOT NULL REFERENCES public.clinic_formulary(id) ON DELETE CASCADE,
  field_name text NOT NULL,
  old_value text,
  new_value text,
  changed_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  changed_at timestamptz NOT NULL DEFAULT now(),
  change_note text
);

CREATE INDEX IF NOT EXISTS idx_formulary_change_log_formulary
  ON public.formulary_change_log(formulary_id, changed_at DESC);

COMMENT ON TABLE public.formulary_change_log IS
  'Audit trail for clinic_formulary edits (populated by trigger).';

-- ============================================================================
-- 3. Change-log trigger
-- ============================================================================

CREATE OR REPLACE FUNCTION public.log_clinic_formulary_changes()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _uid uuid;
  _fields text[] := ARRAY[
    'display_name', 'category', 'dose_strength', 'dose_notes',
    'supplier', 'supplier_sku', 'supplier_cost_cents', 'supplier_cost_unit',
    'client_price_cents', 'client_price_member_cents', 'billing_unit',
    'stripe_price_id', 'tracks_inventory', 'internal_notes', 'is_active',
    'inventory_sku_id', 'iv_addon_id'
  ];
  _f text;
  _old text;
  _new text;
  _old_j jsonb;
  _new_j jsonb;
BEGIN
  _uid := auth.uid();
  _old_j := to_jsonb(OLD);
  _new_j := to_jsonb(NEW);
  FOREACH _f IN ARRAY _fields LOOP
    _old := _old_j ->> _f;
    _new := _new_j ->> _f;
    IF _old IS DISTINCT FROM _new THEN
      INSERT INTO public.formulary_change_log (
        formulary_id, field_name, old_value, new_value, changed_by
      ) VALUES (NEW.id, _f, _old, _new, _uid);
    END IF;
  END LOOP;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_clinic_formulary_audit ON public.clinic_formulary;
CREATE TRIGGER trg_clinic_formulary_audit
  AFTER UPDATE ON public.clinic_formulary
  FOR EACH ROW EXECUTE FUNCTION public.log_clinic_formulary_changes();

-- ============================================================================
-- 4. RLS — staff/admin only (wholesale costs + margin)
-- ============================================================================

ALTER TABLE public.clinic_formulary ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.formulary_change_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Staff and admins can read clinic formulary" ON public.clinic_formulary;
CREATE POLICY "Staff and admins can read clinic formulary"
  ON public.clinic_formulary FOR SELECT
  USING (
    public.has_role(auth.uid(), 'admin'::app_role)
    OR public.has_role(auth.uid(), 'staff'::app_role)
    OR public.has_role(auth.uid(), 'business_admin'::app_role)
    OR public.has_role(auth.uid(), 'provider'::app_role)
  );

DROP POLICY IF EXISTS "Staff and admins can manage clinic formulary" ON public.clinic_formulary;
CREATE POLICY "Staff and admins can manage clinic formulary"
  ON public.clinic_formulary FOR INSERT
  WITH CHECK (
    public.has_role(auth.uid(), 'admin'::app_role)
    OR public.has_role(auth.uid(), 'staff'::app_role)
    OR public.has_role(auth.uid(), 'business_admin'::app_role)
  );

CREATE POLICY "Staff and admins can update clinic formulary"
  ON public.clinic_formulary FOR UPDATE
  USING (
    public.has_role(auth.uid(), 'admin'::app_role)
    OR public.has_role(auth.uid(), 'staff'::app_role)
    OR public.has_role(auth.uid(), 'business_admin'::app_role)
  )
  WITH CHECK (
    public.has_role(auth.uid(), 'admin'::app_role)
    OR public.has_role(auth.uid(), 'staff'::app_role)
    OR public.has_role(auth.uid(), 'business_admin'::app_role)
  );

CREATE POLICY "Admins can delete clinic formulary"
  ON public.clinic_formulary FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Staff and admins can read formulary change log" ON public.formulary_change_log;
CREATE POLICY "Staff and admins can read formulary change log"
  ON public.formulary_change_log FOR SELECT
  USING (
    public.has_role(auth.uid(), 'admin'::app_role)
    OR public.has_role(auth.uid(), 'staff'::app_role)
    OR public.has_role(auth.uid(), 'business_admin'::app_role)
    OR public.has_role(auth.uid(), 'provider'::app_role)
  );

-- ============================================================================
-- 5. Seed — inventory-linked items, IV add-ons, peptide stacks, à la carte
-- ============================================================================

BEGIN;

-- A) Inventory SKUs → formulary (FCC wholesale from FormuConnect Q2 2026 where known)
INSERT INTO public.clinic_formulary (
  item_code, inventory_sku_id, display_name, category, dose_strength, dose_notes,
  supplier, supplier_sku, supplier_cost_cents, supplier_cost_unit,
  client_price_cents, client_price_member_cents, billing_unit,
  tracks_inventory, sort_order, internal_notes
)
SELECT
  s.sku_code,
  s.id,
  s.display_name,
  CASE s.category
    WHEN 'peptide' THEN 'peptide'
    WHEN 'iv_supply' THEN 'iv_supply'
    WHEN 'medical_supply' THEN 'medical_supply'
    WHEN 'consumable' THEN 'consumable'
    ELSE 'compounded_medication'
  END,
  CASE s.sku_code
    WHEN 'TEST-CYP-100-5ML' THEN '100mg/mL'
    WHEN 'TEST-CYP-200-5ML' THEN '200mg/mL'
    WHEN 'TEST-CYP-200-1ML' THEN '200mg/mL'
    WHEN 'SERMORELIN-1-6ML' THEN '1mg/mL, 6mL vial'
    WHEN 'PT141-2-10ML' THEN '2mg/mL, 10mL vial'
    WHEN 'MAG-CL-200-30ML' THEN '200mg/mL, 30mL vial'
    WHEN 'NAD-100-10ML' THEN '100mg/mL, 10mL vial'
    WHEN 'NAD-200-10ML' THEN '200mg/mL, 10mL vial'
    WHEN 'SEMAG-2.5-3ML' THEN '2.5mg/mL, 3mL vial'
    WHEN 'TIRZ-12.5-3ML' THEN '12.5mg/mL, 3mL vial'
    ELSE NULL
  END,
  'Per ' || s.default_unit || '; reorder at ' || s.reorder_threshold::text || ' ' || s.default_unit,
  s.vendor,
  s.fcc_catalog_sku,
  CASE s.fcc_catalog_sku
    WHEN '3801' THEN 4200
    WHEN '3804' THEN 5200
    WHEN '3532' THEN 1800
    WHEN '2884' THEN 3800
    WHEN '3502' THEN 9500
    WHEN '2901' THEN 4500
    WHEN '3812' THEN 12000
    WHEN '3511' THEN 8500
    WHEN '2490' THEN 6500
    WHEN '2493' THEN 11000
    WHEN '2500' THEN 14000
    WHEN '2502' THEN 22000
    WHEN '2837' THEN 4200
    WHEN '3119' THEN 5500
    WHEN '3839' THEN 9800
    WHEN '2867' THEN 3200
    WHEN '3729' THEN 3400
    WHEN '3735' THEN 7200
    ELSE NULL
  END,
  s.default_unit,
  NULL,
  NULL,
  s.default_unit,
  true,
  100,
  'Seeded from inventory_skus. Set client_price when quoting à la carte fills.'
FROM public.inventory_skus s
ON CONFLICT (item_code) DO UPDATE SET
  inventory_sku_id = EXCLUDED.inventory_sku_id,
  display_name = EXCLUDED.display_name,
  category = EXCLUDED.category,
  dose_strength = COALESCE(EXCLUDED.dose_strength, clinic_formulary.dose_strength),
  supplier = EXCLUDED.supplier,
  supplier_sku = EXCLUDED.supplier_sku,
  supplier_cost_cents = COALESCE(EXCLUDED.supplier_cost_cents, clinic_formulary.supplier_cost_cents),
  tracks_inventory = true,
  updated_at = now();

-- B) IV add-ons (walk-in patient prices from iv_addons)
INSERT INTO public.clinic_formulary (
  item_code, iv_addon_id, display_name, category, dose_strength, dose_notes,
  supplier, supplier_cost_cents, supplier_cost_unit,
  client_price_cents, billing_unit, tracks_inventory, sort_order, internal_notes
)
SELECT
  'IV-ADDON-' || upper(replace(replace(a.name, ' ', '-'), '+', 'PLUS')),
  a.id,
  a.name,
  'iv_additive',
  CASE a.name
    WHEN 'Toradol Push' THEN '30mg IV push'
    WHEN 'Zofran Push' THEN '4mg IV push'
    WHEN 'Glutathione Push' THEN '200mg IV push'
    WHEN 'B12 Shot' THEN '1mg IM'
    WHEN 'Vitamin C Push' THEN 'High-dose IV push'
    WHEN 'NAD+ Booster' THEN 'Booster dose at IV lounge'
    ELSE NULL
  END,
  COALESCE(a.description, ''),
  'fcc',
  NULL,
  'push',
  (a.price * 100)::integer,
  'each',
  false,
  200,
  'Synced from iv_addons. Toradol/Zofran typically sourced via clinic supply — set supplier_cost when known.'
FROM public.iv_addons a
WHERE a.is_active IS NOT FALSE
ON CONFLICT (item_code) DO UPDATE SET
  iv_addon_id = EXCLUDED.iv_addon_id,
  display_name = EXCLUDED.display_name,
  client_price_cents = EXCLUDED.client_price_cents,
  dose_strength = COALESCE(EXCLUDED.dose_strength, clinic_formulary.dose_strength),
  updated_at = now();

-- C) IV lounge ingredients not in iv_addons (Mg, Taurine)
INSERT INTO public.clinic_formulary (
  item_code, display_name, category, dose_strength, dose_notes,
  supplier, supplier_sku, supplier_cost_cents, supplier_cost_unit,
  client_price_cents, billing_unit, tracks_inventory, sort_order, internal_notes
) VALUES (
  'IV-INGREDIENT-TAURINE',
  'Taurine IV additive',
  'iv_additive',
  '50mg/mL, 30mL vial',
  'Typical IV drip additive; member 15% off IV add-ons when on ELEVATED program',
  'fcc',
  '3732',
  5500,
  'vial',
  NULL,
  'vial',
  false,
  210,
  'FCC FormuConnect Q2 2026. Set walk-in add-on price if sold à la carte.'
)
ON CONFLICT (item_code) DO UPDATE SET
  supplier_cost_cents = EXCLUDED.supplier_cost_cents,
  dose_strength = EXCLUDED.dose_strength,
  updated_at = now();

INSERT INTO public.clinic_formulary (
  item_code, inventory_sku_id, display_name, category, dose_strength, dose_notes,
  supplier, supplier_sku, supplier_cost_cents, supplier_cost_unit,
  client_price_cents, billing_unit, tracks_inventory, sort_order, internal_notes
)
SELECT
  'IV-INGREDIENT-MAGNESIUM',
  inv.id,
  'Magnesium Chloride IV',
  'iv_additive',
  '200mg/mL, 30mL vial',
  'Myers / custom IV builds',
  'fcc',
  '3729',
  3400,
  'vial',
  NULL,
  'vial',
  true,
  205,
  'Linked to inventory SKU MAG-CL-200-30ML'
FROM public.inventory_skus inv
WHERE inv.sku_code = 'MAG-CL-200-30ML'
ON CONFLICT (item_code) DO UPDATE SET
  inventory_sku_id = EXCLUDED.inventory_sku_id,
  tracks_inventory = true,
  updated_at = now();

-- D) Named peptide stacks (canonical member / non-member monthly — .cursorrules)
INSERT INTO public.clinic_formulary (
  item_code, display_name, category, dose_strength, dose_notes,
  supplier, supplier_cost_cents, supplier_cost_unit,
  client_price_cents, client_price_member_cents, billing_unit,
  tracks_inventory, sort_order, internal_notes
) VALUES
  (
    'STACK-RESTORE',
    'Restore Protocol (PT-141 weekly)',
    'peptide_stack',
    'PT-141 injectable, weekly',
    'Sexual wellness stack. Stripe à la carte may differ — verify before quoting.',
    'fcc',
    NULL,
    'month',
    17900,
    12900,
    'month',
    false,
    300,
    'Display pricing per pricing_source_of_truth.md'
  ),
  (
    'STACK-HEALING',
    'Healing Protocol (PDA + TB-500 Wolverine)',
    'peptide_stack',
    'PDA daily + TB-500 weekly when pharmacy supplies',
    'BPC-157 not compounded; PDA successor per clinic policy.',
    'fcc',
    NULL,
    'month',
    32900,
    24900,
    'month',
    false,
    310,
    'Verify TB-500 FCC supply before enrolling'
  ),
  (
    'STACK-VITALITY-SUBQ',
    'Vitality Protocol (Sermorelin + NAD+ subQ)',
    'peptide_stack',
    'Sermorelin nightly + NAD+ injection',
    'Monthly program bundle',
    'fcc',
    NULL,
    'month',
    39900,
    29900,
    'month',
    false,
    320,
    NULL
  ),
  (
    'STACK-VITALITY-IV',
    'Vitality Protocol with NAD+ IV at lounge',
    'peptide_stack',
    'Sermorelin + NAD+ 250mg IV monthly',
    'Includes IV lounge NAD infusion component',
    'fcc',
    NULL,
    'month',
    59900,
    44900,
    'month',
    false,
    325,
    NULL
  )
ON CONFLICT (item_code) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  client_price_cents = EXCLUDED.client_price_cents,
  client_price_member_cents = EXCLUDED.client_price_member_cents,
  dose_notes = EXCLUDED.dose_notes,
  updated_at = now();

-- E) GLP-1 monthly fills (member / non-member)
INSERT INTO public.clinic_formulary (
  item_code, inventory_sku_id, display_name, category, dose_strength, dose_notes,
  supplier, supplier_sku, supplier_cost_cents, supplier_cost_unit,
  client_price_cents, client_price_member_cents, billing_unit,
  tracks_inventory, sort_order
)
SELECT
  'GLP1-' || s.sku_code,
  s.id,
  s.display_name,
  'glp1',
  CASE WHEN s.sku_code LIKE 'SEMAG%' THEN 'Compounded semaglutide / B6' ELSE 'Compounded tirzepatide / B6' END,
  'Monthly fill pricing; ELEVATED GLP-1 program may bundle',
  'fcc',
  s.fcc_catalog_sku,
  CASE s.fcc_catalog_sku WHEN '2490' THEN 6500 WHEN '2493' THEN 11000 WHEN '2500' THEN 14000 WHEN '2502' THEN 22000 ELSE NULL END,
  'vial',
  CASE WHEN s.sku_code LIKE 'SEMAG%' THEN 24900 ELSE 49900 END,
  CASE WHEN s.sku_code LIKE 'SEMAG%' THEN 19900 ELSE 39900 END,
  'month',
  true,
  400
FROM public.inventory_skus s
WHERE s.sku_code IN ('SEMAG-2.5-3ML', 'TIRZ-12.5-3ML')
ON CONFLICT (item_code) DO UPDATE SET
  inventory_sku_id = EXCLUDED.inventory_sku_id,
  client_price_cents = EXCLUDED.client_price_cents,
  client_price_member_cents = EXCLUDED.client_price_member_cents,
  supplier_cost_cents = COALESCE(EXCLUDED.supplier_cost_cents, clinic_formulary.supplier_cost_cents),
  updated_at = now();

-- F) À la carte peptides (Stripe recurring amounts)
INSERT INTO public.clinic_formulary (
  item_code, display_name, category, dose_strength,
  supplier, supplier_cost_unit, client_price_cents, client_price_member_cents,
  billing_unit, tracks_inventory, sort_order, internal_notes
) VALUES
  ('PEPTIDE-SERMORELIN', 'Sermorelin Injection', 'peptide', '1mg/mL, 6mL vial', 'fcc', 'month', 14900, NULL, 'month', false, 350, 'Stripe price_1TWcskCXbCBPFEeIBSytC63Q'),
  ('PEPTIDE-CJC-IPAM', 'CJC-1295/Ipamorelin', 'peptide', 'Research peptide consent required', 'fcc', 'month', 17900, NULL, 'month', false, 351, 'Cat 2 — Research Peptide Consent'),
  ('PEPTIDE-NAD-INJ', 'NAD+ Injection', 'peptide', 'SubQ take-home', 'fcc', 'month', 19900, NULL, 'month', false, 352, NULL),
  ('PEPTIDE-PT141', 'PT-141 (Bremelanotide)', 'peptide', '2mg/mL, 10mL vial', 'fcc', 'each', 22500, NULL, 'each', false, 353, 'FDA-approved as Vyleesi; compounded dosing')
ON CONFLICT (item_code) DO UPDATE SET
  client_price_cents = EXCLUDED.client_price_cents,
  dose_strength = EXCLUDED.dose_strength,
  updated_at = now();

-- Link MAG formulary row to inventory after insert
UPDATE public.clinic_formulary f
SET inventory_sku_id = s.id, tracks_inventory = true
FROM public.inventory_skus s
WHERE f.item_code = 'IV-INGREDIENT-MAGNESIUM' AND s.sku_code = 'MAG-CL-200-30ML';

COMMIT;
