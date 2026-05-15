-- Magic links for Tier 1 consent intake (/intake/start).

CREATE TABLE IF NOT EXISTS public.intake_magic_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  token text NOT NULL UNIQUE,
  patient_id uuid NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  booking_id uuid,
  email_address text,
  phone_number text,
  expires_at timestamptz NOT NULL,
  first_used_at timestamptz,
  last_used_at timestamptz,
  use_count integer NOT NULL DEFAULT 0,
  revoked_at timestamptz,
  reminder_sent_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_intake_magic_links_token
  ON public.intake_magic_links(token)
  WHERE revoked_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_intake_magic_links_patient
  ON public.intake_magic_links(patient_id);

CREATE INDEX IF NOT EXISTS idx_intake_magic_links_expires
  ON public.intake_magic_links(expires_at)
  WHERE revoked_at IS NULL;

COMMENT ON COLUMN public.intake_magic_links.token IS
  'Cryptographically secure random token for magic link URL (plaintext secret; DB compromise = rotate links)';

COMMENT ON COLUMN public.intake_magic_links.booking_id IS
  'Optional reference to consultation_bookings.id that triggered this link';

COMMENT ON COLUMN public.intake_magic_links.reminder_sent_at IS
  'When the 24h-before-appointment reminder was sent for this link';

ALTER TABLE public.intake_magic_links ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "intake_magic_links_staff_read" ON public.intake_magic_links;
CREATE POLICY "intake_magic_links_staff_read" ON public.intake_magic_links
  FOR SELECT TO authenticated USING (
    public.has_role(auth.uid(), 'admin'::public.app_role) OR
    public.has_role(auth.uid(), 'staff'::public.app_role) OR
    public.has_role(auth.uid(), 'provider'::public.app_role) OR
    public.has_business_admin_role(auth.uid())
  );

DROP POLICY IF EXISTS "intake_magic_links_staff_insert" ON public.intake_magic_links;
CREATE POLICY "intake_magic_links_staff_insert" ON public.intake_magic_links
  FOR INSERT TO authenticated WITH CHECK (
    public.has_role(auth.uid(), 'admin'::public.app_role) OR
    public.has_role(auth.uid(), 'staff'::public.app_role) OR
    public.has_role(auth.uid(), 'provider'::public.app_role) OR
    public.has_business_admin_role(auth.uid())
  );

ALTER TABLE public.patients
  ADD COLUMN IF NOT EXISTS intake_link_email_opt_out boolean NOT NULL DEFAULT false;

ALTER TABLE public.patients
  ADD COLUMN IF NOT EXISTS intake_link_sms_opt_out boolean NOT NULL DEFAULT false;

COMMENT ON COLUMN public.patients.intake_link_email_opt_out IS
  'When true, do not email intake magic links';

COMMENT ON COLUMN public.patients.intake_link_sms_opt_out IS
  'When true, do not SMS intake magic links';

-- Track per-appointment intake reminder (pg_cron not enabled on this project).
ALTER TABLE public.appointments
  ADD COLUMN IF NOT EXISTS intake_reminder_sent_at timestamptz;

COMMENT ON COLUMN public.appointments.intake_reminder_sent_at IS
  'Set when send-intake-reminders delivers the 24h intake reminder for this visit';
