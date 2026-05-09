-- ============================================================================
-- Booking attribution fields.
--
-- Adds booked_by_user_id and booking_source to the three booking tables so
-- we can distinguish patient-initiated bookings from staff-on-behalf bookings
-- (Kristen / Caroline taking a phone call) and walk-ins, and so audit history
-- can answer "who created this booking" without joining through Stripe.
--
-- appointments.booking_source already exists (added in an earlier migration);
-- we add the user_id field and tighten the allowed values via CHECK so the
-- enum is consistent across all three tables.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 1. iv_drip_bookings
-- ---------------------------------------------------------------------------

ALTER TABLE public.iv_drip_bookings
  ADD COLUMN IF NOT EXISTS booked_by_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS booking_source text;

UPDATE public.iv_drip_bookings
  SET booking_source = 'self_service'
  WHERE booking_source IS NULL;

ALTER TABLE public.iv_drip_bookings
  ALTER COLUMN booking_source SET DEFAULT 'self_service',
  ALTER COLUMN booking_source SET NOT NULL;

ALTER TABLE public.iv_drip_bookings
  DROP CONSTRAINT IF EXISTS iv_drip_bookings_booking_source_check;
ALTER TABLE public.iv_drip_bookings
  ADD CONSTRAINT iv_drip_bookings_booking_source_check
  CHECK (booking_source IN ('self_service', 'staff_phone', 'chat', 'walk_in'));

CREATE INDEX IF NOT EXISTS idx_iv_drip_bookings_booked_by
  ON public.iv_drip_bookings(booked_by_user_id)
  WHERE booked_by_user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_iv_drip_bookings_source
  ON public.iv_drip_bookings(booking_source);

COMMENT ON COLUMN public.iv_drip_bookings.booked_by_user_id IS
  'auth.users.id of the staff member who created this booking on a patient''s behalf. NULL for self-service.';
COMMENT ON COLUMN public.iv_drip_bookings.booking_source IS
  'How the booking originated. self_service = patient via website; staff_phone = Kristen/Caroline call-in; chat = chatbot (future); walk_in = front desk.';

-- ---------------------------------------------------------------------------
-- 2. consultation_bookings
-- ---------------------------------------------------------------------------

ALTER TABLE public.consultation_bookings
  ADD COLUMN IF NOT EXISTS booked_by_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS booking_source text;

UPDATE public.consultation_bookings
  SET booking_source = 'self_service'
  WHERE booking_source IS NULL;

ALTER TABLE public.consultation_bookings
  ALTER COLUMN booking_source SET DEFAULT 'self_service',
  ALTER COLUMN booking_source SET NOT NULL;

ALTER TABLE public.consultation_bookings
  DROP CONSTRAINT IF EXISTS consultation_bookings_booking_source_check;
ALTER TABLE public.consultation_bookings
  ADD CONSTRAINT consultation_bookings_booking_source_check
  CHECK (booking_source IN ('self_service', 'staff_phone', 'chat', 'walk_in'));

CREATE INDEX IF NOT EXISTS idx_consultation_bookings_booked_by
  ON public.consultation_bookings(booked_by_user_id)
  WHERE booked_by_user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_consultation_bookings_source
  ON public.consultation_bookings(booking_source);

COMMENT ON COLUMN public.consultation_bookings.booked_by_user_id IS
  'auth.users.id of the staff member who created this booking on a patient''s behalf. NULL for self-service.';
COMMENT ON COLUMN public.consultation_bookings.booking_source IS
  'How the booking originated. Same enum as iv_drip_bookings.booking_source.';

-- ---------------------------------------------------------------------------
-- 3. appointments
--    booking_source already exists as nullable text. Tighten + add user_id.
-- ---------------------------------------------------------------------------

ALTER TABLE public.appointments
  ADD COLUMN IF NOT EXISTS booked_by_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;

-- Backfill existing rows. The two booking edge functions wrote either
-- 'patient_self_serve' or NULL. Normalise both into the new enum.
UPDATE public.appointments
  SET booking_source = 'self_service'
  WHERE booking_source IN ('patient_self_serve', '') OR booking_source IS NULL;

ALTER TABLE public.appointments
  ALTER COLUMN booking_source SET DEFAULT 'self_service',
  ALTER COLUMN booking_source SET NOT NULL;

ALTER TABLE public.appointments
  DROP CONSTRAINT IF EXISTS appointments_booking_source_check;
ALTER TABLE public.appointments
  ADD CONSTRAINT appointments_booking_source_check
  CHECK (booking_source IN ('self_service', 'staff_phone', 'chat', 'walk_in'));

CREATE INDEX IF NOT EXISTS idx_appointments_booked_by
  ON public.appointments(booked_by_user_id)
  WHERE booked_by_user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_appointments_source
  ON public.appointments(booking_source);

COMMENT ON COLUMN public.appointments.booked_by_user_id IS
  'auth.users.id of the staff member who created this appointment on a patient''s behalf. NULL for self-service.';
COMMENT ON COLUMN public.appointments.booking_source IS
  'How the appointment originated. Unified enum across iv_drip_bookings and consultation_bookings.';

-- ---------------------------------------------------------------------------
-- 4. Two-hour reminder cadence
--    appointments.reminder_sent_at already tracks the day-of reminder; add
--    a separate column for the 2-hour-out reminder so we can run both
--    cadences without one clobbering the other.
-- ---------------------------------------------------------------------------

ALTER TABLE public.appointments
  ADD COLUMN IF NOT EXISTS reminder_2h_sent_at timestamptz;

COMMENT ON COLUMN public.appointments.reminder_2h_sent_at IS
  'Timestamp the 2-hour-pre-visit SMS reminder was successfully sent. Distinct from reminder_sent_at (the 24h reminder).';

CREATE INDEX IF NOT EXISTS idx_appointments_reminder_2h
  ON public.appointments(scheduled_at)
  WHERE reminder_2h_sent_at IS NULL AND status NOT IN ('cancelled', 'completed', 'no_show');
