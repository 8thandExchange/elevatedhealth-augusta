-- Pharmacy orders: Custom Pharmacy of Evans only (creams). Deactivate FCC portal routing.
-- Seed primary prescribing provider for staff (Caroline) to select on fax orders.

BEGIN;

UPDATE public.pharmacies
SET is_active = false,
    notes = COALESCE(notes, '') || ' [Inactive 2026-06-21 — clinic routes hormone creams to Custom Pharmacy only.]'
WHERE slug = 'fcc';

UPDATE public.pharmacies
SET
  default_for_categories = ARRAY['male_hormone', 'female_hormone', 'hormone', 'male_creams', 'female_creams'],
  notes = '503A compounding pharmacy — sole vendor for hormone transdermal cream Rx (fax). Eric Holgate, RPh.'
WHERE slug = 'custom-pharmacy-evans';

-- Structured provider keys: provider_{id}_{field} — id must not contain underscores.
INSERT INTO public.clinic_settings (key, value, description)
VALUES
  ('provider_eha_name', 'Troy Akers', 'Elevated Health Augusta — primary prescribing provider name'),
  ('provider_eha_credentials', 'DO', 'Primary prescriber credentials'),
  ('provider_eha_npi', '1265697049', 'Primary prescriber NPI'),
  ('provider_eha_email', 'troy@elevatedhealthaugusta.com', 'Primary prescriber contact email'),
  ('provider_eha_is_primary', 'true', 'Default prescriber on pharmacy fax orders')
ON CONFLICT (key) DO UPDATE SET
  value = EXCLUDED.value,
  description = EXCLUDED.description,
  updated_at = now();

COMMIT;
