-- Tracks consent expiration reminder sends (dedupe per consent_record + window).

CREATE TABLE IF NOT EXISTS public.consent_expiration_reminders_sent (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  consent_record_id uuid NOT NULL REFERENCES public.consent_records(id) ON DELETE CASCADE,
  reminder_window text NOT NULL CHECK (reminder_window IN ('30_day', '14_day', '3_day', 'past_grace')),
  sent_at timestamptz NOT NULL DEFAULT now(),
  channels_delivered text[] NOT NULL DEFAULT '{}',
  CONSTRAINT consent_expiration_reminders_sent_unique UNIQUE (consent_record_id, reminder_window)
);

CREATE INDEX IF NOT EXISTS idx_consent_expiration_reminders_record
  ON public.consent_expiration_reminders_sent(consent_record_id);

ALTER TABLE public.consent_expiration_reminders_sent ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "consent_expiration_reminders_staff_read"
  ON public.consent_expiration_reminders_sent;

CREATE POLICY "consent_expiration_reminders_staff_read"
  ON public.consent_expiration_reminders_sent
  FOR SELECT TO authenticated USING (
    public.has_role(auth.uid(), 'admin'::public.app_role) OR
    public.has_role(auth.uid(), 'staff'::public.app_role) OR
    public.has_role(auth.uid(), 'provider'::public.app_role) OR
    public.has_business_admin_role(auth.uid())
  );

-- Optional: Tier 2 consent request metadata on magic links (send-consent-request flow).
ALTER TABLE public.intake_magic_links
  ADD COLUMN IF NOT EXISTS pending_consent_types text[];

COMMENT ON COLUMN public.intake_magic_links.pending_consent_types IS
  'When set, consume-intake-magic-link redirects patient to treatment consent signing after auth';
