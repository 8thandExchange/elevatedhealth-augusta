-- Retatrutide price increase: $449 → $499/mo (2026-06-28)
UPDATE public.clinic_formulary
SET
  display_name = 'Compounded Retatrutide',
  client_price_cents = 49900,
  client_price_member_cents = 39920,
  dose_notes = 'Triple agonist anchor. GLP-1 class consent required. Physician-gated — not advertised.',
  updated_at = now()
WHERE item_code = 'PEPTIDE-RETATRUTIDE';
