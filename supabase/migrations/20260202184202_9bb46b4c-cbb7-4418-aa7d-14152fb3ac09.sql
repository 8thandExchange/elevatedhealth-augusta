-- Add service_interests column to patients table for multi-select
ALTER TABLE public.patients 
ADD COLUMN IF NOT EXISTS service_interests JSONB DEFAULT '[]'::jsonb;