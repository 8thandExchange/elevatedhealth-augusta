-- Add new columns to lab_results for complete ZRT data capture

-- Cortisol Curve (Saliva Profile III)
ALTER TABLE public.lab_results
ADD COLUMN IF NOT EXISTS cortisol_noon numeric,
ADD COLUMN IF NOT EXISTS cortisol_evening numeric,
ADD COLUMN IF NOT EXISTS cortisol_night numeric;

-- DHEA-S (Saliva Profile III)
ALTER TABLE public.lab_results
ADD COLUMN IF NOT EXISTS dhea_s numeric;

-- Neurotransmitters (Neuro + Saliva panel)
ALTER TABLE public.lab_results
ADD COLUMN IF NOT EXISTS serotonin numeric,
ADD COLUMN IF NOT EXISTS gaba numeric,
ADD COLUMN IF NOT EXISTS dopamine numeric,
ADD COLUMN IF NOT EXISTS glutamate numeric,
ADD COLUMN IF NOT EXISTS norepinephrine numeric,
ADD COLUMN IF NOT EXISTS epinephrine numeric;

-- Interpretation Storage
ALTER TABLE public.lab_results
ADD COLUMN IF NOT EXISTS clinical_story text,
ADD COLUMN IF NOT EXISTS treatment_plan jsonb,
ADD COLUMN IF NOT EXISTS kit_type text DEFAULT 'hormone_mapping';