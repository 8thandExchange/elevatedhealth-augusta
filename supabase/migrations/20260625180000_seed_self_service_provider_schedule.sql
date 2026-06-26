-- Launch: replace fragmented 30-minute test windows on the patient self-service
-- provider calendar with standard Mon–Fri clinic hours (9am–5pm ET).
-- PATIENT_SELF_SERVICE_PROVIDER_ID = 6d3d8103-e937-4885-beee-297ab31033f7

-- Deactivate legacy fragment rows (kept for audit; no longer bookable).
UPDATE public.provider_schedules
SET is_active = false,
    updated_at = now()
WHERE provider_id = '6d3d8103-e937-4885-beee-297ab31033f7'::uuid
  AND is_active = true
  AND (
    EXTRACT(EPOCH FROM (end_time - start_time)) / 60 <= 30
    OR start_time < '09:00:00'::time
    OR end_time > '17:00:00'::time
  );

-- Seed Mon–Fri 9:00–17:00 if no active full-day row exists for that DOW.
INSERT INTO public.provider_schedules (
  provider_id, day_of_week, start_time, end_time, service_lines, slot_minutes, is_active
)
SELECT
  '6d3d8103-e937-4885-beee-297ab31033f7'::uuid,
  dow,
  '09:00:00'::time,
  '17:00:00'::time,
  ARRAY['iv','consult','hormone','peptide','weight_loss','follow_up']::text[],
  30,
  true
FROM unnest(ARRAY[1, 2, 3, 4, 5]::int[]) AS dow
WHERE NOT EXISTS (
  SELECT 1 FROM public.provider_schedules ps
  WHERE ps.provider_id = '6d3d8103-e937-4885-beee-297ab31033f7'::uuid
    AND ps.day_of_week = dow
    AND ps.is_active = true
    AND ps.start_time <= '09:00:00'::time
    AND ps.end_time >= '17:00:00'::time
);
