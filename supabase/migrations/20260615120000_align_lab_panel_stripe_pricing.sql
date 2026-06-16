-- Align lab_panels patient charges with live Stripe CORE_SERVICES catalog.
-- Comprehensive Wellness Panel: $199 (price_1TWcoMCXbCBPFEeIKTLxoYYs)
-- Expanded Panel: $299 (price_1TWcolCXbCBPFEeI11uF9lyf)
-- Clinical test composition unchanged; checkout tier is the billing SKU.

UPDATE public.lab_panels
SET
  non_member_price_cents = 19900,
  member_price_cents = 15920
WHERE slug IN ('foundation-wellness', 'hormone-male', 'hormone-female', 'sexual-wellness');

UPDATE public.lab_panels
SET
  non_member_price_cents = 29900,
  member_price_cents = 23920
WHERE slug = 'weight-optimization';

-- Launch-hidden service line — keep seeded for protocols, hide from staff order UI.
UPDATE public.lab_panels
SET is_active = false
WHERE slug = 'sexual-wellness';

COMMENT ON TABLE public.lab_panels IS
  'Clinical LabCorp panel definitions. Patient checkout uses two Stripe SKUs only ($199 Comprehensive / $299 Expanded). See src/lib/labPanelCheckout.ts for slug→tier mapping.';
