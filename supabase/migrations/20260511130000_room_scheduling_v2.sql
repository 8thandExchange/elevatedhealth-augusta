-- Room Scheduling v2 — fits the real elevatedhealth-augusta schema
-- Differences from v1: creates rooms (didn't exist), keys off service_line (text),
-- uses scheduled_at + duration_minutes (real schema), uses has_role()/has_business_admin_role()
BEGIN;
-- 1. ROOMS
CREATE TABLE IF NOT EXISTS public.rooms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  type text NOT NULL CHECK (type IN ('treatment_room','consult_room','procedure_room','injection_room','lobby')),
  display_order int NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  is_flex boolean NOT NULL DEFAULT false,
  max_concurrent_appointments int NOT NULL DEFAULT 1,
  allowed_service_lines text[] NOT NULL DEFAULT '{}',
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
-- 2. ROOM BLACKOUTS
CREATE TABLE IF NOT EXISTS public.room_blackouts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id uuid NOT NULL REFERENCES public.rooms(id) ON DELETE CASCADE,
  start_at timestamptz NOT NULL,
  end_at timestamptz NOT NULL,
  reason text,
  recurring boolean NOT NULL DEFAULT false,
  recurrence_pattern jsonb,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  CHECK (end_at > start_at)
);
CREATE INDEX IF NOT EXISTS idx_room_blackouts_window ON public.room_blackouts(room_id, start_at, end_at);
-- 3. BOOKING LIMITS
CREATE TABLE IF NOT EXISTS public.booking_limits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  day_of_week int CHECK (day_of_week IS NULL OR day_of_week BETWEEN 0 AND 6),
  start_time time,
  end_time time,
  max_concurrent int NOT NULL CHECK (max_concurrent >= 0),
  service_line text,
  applies_to_room_types text[] DEFAULT '{}',
  effective_from date,
  effective_until date,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
-- 4. APPOINTMENTS — add room_id (column may already exist if v1 was partially applied)
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS room_id uuid REFERENCES public.rooms(id);
CREATE INDEX IF NOT EXISTS idx_appointments_room_window ON public.appointments(room_id, scheduled_at);
-- 5. SEED ROOMS
INSERT INTO public.rooms (name, type, display_order, is_flex, max_concurrent_appointments, allowed_service_lines, notes)
SELECT * FROM (VALUES
  ('Room 1', 'treatment_room'::text, 1, false, 1, ARRAY['iv','hormone','injection','weight_loss','peptide']::text[], 'Treatment room — IV chair + exam table'),
  ('Room 2', 'treatment_room'::text, 2, false, 1, ARRAY['iv','hormone','injection','weight_loss','peptide']::text[], 'Treatment room — IV chair + exam table'),
  ('Room 3', 'treatment_room'::text, 3, false, 1, ARRAY['iv','hormone','injection','weight_loss','peptide']::text[], 'Treatment room — IV chair + exam table'),
  ('Room 4', 'treatment_room'::text, 4, false, 1, ARRAY['iv','hormone','injection','weight_loss','peptide','consult']::text[], 'Treatment + consult dual-purpose room'),
  ('Lobby',  'lobby'::text,          5, true,  2, ARRAY['injection','consult','weight_loss']::text[], 'Flex 5th space — only used when treatment rooms full, only for short services')
) AS v(name, type, display_order, is_flex, max_concurrent_appointments, allowed_service_lines, notes)
WHERE NOT EXISTS (SELECT 1 FROM public.rooms WHERE rooms.name = v.name);
-- 6. SEED DEFAULT BOOKING LIMITS
INSERT INTO public.booking_limits (name, service_line, max_concurrent, applies_to_room_types, active)
SELECT * FROM (VALUES
  ('IV concurrent cap',     'iv'::text,      4, ARRAY['treatment_room']::text[], true),
  ('Hormone consult cap',   'hormone'::text, 2, NULL::text[],                    true),
  ('Lobby concurrent cap',  NULL::text,      2, ARRAY['lobby']::text[],          true)
) AS v(name, service_line, max_concurrent, applies_to_room_types, active)
WHERE NOT EXISTS (SELECT 1 FROM public.booking_limits WHERE booking_limits.name = v.name);
-- 7. find_available_room
CREATE OR REPLACE FUNCTION public.find_available_room(
  _service_line text, _start_at timestamptz, _duration_minutes int, _exclude_appointment_id uuid DEFAULT NULL
) RETURNS uuid LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE
  _end_at timestamptz := _start_at + (_duration_minutes || ' minutes')::interval;
  _room_id uuid;
BEGIN
  SELECT r.id INTO _room_id
  FROM public.rooms r
  WHERE r.is_active = true
    AND _service_line = ANY(r.allowed_service_lines)
    AND NOT EXISTS (
      SELECT 1 FROM public.appointments a
      WHERE a.room_id = r.id
        AND a.status NOT IN ('cancelled','no_show','rescheduled')
        AND (_exclude_appointment_id IS NULL OR a.id <> _exclude_appointment_id)
        AND a.scheduled_at < _end_at
        AND (a.scheduled_at + (a.duration_minutes || ' minutes')::interval) > _start_at
    )
    AND NOT EXISTS (
      SELECT 1 FROM public.room_blackouts b
      WHERE b.room_id = r.id AND b.start_at < _end_at AND b.end_at > _start_at
    )
  ORDER BY r.is_flex ASC, r.display_order ASC
  LIMIT 1;
  RETURN _room_id;
END; $$;
-- 8. check_booking_limits
CREATE OR REPLACE FUNCTION public.check_booking_limits(
  _service_line text, _scheduled_at timestamptz, _duration_minutes int, _exclude_appointment_id uuid DEFAULT NULL
) RETURNS boolean LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE
  _limit RECORD;
  _appt_count int;
  _end_at timestamptz := _scheduled_at + (_duration_minutes || ' minutes')::interval;
  _appt_dow int := EXTRACT(DOW FROM (_scheduled_at AT TIME ZONE 'America/New_York'))::int;
  _appt_time time := (_scheduled_at AT TIME ZONE 'America/New_York')::time;
  _appt_date date := (_scheduled_at AT TIME ZONE 'America/New_York')::date;
BEGIN
  FOR _limit IN
    SELECT * FROM public.booking_limits
    WHERE active = true
      AND (effective_from IS NULL OR effective_from <= _appt_date)
      AND (effective_until IS NULL OR effective_until >= _appt_date)
      AND (day_of_week IS NULL OR day_of_week = _appt_dow)
      AND (start_time IS NULL OR start_time <= _appt_time)
      AND (end_time IS NULL OR end_time >= _appt_time)
      AND (service_line IS NULL OR service_line = _service_line)
  LOOP
    SELECT COUNT(*) INTO _appt_count
    FROM public.appointments a
    LEFT JOIN public.rooms r ON r.id = a.room_id
    WHERE a.status NOT IN ('cancelled','no_show','rescheduled')
      AND (_exclude_appointment_id IS NULL OR a.id <> _exclude_appointment_id)
      AND a.scheduled_at < _end_at
      AND (a.scheduled_at + (a.duration_minutes || ' minutes')::interval) > _scheduled_at
      AND (_limit.service_line IS NULL OR a.service_line = _limit.service_line)
      AND (
        _limit.applies_to_room_types IS NULL
        OR array_length(_limit.applies_to_room_types, 1) IS NULL
        OR (r.type IS NOT NULL AND r.type = ANY(_limit.applies_to_room_types))
      );
    IF _appt_count + 1 > _limit.max_concurrent THEN RETURN false; END IF;
  END LOOP;
  RETURN true;
END; $$;
-- 9. TRIGGER on appointments
CREATE OR REPLACE FUNCTION public.enforce_appointment_room_rules()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.status IN ('cancelled','no_show','rescheduled') THEN RETURN NEW; END IF;
  IF NEW.is_telehealth = true THEN RETURN NEW; END IF;
  IF NEW.room_id IS NULL THEN
    NEW.room_id := public.find_available_room(
      NEW.service_line, NEW.scheduled_at, NEW.duration_minutes,
      CASE WHEN TG_OP = 'UPDATE' THEN NEW.id ELSE NULL END
    );
    IF NEW.room_id IS NULL THEN
      RAISE EXCEPTION 'No room available (service_line: %, scheduled_at: %, duration: % min)',
        NEW.service_line, NEW.scheduled_at, NEW.duration_minutes;
    END IF;
  ELSE
    IF NOT EXISTS (
      SELECT 1 FROM public.rooms
      WHERE id = NEW.room_id AND is_active = true AND NEW.service_line = ANY(allowed_service_lines)
    ) THEN
      RAISE EXCEPTION 'Room not active or does not allow service line %', NEW.service_line;
    END IF;
    IF EXISTS (
      SELECT 1 FROM public.appointments a
      WHERE a.room_id = NEW.room_id AND a.id <> NEW.id
        AND a.status NOT IN ('cancelled','no_show','rescheduled')
        AND a.scheduled_at < NEW.scheduled_at + (NEW.duration_minutes || ' minutes')::interval
        AND (a.scheduled_at + (a.duration_minutes || ' minutes')::interval) > NEW.scheduled_at
    ) THEN RAISE EXCEPTION 'Room already booked for this time window'; END IF;
    IF EXISTS (
      SELECT 1 FROM public.room_blackouts b
      WHERE b.room_id = NEW.room_id
        AND b.start_at < NEW.scheduled_at + (NEW.duration_minutes || ' minutes')::interval
        AND b.end_at > NEW.scheduled_at
    ) THEN RAISE EXCEPTION 'Room blacked out for this time window'; END IF;
  END IF;
  IF NOT public.check_booking_limits(
    NEW.service_line, NEW.scheduled_at, NEW.duration_minutes,
    CASE WHEN TG_OP = 'UPDATE' THEN NEW.id ELSE NULL END
  ) THEN RAISE EXCEPTION 'Booking limit exceeded for this time window'; END IF;
  RETURN NEW;
END; $$;
DROP TRIGGER IF EXISTS enforce_appointment_room_rules ON public.appointments;
CREATE TRIGGER enforce_appointment_room_rules
  BEFORE INSERT OR UPDATE ON public.appointments
  FOR EACH ROW EXECUTE FUNCTION public.enforce_appointment_room_rules();
-- 10. updated_at triggers
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;
DROP TRIGGER IF EXISTS rooms_updated_at ON public.rooms;
CREATE TRIGGER rooms_updated_at BEFORE UPDATE ON public.rooms
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
DROP TRIGGER IF EXISTS booking_limits_updated_at ON public.booking_limits;
CREATE TRIGGER booking_limits_updated_at BEFORE UPDATE ON public.booking_limits
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
-- 11. RLS
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.room_blackouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.booking_limits ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS rooms_select ON public.rooms;
CREATE POLICY rooms_select ON public.rooms FOR SELECT USING (
  public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'staff')
  OR public.has_role(auth.uid(),'provider') OR public.has_business_admin_role(auth.uid())
);
DROP POLICY IF EXISTS rooms_manage ON public.rooms;
CREATE POLICY rooms_manage ON public.rooms FOR ALL
  USING (public.has_role(auth.uid(),'admin') OR public.has_business_admin_role(auth.uid()))
  WITH CHECK (public.has_role(auth.uid(),'admin') OR public.has_business_admin_role(auth.uid()));
DROP POLICY IF EXISTS room_blackouts_select ON public.room_blackouts;
CREATE POLICY room_blackouts_select ON public.room_blackouts FOR SELECT USING (
  public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'staff')
  OR public.has_role(auth.uid(),'provider') OR public.has_business_admin_role(auth.uid())
);
DROP POLICY IF EXISTS room_blackouts_manage ON public.room_blackouts;
CREATE POLICY room_blackouts_manage ON public.room_blackouts FOR ALL
  USING (public.has_role(auth.uid(),'admin') OR public.has_business_admin_role(auth.uid()))
  WITH CHECK (public.has_role(auth.uid(),'admin') OR public.has_business_admin_role(auth.uid()));
DROP POLICY IF EXISTS booking_limits_select ON public.booking_limits;
CREATE POLICY booking_limits_select ON public.booking_limits FOR SELECT USING (
  public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'staff')
  OR public.has_role(auth.uid(),'provider') OR public.has_business_admin_role(auth.uid())
);
DROP POLICY IF EXISTS booking_limits_manage ON public.booking_limits;
CREATE POLICY booking_limits_manage ON public.booking_limits FOR ALL
  USING (public.has_role(auth.uid(),'admin') OR public.has_business_admin_role(auth.uid()))
  WITH CHECK (public.has_role(auth.uid(),'admin') OR public.has_business_admin_role(auth.uid()));
-- 12. UTILIZATION VIEW
CREATE OR REPLACE VIEW public.v_room_utilization AS
SELECT r.id, r.name, r.type, r.is_active, r.is_flex, r.allowed_service_lines,
  COUNT(DISTINCT a.id) FILTER (
    WHERE a.scheduled_at::date = (now() AT TIME ZONE 'America/New_York')::date
      AND a.status NOT IN ('cancelled','no_show','rescheduled')
  ) AS appointments_today,
  COUNT(DISTINCT a.id) FILTER (
    WHERE a.scheduled_at >= date_trunc('week', now() AT TIME ZONE 'America/New_York')
      AND a.status NOT IN ('cancelled','no_show','rescheduled')
  ) AS appointments_this_week,
  COUNT(DISTINCT b.id) FILTER (WHERE b.end_at > now()) AS active_blackouts
FROM public.rooms r
LEFT JOIN public.appointments a ON a.room_id = r.id
LEFT JOIN public.room_blackouts b ON b.room_id = r.id
GROUP BY r.id, r.name, r.type, r.is_active, r.is_flex, r.allowed_service_lines, r.display_order
ORDER BY r.display_order;
GRANT SELECT ON public.v_room_utilization TO authenticated;
COMMIT;
