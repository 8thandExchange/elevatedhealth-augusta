-- Recompute lab member prices from the single 20% discount rule (src/lib/pricing.ts).
-- Display code derives member_price at read time; this keeps stored columns in sync.

UPDATE public.lab_panels
SET member_price_cents = ROUND(non_member_price_cents * 0.8)
WHERE member_price_cents IS DISTINCT FROM ROUND(non_member_price_cents * 0.8);

UPDATE public.lab_tests
SET member_price_cents = ROUND(non_member_price_cents * 0.8)
WHERE member_price_cents IS DISTINCT FROM ROUND(non_member_price_cents * 0.8);
