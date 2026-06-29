-- Activate IV prescription injectable add-on protocols in the library.
-- status remains 'draft' until Dr. Akers signs; is_active = true makes them visible to staff/admin.
-- Do not re-run seed migration expecting is_active = false — this migration is authoritative for visibility.

BEGIN;

UPDATE public.clinical_protocols
SET is_active = true,
    updated_at = now()
WHERE slug IN (
  'iv-addon-ketorolac-toradol',
  'iv-addon-ondansetron-zofran',
  'iv-addon-diphenhydramine-benadryl',
  'iv-addon-famotidine-pepcid'
);

COMMIT;
