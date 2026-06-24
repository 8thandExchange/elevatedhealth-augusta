-- Reprice the two hormone lab panels from the Comprehensive ($199) tier to the
-- Expanded ($299) tier. At 16–18 individual assays (LabCorp COGS ~$170–182) the
-- $199 tier sold them below cost at the 20%-off member price ($159.20).
-- $299 (member $239.20) restores a healthy margin and stays competitive
-- (Marek $250–595, Genics $279, WarriorBabe $299). Idempotent.
UPDATE public.lab_panels
SET non_member_price_cents = 29900,
    member_price_cents = 23920,
    updated_at = now()
WHERE slug IN ('hormone-male', 'hormone-female');
