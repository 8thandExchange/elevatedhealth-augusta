-- Twilio SMS message log (inbound + outbound)
CREATE TABLE public.sms_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid REFERENCES public.patients(id) ON DELETE SET NULL,
  direction text NOT NULL CHECK (direction IN ('inbound', 'outbound')),
  from_number text NOT NULL,
  to_number text NOT NULL,
  body text NOT NULL,
  twilio_sid text UNIQUE,
  delivery_status text,
  is_read boolean NOT NULL DEFAULT false,
  sent_by uuid,
  source_function text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_sms_messages_patient_id ON public.sms_messages(patient_id);
CREATE INDEX idx_sms_messages_created_at ON public.sms_messages(created_at DESC);
CREATE INDEX idx_sms_messages_direction ON public.sms_messages(direction);
CREATE INDEX idx_sms_messages_is_read ON public.sms_messages(is_read) WHERE is_read = false;

ALTER TABLE public.sms_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff and admins can view sms messages"
ON public.sms_messages
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'staff'::app_role));

CREATE POLICY "Staff and admins can update sms messages"
ON public.sms_messages
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'staff'::app_role));

CREATE POLICY "Staff and admins can insert sms messages"
ON public.sms_messages
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'staff'::app_role));

ALTER PUBLICATION supabase_realtime ADD TABLE public.sms_messages;
