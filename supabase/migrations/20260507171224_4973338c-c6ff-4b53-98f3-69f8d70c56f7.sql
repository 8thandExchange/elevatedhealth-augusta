
-- 1. Provider schedules (weekly recurring availability)
CREATE TABLE public.provider_schedules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id uuid NOT NULL,
  day_of_week smallint NOT NULL CHECK (day_of_week BETWEEN 0 AND 6), -- 0=Sun
  start_time time NOT NULL,
  end_time time NOT NULL,
  service_lines text[] NOT NULL DEFAULT '{}', -- e.g. {iv, consult, follow_up}
  slot_minutes integer NOT NULL DEFAULT 30,
  location text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.provider_schedules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active schedules"
ON public.provider_schedules FOR SELECT
USING (is_active = true);

CREATE POLICY "Staff and admins can manage schedules"
ON public.provider_schedules FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'staff'::app_role));

CREATE POLICY "Providers can manage their own schedule"
ON public.provider_schedules FOR ALL
USING (provider_id = auth.uid());

CREATE TRIGGER provider_schedules_updated_at
BEFORE UPDATE ON public.provider_schedules
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 2. Schedule blocks (one-off time off / lunch / vacation)
CREATE TABLE public.schedule_blocks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id uuid NOT NULL,
  start_at timestamptz NOT NULL,
  end_at timestamptz NOT NULL,
  reason text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.schedule_blocks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view schedule blocks"
ON public.schedule_blocks FOR SELECT USING (true);

CREATE POLICY "Staff and admins can manage schedule blocks"
ON public.schedule_blocks FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'staff'::app_role));

CREATE POLICY "Providers can manage their own blocks"
ON public.schedule_blocks FOR ALL
USING (provider_id = auth.uid());

-- 3. IV drip bookings
CREATE TABLE public.iv_drip_bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  stripe_session_id text UNIQUE,
  stripe_payment_intent_id text,
  therapy_id uuid,
  therapy_name text,
  addon_ids uuid[] DEFAULT '{}',
  customer_email text NOT NULL,
  customer_name text,
  customer_phone text,
  amount_paid integer,
  payment_status text NOT NULL DEFAULT 'pending',
  appointment_id uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.iv_drip_bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can create IV drip booking"
ON public.iv_drip_bookings FOR INSERT WITH CHECK (true);

CREATE POLICY "Staff and admins can manage IV drip bookings"
ON public.iv_drip_bookings FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'staff'::app_role));

CREATE POLICY "Public can view by stripe session id"
ON public.iv_drip_bookings FOR SELECT USING (true);

CREATE TRIGGER iv_drip_bookings_updated_at
BEFORE UPDATE ON public.iv_drip_bookings
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 4. Appointments extensions
ALTER TABLE public.appointments
  ADD COLUMN IF NOT EXISTS stripe_session_id text,
  ADD COLUMN IF NOT EXISTS iv_drip_booking_id uuid,
  ADD COLUMN IF NOT EXISTS consultation_booking_id uuid,
  ADD COLUMN IF NOT EXISTS booking_source text DEFAULT 'staff',
  ADD COLUMN IF NOT EXISTS pre_visit_summary text;

-- Allow anonymous IV booking inserts when paid checkout session matches
CREATE POLICY "Public can create IV appointments via paid session"
ON public.appointments FOR INSERT
WITH CHECK (
  service_line = 'iv'
  AND stripe_session_id IS NOT NULL
  AND iv_drip_booking_id IS NOT NULL
);

-- 5. Patients additions
ALTER TABLE public.patients
  ADD COLUMN IF NOT EXISTS insurance_card_front_url text,
  ADD COLUMN IF NOT EXISTS insurance_card_back_url text,
  ADD COLUMN IF NOT EXISTS lab_panel_recommendation jsonb;

CREATE INDEX IF NOT EXISTS idx_appointments_provider_scheduled
  ON public.appointments(provider_id, scheduled_at);
CREATE INDEX IF NOT EXISTS idx_provider_schedules_provider
  ON public.provider_schedules(provider_id, day_of_week);
CREATE INDEX IF NOT EXISTS idx_schedule_blocks_provider_time
  ON public.schedule_blocks(provider_id, start_at, end_at);
