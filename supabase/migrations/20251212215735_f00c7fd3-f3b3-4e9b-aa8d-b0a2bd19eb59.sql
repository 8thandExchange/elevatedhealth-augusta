-- Add fax tracking columns to orders table
ALTER TABLE public.orders 
  ADD COLUMN IF NOT EXISTS fax_id TEXT,
  ADD COLUMN IF NOT EXISTS fax_status TEXT DEFAULT 'not_sent',
  ADD COLUMN IF NOT EXISTS fax_sent_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS fax_destination TEXT,
  ADD COLUMN IF NOT EXISTS fax_error TEXT;

-- Insert provider NPIs into clinic_settings
INSERT INTO public.clinic_settings (key, value, description) VALUES
  ('provider_npi_lauren_bursey', '1578971552', 'Lauren Bursey, FNP-C NPI'),
  ('provider_npi_troy_akers', '1265697049', 'Troy Akers, DO NPI'),
  ('provider_npi_michael_bursey', '1295099182', 'Michael Bursey, DO NPI'),
  ('provider_npi_dennis_williams', '1235131525', 'Dennis Williams, MD NPI')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = now();